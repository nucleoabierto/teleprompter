import fs from 'node:fs';
import path from 'node:path';

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
      && (f.sha256 === undefined || typeof f.sha256 === 'string')));
}
