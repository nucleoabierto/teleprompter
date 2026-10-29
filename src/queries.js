import fs from 'node:fs';
import {
  readLock, lockEntry, lockEntries, isWritten,
} from './lock.js';
import { resolveRecordedPath } from './paths.js';
import { classifyResource } from './drift.js';
import {
  printGuide, DRIFT_MARKS, reportWarnings,
} from './report.js';
import {
  EXIT_OK, EXIT_USAGE, EXIT_EXECUTION,
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
