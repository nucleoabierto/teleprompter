import fs from 'node:fs';
import { verifyPackage } from './verify.js';

export const EXIT_OK = 0;
export const EXIT_MANIFEST = 1;
export const EXIT_PLAN = 2;
export const EXIT_EXECUTION = 3;
export const EXIT_USAGE = 4;

const USAGE = 'uso: teleprompter install <paquete> <destino>';

// Invocation layer only: parses arguments, delegates to src/ and maps
// the result to output and exit codes. Keeping it thin is what lets
// the test suite exercise the CLI without spawning processes.
export function main(argv, out = console.log, err = console.error) {
  const [command, ...args] = argv;
  if (command !== 'install' || args.length !== 2) {
    err(USAGE);
    return EXIT_USAGE;
  }
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
  return EXIT_OK;
}
