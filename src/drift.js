import fs from 'node:fs';
import path from 'node:path';
import { hashPath } from './hash.js';
import { isWithin, recordedChainSafe } from './paths.js';

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

// The abandonment units of a recorded directory target: the
// maximal subtrees under it that neither the incoming targets nor
// another recorded entry cover. The walk stops at an incoming
// target, whose plan entry governs that subtree; at a path with
// its own lock entry, which classifies on its own; and at each
// unit. A directory descends while it leads to an incoming or
// recorded target; a non-directory on the way to an incoming one
// is infrastructure the new map still needs, so it is kept —
// never a unit — and a kept symlink may point under a sibling
// unit, so it pins the expansion to user decisions. Returns null
// when the recorded path is unsafe, is not a readable directory
// or the walk fails: the caller then classifies the entry as a
// whole.
export function uncoveredUnits(root, rel, shipped, recorded) {
  const result = { units: [], pinned: false };
  const onTheWay = (child) => [...shipped].some((s) => isWithin(child, s));
  const leadsTo = (child) => onTheWay(child)
    || [...recorded].some((r) => isWithin(child, r));
  const walk = (dirRel) => {
    for (const name of fs.readdirSync(path.join(root, dirRel))) {
      const child = path.join(dirRel, name);
      if (shipped.has(child) || recorded.has(child)) continue;
      const stat = fs.lstatSync(path.join(root, child));
      if (!leadsTo(child)) {
        result.units.push(child);
        continue;
      }
      if (stat.isDirectory()) {
        walk(child);
        continue;
      }
      if (stat.isSymbolicLink() && onTheWay(child)) result.pinned = true;
    }
  };
  // The recorded path is revalidated before enumerating it, like
  // any other lock data: an escaping parent chain makes the tree
  // unreadable here and unverifiable for the caller's fallback.
  try {
    if (!recordedChainSafe(root, rel)
        || !fs.lstatSync(path.join(root, rel)).isDirectory()) return null;
    walk(rel);
  } catch {
    return null;
  }
  return result;
}
