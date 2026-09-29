import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
  main, EXIT_OK, EXIT_MANIFEST, EXIT_PLAN, EXIT_USAGE,
} from '../src/cli.js';

const repoRoot = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const referencePkg = path.join(repoRoot, 'packages', 'ciclo-tareas');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-'));
}

function run(argv) {
  const stdout = [];
  const stderr = [];
  const code = main(argv, (m) => stdout.push(m), (m) => stderr.push(m));
  return { code, stdout, stderr };
}

function writePkg(dir, manifest, files = {}) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'teleprompter.json'), JSON.stringify(manifest));
  for (const [name, content] of Object.entries(files)) {
    const p = path.join(dir, name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
}

function validManifest(name, extra = {}) {
  return {
    name,
    version: '1.0.0',
    install: [{ source: 'a.txt', target: 'a.txt' }],
    ...extra,
  };
}

test('main exits with usage error on missing, wrong, or excess arguments', () => {
  for (const argv of [[], ['doctor'], ['install'], ['install', 'a', 'b', 'c']]) {
    const { code, stderr } = run(argv);
    assert.equal(code, EXIT_USAGE);
    assert.match(stderr[0], /uso:/);
  }
});

test('main exits with usage error and names each missing directory', () => {
  const dest = tmp();
  const { code, stderr } = run(['install', path.join(dest, 'no-pkg'), path.join(dest, 'no-dest')]);
  assert.equal(code, EXIT_USAGE);
  assert.equal(stderr.length, 2);

  const pkg = path.join(tmp(), 'x');
  writePkg(pkg, validManifest('x'), { 'a.txt': 'a' });
  const missing = run(['install', pkg, path.join(dest, 'no-dest')]);
  assert.equal(missing.code, EXIT_USAGE);
  assert.match(missing.stderr[0], /no-dest/);
});

test('main exits with usage error when a path is a file, not a directory', () => {
  const file = path.join(tmp(), 'su.txt');
  fs.writeFileSync(file, 'x');
  const pkg = path.join(tmp(), 'y');
  writePkg(pkg, validManifest('y'), { 'a.txt': 'a' });
  const { code, stderr } = run(['install', file, tmp()]);
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr[0], /no es un directorio/);
  const { code: code2 } = run(['install', pkg, file]);
  assert.equal(code2, EXIT_USAGE);
});

test('the real binary verifies the reference package', () => {
  const bin = path.join(repoRoot, 'bin', 'teleprompter.js');
  const dest = tmp();
  const out = execFileSync('node', [bin, 'install', referencePkg, dest], { encoding: 'utf8' });
  assert.match(out, /ciclo-tareas@1\.0\.0/);
});

test('main verifies the reference package and exits 0', () => {
  const dest = tmp();
  const { code, stdout, stderr } = run(['install', referencePkg, dest]);
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout[0], /ciclo-tareas@1\.0\.0/);
});

test('main exits 1 on an invalid manifest without writing to the destination', () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'roto');
  fs.mkdirSync(pkg);
  fs.writeFileSync(path.join(pkg, 'teleprompter.json'), 'no es json');
  const { code, stderr } = run(['install', pkg, dest]);
  assert.equal(code, EXIT_MANIFEST);
  assert.match(stderr[0], /JSON inválido/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('main exits 1 on a collection manifest', () => {
  const pkg = path.join(tmp(), 'coleccion');
  writePkg(pkg, { collection: true, name: 'coleccion', packages: [] });
  const { code } = run(['install', pkg, tmp()]);
  assert.equal(code, EXIT_MANIFEST);
});

test('main exits 2 on an unmet precondition without writing', () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'con-precondicion');
  writePkg(pkg, validManifest('con-precondicion', {
    requires: { paths: [{ path: 'existe-ya/' }] },
  }), { 'a.txt': 'a' });
  const { code, stderr } = run(['install', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr[0], /existe-ya/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('main passes when a missing precondition path allows creation', () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'con-create');
  writePkg(pkg, validManifest('con-create', {
    requires: { paths: [{ path: 'se-crea/', create: true }] },
  }), { 'a.txt': 'a' });
  const { code } = run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
});

test('main passes when the required path already exists', () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'ya-esta'));
  const pkg = path.join(tmp(), 'ok-pre');
  writePkg(pkg, validManifest('ok-pre', {
    requires: { paths: [{ path: 'ya-esta' }] },
  }), { 'a.txt': 'a' });
  const { code } = run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
});

test('main warns on unknown top-level fields and still succeeds', () => {
  const pkg = path.join(tmp(), 'con-aviso');
  writePkg(pkg, validManifest('con-aviso', { campo_raro: 1 }), { 'a.txt': 'a' });
  const { code, stdout } = run(['install', pkg, tmp()]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout[0], /aviso: campo desconocido ignorado: "campo_raro"/);
});
