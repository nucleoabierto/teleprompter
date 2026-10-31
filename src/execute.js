import fs from 'node:fs';
import path from 'node:path';
import { hashPath } from './hash.js';
import { resolvesUnder, personalizationTarget } from './paths.js';

// A failed execution reports what it already did: the thrown error
// is a declared type carrying the applied actions and the original
// error as `cause`, instead of mutating whatever the try happened
// to catch.
export class ExecutionError extends Error {
  constructor(applied, cause) {
    super(cause.message, { cause });
    this.name = 'ExecutionError';
    this.applied = applied;
  }
}

const ACTION = {
  create: 'create',
  identical: 'identical',
  'managed-update': 'overwrite',
  update: 'overwrite',
  retire: 'remove',
  conflict: null, // taken from the resource's resolution
};

// A conflict marked `removal` resolves to remove or keep instead of
// overwrite or skip — there is no incoming resource to write.
const REMOVAL_RESOLUTION = { overwrite: 'remove', skip: 'keep' };

// The action one plan entry decided: the status translates through
// ACTION — a conflict defers to its resolution — and a `removal`
// conflict translates that resolution again, so `overwrite`/`skip`
// become `remove`/`keep`. An entry that resolves to nothing means
// the plan reached execution with a conflict still open.
function actionOf(resource) {
  const action = resource.removal === true
    ? REMOVAL_RESOLUTION[resource.resolution]
    : ACTION[resource.status] ?? resource.resolution;
  if (action === undefined) {
    throw new Error(`plan sin resolver: ${resource.target}`);
  }
  return action;
}

function copyResource(source, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) {
    fs.symlinkSync(fs.readlinkSync(source), dest);
  } else if (stat.isDirectory()) {
    // verbatimSymlinks keeps links as links: dereferencing them would
    // make the written copy hash differently from the package, and the
    // next install would report a phantom conflict.
    fs.cpSync(source, dest, { recursive: true, verbatimSymlinks: true });
  } else {
    fs.copyFileSync(source, dest);
  }
}

// The backup of a conflict about to be overwritten: the same verbatim
// copy the plan writes, mirrored under the operation's backup root so
// restoring is a plain copy back. The write gets the same
// symlink-escape guard as any other.
function backupConflict(destDir, backupRoot, target) {
  const backupDest = path.join(destDir, backupRoot, target);
  if (!resolvesUnder(destDir, path.dirname(backupDest))) {
    throw new Error(`la ruta destino escapa de la raíz: ${backupDest}`);
  }
  copyResource(path.join(destDir, target), backupDest);
  return path.join(backupRoot, target);
}

// The destination a write may touch: the final component is what
// the write itself creates, so it is the parent chain that must
// resolve under the destination root — a symlinked directory can
// never redirect the write outside it.
function writableTarget(destDir, target) {
  const dest = path.join(destDir, target);
  if (!resolvesUnder(destDir, path.dirname(dest))) {
    throw new Error(`la ruta destino escapa de la raíz: ${dest}`);
  }
  return dest;
}

// Writes an incoming resource: a create, or an overwrite that first
// removes what was there. A conflict about to be overwritten mirrors
// its previous content under the backup root first. The entry is
// pushed before the copy so a failed write still reports the
// destructive half it already ran.
function writeResource({ src, destDir, backupRoot }, resource, applied) {
  const dest = writableTarget(destDir, resource.target);
  const entry = { target: resource.target, action: resource.action };
  if (resource.action === 'overwrite') {
    if (backupRoot !== null && resource.status === 'conflict') {
      entry.backup = backupConflict(destDir, backupRoot, resource.target);
    }
    fs.rmSync(dest, { recursive: true, force: true });
  }
  applied.push(entry);
  copyResource(path.join(src, resource.source), dest);
  entry.sha256 = hashPath(dest);
}

// Removes a resource: a retirement, or a removal conflict resolved
// to remove — a conflict gets the same backup an overwrite does.
// A backup that already ran still belongs in the report even when
// the removal that motivated it fails.
function removeResource({ destDir, backupRoot }, resource, applied) {
  const dest = writableTarget(destDir, resource.target);
  const entry = { target: resource.target, action: resource.action };
  if (backupRoot !== null && resource.status === 'conflict') {
    entry.backup = backupConflict(destDir, backupRoot, resource.target);
  }
  try {
    fs.rmSync(dest, { recursive: true, force: true });
  } catch (error) {
    if (entry.backup !== undefined) {
      applied.push({ target: resource.target, action: 'backup', backup: entry.backup });
    }
    throw error;
  }
  applied.push(entry);
}

// Nothing to write: the plan already proved the content equal, so
// no write guard applies. The hash goes with the action so the
// registry can record what the package manages even when nothing
// was written.
function recordIdentical({ destDir }, resource, applied) {
  applied.push({
    target: resource.target,
    action: resource.action,
    sha256: hashPath(path.join(destDir, resource.target)),
  });
}

// A decision that performs no work — skip, keep, or any action
// outside the executor's vocabulary — is reported as it arrived.
// The join is deliberate: the flat loop computed it for every
// entry, so a malformed target still throws here even though
// nothing is written.
function recordDecision({ destDir }, resource, applied) {
  path.join(destDir, resource.target);
  applied.push({ target: resource.target, action: resource.action });
}

// The actions that do work dispatch to their handler; everything
// else — the `else` the flat loop had — falls through to recording
// the decision. The table has no prototype: a resolution naming an
// inherited member — `hasOwnProperty`, `constructor` — is a foreign
// action to record, not a function to call.
const EXECUTE = {
  __proto__: null,
  create: writeResource,
  overwrite: writeResource,
  remove: removeResource,
  identical: recordIdentical,
};

// Materializes a resolved plan: creates the precondition
// directories, then dispatches each resource to the handler its
// resolved action names. A `conflict` that reaches a destructive
// step —overwrite or remove— was resolved to overwrite: with
// `backupRoot` set, its previous content is mirrored under that
// root first, and the applied entry carries the location.
// `sides.src` is the package directory copy actions read from: a
// removal-only plan declares no package side by omitting it — its
// entries carry no `source` and never reach the copy. If anything
// throws midway, the ExecutionError carries `applied` — the actions
// already performed — so the caller can report them.
export function executePlan({ src, dest: destDir }, plan, backupRoot = null) {
  const applied = [];
  const ctx = { src, destDir, backupRoot };
  try {
    for (const dir of plan.mkdirs) {
      const dest = path.join(destDir, dir);
      if (!resolvesUnder(destDir, dest)) {
        throw new Error(`la ruta destino escapa de la raíz: ${dest}`);
      }
      fs.mkdirSync(dest, { recursive: true });
      applied.push({ target: dir, action: 'mkdir' });
    }
    for (const resource of [...plan.resources, ...plan.retired]) {
      const action = actionOf(resource);
      (EXECUTE[action] ?? recordDecision)(ctx, { ...resource, action }, applied);
    }
  } catch (error) {
    throw new ExecutionError(applied, error);
  }
  return applied;
}

// Materializes the declared personalization guide into the managed
// namespace — not through the plan: the field already names the file,
// and .teleprompter/ belongs to the tool, so the write is
// unconditional apart from the same symlink-escape guard every write
// gets. Returns the target it wrote, or null when the manifest
// declares no guide.
export function installPersonalization(pkgDir, destDir, manifest) {
  if (!manifest.personalization) return null;
  const target = personalizationTarget(manifest.name, manifest.personalization);
  const dest = path.join(destDir, target);
  if (!resolvesUnder(destDir, path.dirname(dest))) {
    throw new Error(`la ruta destino escapa de la raíz: ${dest}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // rm first: copyFileSync would write through a symlink destination.
  fs.rmSync(dest, { force: true, recursive: true });
  fs.copyFileSync(path.join(pkgDir, manifest.personalization), dest);
  return { target };
}
