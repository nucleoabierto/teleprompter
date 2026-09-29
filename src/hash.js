import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Each node kind hashes in its own domain ("file"/"link"/"dir"
// seeds) so two resources of different kinds can never collide.
function hashFile(file) {
  return crypto.createHash('sha256')
    .update('file\n')
    .update(fs.readFileSync(file))
    .digest('hex');
}

function collect(root, rel, entries) {
  for (const name of fs.readdirSync(path.join(root, rel))) {
    const childRel = rel ? `${rel}/${name}` : name;
    const child = path.join(root, childRel);
    const stat = fs.lstatSync(child);
    if (stat.isSymbolicLink()) {
      entries.push(`${childRel} -> ${fs.readlinkSync(child)}`);
    } else if (stat.isDirectory()) {
      // Directory markers keep empty subtrees significant: two trees
      // that differ only in an empty directory must not hash equal.
      entries.push(`${childRel}/`);
      collect(root, childRel, entries);
    } else {
      entries.push(`${childRel}:${hashFile(child)}`);
    }
  }
}

// Hashes a file, symlink, or directory tree so resources can be
// compared regardless of shape. lstat is deliberate: following links
// would crash on dangling targets and could recurse forever through
// a link back to a parent. The "dir" seed keeps an empty directory
// from hashing equal to an empty file, and sorting the entry list
// keeps the digest independent of traversal order.
export function hashPath(target) {
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) {
    return crypto.createHash('sha256')
      .update(`link\n${fs.readlinkSync(target)}`)
      .digest('hex');
  }
  if (stat.isDirectory()) {
    const entries = [];
    collect(target, '', entries);
    const hash = crypto.createHash('sha256').update('dir\n');
    for (const entry of entries.sort()) hash.update(`${entry}\n`);
    return hash.digest('hex');
  }
  return hashFile(target);
}
