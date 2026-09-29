import fs from 'node:fs';
import path from 'node:path';

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
