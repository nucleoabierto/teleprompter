import path from 'node:path';

// Rejects anything that could escape the package or the destination
// root: absolute paths and ".." segments, plus Windows-style absolute
// ("C:\...") and UNC ("\\...") paths, which path.isAbsolute does not
// detect on POSIX.
export function isSafeRelative(p) {
  if (path.isAbsolute(p)) return false;
  if (/^[a-zA-Z]:[\\/]/.test(p) || p.startsWith('\\\\')) return false;
  return !p.split('/').concat(p.split('\\')).includes('..');
}
