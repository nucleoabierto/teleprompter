import fs from 'node:fs';
import { verifyPackage } from './verify.js';
import { readLock } from './lock.js';
import { buildPlan } from './plan.js';

export const EXIT_OK = 0;
export const EXIT_MANIFEST = 1;
export const EXIT_PLAN = 2;
export const EXIT_EXECUTION = 3;
export const EXIT_USAGE = 4;

const USAGE = 'uso: teleprompter install <paquete> <destino> [--force|--skip] [--dry-run]';
const KNOWN_FLAGS = new Set(['--force', '--skip', '--dry-run']);

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const args = [];
  const flags = new Set();
  for (const arg of rest) {
    if (arg.startsWith('--')) flags.add(arg);
    else args.push(arg);
  }
  const unknown = [...flags].find((f) => !KNOWN_FLAGS.has(f));
  const invalid = command !== 'install' || args.length !== 2
    || unknown !== undefined || (flags.has('--force') && flags.has('--skip'));
  return invalid ? null : { args, flags };
}

function printPlan(plan, out) {
  out('plan de instalación:');
  for (const dir of plan.mkdirs) out(`  ${'mkdir'.padEnd(15)}${dir}`);
  for (const r of plan.resources) out(`  ${r.status.padEnd(15)}${r.target}`);
}

// Invocation layer only: parses arguments, delegates to src/ and maps
// the result to output and exit codes. Keeping it thin is what lets
// the test suite exercise the CLI without spawning processes.
// io: { out, err, interactive, createAsker } — injectable for tests.
export async function main(argv, io = {}) {
  const out = io.out ?? console.log;
  const err = io.err ?? console.error;

  const parsed = parseArgs(argv);
  if (parsed === null) {
    err(USAGE);
    return EXIT_USAGE;
  }
  const { args, flags } = parsed;
  const [pkgDir, destDir] = args;
  const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
  if (!isDir(pkgDir) || !isDir(destDir)) {
    for (const arg of args) {
      if (!isDir(arg)) err(`la ruta no es un directorio: ${arg}`);
    }
    return EXIT_USAGE;
  }

  const result = verifyPackage(pkgDir, destDir);
  for (const warning of result.warnings) out(`aviso: ${warning}`);
  if (result.kind === 'manifest') {
    for (const error of result.errors) err(`manifiesto inválido: ${error}`);
    return EXIT_MANIFEST;
  }
  if (result.kind === 'requires') {
    for (const p of result.failures) {
      err(`precondición incumplida: "${p}" no existe en el destino`);
    }
    return EXIT_PLAN;
  }
  out(`verificado: ${result.manifest.name}@${result.manifest.version}`);

  const lock = readLock(destDir);
  for (const warning of lock.warnings) out(`aviso: ${warning}`);
  const plan = buildPlan(pkgDir, result.manifest, destDir, result.creates, lock);
  printPlan(plan, out);

  if (plan.conflicts.length > 0) {
    if (flags.has('--force')) {
      for (const r of plan.conflicts) r.resolution = 'overwrite';
    } else if (flags.has('--skip')) {
      for (const r of plan.conflicts) r.resolution = 'skip';
    } else if (io.interactive && io.createAsker) {
      const asker = io.createAsker();
      try {
        for (const r of plan.conflicts) {
          const overwrite = await asker.ask(`colisión en ${r.target}: ¿sobrescribir? [s/N] `);
          r.resolution = overwrite ? 'overwrite' : 'skip';
        }
      } finally {
        asker.close();
      }
    } else {
      for (const r of plan.conflicts) err(`conflicto sin resolver: ${r.target}`);
      err('plan no ejecutable: colisiones sin resolver');
      return EXIT_PLAN;
    }
    for (const r of plan.conflicts) out(`  ${r.target} → ${r.resolution}`);
  }

  if (flags.has('--dry-run')) {
    out('fin del plan (--dry-run): nada se escribió');
    return EXIT_OK;
  }

  // Execution and registry are the next layer; a resolved plan is the
  // boundary this command currently stops at.
  out(`plan resuelto: ${plan.resources.length} recursos`);
  return EXIT_OK;
}
