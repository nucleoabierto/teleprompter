import fs from 'node:fs';
import path from 'node:path';

// Reserved managed namespace: the tool, not the package, owns where
// its own files land — same rule as teleprompter-lock.json. Install
// targets may not point inside it; the personalization guide is
// materialized under it as <name>/<basename of the declared file>.
export const MANAGED_DIR = '.teleprompter';

export function personalizationTarget(name, declaredPath) {
  return `${MANAGED_DIR}/${name}/${path.basename(declaredPath)}`;
}

// "Exists" means a directory entry is present, whatever it points
// at: existsSync follows links, so a dangling symlink would report
// the path as free and a later write could escape through it.
export function hasEntry(p) {
  try {
    fs.lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

// Rejects anything that could escape the package or the destination
// root: absolute paths and ".." segments, plus Windows-style absolute
// ("C:\...") and UNC ("\\...") paths, which path.isAbsolute does not
// detect on POSIX.
export function isSafeRelative(p) {
  if (path.isAbsolute(p)) return false;
  if (/^[a-zA-Z]:[\\/]/.test(p) || p.startsWith('\\\\')) return false;
  return !p.split('/').concat(p.split('\\')).includes('..');
}

// A relative path can still escape the root through a symlink in its
// parent chain: existsSync-style checks follow links, so the deepest
// existing ancestor must resolve — after dereferencing — to a
// directory inside the root. Anything else (dangling ancestor, an
// ancestor that is a file, a link pointing outside) means the write
// would not land where the plan claims.
export function resolvesUnder(root, dir) {
  let probe = dir;
  while (!hasEntry(probe)) {
    const parent = path.dirname(probe);
    if (parent === probe) return false;
    probe = parent;
  }
  try {
    const real = fs.realpathSync(probe);
    if (!fs.statSync(real).isDirectory()) return false;
    const rootReal = fs.realpathSync(root);
    return real === rootReal || real.startsWith(`${rootReal}${path.sep}`);
  } catch {
    return false;
  }
}

// A recorded path is the lock's data, not trusted input: it is
// re-validated before use at the level the operation needs. The
// chain level suffices when the leaf is treated atomically — lstat,
// rm, hashing a link as a link — so only the parent chain must stay
// inside the root.
export function recordedChainSafe(root, rel) {
  return isSafeRelative(rel)
    && resolvesUnder(root, path.dirname(path.join(root, rel)));
}

// Whether `descendant` sits strictly inside `ancestor`, both
// targets under the same root. The comparison works on normalized
// paths stripped of their trailing separator —directory targets
// are recorded as `d/`— because a bare string prefix would
// conflate `d` with `dir`: `d/x` is inside `d`, `dir/x` is not.
// An equal pair is never "within": `d` does not start with `d/`.
export function isWithin(ancestor, descendant) {
  const a = path.normalize(ancestor).replace(/[/\\]+$/, '');
  const d = path.normalize(descendant).replace(/[/\\]+$/, '');
  return d.startsWith(`${a}${path.sep}`);
}

// The leaf level of the recorded-path defense: for reads that follow
// the leaf itself a parent-chain proof is not enough — a recorded
// symlink pointing outside must not disclose its target, so the whole
// path is resolved and the result must land inside the root. The
// discriminated result keeps "unsafe" apart from "unreadable" because
// callers report them differently.
export function resolveRecordedPath(root, rel) {
  if (!isSafeRelative(rel)) return { ok: false, reason: 'unsafe' };
  let real;
  try {
    real = fs.realpathSync(path.join(root, rel));
    const rootReal = fs.realpathSync(root);
    if (real !== rootReal && !real.startsWith(`${rootReal}${path.sep}`)) {
      return { ok: false, reason: 'unsafe' };
    }
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
  return { ok: true, real };
}
