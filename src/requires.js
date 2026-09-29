import path from 'node:path';
import { hasEntry, resolvesUnder } from './paths.js';

// Splits missing precondition paths into hard failures and deferred
// creations: `create: true` entries become plan actions rather than
// aborting the operation — unless their parent chain escapes the
// destination root through a link, which makes the precondition
// unmeetable rather than deferrable.
export function checkRequires(manifest, destDir) {
  const failures = [];
  const creates = [];
  for (const entry of manifest.requires?.paths ?? []) {
    const p = path.join(destDir, entry.path);
    if (hasEntry(p)) continue;
    if (entry.create === true && resolvesUnder(destDir, p)) creates.push(entry.path);
    else failures.push(entry.path);
  }
  return { failures, creates };
}
