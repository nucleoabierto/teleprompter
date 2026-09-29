import fs from 'node:fs';
import { verifyPackage } from './verify.js';
import { readLock, writeLock } from './lock.js';
import { buildPlan } from './plan.js';
import { executePlan } from './execute.js';
import { parseRepoSpec, fetchRepoTree, isValidRef } from './fetch.js';

export const EXIT_OK = 0;
export const EXIT_MANIFEST = 1;
export const EXIT_PLAN = 2;
export const EXIT_EXECUTION = 3;
export const EXIT_USAGE = 4;
export const EXIT_FETCH = 5;

const USAGE = 'uso: teleprompter [install] <user/repo[@ref]> [destino] | --path <paquete> [destino] [--force|--skip] [--dry-run]';
const KNOWN_FLAGS = new Set(['--force', '--skip', '--dry-run']);
const VALUE_OPTIONS = new Set(['--path', '--ref']);

// Grammar: an optional "install" alias, then either --path <dir> or a
// positional user/repo[@ref] spec, plus an optional positional OUT
// (defaults to the working directory). --ref and @ref are mutually
// exclusive; with --path no remote spec is processed at all.
function parseArgs(argv) {
  const rest = argv[0] === 'install' ? argv.slice(1) : argv;
  const args = [];
  const flags = new Set();
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (VALUE_OPTIONS.has(arg)) {
      if (options[arg] !== undefined) return null;
      const value = rest[++i];
      if (value === undefined || value.startsWith('--')) return null;
      options[arg] = value;
    } else if (arg.startsWith('--')) {
      flags.add(arg);
    } else {
      args.push(arg);
    }
  }
  const unknown = [...flags].find((f) => !KNOWN_FLAGS.has(f));
  if (unknown !== undefined || (flags.has('--force') && flags.has('--skip'))) return null;
  if (options['--path'] !== undefined) {
    if (args.length > 1 || options['--ref'] !== undefined) return null;
    return { source: { kind: 'path', dir: options['--path'] }, dest: args[0], flags };
  }
  if (args.length < 1 || args.length > 2) return null;
  const spec = parseRepoSpec(args[0]);
  if (spec === null || (spec.ref !== null && options['--ref'] !== undefined)) return null;
  if (options['--ref'] !== undefined && !isValidRef(options['--ref'])) return null;
  spec.ref = options['--ref'] ?? spec.ref;
  return { source: { kind: 'repo', spec }, dest: args[1], flags };
}

function printPlan(plan, out) {
  out('plan de instalación:');
  for (const dir of plan.mkdirs) out(`  ${'mkdir'.padEnd(15)}${dir}`);
  for (const r of plan.resources) out(`  ${r.status.padEnd(15)}${r.target}`);
}

const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();

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
    err(USAGE);
    return EXIT_USAGE;
  }
  const { source, dest, flags } = parsed;
  const destDir = dest ?? io.cwd;
  const badPaths = source.kind === 'path'
    ? [source.dir, destDir].filter((p) => !isDir(p))
    : isDir(destDir) ? [] : [destDir];
  if (badPaths.length > 0) {
    for (const p of badPaths) err(`la ruta no es un directorio: ${p}`);
    return EXIT_USAGE;
  }

  let pkgDir = source.dir;
  let cleanup = null;
  if (source.kind === 'repo') {
    const { owner, name, ref } = source.spec;
    out(`obteniendo: ${owner}/${name}${ref ? `@${ref}` : ''}`);
    const fetched = await fetchRepoTree(source.spec, { fetch: io.fetch, tmpBase: io.tmpBase });
    if (!fetched.ok) {
      err(`error de obtención: ${fetched.error}`);
      return EXIT_FETCH;
    }
    pkgDir = fetched.dir;
    cleanup = fetched.cleanup;
  }

  try {
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

    let actions;
    try {
      actions = executePlan(pkgDir, destDir, plan);
      writeLock(destDir, lock, result.manifest, actions);
    } catch (error) {
      for (const a of error.applied ?? actions) {
        out(`  ${a.action.padEnd(15)}${a.target}`);
      }
      err(`error de ejecución: ${error.message}`);
      return EXIT_EXECUTION;
    }
    out('resultado:');
    for (const a of actions) out(`  ${a.action.padEnd(15)}${a.target}`);
    if (result.manifest.personalization) {
      out(`personalización: instrucciones en "${result.manifest.personalization}" del paquete`);
    }
    out(`instalado: ${result.manifest.name}@${result.manifest.version}`);
    return EXIT_OK;
  } finally {
    if (cleanup !== null) cleanup();
  }
}
