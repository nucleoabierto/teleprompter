import fs from 'node:fs';
import path from 'node:path';
import { hashPath } from './hash.js';
import { personalizationTarget } from './paths.js';

const CORRUPT_WARNING = 'teleprompter-lock.json ilegible o corrupto: se ignora';
const EMPTY = () => ({ packages: {}, warnings: [] });

// A missing or corrupt lock means "no recorded history": the install
// proceeds as if nothing was ever installed. Corruption surfaces as a
// warning because collision detection degrades to treating everything
// as foreign.
export function readLock(destDir) {
  const lockPath = path.join(destDir, 'teleprompter-lock.json');
  let data;
  try {
    data = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return EMPTY();
    return { packages: {}, warnings: [CORRUPT_WARNING] };
  }
  if (!isValidLock(data)) return { packages: {}, warnings: [CORRUPT_WARNING] };
  return { packages: data.packages ?? {}, warnings: [] };
}

// The lock is the module that owns the registry's shape: readers ask
// for an entry by name or walk the entries, never `lock.packages`
// directly, so the internal structure can change in one place.
export function lockEntry(lock, name) {
  return lock.packages[name];
}

export function lockEntries(lock) {
  return Object.entries(lock.packages);
}

// A lock is only trustworthy if every package entry holds a files
// array of {target, sha256?} records — anything else is corrupt even
// when it parses as JSON.
function isValidLock(data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return false;
  if (data.packages === undefined) return true;
  const { packages } = data;
  if (typeof packages !== 'object' || packages === null || Array.isArray(packages)) {
    return false;
  }
  return Object.values(packages).every((p) => p !== null && typeof p === 'object'
    && typeof p.version === 'string'
    && Array.isArray(p.files)
    && p.files.every((f) => f !== null && typeof f === 'object'
      && typeof f.target === 'string'
      && (f.sha256 === undefined || typeof f.sha256 === 'string'))
    && (p.origin === undefined || isValidOrigin(p.origin)));
}

// `origin` is optional — locks written before it existed stay
// valid — but when present it must name the re-fetchable source:
// a GitHub repo with its optional ref, or a local path.
function isValidOrigin(o) {
  if (o === null || typeof o !== 'object' || Array.isArray(o)) return false;
  if (o.type === 'github') {
    return typeof o.repo === 'string'
      && (o.ref === undefined || typeof o.ref === 'string');
  }
  if (o.type === 'path') return typeof o.path === 'string';
  return false;
}

// Merges the new install into the existing history: other packages'
// records survive untouched, while this package's entry is replaced
// wholesale because it describes the installation just performed.
// `identical` keeps any previous record — the content is still ours
// and the recorded hash still matches — but creates none for a
// resource we never wrote. `mkdir` actions are plan bookkeeping, not
// installed files. `origin` is the source the install came from, in
// lock shape: a later operation can re-fetch the package without
// asking for it again.
export function writeLock(destDir, lock, manifest, actions, origin) {
  const previous = new Map(
    (lockEntry(lock, manifest.name)?.files ?? []).map((f) => [f.target, f]),
  );
  const files = actions.flatMap(({ target, action, sha256 }) => {
    if (action === 'remove') return [];
    if (action === 'identical' || action === 'mkdir' || action === 'keep') {
      const prev = previous.get(target);
      return prev === undefined ? [] : [prev];
    }
    return [sha256 === undefined ? { target, action } : { target, action, sha256 }];
  });
  // The managed guide never appears among the install actions — the
  // manifest field already names it — but it is recorded like any
  // other file the tool wrote.
  let personalization;
  if (manifest.personalization) {
    personalization = personalizationTarget(manifest.name, manifest.personalization);
    files.push({
      target: personalization,
      action: previous.has(personalization) ? 'overwrite' : 'create',
      sha256: hashPath(path.join(destDir, personalization)),
    });
  }
  const data = {
    packages: {
      ...lock.packages,
      [manifest.name]: {
        version: manifest.version,
        installedAt: new Date().toISOString(),
        files,
        ...(personalization === undefined ? {} : { personalization }),
        origin,
      },
    },
  };
  fs.writeFileSync(
    path.join(destDir, 'teleprompter-lock.json'),
    `${JSON.stringify(data, null, 2)}\n`,
  );
}
