import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  main, EXIT_OK, EXIT_PLAN,
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

// Fixture: package with file and directory resources; nested objects
// describe subdirectories recursively.
function pkgWith(name, files = {}) {
  const dir = path.join(tmp(), name);
  fs.mkdirSync(dir, { recursive: true });
  const install = Object.keys(files).map((f) => ({ source: f, target: f }));
  fs.writeFileSync(path.join(dir, 'teleprompter.json'), JSON.stringify({
    name, version: '1.0.0', install,
  }));
  writeTree(dir, files);
  return dir;
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

test('plan marks every resource create on an empty destination', async () => {
  const dest = tmp();
  const pkg = pkgWith('vacio', { 'a.txt': 'a', 'd/': { 'x.txt': 'x' } });
  const { code, stdout } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, /create\s+a\.txt/);
  assert.match(out, /create\s+d\//);
});

test('plan marks identical when the destination already holds the same content', async () => {
  const dest = tmp();
  const pkg = pkgWith('mismo', {
    'a.txt': 'igual',
    'dir': { 'f.txt': 'inside', 'sub': { 'g.txt': 'deep' } },
  });
  writeTree(dest, {
    'a.txt': 'igual',
    'dir': { 'f.txt': 'inside', 'sub': { 'g.txt': 'deep' } },
  });
  const { code, stdout } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, /identical\s+a\.txt/);
  assert.match(out, /identical\s+dir/);
});

test('plan reports conflict for foreign content without a lock record', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'otro contenido');
  const pkg = pkgWith('choque', { 'a.txt': 'a' });
  const { code, stderr } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /conflicto sin resolver: a\.txt/);
  assert.match(stderr.join('\n'), /plan no ejecutable/);
});

test('plan marks managed-update when the destination still holds what the lock recorded', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'versión previa');
  const sha256 = hashPath(path.join(dest, 'a.txt'));
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { propio: { version: '1.0.0', files: [{ target: 'a.txt', action: 'create', sha256 }] } },
  }));
  const pkg = pkgWith('propio', { 'a.txt': 'nueva' });
  const { code, stdout } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /managed-update\s+a\.txt/);
});

test('plan marks conflict when a recorded resource was modified locally', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'tocado a mano');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      mano: {
        version: '1.0.0',
        files: [{ target: 'a.txt', action: 'create', sha256: 'otro-hash' }],
      },
    },
  }));
  const pkg = pkgWith('mano', { 'a.txt': 'x' });
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan still computes with a missing or corrupt lock file', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), '{roto');
  const pkg = pkgWith('sinlock', { 'a.txt': 'a' });
  const { code, stdout } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /aviso:.*lock.*corrupto/s);
});

test('plan treats a recorded resource as conflict when the package downgrades it', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'previa');
  const sha256 = hashPath(path.join(dest, 'a.txt'));
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { viejo: { version: '2.0.0', files: [{ target: 'a.txt', action: 'create', sha256 }] } },
  }));
  const pkg = pkgWith('viejo', { 'a.txt': 'x' });
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan ignores a lock file that is valid JSON without a packages map', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), '{}');
  const pkg = pkgWith('sinpkgs', { 'a.txt': 'a' });
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
});

test('plan warns and treats a structurally malformed lock as empty history', async () => {
  for (const content of [
    'null', '[]', '{"packages":[]}', '{"packages":{"x":{"files":"nope"}}}',
    '{"packages":{"x":{"files":[{}]}}}',
    '{"packages":{"x":{"files":[{"target":"a.txt"}]}}}',
    '{"packages":{"x":{"version":"1.0.0","files":[{"target":"a.txt","sha256":123}]}}}',
  ]) {
    const dest = tmp();
    fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), content);
    const pkg = pkgWith('malformado', { 'a.txt': 'a' });
    const { code, stdout } = await run(['install', pkg, dest]);
    assert.equal(code, EXIT_OK);
    assert.match(stdout.join('\n'), /aviso:.*lock.*corrupto/s);
  }
});

test('plan treats a skip-recorded target as conflict since it carries no hash', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'cualquiera');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { saltado: { version: '1.0.0', files: [{ target: 'a.txt', action: 'skip' }] } },
  }));
  const pkg = pkgWith('saltado', { 'a.txt': 'x' });
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan does not confuse an empty file with an empty directory', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'a.txt'));
  const pkg = pkgWith('hueco', { 'a.txt': '' });
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan treats a dangling symlink at the target as occupied', async () => {
  const dest = tmp();
  fs.symlinkSync('no-existe', path.join(dest, 'a.txt'));
  const pkg = pkgWith('colgado', { 'a.txt': 'a' });
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan hashes a destination that is itself a symlink', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'real.txt'), 'contenido real');
  fs.symlinkSync('real.txt', path.join(dest, 'a.txt'));
  const pkg = pkgWith('enlaceraiz', { 'a.txt': 'a' });
  const { code } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan treats symlinks inside resources as comparable leaves', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'd'));
  fs.writeFileSync(path.join(dest, 'd', 'f.txt'), 'x');
  fs.symlinkSync('f.txt', path.join(dest, 'd', 'l'));
  const pkg = pkgWith('enlace', { 'd': { 'f.txt': 'x' } });
  fs.symlinkSync('f.txt', path.join(pkg, 'd', 'l'));
  const { code, stdout } = await run(['install', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /identical\s+d/);
});

test('an interactive console without an asker reports conflicts and aborts', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'ajeno');
  const pkg = pkgWith('sinpregunta', { 'a.txt': 'a' });
  const { code, stderr } = await run(['install', pkg, dest], { interactive: true });
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /conflicto sin resolver/);
});

test('--dry-run prints the plan and exits without writing', async () => {
  const dest = tmp();
  const pkg = pkgWith('seco', { 'a.txt': 'a' });
  const { code, stdout } = await run(['install', pkg, dest, '--dry-run']);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /--dry-run/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('--force resolves every conflict as overwrite', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'ajeno');
  const pkg = pkgWith('fuerza', { 'a.txt': 'a' });
  const { code, stdout } = await run(['install', pkg, dest, '--force']);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /plan resuelto/);
});

test('--skip resolves every conflict as skip', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'ajeno');
  const pkg = pkgWith('omite', { 'a.txt': 'a' });
  const { code } = await run(['install', pkg, dest, '--skip']);
  assert.equal(code, EXIT_OK);
});

test('an interactive console resolves each conflict per answer', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'ajeno');
  fs.writeFileSync(path.join(dest, 'b.txt'), 'ajeno también');
  const pkg = pkgWith('interactivo', { 'a.txt': 'a', 'b.txt': 'b' });
  const answers = [true, false];
  const questions = [];
  const { code, stdout } = await run(['install', pkg, dest], {
    interactive: true,
    createAsker: () => ({
      ask: async (q) => { questions.push(q); return answers.shift(); },
      close: () => {},
    }),
  });
  assert.equal(code, EXIT_OK);
  assert.equal(questions.length, 2);
  assert.match(questions[0], /sobrescribir/);
  assert.match(stdout.join('\n'), /a\.txt → overwrite/);
  assert.match(stdout.join('\n'), /b\.txt → skip/);
});
