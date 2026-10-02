import path from 'node:path';
import { hashPath } from './hash.js';
import { recordedChainSafe } from './paths.js';

// The drift of a recorded resource: what the destination holds now
// against what the lock says was written. `missing` covers a target
// that is gone — hashPath's ENOENT is the signal. `unverifiable`
// covers entries recorded without a hash — valid per the lock
// contract —, reads that fail for any reason other than absence,
// and targets that are not safe to read at all: the lock is
// repository data, not trusted memory, so a recorded path is
// re-validated before use like any other untrusted input. The chain
// level of the recorded-path defense is enough here — a `..` segment
// or a parent chain escaping through a symlink would make the check
// read outside the destination, while the leaf itself stays unproven
// because hashPath lstats it rather than following it.
export function classifyResource(destDir, { target, sha256 }) {
  if (sha256 === undefined) return 'unverifiable';
  if (!recordedChainSafe(destDir, target)) return 'unverifiable';
  const abs = path.join(destDir, target);
  let current;
  try {
    current = hashPath(abs);
  } catch (error) {
    return error.code === 'ENOENT' ? 'missing' : 'unverifiable';
  }
  return current === sha256 ? 'intact' : 'modified';
}
