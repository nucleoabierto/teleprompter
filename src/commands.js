import fs from 'node:fs';
import path from 'node:path';
import { verifyPackage } from './verify.js';
import {
  readLock, writeLock, lockEntry, lockEntries, removeLockEntry, isWritten,
} from './lock.js';
import {
  buildPlan, buildUpdatePlan, buildUninstallPlan, resolveConflicts, needsBackup,
} from './plan.js';
import { executePlan, installPersonalization } from './execute.js';
import { diffResource, show } from './diff.js';
import {
  resolvesUnder, personalizationTarget, resolveRecordedPath, MANAGED_DIR,
} from './paths.js';
import { parseRepoSpec, fetchRepoTree, specLabel } from './fetch.js';
import { classifyResource } from './drift.js';
import { loadCollectionManifest, NAME_RE, SEMVER_SHAPE } from './manifest.js';
import { isCollectionDir, resolveSelection, describeIndex } from './collection.js';
import {
  printPlan, printGuide, DRIFT_MARKS, reportBackup, reportWarnings,
  reportExecutionFailure,
} from './report.js';
import {
  EXIT_OK, EXIT_MANIFEST, EXIT_PLAN, EXIT_EXECUTION, EXIT_USAGE, EXIT_FETCH,
} from './exits.js';

// `guide` re-reads what the lock recorded: each installed package's
// managed guide path, then the file itself. Resolution failures are
// usage errors; a recorded file that is gone or unreadable is an
// execution failure — the install drifted, not the invocation.
export function showGuide(io, out, err, pkgName) {
  const destDir = io.cwd;
  const lock = readLock(destDir);
  reportWarnings(out, lock.warnings);
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
export function showList(io, out) {
  const lock = readLock(io.cwd);
  reportWarnings(out, lock.warnings);
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
      if (isWritten(f)) out(`    ${f.target}`);
    }
  }
  return EXIT_OK;
}

// `check` confronts the registry with the disk: for each resource the
// lock recorded, its drift mark — intact, modified, missing or
// unverifiable when there is no reference or the read fails. `skip`
// entries recorded a decision that wrote nothing, so they are not
// reported; drift is information, not a failure, so the command
// always exits 0.
export function showCheck(io, out) {
  const lock = readLock(io.cwd);
  reportWarnings(out, lock.warnings);
  const entries = lockEntries(lock);
  if (entries.length === 0) {
    out('no hay paquetes instalados');
    return EXIT_OK;
  }
  out('estado de los recursos:');
  for (const [name, entry] of entries) {
    out(`  ${name}@${entry.version}`);
    for (const f of entry.files) {
      if (!isWritten(f)) continue;
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
  out(`obteniendo: ${specLabel(source.spec)}`);
  const fetched = await fetchRepoTree(source.spec, { fetch: io.fetch, tmpBase: io.tmpBase });
  if (!fetched.ok) {
    err(`error de obtención: ${fetched.error}`);
    return { ok: false, code: EXIT_FETCH };
  }
  return { ok: true, pkgDir: fetched.dir, cleanup: fetched.cleanup, commit: fetched.commit };
}

// Verification maps to output and exit codes. `expectedName` — only
// `update` passes it — fails an origin that publishes a different
// package before its preconditions are even looked at.
function checkVerified(result, out, err, expectedName) {
  reportWarnings(out, result.warnings);
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
// and aborts. Both surfaces where a conflict is announced show its
// diff — the abort listing prints each conflict's diff after its
// line, the interactive prompt shows it before the question, so the
// decision is made seeing what would change. A `removal` conflict
// asks about removing and reports the decision as remove/keep —
// the plan's `overwrite`/`skip` vocabulary stays internal.
async function settleConflicts(io, out, err, flags, plan, destDir, pkgDir) {
  if (plan.conflicts.length === 0) return null;
  if (flags.has('--force')) {
    await resolveConflicts(plan, () => 'overwrite');
  } else if (flags.has('--skip')) {
    await resolveConflicts(plan, () => 'skip');
  } else if (io.interactive && io.createAsker) {
    const asker = io.createAsker();
    try {
      await resolveConflicts(plan, async (r) => {
        for (const line of diffResource(destDir, pkgDir, r)) out(line);
        // The announced name is lock/manifest data: control
        // characters in it would forge output, so it is escaped.
        const shown = show(r.target);
        const question = r.removal === true
          ? `el recurso ${shown} se retira y tiene cambios locales: ¿quitar? [s/N] `
          : `colisión en ${shown}: ¿sobrescribir? [s/N] `;
        return (await asker.ask(question)) ? 'overwrite' : 'skip';
      });
    } finally {
      asker.close();
    }
  } else {
    for (const r of plan.conflicts) {
      err(`conflicto sin resolver: ${show(r.target)}`);
      for (const line of diffResource(destDir, pkgDir, r)) err(line);
    }
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

// A conflict resolved to overwrite gets its previous content mirrored
// under `.teleprompter/backups/` — managed territory, like the guide,
// so the same pre-flight applies: an escaping chain makes the plan
// non-executable up front (D005) instead of a mid-run failure.
function checkBackupDestination(destDir, plan, err) {
  if (!needsBackup(plan)) return null;
  const backupBase = path.join(destDir, MANAGED_DIR, 'backups');
  if (!resolvesUnder(destDir, backupBase)) {
    err(`la ruta destino escapa de la raíz: ${backupBase}`);
    err('plan no ejecutable');
    return EXIT_PLAN;
  }
  return null;
}

// One directory per backup operation: the UTC stamp keeps successive
// backups ordered and distinct, the package name attributes them and
// the recorded version —the install being displaced— goes in when the
// lock has one; a first install's conflicts were foreign content.
// The lock is repository data: only a semver-shaped version and a
// manifest-shaped name can be interpolated — in install and update
// the name comes from a verified manifest, but uninstall feeds it
// from a lock key, and anything else would let a hand-edited record
// write the backup outside the managed root. An unsafe name leaves
// the bare stamp.
function backupName(name, lock) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '');
  const recorded = lockEntry(lock, name)?.version;
  const version = SEMVER_SHAPE.test(recorded ?? '') ? recorded : undefined;
  const safeName = NAME_RE.test(name) ? name : undefined;
  const tag = safeName === undefined ? undefined
    : version === undefined ? safeName : `${safeName}@${version}`;
  return path.join(MANAGED_DIR, 'backups',
    tag === undefined ? stamp : `${stamp}-${tag}`);
}

// Runs the resolved plan, materializes the guide, records the install
// and reports what happened — the same ending for install and update
// apart from the final verb. On failure the report lists the actions
// already applied so the partial state is visible.
function executeAndReport(out, err, { pkgDir, destDir, lock, plan, manifest, origin, verb }) {
  const backupRoot = needsBackup(plan)
    ? backupName(manifest.name, lock)
    : null;
  let actions;
  let guide;
  let guideContent = null;
  try {
    actions = executePlan(pkgDir, destDir, plan, backupRoot);
    guide = installPersonalization(pkgDir, destDir, manifest);
    writeLock(destDir, lock, manifest, actions, origin);
    // Deliver what was installed, not the package source — the
    // managed copy survives a remote fetch's cleanup and is the same
    // content `guide` will show later.
    if (guide !== null) {
      guideContent = fs.readFileSync(path.join(destDir, guide.target), 'utf8');
    }
  } catch (error) {
    return reportExecutionFailure(out, err, error, actions, backupRoot);
  }
  out('resultado:');
  for (const a of actions) out(`  ${a.action.padEnd(15)}${a.target}`);
  reportBackup(out, actions, backupRoot);
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
export async function runUpdate(io, out, err, parsed) {
  const destDir = io.cwd;
  const lock = readLock(destDir);
  reportWarnings(out, lock.warnings);
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
  const { pkgDir, cleanup, commit } = obtained;
  try {
    // A collection origin re-resolves the member through the index
    // of the freshly obtained tree — the name is the package being
    // updated, whether the origin came from the lock or the
    // invocation (D019).
    let unitDir = pkgDir;
    let fromCollection = false;
    if (isCollectionDir(pkgDir)) {
      const selected = resolveMembers(out, err, pkgDir, [parsed.pkg],
        () => err(`el paquete "${parsed.pkg}" ya no está en la colección`));
      if (selected.units === undefined) return selected.code;
      unitDir = selected.units[0].dir;
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

    const unresolved = await settleConflicts(
      io, out, err, parsed.flags, plan, destDir, unitDir);
    if (unresolved !== null) return unresolved;
    const escaping = checkGuideDestination(destDir, manifest, err);
    if (escaping !== null) return escaping;
    const unsafeBackup = checkBackupDestination(destDir, plan, err);
    if (unsafeBackup !== null) return unsafeBackup;

    if (parsed.flags.has('--dry-run')) {
      out('fin del plan (--dry-run): nada se escribió');
      return EXIT_OK;
    }

    // The rewritten origin must stay re-resolvable: a collection
    // update keeps the member name beside the source.
    const origin = originOf(source, commit);
    if (fromCollection) origin.package = parsed.pkg;
    return executeAndReport(out, err, {
      pkgDir: unitDir, destDir, lock, plan, manifest, origin, verb: 'actualizado',
    });
  } finally {
    if (cleanup !== null) cleanup();
  }
}

// `uninstall` is the way out of the lifecycle: it removes what the
// lock recorded for the package —intact resources leave, drifted ones
// are removal conflicts the shared policy settles— and rewrites the
// registry without the package's entry. The conflict machinery —
// settle, backup preflight, the dry-run cut after both— runs in the
// same order `update` runs it; what a kept divergence leaves on disk
// simply stops being the package's, so the entry goes whole.
export async function runUninstall(io, out, err, parsed) {
  const destDir = io.cwd;
  const lock = readLock(destDir);
  reportWarnings(out, lock.warnings);
  const record = lockEntry(lock, parsed.pkg);
  if (record === undefined) {
    err(`el paquete "${parsed.pkg}" no está instalado`);
    return EXIT_USAGE;
  }
  const plan = buildUninstallPlan(destDir, record);
  printPlan(plan, out, 'plan de retirada:');

  const unresolved = await settleConflicts(
    io, out, err, parsed.flags, plan, destDir, destDir);
  if (unresolved !== null) return unresolved;
  const unsafeBackup = checkBackupDestination(destDir, plan, err);
  if (unsafeBackup !== null) return unsafeBackup;

  if (parsed.flags.has('--dry-run')) {
    out('fin del plan (--dry-run): nada se escribió');
    return EXIT_OK;
  }
  const backupRoot = needsBackup(plan)
    ? backupName(parsed.pkg, lock)
    : null;
  let actions;
  try {
    // No package side: the removal plan never reads a `source`, so
    // the destination stands in for the unused pkgDir argument.
    actions = executePlan(destDir, destDir, plan, backupRoot);
    removeLockEntry(destDir, lock, parsed.pkg);
  } catch (error) {
    return reportExecutionFailure(out, err, error, actions, backupRoot);
  }
  out('resultado:');
  for (const a of actions) out(`  ${a.action.padEnd(15)}${a.target}`);
  reportBackup(out, actions, backupRoot);
  out(`desinstalado: ${parsed.pkg}@${record.version}`);
  return EXIT_OK;
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
// the remote's default branch at fetch time— and the commit the
// ref resolved to, so the registry says which exact tree produced
// the installation; a local --path is recorded absolute, because
// the relative form would die with the working directory of that
// invocation.
function originOf(source, commit) {
  if (source.kind === 'path') {
    return { type: 'path', path: path.resolve(source.dir) };
  }
  const { owner, name, ref } = source.spec;
  const repo = `${owner}/${name}`;
  const origin = ref === null
    ? { type: 'github', repo }
    : { type: 'github', repo, ref };
  if (commit !== undefined) origin.commit = commit;
  return origin;
}

// The shared member-resolution sequence inside a collection
// directory: load the index manifest, surface its warnings and
// errors, print the index when nothing was selected, resolve the
// names and — when resolution fails — let the caller phrase the
// miss before listing what is available. Everything here is
// read-only: it aborts before any write.
function resolveMembers(out, err, rootDir, names, onUnresolved) {
  const collection = loadCollectionManifest(rootDir);
  reportWarnings(out, collection.warnings);
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
    onUnresolved(resolved);
    if (resolved.available.length > 0) {
      err(`disponibles: ${resolved.available.join(', ')}`);
    }
    return { code: EXIT_USAGE };
  }
  return { units: resolved.units };
}

// A collection origin resolves to member units selected by name; a
// package origin resolves to itself.
function selectUnits(out, err, rootDir, names) {
  if (!isCollectionDir(rootDir)) {
    if (names.length > 0) {
      err('el origen no es una colección: --package no aplica');
      return { code: EXIT_USAGE };
    }
    return { units: [{ dir: rootDir }] };
  }
  return resolveMembers(out, err, rootDir, names,
    (resolved) => { for (const error of resolved.errors) err(error); });
}

// One installable unit through the shared pipeline: verify, plan,
// settle, execute, register, report. The lock is re-read per unit
// because a previous unit of the same invocation already wrote its
// own entry — writeLock builds on what it is given.
async function installUnit(io, out, err, { source, unit, destDir, flags, commit }) {
  const result = verifyPackage(unit.dir, destDir);
  const invalid = checkVerified(result, out, err);
  if (invalid !== null) return invalid;
  const { manifest } = result;

  const lock = readLock(destDir);
  reportWarnings(out, lock.warnings);
  const plan = buildPlan(unit.dir, manifest, destDir, result.creates, lock);
  printPlan(plan, out, 'plan de instalación:');

  const unresolved = await settleConflicts(
    io, out, err, flags, plan, destDir, unit.dir);
  if (unresolved !== null) return unresolved;
  const escaping = checkGuideDestination(destDir, manifest, err);
  if (escaping !== null) return escaping;
  const unsafeBackup = checkBackupDestination(destDir, plan, err);
  if (unsafeBackup !== null) return unsafeBackup;

  if (flags.has('--dry-run')) {
    out('fin del plan (--dry-run): nada se escribió');
    return EXIT_OK;
  }

  const origin = { ...originOf(source, commit) };
  if (unit.name !== undefined) origin.package = unit.name;
  return executeAndReport(out, err, {
    pkgDir: unit.dir, destDir, lock, plan, manifest, origin, verb: 'instalado',
  });
}

// `install` checks its invocation's paths, obtains the origin once
// and runs the shared pipeline per selected unit — a collection
// fans out to its chosen members, each an independent install.
export async function runInstall(io, out, err, { source, dest, flags, packages }) {
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
  const { pkgDir, cleanup, commit } = obtained;
  try {
    const selected = selectUnits(out, err, pkgDir, packages);
    if (selected.units === undefined) return selected.code;
    for (const unit of selected.units) {
      const code = await installUnit(io, out, err, { source, unit, destDir, flags, commit });
      if (code !== EXIT_OK) return code;
    }
    return EXIT_OK;
  } finally {
    if (cleanup !== null) cleanup();
  }
}
