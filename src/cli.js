import fs from 'node:fs';
import path from 'node:path';
import { verifyPackage } from './verify.js';
import { readLock, writeLock, lockEntry, lockEntries } from './lock.js';
import { buildPlan, buildUpdatePlan, resolveConflicts } from './plan.js';
import { executePlan, installPersonalization, ExecutionError } from './execute.js';
import {
  resolvesUnder, personalizationTarget, resolveRecordedPath,
} from './paths.js';
import { parseRepoSpec, fetchRepoTree, isValidRef } from './fetch.js';
import { classifyResource } from './drift.js';
import { loadCollectionManifest } from './manifest.js';
import { isCollectionDir, resolveSelection, describeIndex } from './collection.js';

export const EXIT_OK = 0;
export const EXIT_MANIFEST = 1;
export const EXIT_PLAN = 2;
export const EXIT_EXECUTION = 3;
export const EXIT_USAGE = 4;
export const EXIT_FETCH = 5;

const USAGE = 'uso: teleprompter [install] <user/repo[@ref]> [destino] | --path <paquete> [destino] [--package <nombre>]... [--force|--skip] [--dry-run] | guide [<paquete>] | list | check | update <paquete> [<user/repo[@ref]>|--path <paquete>] [--ref <ref>] [--force|--skip] [--dry-run]';
const KNOWN_FLAGS = new Set(['--force', '--skip', '--dry-run']);
const VALUE_OPTIONS = new Set(['--path', '--ref']);
const MULTI_OPTIONS = new Set(['--package']);

function splitArgs(rest) {
  const args = [];
  const flags = new Set();
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (VALUE_OPTIONS.has(arg) || MULTI_OPTIONS.has(arg)) {
      const value = rest[++i];
      if (value === undefined || value.startsWith('--')) return null;
      if (MULTI_OPTIONS.has(arg)) {
        options[arg] = [...(options[arg] ?? []), value];
      } else if (options[arg] !== undefined) {
        return null;
      } else {
        options[arg] = value;
      }
    } else if (arg.startsWith('--')) {
      flags.add(arg);
    } else {
      args.push(arg);
    }
  }
  const unknown = [...flags].find((f) => !KNOWN_FLAGS.has(f));
  if (unknown !== undefined || (flags.has('--force') && flags.has('--skip'))) return null;
  return { args, flags, options };
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
function parseArgs(argv) {
  if (argv[0] === 'guide') {
    const rest = argv.slice(1);
    if (rest.length > 1 || rest.some((a) => a.startsWith('-'))) return null;
    return { command: 'guide', pkg: rest[0] };
  }
  if (argv[0] === 'list' || argv[0] === 'check') {
    return argv.length === 1 ? { command: argv[0] } : null;
  }
  if (argv[0] === 'update') {
    const split = splitArgs(argv.slice(1));
    if (split === null) return null;
    const { args, flags, options } = split;
    if (options['--package'] !== undefined) return null;
    if (args.length < 1 || args.length > 2) return null;
    if (options['--ref'] !== undefined && !isValidRef(options['--ref'])) return null;
    if (options['--path'] !== undefined) {
      if (args.length > 1 || options['--ref'] !== undefined) return null;
      return {
        command: 'update',
        pkg: args[0],
        source: { kind: 'path', dir: options['--path'] },
        flags,
      };
    }
    let spec = null;
    if (args[1] !== undefined) {
      spec = parseRepoSpec(args[1]);
      if (spec === null || (spec.ref !== null && options['--ref'] !== undefined)) return null;
      spec.ref = options['--ref'] ?? spec.ref;
    }
    return {
      command: 'update',
      pkg: args[0],
      source: spec === null ? null : { kind: 'repo', spec },
      ref: options['--ref'],
      flags,
    };
  }
  const rest = argv[0] === 'install' ? argv.slice(1) : argv;
  const split = splitArgs(rest);
  if (split === null) return null;
  const { args, flags, options } = split;
  if (options['--path'] !== undefined) {
    if (args.length > 1 || options['--ref'] !== undefined) return null;
    return {
      command: 'install',
      source: { kind: 'path', dir: options['--path'] },
      dest: args[0],
      flags,
      packages: options['--package'] ?? [],
    };
  }
  if (args.length < 1 || args.length > 2) return null;
  const spec = parseRepoSpec(args[0]);
  if (spec === null || (spec.ref !== null && options['--ref'] !== undefined)) return null;
  if (options['--ref'] !== undefined && !isValidRef(options['--ref'])) return null;
  spec.ref = options['--ref'] ?? spec.ref;
  return {
    command: 'install',
    source: { kind: 'repo', spec },
    dest: args[1],
    flags,
    packages: options['--package'] ?? [],
  };
}

function printPlan(plan, out, title) {
  out(title);
  for (const dir of plan.mkdirs) out(`  ${'mkdir'.padEnd(15)}${dir}`);
  for (const r of [...plan.resources, ...(plan.retired ?? [])]) {
    out(`  ${r.status.padEnd(15)}${r.target}`);
  }
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
  if (pkgName !== undefined && lockEntry(lock, pkgName) === undefined) {
    err(`el paquete "${pkgName}" no está instalado`);
    return EXIT_USAGE;
  }
  const withGuide = lockEntries(lock)
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
  // input — the leaf level of the recorded-path defense, because the
  // command reads through the leaf and a recorded symlink pointing
  // outside would disclose arbitrary files. All guides are read
  // before printing, so a failure never leaves half the output
  // behind.
  const guides = [];
  for (const [, entry] of withGuide) {
    const rel = entry.personalization;
    const resolved = resolveRecordedPath(destDir, rel);
    if (!resolved.ok) {
      err(resolved.reason === 'unsafe'
        ? `la ruta de guía registrada no es segura: ${rel}`
        : `no se puede leer la guía registrada: ${rel}`);
      return EXIT_EXECUTION;
    }
    try {
      guides.push({ target: rel, content: fs.readFileSync(resolved.real, 'utf8') });
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
  const entries = lockEntries(lock);
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
  const entries = lockEntries(lock);
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

// Obtaining is the only phase that may leave something behind: a
// remote fetch lands in a temp dir the caller must release whatever
// happens next, so the result carries `cleanup` beside `pkgDir`.
async function obtainPackage(io, out, err, source) {
  if (source.kind !== 'repo') return { ok: true, pkgDir: source.dir, cleanup: null };
  const { owner, name, ref } = source.spec;
  out(`obteniendo: ${owner}/${name}${ref ? `@${ref}` : ''}`);
  const fetched = await fetchRepoTree(source.spec, { fetch: io.fetch, tmpBase: io.tmpBase });
  if (!fetched.ok) {
    err(`error de obtención: ${fetched.error}`);
    return { ok: false, code: EXIT_FETCH };
  }
  return { ok: true, pkgDir: fetched.dir, cleanup: fetched.cleanup };
}

// Verification maps to output and exit codes. `expectedName` — only
// `update` passes it — fails an origin that publishes a different
// package before its preconditions are even looked at.
function checkVerified(result, out, err, expectedName) {
  for (const warning of result.warnings) out(`aviso: ${warning}`);
  if (result.kind === 'manifest') {
    for (const error of result.errors) err(`manifiesto inválido: ${error}`);
    return EXIT_MANIFEST;
  }
  if (expectedName !== undefined && result.manifest.name !== expectedName) {
    err(`el origen publica "${result.manifest.name}", no "${expectedName}"`);
    return EXIT_USAGE;
  }
  if (result.kind === 'requires') {
    for (const p of result.failures) {
      err(`precondición incumplida: "${p}" no existe en el destino`);
    }
    return EXIT_PLAN;
  }
  out(`verificado: ${result.manifest.name}@${result.manifest.version}`);
  return null;
}

// The D006 policy in one place: --force and --skip decide ahead, an
// interactive console asks conflict by conflict, anything else lists
// and aborts. A `removal` conflict asks about removing and reports
// the decision as remove/keep — the plan's `overwrite`/`skip`
// vocabulary stays internal.
async function settleConflicts(io, out, err, flags, plan) {
  if (plan.conflicts.length === 0) return null;
  if (flags.has('--force')) {
    await resolveConflicts(plan, () => 'overwrite');
  } else if (flags.has('--skip')) {
    await resolveConflicts(plan, () => 'skip');
  } else if (io.interactive && io.createAsker) {
    const asker = io.createAsker();
    try {
      await resolveConflicts(plan, async (r) => {
        const question = r.removal === true
          ? `el recurso ${r.target} se retira y tiene cambios locales: ¿quitar? [s/N] `
          : `colisión en ${r.target}: ¿sobrescribir? [s/N] `;
        return (await asker.ask(question)) ? 'overwrite' : 'skip';
      });
    } finally {
      asker.close();
    }
  } else {
    for (const r of plan.conflicts) err(`conflicto sin resolver: ${r.target}`);
    err('plan no ejecutable: colisiones sin resolver');
    return EXIT_PLAN;
  }
  for (const r of plan.conflicts) {
    const shown = r.removal === true
      ? (r.resolution === 'overwrite' ? 'remove' : 'keep')
      : r.resolution;
    out(`  ${r.target} → ${shown}`);
  }
  return null;
}

// The managed guide writes outside the plan's resources, but its
// destination is still provable before anything is written — an
// escaping .teleprompter/ makes the plan non-executable, not a
// mid-execution surprise (D005).
function checkGuideDestination(destDir, manifest, err) {
  if (!manifest.personalization) return null;
  const guideDest = path.join(destDir,
    personalizationTarget(manifest.name, manifest.personalization));
  if (!resolvesUnder(destDir, path.dirname(guideDest))) {
    err(`la ruta destino escapa de la raíz: ${guideDest}`);
    err('plan no ejecutable');
    return EXIT_PLAN;
  }
  return null;
}

// Runs the resolved plan, materializes the guide, records the install
// and reports what happened — the same ending for install and update
// apart from the final verb. On failure the report lists the actions
// already applied so the partial state is visible.
function executeAndReport(out, err, { pkgDir, destDir, lock, plan, manifest, origin, verb }) {
  let actions;
  let guide;
  let guideContent = null;
  try {
    actions = executePlan(pkgDir, destDir, plan);
    guide = installPersonalization(pkgDir, destDir, manifest);
    writeLock(destDir, lock, manifest, actions, origin);
    // Deliver what was installed, not the package source — the
    // managed copy survives a remote fetch's cleanup and is the same
    // content `guide` will show later.
    if (guide !== null) {
      guideContent = fs.readFileSync(path.join(destDir, guide.target), 'utf8');
    }
  } catch (error) {
    const applied = error instanceof ExecutionError ? error.applied : actions;
    for (const a of applied) {
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
  out(`${verb}: ${manifest.name}@${manifest.version}`);
  return EXIT_OK;
}

// `update` brings an installed package to the version its origin
// publishes — the recorded one unless the invocation overrides it.
// Its prologue resolves the source from the lock; from obtaining on
// it runs the same pipeline as install, over the drift-aware update
// plan whose removal conflicts ask about deleting, not overwriting.
async function runUpdate(io, out, err, parsed) {
  const destDir = io.cwd;
  const lock = readLock(destDir);
  for (const warning of lock.warnings) out(`aviso: ${warning}`);
  const record = lockEntry(lock, parsed.pkg);
  if (record === undefined) {
    err(`el paquete "${parsed.pkg}" no está instalado`);
    return EXIT_USAGE;
  }
  let source = parsed.source;
  if (source === null) {
    const { origin } = record;
    if (origin === undefined) {
      err(`el paquete "${parsed.pkg}" no registra un origen: indica <user/repo[@ref]> o --path <dir>`);
      return EXIT_USAGE;
    }
    if (origin.type === 'path') {
      if (parsed.ref !== undefined) {
        err('un --ref no aplica a un origen local');
        return EXIT_USAGE;
      }
      source = { kind: 'path', dir: origin.path };
    } else {
      // The lock is repository data: a `repo` that cannot parse back
      // into a spec is an unusable origin, not a crash.
      const spec = parseRepoSpec(origin.repo);
      if (spec === null) {
        err(`el origen registrado no es un repositorio válido: ${origin.repo}`);
        return EXIT_USAGE;
      }
      spec.ref = parsed.ref ?? origin.ref ?? null;
      source = { kind: 'repo', spec };
    }
  }
  if (source.kind === 'path' && !isDir(source.dir)) {
    err(`la ruta no es un directorio: ${source.dir}`);
    return EXIT_USAGE;
  }

  const obtained = await obtainPackage(io, out, err, source);
  if (!obtained.ok) return obtained.code;
  const { pkgDir, cleanup } = obtained;
  try {
    // A collection origin re-resolves the member through the index
    // of the freshly obtained tree — the name is the package being
    // updated, whether the origin came from the lock or the
    // invocation (D019).
    let unitDir = pkgDir;
    let fromCollection = false;
    if (isCollectionDir(pkgDir)) {
      const collection = loadCollectionManifest(pkgDir);
      for (const warning of collection.warnings) out(`aviso: ${warning}`);
      if (collection.errors.length > 0) {
        for (const error of collection.errors) {
          err(`manifiesto de colección inválido: ${error}`);
        }
        return EXIT_MANIFEST;
      }
      const resolved = resolveSelection(pkgDir, collection.manifest, [parsed.pkg]);
      if (!resolved.ok) {
        err(`el paquete "${parsed.pkg}" ya no está en la colección`);
        if (resolved.available.length > 0) {
          err(`disponibles: ${resolved.available.join(', ')}`);
        }
        return EXIT_USAGE;
      }
      unitDir = resolved.units[0].dir;
      fromCollection = true;
    }

    const result = verifyPackage(unitDir, destDir);
    const invalid = checkVerified(result, out, err, parsed.pkg);
    if (invalid !== null) return invalid;
    const { manifest } = result;

    const plan = buildUpdatePlan(unitDir, manifest, destDir, result.creates, lock);
    if (plan.upToDate) {
      out(`${manifest.name}@${manifest.version} ya está en esa versión`);
      return EXIT_OK;
    }
    printPlan(plan, out, 'plan de actualización:');

    const unresolved = await settleConflicts(io, out, err, parsed.flags, plan);
    if (unresolved !== null) return unresolved;
    const escaping = checkGuideDestination(destDir, manifest, err);
    if (escaping !== null) return escaping;

    if (parsed.flags.has('--dry-run')) {
      out('fin del plan (--dry-run): nada se escribió');
      return EXIT_OK;
    }

    // The rewritten origin must stay re-resolvable: a collection
    // update keeps the member name beside the source.
    const origin = originOf(source);
    if (fromCollection) origin.package = parsed.pkg;
    return executeAndReport(out, err, {
      pkgDir: unitDir, destDir, lock, plan, manifest, origin, verb: 'actualizado',
    });
  } finally {
    if (cleanup !== null) cleanup();
  }
}

const isDir = (p) => {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
};

// The installation's origin in lock shape: what a later operation
// needs to fetch the package again without asking. A remote source
// records owner/repo plus the ref the user gave —absent ref means
// the remote's default branch at fetch time—; a local --path is
// recorded absolute, because the relative form would die with the
// working directory of that invocation.
function originOf(source) {
  if (source.kind === 'path') {
    return { type: 'path', path: path.resolve(source.dir) };
  }
  const { owner, name, ref } = source.spec;
  const repo = `${owner}/${name}`;
  return ref === null ? { type: 'github', repo } : { type: 'github', repo, ref };
}

// A collection origin resolves to member units selected by name; a
// package origin resolves to itself. Everything here is read-only:
// no selection prints the index and aborts before any write.
function selectUnits(out, err, rootDir, names) {
  if (!isCollectionDir(rootDir)) {
    if (names.length > 0) {
      err('el origen no es una colección: --package no aplica');
      return { code: EXIT_USAGE };
    }
    return { units: [{ dir: rootDir }] };
  }
  const collection = loadCollectionManifest(rootDir);
  for (const warning of collection.warnings) out(`aviso: ${warning}`);
  if (collection.errors.length > 0) {
    for (const error of collection.errors) {
      err(`manifiesto de colección inválido: ${error}`);
    }
    return { code: EXIT_MANIFEST };
  }
  if (names.length === 0) {
    out('el origen es una colección:');
    for (const entry of describeIndex(rootDir, collection.manifest)) {
      out(entry.invalid
        ? `  ${entry.name.padEnd(24)}(manifiesto inválido)`
        : `  ${entry.name.padEnd(24)}${entry.version}${entry.description === undefined ? '' : `  ${entry.description}`}`);
    }
    err('selecciona con --package <nombre>');
    return { code: EXIT_USAGE };
  }
  const resolved = resolveSelection(rootDir, collection.manifest, names);
  if (!resolved.ok) {
    for (const error of resolved.errors) err(error);
    if (resolved.available.length > 0) {
      err(`disponibles: ${resolved.available.join(', ')}`);
    }
    return { code: EXIT_USAGE };
  }
  return { units: resolved.units };
}

// One installable unit through the shared pipeline: verify, plan,
// settle, execute, register, report. The lock is re-read per unit
// because a previous unit of the same invocation already wrote its
// own entry — writeLock builds on what it is given.
async function installUnit(io, out, err, { source, unit, destDir, flags }) {
  const result = verifyPackage(unit.dir, destDir);
  const invalid = checkVerified(result, out, err);
  if (invalid !== null) return invalid;
  const { manifest } = result;

  const lock = readLock(destDir);
  for (const warning of lock.warnings) out(`aviso: ${warning}`);
  const plan = buildPlan(unit.dir, manifest, destDir, result.creates, lock);
  printPlan(plan, out, 'plan de instalación:');

  const unresolved = await settleConflicts(io, out, err, flags, plan);
  if (unresolved !== null) return unresolved;
  const escaping = checkGuideDestination(destDir, manifest, err);
  if (escaping !== null) return escaping;

  if (flags.has('--dry-run')) {
    out('fin del plan (--dry-run): nada se escribió');
    return EXIT_OK;
  }

  const origin = { ...originOf(source) };
  if (unit.name !== undefined) origin.package = unit.name;
  return executeAndReport(out, err, {
    pkgDir: unit.dir, destDir, lock, plan, manifest, origin, verb: 'instalado',
  });
}

// `install` checks its invocation's paths, obtains the origin once
// and runs the shared pipeline per selected unit — a collection
// fans out to its chosen members, each an independent install.
async function runInstall(io, out, err, { source, dest, flags, packages }) {
  const destDir = dest ?? io.cwd;
  const badPaths = source.kind === 'path'
    ? [source.dir, destDir].filter((p) => !isDir(p))
    : isDir(destDir) ? [] : [destDir];
  if (badPaths.length > 0) {
    for (const p of badPaths) err(`la ruta no es un directorio: ${p}`);
    return EXIT_USAGE;
  }

  const obtained = await obtainPackage(io, out, err, source);
  if (!obtained.ok) return obtained.code;
  const { pkgDir, cleanup } = obtained;
  try {
    const selected = selectUnits(out, err, pkgDir, packages);
    if (selected.units === undefined) return selected.code;
    for (const unit of selected.units) {
      const code = await installUnit(io, out, err, { source, unit, destDir, flags });
      if (code !== EXIT_OK) return code;
    }
    return EXIT_OK;
  } finally {
    if (cleanup !== null) cleanup();
  }
}

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
  if (parsed.command === 'update') return runUpdate(io, out, err, parsed);
  return runInstall(io, out, err, parsed);
}
