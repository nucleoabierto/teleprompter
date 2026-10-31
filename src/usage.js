import { parseArgs as scanTokens } from 'node:util';
import { parseRepoSpec, isValidRef } from './fetch.js';
import { EXIT_OK } from './exits.js';

// The general help doubles as the usage-error message: both paths
// print the same block — the query on stdout with exit 0, the
// failed invocation on stderr with EXIT_USAGE.
export const USAGE = `uso: teleprompter [<comando>] [<argumentos>]

instala y mantiene paquetes de configuración en un repositorio

comandos:
  install <user/repo[@ref]> [destino]     instala un paquete desde GitHub
          --path <paquete> [destino]      o desde un directorio local
  guide [<paquete>]                       muestra la guía de personalización
  list                                    lista los paquetes instalados
  check                                   verifica los recursos instalados
  update <paquete> [<origen>]             actualiza un paquete instalado
  uninstall <paquete>                     retira un paquete instalado
  help [<comando>]                        muestra esta ayuda o la de un comando
                                          —«--help» pide la de cada comando—

opciones:
  --path <paquete>     origen local: un directorio con su teleprompter.json (install, update)
  --ref <ref>          referencia de GitHub —rama, tag o commit— (install, update)
  --package <nombre>   selecciona miembros de una colección, repetible (install)
  --force              resuelve sin preguntar: sobrescribe o retira (install, update, uninstall)
  --skip               resuelve sin preguntar: omite o conserva (install, update, uninstall)
  --dry-run            muestra el plan sin escribir (install, update, uninstall)

ejemplos:
  teleprompter nucleoabierto/mis-skills
  teleprompter install o/paquete@v1.2.0 ~/proyecto
  teleprompter --path ./paquete-local --package alfa
  teleprompter update factory`;

// Per-command help: the synopsis `help <comando>` prints. The texts
// follow the grammar parseArgs accepts — `list` and `check` take
// nothing, `guide` at most a package name — and the vocabulary of
// the manual's reference pages.
const HELP = {
  install: `uso: teleprompter [install] <user/repo[@ref]> [destino] [--ref <ref>]
     teleprompter [install] --path <paquete> [destino]
     [--package <nombre>]... [--force|--skip] [--dry-run]

instala un paquete en el repositorio cuya raíz es «destino»
—por defecto, el directorio de trabajo—; «install» es un alias opcional

  <user/repo[@ref]>   origen remoto: descarga el tarball público de GitHub
  --path <paquete>    origen local: un directorio con su teleprompter.json
  --package <nombre>  en una colección, instala solo los miembros nombrados
  --force, --skip     resuelven las colisiones sin preguntar
  --dry-run           muestra el plan completo sin escribir nada`,
  guide: `uso: teleprompter guide [<paquete>]

muestra las instrucciones de personalización que declaran los
paquetes instalados, leyendo el archivo que el lock registró

  <paquete>  con nombre, muestra solo la guía de ese paquete`,
  list: `uso: teleprompter list

lista los paquetes instalados en el repositorio: nombre, versión,
instante de instalación y una línea por recurso escrito`,
  check: `uso: teleprompter check

verifica los recursos instalados contrastando el lock con el disco:
intacto, modificado, ausente o no verificable`,
  update: `uso: teleprompter update <paquete> [<user/repo[@ref]>] [--ref <ref>]
     teleprompter update <paquete> --path <paquete>
     [--force|--skip] [--dry-run]

lleva un paquete instalado a la versión que publica su origen —el
registrado en el lock o el origen explícito de la invocación—

  <user/repo[@ref]>   nuevo origen remoto; queda registrado
  --path <paquete>    nuevo origen local: un directorio con su teleprompter.json
  --ref <ref>         sobrescribe el ref de un origen de repositorio
  --force, --skip     resuelven las colisiones sin preguntar
  --dry-run           muestra el plan completo sin escribir nada`,
  uninstall: `uso: teleprompter uninstall <paquete> [--force|--skip] [--dry-run]

retira del repositorio los recursos que el paquete registró en el
lock —los intactos se eliminan y los modificados localmente se
deciden como divergencias: quitarlos, con respaldo previo, o
conservarlos— y deja el registro sin su entrada

  --force, --skip     resuelven las divergencias sin preguntar:
                      las retiran todas o las conservan todas
  --dry-run           muestra el plan de retirada sin escribir nada`,
  help: `uso: teleprompter help [<comando>]
     teleprompter [<comando>] --help

muestra la ayuda general o la del comando indicado; «--help» tras
una invocación pide la ayuda de ese comando`,
};
// The token level — which options exist, which take a value, which
// accumulate — is standard grammar the standard scanner validates.
// Each command declares its own set: what a command does not
// declare the scanner rejects on its own — `--package` outside
// install, value options on uninstall — where the hand scanner
// needed a manual check per command.
const OPTION_TYPES = {
  path: { type: 'string' },
  ref: { type: 'string' },
  package: { type: 'string', multiple: true },
  force: { type: 'boolean' },
  skip: { type: 'boolean' },
  'dry-run': { type: 'boolean' },
};
const COMMAND_OPTIONS = {
  install: new Set(Object.keys(OPTION_TYPES)),
  update: new Set(['path', 'ref', 'force', 'skip', 'dry-run']),
  uninstall: new Set(['force', 'skip', 'dry-run']),
};

// The standard scanner resolves the token level — unknown options,
// missing values, the `--opt=value` form and the `--` terminator,
// which the hand scanner used to reject. Two grammar rules stay
// manual because they are ours, not the format's: a value option
// given twice is rejected (the scanner goes last-wins, so `tokens`
// makes the duplicate visible — repeated boolean flags collapse in
// the Set anyway, as they always did) and `--force` excludes
// `--skip`. Its errors map to `null` — the "invalid grammar"
// idiom — instead of propagating.
const BOOLEAN_OPTIONS = Object.keys(OPTION_TYPES)
  .filter((name) => OPTION_TYPES[name].type === 'boolean');

function splitArgs(command, rest) {
  const options = {};
  for (const name of COMMAND_OPTIONS[command]) options[name] = OPTION_TYPES[name];
  let scanned;
  try {
    scanned = scanTokens({
      args: rest, options, strict: true, allowPositionals: true, tokens: true,
    });
  } catch {
    return null;
  }
  const seen = new Set();
  for (const token of scanned.tokens) {
    if (token.kind !== 'option') continue;
    const { type, multiple } = OPTION_TYPES[token.name];
    if (type !== 'boolean' && multiple !== true && seen.has(token.name)) return null;
    seen.add(token.name);
  }
  const flags = new Set(
    BOOLEAN_OPTIONS.filter((name) => scanned.values[name]).map((name) => `--${name}`),
  );
  if (flags.has('--force') && flags.has('--skip')) return null;
  return { args: scanned.positionals, flags, values: scanned.values };
}

// Grammar: an optional "install" alias, then either --path <dir> or a
// positional user/repo[@ref] spec, plus an optional positional OUT
// (defaults to the working directory). --ref and @ref are mutually
// exclusive; with --path no remote spec is processed at all. `guide`,
// `list` and `check` are their own commands: all consult the working
// directory's lock — `guide` admits at most one package name, `list`
// and `check` admit nothing — no options, no destination. `update`
// takes the package name plus an optional explicit origin —a repo
// spec positional or --path— and --ref overrides the github ref.
// `uninstall` takes just the package name —it works on the working
// directory's lock— plus the resolution flags, which decide the
// removal conflicts of drifted resources, and --dry-run.
// `help` is the query command —an optional topic from HELP— and
// `--help` its alias anywhere: as sole argument it asks for the
// general help, and beside an invocation it asks for that command's
// —the named subcommand, or `install` for the implicit form. Like
// `guide` before it, the word is reserved as first position.
export function parseArgs(argv) {
  if (argv[0] === '--help') {
    return argv.length === 1 ? { command: 'help' } : null;
  }
  if (argv.includes('--help')) {
    return {
      command: 'help',
      topic: Object.hasOwn(HELP, argv[0]) ? argv[0] : 'install',
    };
  }
  if (argv[0] === 'help') {
    const rest = argv.slice(1);
    if (rest.length > 1 || (rest[0] !== undefined && !Object.hasOwn(HELP, rest[0]))) return null;
    return { command: 'help', topic: rest[0] };
  }
  if (argv[0] === 'guide') {
    const rest = argv.slice(1);
    if (rest.length > 1 || rest.some((a) => a.startsWith('-'))) return null;
    return { command: 'guide', pkg: rest[0] };
  }
  if (argv[0] === 'list' || argv[0] === 'check') {
    return argv.length === 1 ? { command: argv[0] } : null;
  }
  if (argv[0] === 'update') {
    const split = splitArgs('update', argv.slice(1));
    if (split === null) return null;
    const { args, flags, values } = split;
    if (args.length < 1 || args.length > 2) return null;
    if (values.ref !== undefined && !isValidRef(values.ref)) return null;
    if (values.path !== undefined) {
      if (args.length > 1 || values.ref !== undefined) return null;
      return {
        command: 'update',
        pkg: args[0],
        source: { kind: 'path', dir: values.path },
        flags,
      };
    }
    let spec = null;
    if (args[1] !== undefined) {
      spec = parseRepoSpec(args[1]);
      if (spec === null || (spec.ref !== null && values.ref !== undefined)) return null;
      spec.ref = values.ref ?? spec.ref;
    }
    return {
      command: 'update',
      pkg: args[0],
      source: spec === null ? null : { kind: 'repo', spec },
      ref: values.ref,
      flags,
    };
  }
  if (argv[0] === 'uninstall') {
    const split = splitArgs('uninstall', argv.slice(1));
    if (split === null) return null;
    const { args, flags } = split;
    if (args.length !== 1) return null;
    return { command: 'uninstall', pkg: args[0], flags };
  }
  const rest = argv[0] === 'install' ? argv.slice(1) : argv;
  const split = splitArgs('install', rest);
  if (split === null) return null;
  const { args, flags, values } = split;
  if (values.path !== undefined) {
    if (args.length > 1 || values.ref !== undefined) return null;
    return {
      command: 'install',
      source: { kind: 'path', dir: values.path },
      dest: args[0],
      flags,
      packages: values.package ?? [],
    };
  }
  if (args.length < 1 || args.length > 2) return null;
  const spec = parseRepoSpec(args[0]);
  if (spec === null || (spec.ref !== null && values.ref !== undefined)) return null;
  if (values.ref !== undefined && !isValidRef(values.ref)) return null;
  spec.ref = values.ref ?? spec.ref;
  return {
    command: 'install',
    source: { kind: 'repo', spec },
    dest: args[1],
    flags,
    packages: values.package ?? [],
  };
}

// `help` is a query, not a failure: it answers on stdout with exit 0.
// The general block is the same text the usage-error path prints on
// stderr — a failed invocation now shows the formatted help instead
// of the single synopsis line.
export function showHelp(out, topic) {
  for (const line of (topic === undefined ? USAGE : HELP[topic]).split('\n')) {
    out(line);
  }
  return EXIT_OK;
}
