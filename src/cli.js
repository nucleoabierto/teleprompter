import { parseArgs, showHelp, USAGE } from './usage.js';
import {
  showGuide, showList, showCheck, runInstall, runUpdate, runUninstall,
} from './commands.js';
import { EXIT_USAGE } from './exits.js';

export {
  EXIT_OK, EXIT_MANIFEST, EXIT_PLAN, EXIT_EXECUTION, EXIT_USAGE, EXIT_FETCH,
} from './exits.js';

// Invocation layer only: parses arguments, delegates to src/ and maps
// the result to output and exit codes. Keeping it thin is what lets
// the test suite exercise the CLI without spawning processes.
// io: { out, err, cwd, interactive, createAsker, fetch, tmpBase } —
// injectable for tests.
export async function main(argv, io = {}) {
  const out = io.out ?? console.log;
  const err = io.err ?? console.error;

  const parsed = parseArgs(argv);
  if (parsed === null) {
    for (const line of USAGE.split('\n')) err(line);
    return EXIT_USAGE;
  }
  if (parsed.command === 'help') return showHelp(out, parsed.topic);
  if (parsed.command === 'guide') return showGuide(io, out, err, parsed.pkg);
  if (parsed.command === 'list') return showList(io, out);
  if (parsed.command === 'check') return showCheck(io, out);
  if (parsed.command === 'update') return runUpdate(io, out, err, parsed);
  if (parsed.command === 'uninstall') return runUninstall(io, out, err, parsed);
  return runInstall(io, out, err, parsed);
}
