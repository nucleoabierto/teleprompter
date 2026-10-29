import { ExecutionError } from './execute.js';
import { EXIT_EXECUTION } from './exits.js';

export function printPlan(plan, out, title) {
  out(title);
  for (const dir of plan.mkdirs) out(`  ${'mkdir'.padEnd(15)}${dir}`);
  for (const r of [...plan.resources, ...plan.retired]) {
    out(`  ${r.status.padEnd(15)}${r.target}`);
  }
}

// The maintainer's guide is delivered verbatim under a heading that
// names its managed location — the installer and the `guide` command
// share this block so consulting later shows what installing showed.
export function printGuide(out, target, content) {
  out(`personalización (${target}):`);
  for (const line of content.replace(/\n$/, '').split('\n')) out(line);
}

// Drift marks in product language: `check` reports the state of each
// recorded resource without exposing the hashes it compared.
export const DRIFT_MARKS = {
  intact: 'intacto',
  modified: 'modificado',
  missing: 'ausente',
  unverifiable: 'no verificable',
};

// Reports the backup an operation produced — in the result or in the
// failure report when it already ran: where it lives and which
// targets it preserved.
export function reportBackup(out, actions, backupRoot) {
  const backedUp = actions.filter((a) => a.backup !== undefined);
  if (backedUp.length === 0) return;
  out(`respaldo (${backupRoot}/):`);
  for (const a of backedUp) out(`  ${a.target}`);
}

// Warnings travel with the data that produced them — the lock, a
// manifest, a collection — but the `aviso:` idiom is the CLI's: one
// emitter keeps the prefix and the emission order in a single place.
export function reportWarnings(out, warnings) {
  for (const warning of warnings) out(`aviso: ${warning}`);
}

// A mid-plan failure reports the same three things wherever it
// surfaces: the actions already applied — the ExecutionError carries
// them; a failure outside the plan falls back to the full list —,
// the backup already made, and the error itself under the execution
// exit code.
export function reportExecutionFailure(out, err, error, actions, backupRoot) {
  const applied = error instanceof ExecutionError ? error.applied : actions;
  for (const a of applied) {
    out(`  ${a.action.padEnd(15)}${a.target}`);
  }
  reportBackup(out, applied, backupRoot);
  err(`error de ejecución: ${error.message}`);
  return EXIT_EXECUTION;
}
