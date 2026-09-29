import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  main, EXIT_OK, EXIT_PLAN, EXIT_EXECUTION,
} from '../src/cli.js';
import { hashPath } from '../src/hash.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-'));
}

async function run(argv, io = {}) {
  const stdout = [];
  const stderr = [];
  const code = await main(argv, {
    out: (m) => stdout.push(m),
    err: (m) => stderr.push(m),
    ...io,
  });
  return { code, stdout, stderr };
}

function writeTree(dir, files) {
  for (const [file, content] of Object.entries(files)) {
    const p = path.join(dir, file);
    if (typeof content === 'object') {
      fs.mkdirSync(p, { recursive: true });
      writeTree(p, content);
    } else {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, content);
    }
  }
}

function pkgWith(name, files = {}, extra = {}) {
  const dir = path.join(tmp(), name);
  fs.mkdirSync(dir, { recursive: true });
  const install = Object.keys(files).map((f) => ({ source: f, target: f }));
  fs.writeFileSync(path.join(dir, 'teleprompter.json'), JSON.stringify({
    name, version: '1.0.0', install, ...extra,
  }));
  writeTree(dir, files);
  return dir;
}

const readLockFile = (dest) => JSON.parse(
  fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'),
);

test('install copies every resource and writes the lock on an empty destination', async () => {
  const dest = tmp();
  const pkg = pkgWith('completo', { 'a.txt': 'a', 'd': { 'f.txt': 'x' } });
  const { code, stdout } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
  assert.equal(fs.readFileSync(path.join(dest, 'd', 'f.txt'), 'utf8'), 'x');
  assert.match(stdout.join('\n'), /instalado: completo@1\.0\.0/);
  const lock = readLockFile(dest);
  const files = lock.packages['completo'].files;
  assert.equal(files.length, 2);
  assert.deepEqual(
    files.map((f) => [f.target, f.action]).sort(),
    [['a.txt', 'create'], ['d', 'create']],
  );
  assert.equal(files[0].sha256, hashPath(path.join(dest, files[0].target)));
});

test('reinstalling the same package reports identical and keeps the recorded entry', async () => {
  const dest = tmp();
  const pkg = pkgWith('repetido', { 'a.txt': 'a' });
  assert.equal((await run(['install', pkg, dest])).code, EXIT_OK);
  const { code, stdout } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /identical\s+a\.txt/);
  const files = readLockFile(dest).packages['repetido'].files;
  assert.equal(files.length, 1);
  assert.equal(files[0].action, 'create');
  assert.equal(files[0].sha256, hashPath(path.join(dest, 'a.txt')));
});

test('a mixed plan applies only the action each resource was assigned', async () => {
  const dest = tmp();
  writeTree(dest, { 'vieja.txt': 'v1', 'queda.txt': 'intocable' });
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      mixto: {
        version: '0.9.0',
        files: [{ target: 'vieja.txt', action: 'create', sha256: hashPath(path.join(dest, 'vieja.txt')) }],
      },
    },
  }));
  const pkg = pkgWith('mixto', {
    'nueva.txt': 'n', 'vieja.txt': 'v2', 'queda.txt': 'x',
  });
  const { code, stdout } = await run(['install', pkg, dest, '--skip']);
  assert.equal(code, EXIT_OK);
  assert.equal(fs.readFileSync(path.join(dest, 'nueva.txt'), 'utf8'), 'n');
  assert.equal(fs.readFileSync(path.join(dest, 'vieja.txt'), 'utf8'), 'v2');
  assert.equal(fs.readFileSync(path.join(dest, 'queda.txt'), 'utf8'), 'intocable');
  const out = stdout.join('\n');
  assert.match(out, /create\s+nueva\.txt/);
  assert.match(out, /managed-update\s+vieja\.txt/);
  const files = readLockFile(dest).packages['mixto'].files;
  const skipEntry = files.find((f) => f.target === 'queda.txt');
  assert.deepEqual(skipEntry, { target: 'queda.txt', action: 'skip' });
});

test('overwrite removes a symlink destination instead of writing through it', async () => {
  const dest = tmp();
  const outside = tmp();
  fs.writeFileSync(path.join(outside, 'fuera.txt'), 'no tocar');
  fs.symlinkSync(path.join(outside, 'fuera.txt'), path.join(dest, 'a.txt'));
  const pkg = pkgWith('sobre-enlace', { 'a.txt': 'nuevo' });
  const { code } = await run(['install', pkg, dest, '--force']);
  assert.equal(code, EXIT_OK);
  assert.equal(fs.readFileSync(path.join(outside, 'fuera.txt'), 'utf8'), 'no tocar');
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'nuevo');
});

test('install copies a symlink resource as a symlink', async () => {
  const dest = tmp();
  const pkg = pkgWith('enlazado', { 'd': { 'f.txt': 'x' } });
  fs.symlinkSync('f.txt', path.join(pkg, 'd', 'l'));
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.ok(fs.lstatSync(path.join(dest, 'd', 'l')).isSymbolicLink());
  assert.equal(fs.readlinkSync(path.join(dest, 'd', 'l')), 'f.txt');
});

test('install copies a top-level symlink resource as a symlink', async () => {
  const dest = tmp();
  const pkg = pkgWith('enlace-directo', { 'real.txt': 'contenido' });
  fs.symlinkSync('real.txt', path.join(pkg, 'atajo.txt'));
  const manifest = JSON.parse(fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'));
  manifest.install.push({ source: 'atajo.txt', target: 'atajo.txt' });
  fs.writeFileSync(path.join(pkg, 'teleprompter.json'), JSON.stringify(manifest));
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.ok(fs.lstatSync(path.join(dest, 'atajo.txt')).isSymbolicLink());
  assert.equal(fs.readlinkSync(path.join(dest, 'atajo.txt')), 'real.txt');
});

test('writeLock preserves records belonging to other packages', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      otro: {
        version: '3.2.1',
        installedAt: '2026-01-01T00:00:00Z',
        files: [{ target: 'z.txt', action: 'create', sha256: 'h' }],
      },
    },
  }));
  const pkg = pkgWith('segundo', { 'a.txt': 'a' });
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  const lock = readLockFile(dest);
  assert.equal(lock.packages['otro'].version, '3.2.1');
  assert.equal(lock.packages['segundo'].files.length, 1);
});

test('install reports the personalization instructions location', async () => {
  const dest = tmp();
  const pkg = pkgWith('con-guia', { 'a.txt': 'a', 'guia.md': 'sigue esto' }, {
    personalization: 'guia.md',
  });
  const { code, stdout } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /personalización:.*guia\.md/);
});

test('a mid-execution error exits 3 and reports what was applied', async () => {
  const dest = tmp();
  const blocked = path.join(dest, 'sub');
  fs.mkdirSync(blocked);
  fs.chmodSync(blocked, 0o555);
  try {
    const pkg = pkgWith('falla', { 'a.txt': 'a', 'sub/f.txt': 'x' });
    const { code, stdout, stderr } = await run(['install', pkg, dest]);
    assert.equal(code, EXIT_EXECUTION);
    assert.match(stdout.join('\n'), /create\s+a\.txt/);
    assert.match(stderr.join('\n'), /error de ejecución/);
  } finally {
    fs.chmodSync(blocked, 0o755);
  }
});

test('a lock write failure exits 3 and still reports what was applied', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'teleprompter-lock.json'));
  const pkg = pkgWith('lockroto', { 'a.txt': 'a' });
  const { code, stdout, stderr } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_EXECUTION);
  assert.match(stdout.join('\n'), /create\s+a\.txt/);
  assert.match(stderr.join('\n'), /error de ejecución/);
});

test('overwrite replaces a whole directory destination', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'd'));
  fs.writeFileSync(path.join(dest, 'd', 'viejo.txt'), 'fuera');
  const pkg = pkgWith('sobre-dir', { 'd': { 'f.txt': 'dentro' } });
  const { code } = await run(['install', pkg, dest, '--force']);
  assert.equal(code, EXIT_OK);
  assert.equal(fs.readFileSync(path.join(dest, 'd', 'f.txt'), 'utf8'), 'dentro');
  assert.equal(fs.existsSync(path.join(dest, 'd', 'viejo.txt')), false);
});

test('a target under a symlinked directory is a conflict, not a create', async () => {
  const dest = tmp();
  const outside = tmp();
  fs.symlinkSync(outside, path.join(dest, 'vendor'));
  const pkg = pkgWith('tras-enlace', { 'vendor/f.txt': 'x' });
  const { code, stdout } = await run(['install', pkg, dest, '--force']);
  assert.equal(code, EXIT_EXECUTION);
  assert.match(stdout.join('\n'), /conflict\s+vendor\/f\.txt/);
  assert.equal(fs.existsSync(path.join(outside, 'f.txt')), false);
});

test('a target whose ancestor is a file is a conflict, not a create', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a'), 'soy un archivo');
  const pkg = pkgWith('tras-archivo', { 'a/b.txt': 'x' });
  const { code } = await run(['install', pkg, dest, '--force']);
  assert.equal(code, EXIT_EXECUTION);
  assert.equal(fs.readFileSync(path.join(dest, 'a'), 'utf8'), 'soy un archivo');
});

test('a target under a dangling symlink is a conflict, not a create', async () => {
  const dest = tmp();
  fs.symlinkSync('no-existe', path.join(dest, 'vendor'));
  const pkg = pkgWith('tras-colgado', { 'vendor/f.txt': 'x' });
  const { code } = await run(['install', pkg, dest, '--force']);
  assert.equal(code, EXIT_EXECUTION);
});

test('a precondition directory under a symlinked path is an unmet precondition', async () => {
  const dest = tmp();
  const outside = tmp();
  fs.symlinkSync(outside, path.join(dest, 'vendor'));
  const pkg = pkgWith('mkdir-fuera', { 'a.txt': 'a' }, {
    requires: { paths: [{ path: 'vendor/sub', create: true }] },
  });
  const { code, stderr } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /precondición incumplida/);
  assert.equal(fs.existsSync(path.join(outside, 'sub')), false);
});

test('executePlan refuses a mkdir that escapes the destination root', async () => {
  const { executePlan } = await import('../src/execute.js');
  const dest = tmp();
  const outside = tmp();
  fs.symlinkSync(outside, path.join(dest, 'vendor'));
  assert.throws(
    () => executePlan(tmp(), dest, { mkdirs: ['vendor/sub'], resources: [] }),
    /escapa de la raíz/,
  );
});

test('executePlan refuses a conflict left without resolution', async () => {
  const { executePlan } = await import('../src/execute.js');
  const dest = tmp();
  const pkg = pkgWith('sin-resolver', { 'a.txt': 'a' });
  assert.throws(
    () => executePlan(pkg, dest, {
      mkdirs: [], resources: [{ source: 'a.txt', target: 'a.txt', status: 'conflict' }],
    }),
    /plan sin resolver: a\.txt/,
  );
});
