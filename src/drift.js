import path from 'node:path';
import { hashPath } from './hash.js';
import { isSafeRelative, resolvesUnder } from './paths.js';

// The drift of a recorded resource: what the destination holds now
// against what the lock says was written. `missing` covers a target
// that is gone — hashPath's ENOENT is the signal. `unverifiable`
// covers entries recorded without a hash — valid per the lock
// contract —, reads that fail for any reason other than absence,
// and targets that are not safe to read at all: the lock is
// repository data, not trusted memory, so a recorded path is
// re-validated before use like any other untrusted input — a `..`
// segment or a parent chain escaping through a symlink would make
// the check read outside the destination.
export function classifyResource(destDir, { target, sha256 }) {
  if (sha256 === undefined) return 'unverifiable';
  const abs = path.join(destDir, target);
  if (!isSafeRelative(target) || !resolvesUnder(destDir, path.dirname(abs))) {
    return 'unverifiable';
  }
  let current;
  try {
    current = hashPath(abs);
  } catch (error) {
    return error.code === 'ENOENT' ? 'missing' : 'unverifiable';
  }
  return current === sha256 ? 'intact' : 'modified';
}
