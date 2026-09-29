import fs from 'node:fs';
import path from 'node:path';

// Splits missing precondition paths into hard failures and deferred
// creations: `create: true` entries become plan actions rather than
// aborting the operation.
export function checkRequires(manifest, destDir) {
  const failures = [];
  const creates = [];
  for (const entry of manifest.requires?.paths ?? []) {
    if (fs.existsSync(path.join(destDir, entry.path))) continue;
    if (entry.create === true) creates.push(entry.path);
    else failures.push(entry.path);
  }
  return { failures, creates };
}
