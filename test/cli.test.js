import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { create as tarCreate } from 'tar';
import {
  main, EXIT_OK, EXIT_MANIFEST, EXIT_PLAN, EXIT_USAGE, EXIT_FETCH,
} from '../src/cli.js';

const repoRoot = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const referencePkg = path.join(repoRoot, 'packages', 'ciclo-tareas');

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

test('main exits with usage error on missing, wrong, or excess arguments', async () => {
  for (const argv of [[], ['doctor'], ['install'], ['install', 'a', 'b', 'c']]) {
    const { code, stderr } = await run(argv);
    assert.equal(code, EXIT_USAGE);
    assert.match(stderr[0], /uso:/);
  }
});

test('main exits with usage error on unknown or mutually exclusive flags', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p'), { 'a.txt': 'a' });
  assert.equal((await run(['--path', pkg, dest, '--wat'])).code, EXIT_USAGE);
  assert.equal((await run(['--path', pkg, dest, '--force', '--skip'])).code, EXIT_USAGE);
});

test('main exits with usage error and names each missing directory', async () => {
  const dest = tmp();
  const { code, stderr } = await run(['--path', path.join(dest, 'no-pkg'), path.join(dest, 'no-dest')]);
  assert.equal(code, EXIT_USAGE);
  assert.equal(stderr.length, 2);

  const pkg = path.join(tmp(), 'x');
  writePkg(pkg, validManifest('x'), { 'a.txt': 'a' });
  const missing = await run(['--path', pkg, path.join(dest, 'no-dest')]);
  assert.equal(missing.code, EXIT_USAGE);
  assert.match(missing.stderr[0], /no-dest/);
});

test('main exits with usage error when a path is a file, not a directory', async () => {
  const file = path.join(tmp(), 'su.txt');
  fs.writeFileSync(file, 'x');
  const pkg = path.join(tmp(), 'y');
  writePkg(pkg, validManifest('y'), { 'a.txt': 'a' });
  const { code, stderr } = await run(['--path', file, tmp()]);
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr[0], /no es un directorio/);
  const { code: code2 } = await run(['--path', pkg, file]);
  assert.equal(code2, EXIT_USAGE);
});

test('the real binary verifies the reference package', () => {
  const bin = path.join(repoRoot, 'bin', 'teleprompter.js');
  const dest = tmp();
  const out = execFileSync('node', [bin, 'install', '--path', referencePkg, dest], { encoding: 'utf8' });
  assert.match(out, /ciclo-tareas@1\.0\.0/);
});

test('main verifies the reference package and exits 0 with an all-create plan', async () => {
  const dest = tmp();
  const { code, stdout, stderr } = await run(['install', '--path', referencePkg, dest]);
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /ciclo-tareas@1\.0\.0/);
  assert.match(stdout.join('\n'), /mkdir\s+\.agents\/skills\//);
  assert.match(stdout.join('\n'), /create\s+\.agents\/skills\/crear-tareas\//);
});

test('main exits 1 on an invalid manifest without writing to the destination', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'roto');
  fs.mkdirSync(pkg);
  fs.writeFileSync(path.join(pkg, 'teleprompter.json'), 'no es json');
  const { code, stderr } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_MANIFEST);
  assert.match(stderr[0], /JSON inválido/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('main exits 1 on a collection manifest', async () => {
  const pkg = path.join(tmp(), 'coleccion');
  writePkg(pkg, { collection: true, name: 'coleccion', packages: [] });
  const { code } = await run(['--path', pkg, tmp()]);
  assert.equal(code, EXIT_MANIFEST);
});

test('main exits 2 on an unmet precondition without writing', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'con-precondicion');
  writePkg(pkg, validManifest('con-precondicion', {
    requires: { paths: [{ path: 'existe-ya/' }] },
  }), { 'a.txt': 'a' });
  const { code, stderr } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr[0], /existe-ya/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('main passes when a missing precondition path allows creation', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'con-create');
  writePkg(pkg, validManifest('con-create', {
    requires: { paths: [{ path: 'se-crea/', create: true }] },
  }), { 'a.txt': 'a' });
  const { code } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
});

test('main passes when the required path already exists', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'ya-esta'));
  const pkg = path.join(tmp(), 'ok-pre');
  writePkg(pkg, validManifest('ok-pre', {
    requires: { paths: [{ path: 'ya-esta' }] },
  }), { 'a.txt': 'a' });
  const { code } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
});

test('main exits 1 when two install entries share a target', async () => {
  const pkg = path.join(tmp(), 'duplicado');
  writePkg(pkg, {
    name: 'duplicado',
    version: '1.0.0',
    install: [
      { source: 'a.txt', target: 'a.txt' },
      { source: 'a.txt', target: 'a.txt' },
    ],
  }, { 'a.txt': 'a' });
  const { code, stderr } = await run(['--path', pkg, tmp()]);
  assert.equal(code, EXIT_MANIFEST);
  assert.match(stderr.join('\n'), /target duplicado/);
});

test('main exits 1 on normalized duplicate, nested, or reserved targets', async () => {
  const cases = [
    { targets: ['a.txt', 'a.txt/'], match: /target duplicado/ },
    { targets: ['a', 'a/b.txt'], match: /dentro de otro target/ },
    { targets: ['teleprompter-lock.json'], match: /target reservado/ },
  ];
  for (const { targets, match } of cases) {
    const pkg = path.join(tmp(), 'colisiones');
    writePkg(pkg, {
      name: 'colisiones',
      version: '1.0.0',
      install: targets.map((t) => ({ source: 'a.txt', target: t })),
    }, { 'a.txt': 'a' });
    const { code, stderr } = await run(['--path', pkg, tmp()]);
    assert.equal(code, EXIT_MANIFEST);
    assert.match(stderr.join('\n'), match);
  }
});

test('main warns on unknown top-level fields and still succeeds', async () => {
  const pkg = path.join(tmp(), 'con-aviso');
  writePkg(pkg, validManifest('con-aviso', { campo_raro: 1 }), { 'a.txt': 'a' });
  const { code, stdout } = await run(['--path', pkg, tmp()]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout[0], /aviso: campo desconocido ignorado: "campo_raro"/);
});

// --- origen remoto user/repo ---

// GitHub archives wrap the tree in a root directory; the extractor
// strips it. The manifest name must equal the repo name because the
// package lands in {tmp}/{repo} and the manifest rule applies.
async function repoTarball(name, manifest, files = {}) {
  const work = tmp();
  writePkg(path.join(work, `${name}-abc123`), manifest, files);
  const archive = path.join(work, 'a.tgz');
  await tarCreate({ gzip: true, file: archive, cwd: work }, [`${name}-abc123`]);
  return fs.readFileSync(archive);
}

const okResponse = (buf) => ({
  ok: true,
  arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
});

function spyFetch(behavior = () => okResponse(Buffer.alloc(0))) {
  const spy = { urls: [], calls: 0 };
  spy.fetch = async (url) => {
    spy.urls.push(url);
    spy.calls += 1;
    return typeof behavior === 'function' ? behavior(url) : behavior;
  };
  return spy;
}

const remotePkg = () => repoTarball('mi-paquete', validManifest('mi-paquete'), { 'a.txt': 'a' });

test('user/repo without OUT installs into the working directory', async () => {
  const cwd = tmp();
  const tmpBase = tmp();
  const spy = spyFetch(await remotePkg().then(okResponse));
  const { code, stdout, stderr } = await run(['o/mi-paquete'], { cwd, tmpBase, fetch: spy.fetch });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /obteniendo: o\/mi-paquete/);
  assert.equal(fs.readFileSync(path.join(cwd, 'a.txt'), 'utf8'), 'a');
  assert.ok(fs.existsSync(path.join(cwd, 'teleprompter-lock.json')));
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('user/repo with OUT installs into it', async () => {
  const dest = tmp();
  const spy = spyFetch(okResponse(await remotePkg()));
  const { code, stderr } = await run(['o/mi-paquete', dest], { fetch: spy.fetch });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
});

test('install is an alias of the short form', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const spy = spyFetch(okResponse(await remotePkg()));
  const { code } = await run(['install', 'o/mi-paquete', dest], { tmpBase, fetch: spy.fetch });
  assert.equal(code, EXIT_OK);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('--path installs the local package without any HTTP request', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'local-pkg');
  writePkg(pkg, validManifest('local-pkg'), { 'a.txt': 'a' });
  const spy = spyFetch();
  const { code } = await run(['--path', pkg, dest], { fetch: spy.fetch });
  assert.equal(code, EXIT_OK);
  assert.equal(spy.calls, 0);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
});

test('the ref reaches the download URL via @ref or --ref', async () => {
  for (const argv of [['o/mi-paquete@v9', tmp()], ['o/mi-paquete', tmp(), '--ref', 'v9']]) {
    const spy = spyFetch(okResponse(await remotePkg()));
    const { code } = await run(argv, { fetch: spy.fetch });
    assert.equal(code, EXIT_OK);
    assert.equal(spy.urls[0], 'https://codeload.github.com/o/mi-paquete/tar.gz/v9');
  }
});

test('declaring @ref and --ref at once is a usage error', async () => {
  const { code } = await run(['o/mi-paquete@v9', tmp(), '--ref', 'v8']);
  assert.equal(code, EXIT_USAGE);
});

test('an invalid --ref value is a usage error', async () => {
  assert.equal((await run(['o/mi-paquete', tmp(), '--ref', 'a..b'])).code, EXIT_USAGE);
  assert.equal((await run(['o/mi-paquete', tmp(), '--ref', 'a b'])).code, EXIT_USAGE);
});

test('usage errors: bad spec, excess args, --path combos, missing option values', async () => {
  const cases = [
    ['no-es-repo'], ['o/r', 'a', 'b'], ['--path', tmp(), 'a', 'b'],
    ['--path', tmp(), '--ref', 'v1'], ['--path'], ['--path', '--force'],
    ['--path', 'a', '--path', 'b'], ['--ref', 'v1'],
  ];
  for (const argv of cases) {
    assert.equal((await run(argv)).code, EXIT_USAGE, argv.join(' '));
  }
});

test('a missing repository exits 5 and writes nothing', async () => {
  const dest = tmp();
  const spy = spyFetch({ ok: false, status: 404 });
  const { code, stderr } = await run(['o/privado', dest], { fetch: spy.fetch });
  assert.equal(code, EXIT_FETCH);
  assert.match(stderr.join('\n'), /error de obtención.*o\/privado/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('a missing ref exits 5 and writes nothing', async () => {
  const dest = tmp();
  const spy = spyFetch({ ok: false, status: 404 });
  const { code, stderr } = await run(['o/mi-paquete@no-existe', dest], { fetch: spy.fetch });
  assert.equal(code, EXIT_FETCH);
  assert.match(stderr.join('\n'), /error de obtención.*no-existe/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('a network failure exits 5 and writes nothing', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const spy = spyFetch(() => Promise.reject(new Error('ENOTFOUND')));
  const { code, stderr } = await run(['o/r@x', dest], { tmpBase, fetch: spy.fetch });
  assert.equal(code, EXIT_FETCH);
  assert.match(stderr.join('\n'), /error de obtención.*contactar/);
  assert.deepEqual(fs.readdirSync(dest), []);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('a repo without teleprompter.json exits 1 and cleans the temp dir', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const work = tmp();
  fs.mkdirSync(path.join(work, 'vacio-abc'));
  const archive = path.join(work, 'a.tgz');
  await tarCreate({ gzip: true, file: archive, cwd: work }, ['vacio-abc']);
  const spy = spyFetch(okResponse(fs.readFileSync(archive)));
  const { code } = await run(['o/vacio', dest], { tmpBase, fetch: spy.fetch });
  assert.equal(code, EXIT_MANIFEST);
  assert.deepEqual(fs.readdirSync(dest), []);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('a non-directory OUT is a usage error before any request', async () => {
  const spy = spyFetch();
  const { code, stderr } = await run(['o/mi-paquete', path.join(tmp(), 'no-dir')], { fetch: spy.fetch });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /no es un directorio/);
  assert.equal(spy.calls, 0);
});

test('--dry-run with a remote origin writes nothing and cleans the temp dir', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const spy = spyFetch(okResponse(await remotePkg()));
  const { code, stdout } = await run(['o/mi-paquete', dest, '--dry-run'], { tmpBase, fetch: spy.fetch });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /--dry-run/);
  assert.deepEqual(fs.readdirSync(dest), []);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('--skip resolves remote conflicts like a local origin', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'contenido propio');
  const spy = spyFetch(okResponse(await remotePkg()));
  const { code } = await run(['o/mi-paquete', dest, '--skip'], { fetch: spy.fetch });
  assert.equal(code, EXIT_OK);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'contenido propio');
});

test('--force resolves remote conflicts like a local origin', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'contenido propio');
  const spy = spyFetch(okResponse(await remotePkg()));
  const { code } = await run(['o/mi-paquete', dest, '--force'], { fetch: spy.fetch });
  assert.equal(code, EXIT_OK);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
});
