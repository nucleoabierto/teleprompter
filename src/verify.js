import { loadManifest } from './manifest.js';
import { checkRequires } from './requires.js';

// Returns a structured result so the plan phase can consume the
// verification outcome without revalidating the manifest.
// kind: 'ok' | 'manifest' | 'requires'.
export function verifyPackage(pkgDir, destDir) {
  const { manifest, warnings, errors } = loadManifest(pkgDir);
  if (errors.length > 0) {
    return { kind: 'manifest', warnings, errors, manifest: null, creates: [], failures: [] };
  }
  const { failures, creates } = checkRequires(manifest, destDir);
  if (failures.length > 0) {
    return { kind: 'requires', warnings, errors: [], manifest, creates, failures };
  }
  return { kind: 'ok', warnings, errors: [], manifest, creates, failures: [] };
}
