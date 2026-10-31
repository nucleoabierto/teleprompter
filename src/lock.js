import fs from 'node:fs';
import path from 'node:path';
import { hashPath } from './hash.js';
import { personalizationTarget } from './paths.js';
import { isPlainObject, isOptionalString } from './shape.js';

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
// directly, so the internal structure can change in one place. The
// own-property check treats the lock as untrusted data — an inherited
// key like `__proto__` or `constructor` resolves a member of
// `Object.prototype`, which must read as "not installed".
export function lockEntry(lock, name) {
  return Object.hasOwn(lock.packages, name) ? lock.packages[name] : undefined;
}

export function lockEntries(lock) {
  return Object.entries(lock.packages);
}

// A recorded file entry asserts the tool wrote the resource —
// `skip` records a decision that wrote nothing: a conflict kept
// foreign content. Every other action counts as written.
export function isWritten(f) {
  return f.action !== 'skip';
}

// A file entry records one target the install touched: the path
// always, the hash only when the action produced content — a `skip`
// records a decision, not a file.
function isValidFileEntry(f) {
  return isPlainObject(f)
    && typeof f.target === 'string'
    && isOptionalString(f.sha256);
}

// A package entry is the unit the registry maps a name to: the
// installed version, the files the install wrote and optionally the
// origin they were fetched from — everything else is corrupt even
// when it parses as JSON.
function isValidPackageEntry(p) {
  return isPlainObject(p)
    && typeof p.version === 'string'
    && Array.isArray(p.files)
    && p.files.every(isValidFileEntry)
    && (p.origin === undefined || isValidOrigin(p.origin));
}

// A lock is only trustworthy if it is a plain object whose packages
// map — absent in locks written before any install — holds only
// well-formed package entries.
function isValidLock(data) {
  if (!isPlainObject(data)) return false;
  if (data.packages === undefined) return true;
  return isPlainObject(data.packages)
    && Object.values(data.packages).every(isValidPackageEntry);
}

// Each origin type declares the fields that make it re-fetchable —
// the table has no prototype so a `type` naming a member of
// `Object.prototype` falls through to "not valid" instead of
// invoking an inherited function.
const ORIGIN_SHAPES = {
  __proto__: null,
  github: (o) => typeof o.repo === 'string'
    && isOptionalString(o.ref)
    && isOptionalString(o.commit),
  path: (o) => typeof o.path === 'string',
};

// `origin` is optional — locks written before it existed stay
// valid — but when present it must name the re-fetchable source:
// a GitHub repo with its optional ref, or a local path. A
// collection install adds the selected member's name, which a
// later update re-resolves through the index.
function isValidOrigin(o) {
  if (!isPlainObject(o) || !isOptionalString(o.package)) return false;
  // `type` must be a string: a table lookup coerces the key, so an
  // array like ["github"] would dispatch where strict equality —
  // the original contract — rejected it.
  const shape = typeof o.type === 'string' ? ORIGIN_SHAPES[o.type] : undefined;
  return (shape ?? (() => false))(o);
}

// Merges the new install into the existing history: other packages'
// records survive untouched, while this package's entry is replaced
// wholesale because it describes the installation just performed.
// `identical` keeps a previous record that still tells the truth —
// a `skip` records an omission with no hash, a matching hash keeps
// its provenance — and registers one otherwise: a resource the
// plan proves equal to the package is managed whatever wrote it,
// and a recorded hash that no longer matches the disk must not
// survive. `mkdir` actions are plan bookkeeping, not installed
// files. `origin` is the source the install came from, in lock
// shape: a later operation can re-fetch the package without asking
// for it again.
export function writeLock(destDir, lock, manifest, actions, origin) {
  const previous = new Map(
    (lockEntry(lock, manifest.name)?.files ?? []).map((f) => [f.target, f]),
  );
  const files = actions.flatMap(({ target, action, sha256 }) => {
    if (action === 'remove') return [];
    if (action === 'identical') {
      const prev = previous.get(target);
      const stillTrue = prev !== undefined
        && (prev.action === 'skip' || prev.sha256 === sha256);
      return [stillTrue ? prev : { target, action, sha256 }];
    }
    if (action === 'mkdir' || action === 'keep') {
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
  persistLock(destDir, data);
}

// Rewrites the registry without one package's entry: the record
// stops asserting what the uninstall retired — resources kept by
// drift included, which no longer belong to the package — while
// every other entry survives untouched. `packages` may come out
// empty and the lock is still written: the file itself is the
// history, so the write stays atomic like any other.
export function removeLockEntry(destDir, lock, name) {
  const { [name]: retired, ...rest } = lock.packages;
  persistLock(destDir, { packages: rest });
}

// Atomic write: the serialized lock goes to a temp file in the
// same directory — rename is only atomic within one filesystem —
// and is then renamed over the real name, so a crash mid-write
// leaves the old lock or the new one, never a truncated file. The
// pid suffix keeps the temp name unique across concurrent runs;
// the finally removes it whether the write or the rename failed.
function persistLock(destDir, data) {
  const lockPath = path.join(destDir, 'teleprompter-lock.json');
  const tmpPath = `${lockPath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`);
    fs.renameSync(tmpPath, lockPath);
  } finally {
    fs.rmSync(tmpPath, { force: true, recursive: true });
  }
}
