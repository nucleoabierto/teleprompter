import fs from 'node:fs';
import path from 'node:path';
import { verifyPackage } from './verify.js';
import { readLock, writeLock } from './lock.js';
import { buildPlan } from './plan.js';
import { executePlan, installPersonalization } from './execute.js';
import { resolvesUnder, personalizationTarget, isSafeRelative } from './paths.js';
import { parseRepoSpec, fetchRepoTree, isValidRef } from './fetch.js';
import { classifyResource } from './drift.js';

export const EXIT_OK = 0;
export const EXIT_MANIFEST = 1;
export const EXIT_PLAN = 2;
export const EXIT_EXECUTION = 3;
export const EXIT_USAGE = 4;
export const EXIT_FETCH = 5;

const USAGE = 'uso: teleprompter [install] <user/repo[@ref]> [destino] | --path <paquete> [destino] [--force|--skip] [--dry-run] | guide [<paquete>] | list | check';
const KNOWN_FLAGS = new Set(['--force', '--skip', '--dry-run']);
const VALUE_OPTIONS = new Set(['--path', '--ref']);

// Grammar: an optional "install" alias, then either --path <dir> or a
// positional user/repo[@ref] spec, plus an optional positional OUT
// (defaults to the working directory). --ref and @ref are mutually
// exclusive; with --path no remote spec is processed at all. `guide`,
// `list` and `check` are their own commands: all consult the working
// directory's lock — `guide` admits at most one package name, `list`
// and `check` admit nothing — no options, no destination.
function parseArgs(argv) {
  if (argv[0] === 'guide') {
    const rest = argv.slice(1);
    if (rest.length > 1 || rest.some((a) => a.startsWith('-'))) return null;
    return { command: 'guide', pkg: rest[0] };
  }
  if (argv[0] === 'list' || argv[0] === 'check') {
    return argv.length === 1 ? { command: argv[0] } : null;
  }
  const rest = argv[0] === 'install' ? argv.slice(1) : argv;
  const args = [];
  const flags = new Set();
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (VALUE_OPTIONS.has(arg)) {
      if (options[arg] !== undefined) return null;
      const value = rest[++i];
      if (value === undefined || value.startsWith('--')) return null;
      options[arg] = value;
    } else if (arg.startsWith('--')) {
      flags.add(arg);
    } else {
      args.push(arg);
    }
  }
  const unknown = [...flags].find((f) => !KNOWN_FLAGS.has(f));
  if (unknown !== undefined || (flags.has('--force') && flags.has('--skip'))) return null;
  if (options['--path'] !== undefined) {
    if (args.length > 1 || options['--ref'] !== undefined) return null;
    return { command: 'install', source: { kind: 'path', dir: options['--path'] }, dest: args[0], flags };
  }
  if (args.length < 1 || args.length > 2) return null;
  const spec = parseRepoSpec(args[0]);
  if (spec === null || (spec.ref !== null && options['--ref'] !== undefined)) return null;
  if (options['--ref'] !== undefined && !isValidRef(options['--ref'])) return null;
  spec.ref = options['--ref'] ?? spec.ref;
  return { command: 'install', source: { kind: 'repo', spec }, dest: args[1], flags };
}

function printPlan(plan, out) {
  out('plan de instalación:');
  for (const dir of plan.mkdirs) out(`  ${'mkdir'.padEnd(15)}${dir}`);
  for (const r of plan.resources) out(`  ${r.status.padEnd(15)}${r.target}`);
}

// The maintainer's guide is delivered verbatim under a heading that
// names its managed location — the installer and the `guide` command
// share this block so consulting later shows what installing showed.
function printGuide(out, target, content) {
  out(`personalización (${target}):`);
  for (const line of content.replace(/\n$/, '').split('\n')) out(line);
}

// `guide` re-reads what the lock recorded: each installed package's
// managed guide path, then the file itself. Resolution failures are
// usage errors; a recorded file that is gone or unreadable is an
// execution failure — the install drifted, not the invocation.
function showGuide(io, out, err, pkgName) {
  const destDir = io.cwd;
  const lock = readLock(destDir);
  for (const warning of lock.warnings) out(`aviso: ${warning}`);
  if (pkgName !== undefined && lock.packages[pkgName] === undefined) {
    err(`el paquete "${pkgName}" no está instalado`);
    return EXIT_USAGE;
  }
  const withGuide = Object.entries(lock.packages)
    .filter(([name, entry]) => (pkgName === undefined || name === pkgName)
      && typeof entry.personalization === 'string');
  if (withGuide.length === 0) {
    err(pkgName === undefined
      ? 'ningún paquete instalado declara instrucciones de personalización'
      : `el paquete "${pkgName}" no declara instrucciones de personalización`);
    return EXIT_USAGE;
  }
  // The lock is repository data, not trusted memory: its recorded
  // paths are re-validated before reading, like any other untrusted
  // input. The resolved real path — symlinks included, in the parent
  // chain and in the file itself — must land inside the destination;
  // otherwise the command would disclose arbitrary files. All guides
  // are read before printing, so a failure never leaves half the
  // output behind.
  const guides = [];
  const rootReal = fs.realpathSync(destDir);
  for (const [, entry] of withGuide) {
    const rel = entry.personalization;
    if (!isSafeRelative(rel)) {
      err(`la ruta de guía registrada no es segura: ${rel}`);
      return EXIT_EXECUTION;
    }
    try {
      const real = fs.realpathSync(path.join(destDir, rel));
      if (real !== rootReal && !real.startsWith(`${rootReal}${path.sep}`)) {
        err(`la ruta de guía registrada no es segura: ${rel}`);
        return EXIT_EXECUTION;
      }
      guides.push({ target: rel, content: fs.readFileSync(real, 'utf8') });
    } catch (error) {
      err(`no se puede leer la guía registrada: ${rel}`);
      return EXIT_EXECUTION;
    }
  }
  for (const g of guides) printGuide(out, g.target, g.content);
  return EXIT_OK;
}

// `list` presents what the lock recorded — the registry as product
// surface: name, version, when, and the written targets, without
// internal details like hashes or actions. A `skip` entry recorded
// the decision but wrote nothing, so it is not listed; a package
// with a managed guide points at `guide` as the way to consult it;
// an entry without `installedAt` — valid per the lock contract —
// shows no date. No recorded installations is an answer, not a
// failure.
function showList(io, out) {
  const lock = readLock(io.cwd);
  for (const warning of lock.warnings) out(`aviso: ${warning}`);
  const entries = Object.entries(lock.packages);
  if (entries.length === 0) {
    out('no hay paquetes instalados');
    return EXIT_OK;
  }
  out('paquetes instalados:');
  for (const [name, entry] of entries) {
    const when = typeof entry.installedAt === 'string'
      ? ` — instalado ${entry.installedAt}` : '';
    out(`  ${name}@${entry.version}${when}`);
    if (typeof entry.personalization === 'string') {
      out(`    guía: teleprompter guide ${name}`);
    }
    for (const f of entry.files) {
      if (f.action !== 'skip') out(`    ${f.target}`);
    }
  }
  return EXIT_OK;
}

// Drift marks in product language: `check` reports the state of each
// recorded resource without exposing the hashes it compared.
const DRIFT_MARKS = {
  intact: 'intacto',
  modified: 'modificado',
  missing: 'ausente',
  unverifiable: 'no verificable',
};

// `check` confronts the registry with the disk: for each resource the
// lock recorded, its drift mark — intact, modified, missing or
// unverifiable when there is no reference or the read fails. `skip`
// entries recorded a decision that wrote nothing, so they are not
// reported; drift is information, not a failure, so the command
// always exits 0.
function showCheck(io, out) {
  const lock = readLock(io.cwd);
  for (const warning of lock.warnings) out(`aviso: ${warning}`);
  const entries = Object.entries(lock.packages);
  if (entries.length === 0) {
    out('no hay paquetes instalados');
    return EXIT_OK;
  }
  out('estado de los recursos:');
  for (const [name, entry] of entries) {
    out(`  ${name}@${entry.version}`);
    for (const f of entry.files) {
      if (f.action === 'skip') continue;
      const mark = DRIFT_MARKS[classifyResource(io.cwd, f)];
      out(`    ${mark.padEnd(15)}${f.target}`);
    }
  }
  return EXIT_OK;
}

const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();

// Invocation layer only: parses arguments, delegates to src/ and maps
// the result to output and exit codes. Keeping it thin is what lets
// the test suite exercise the CLI without spawning processes.
// io: { out, err, cwd, interactive, createAsker, fetch, tmpBase } —
// injectable for tests.
export async function main(argv, io = {}) {
  const out = io.out ?? console.log;
  const err = io.err ?? console.error;

  const parsed = parseArgs(argv);
  if (parsed === null) {
    err(USAGE);
    return EXIT_USAGE;
  }
  if (parsed.command === 'guide') return showGuide(io, out, err, parsed.pkg);
  if (parsed.command === 'list') return showList(io, out);
  if (parsed.command === 'check') return showCheck(io, out);
  const { source, dest, flags } = parsed;
  const destDir = dest ?? io.cwd;
  const badPaths = source.kind === 'path'
    ? [source.dir, destDir].filter((p) => !isDir(p))
    : isDir(destDir) ? [] : [destDir];
  if (badPaths.length > 0) {
    for (const p of badPaths) err(`la ruta no es un directorio: ${p}`);
    return EXIT_USAGE;
  }

  let pkgDir = source.dir;
  let cleanup = null;
  if (source.kind === 'repo') {
    const { owner, name, ref } = source.spec;
    out(`obteniendo: ${owner}/${name}${ref ? `@${ref}` : ''}`);
    const fetched = await fetchRepoTree(source.spec, { fetch: io.fetch, tmpBase: io.tmpBase });
    if (!fetched.ok) {
      err(`error de obtención: ${fetched.error}`);
      return EXIT_FETCH;
    }
    pkgDir = fetched.dir;
    cleanup = fetched.cleanup;
  }

  try {
    const result = verifyPackage(pkgDir, destDir);
    for (const warning of result.warnings) out(`aviso: ${warning}`);
    if (result.kind === 'manifest') {
      for (const error of result.errors) err(`manifiesto inválido: ${error}`);
      return EXIT_MANIFEST;
    }
    if (result.kind === 'requires') {
      for (const p of result.failures) {
        err(`precondición incumplida: "${p}" no existe en el destino`);
      }
      return EXIT_PLAN;
    }
    out(`verificado: ${result.manifest.name}@${result.manifest.version}`);

    const lock = readLock(destDir);
    for (const warning of lock.warnings) out(`aviso: ${warning}`);
    const plan = buildPlan(pkgDir, result.manifest, destDir, result.creates, lock);
    printPlan(plan, out);

    if (plan.conflicts.length > 0) {
      if (flags.has('--force')) {
        for (const r of plan.conflicts) r.resolution = 'overwrite';
      } else if (flags.has('--skip')) {
        for (const r of plan.conflicts) r.resolution = 'skip';
      } else if (io.interactive && io.createAsker) {
        const asker = io.createAsker();
        try {
          for (const r of plan.conflicts) {
            const overwrite = await asker.ask(`colisión en ${r.target}: ¿sobrescribir? [s/N] `);
            r.resolution = overwrite ? 'overwrite' : 'skip';
          }
        } finally {
          asker.close();
        }
      } else {
        for (const r of plan.conflicts) err(`conflicto sin resolver: ${r.target}`);
        err('plan no ejecutable: colisiones sin resolver');
        return EXIT_PLAN;
      }
      for (const r of plan.conflicts) out(`  ${r.target} → ${r.resolution}`);
    }

    // The managed guide writes outside the plan's resources, but its
    // destination is still provable before anything is written — an
    // escaping .teleprompter/ makes the plan non-executable, not a
    // mid-execution surprise (D005).
    if (result.manifest.personalization) {
      const guideDest = path.join(destDir,
        personalizationTarget(result.manifest.name, result.manifest.personalization));
      if (!resolvesUnder(destDir, path.dirname(guideDest))) {
        err(`la ruta destino escapa de la raíz: ${guideDest}`);
        err('plan no ejecutable');
        return EXIT_PLAN;
      }
    }

    if (flags.has('--dry-run')) {
      out('fin del plan (--dry-run): nada se escribió');
      return EXIT_OK;
    }

    let actions;
    let guide;
    let guideContent = null;
    try {
      actions = executePlan(pkgDir, destDir, plan);
      guide = installPersonalization(pkgDir, destDir, result.manifest);
      writeLock(destDir, lock, result.manifest, actions);
      // Deliver what was installed, not the package source — the
      // managed copy survives a remote fetch's cleanup and is the
      // same content `guide` will show later.
      if (guide !== null) {
        guideContent = fs.readFileSync(path.join(destDir, guide.target), 'utf8');
      }
    } catch (error) {
      for (const a of error.applied ?? actions) {
        out(`  ${a.action.padEnd(15)}${a.target}`);
      }
      err(`error de ejecución: ${error.message}`);
      return EXIT_EXECUTION;
    }
    out('resultado:');
    for (const a of actions) out(`  ${a.action.padEnd(15)}${a.target}`);
    if (guide !== null) {
      printGuide(out, guide.target, guideContent);
    }
    out(`instalado: ${result.manifest.name}@${result.manifest.version}`);
    return EXIT_OK;
  } finally {
    if (cleanup !== null) cleanup();
  }
}
