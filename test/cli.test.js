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

test('a remote origin delivers the guide read from the destination', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const buf = await repoTarball('mi-paquete',
    validManifest('mi-paquete', { personalization: 'guia.md' }),
    { 'a.txt': 'a', 'guia.md': 'guía remota' });
  const spy = spyFetch(okResponse(buf));
  const { code, stdout } = await run(['o/mi-paquete', dest], { tmpBase, fetch: spy.fetch });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'),
    /personalización \(\.teleprompter\/mi-paquete\/guia\.md\):\nguía remota\ninstalado:/);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

// --- entrega y consulta de la guía de personalización ---

function guidePkg(name, contenido) {
  const pkg = path.join(tmp(), name);
  writePkg(pkg, validManifest(name, { personalization: 'guia.md' }), {
    'a.txt': 'a',
    'guia.md': contenido,
  });
  return pkg;
}

test('install delivers the declared guide verbatim after the result', async () => {
  const dest = tmp();
  const contenido = '# Guía\n\nhaz esto\ny aquello';
  const pkg = guidePkg('con-guia', contenido);
  const { code, stdout } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, /personalización \(\.teleprompter\/con-guia\/guia\.md\):\n# Guía\n\nhaz esto\ny aquello\ninstalado:/);
});

test('install without personalization adds no guide output', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'sin-guia');
  writePkg(pkg, validManifest('sin-guia'), { 'a.txt': 'a' });
  const { code, stdout } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.doesNotMatch(stdout.join('\n'), /personalización/);
});

test('--dry-run shows the plan but never delivers the guide', async () => {
  const dest = tmp();
  const pkg = guidePkg('con-guia', 'instrucciones');
  const { code, stdout } = await run(['--path', pkg, dest, '--dry-run']);
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, /fin del plan \(--dry-run\)/);
  assert.doesNotMatch(out, /personalización/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('guide prints the installed guide from the working directory', async () => {
  const dest = tmp();
  const pkg = guidePkg('con-guia', 'línea uno\nlínea dos');
  await run(['--path', pkg, dest]);
  const { code, stdout } = await run(['guide'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.deepEqual(stdout, [
    'personalización (.teleprompter/con-guia/guia.md):',
    'línea uno',
    'línea dos',
  ]);
});

test('guide <paquete> shows only that package\'s guide', async () => {
  const dest = tmp();
  await run(['--path', guidePkg('guia-a', 'A'), dest]);
  await run(['--path', guidePkg('guia-b', 'B'), dest]);
  const { code, stdout } = await run(['guide', 'guia-b'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.deepEqual(stdout, [
    'personalización (.teleprompter/guia-b/guia.md):',
    'B',
  ]);
});

test('guide without a package shows every installed guide', async () => {
  const dest = tmp();
  await run(['--path', guidePkg('guia-a', 'A'), dest]);
  await run(['--path', guidePkg('guia-b', 'B'), dest]);
  const { code, stdout } = await run(['guide'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.deepEqual(stdout, [
    'personalización (.teleprompter/guia-a/guia.md):',
    'A',
    'personalización (.teleprompter/guia-b/guia.md):',
    'B',
  ]);
});

test('guide skips installed packages that declare no guide', async () => {
  const dest = tmp();
  const sin = path.join(tmp(), 'sin-guia');
  writePkg(sin, validManifest('sin-guia'), { 'a.txt': 'a' });
  await run(['--path', sin, dest]);
  const { code, stderr } = await run(['guide'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /ningún paquete instalado/);
});

test('guide exits 4 without a lock, on unknown packages, or without a guide', async () => {
  const dest = tmp();
  assert.equal((await run(['guide'], { cwd: dest })).code, EXIT_USAGE);
  await run(['--path', guidePkg('con-guia', 'x'), dest]);
  assert.equal((await run(['guide', 'no-existe'], { cwd: dest })).code, EXIT_USAGE);
  const sin = path.join(tmp(), 'sin-guia');
  writePkg(sin, validManifest('sin-guia'), { 'a.txt': 'a' });
  await run(['--path', sin, dest]);
  const { code, stderr } = await run(['guide', 'sin-guia'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /no declara/);
});

test('guide warns on a corrupt lock and reports no installed packages', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), '{roto');
  const { code, stdout, stderr } = await run(['guide'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stdout.join('\n'), /aviso:.*corrupto/);
  assert.match(stderr.join('\n'), /ningún paquete instalado/);
});

test('guide exits 3 when the recorded guide file is gone', async () => {
  const dest = tmp();
  await run(['--path', guidePkg('con-guia', 'x'), dest]);
  fs.rmSync(path.join(dest, '.teleprompter/con-guia/guia.md'));
  const { code, stderr } = await run(['guide'], { cwd: dest });
  assert.equal(code, 3);
  assert.match(stderr.join('\n'), /no se puede leer la guía registrada/);
});

test('guide refuses recorded paths that escape the destination', async () => {
  const dest = tmp();
  const writeLock = (personalization) => fs.writeFileSync(
    path.join(dest, 'teleprompter-lock.json'),
    JSON.stringify({ packages: { p: { version: '1.0.0', files: [], personalization } } }),
  );

  // A "../" path in the lock must not disclose files outside.
  writeLock('../secreto.txt');
  const escaped = await run(['guide'], { cwd: dest });
  assert.equal(escaped.code, 3);
  assert.match(escaped.stderr.join('\n'), /no es segura/);
  assert.doesNotMatch(escaped.stdout.join('\n'), /personalización \(/);

  // Nor must a symlinked managed namespace.
  writeLock('.teleprompter/p/guia.md');
  const outside = tmp();
  fs.writeFileSync(path.join(outside, 'guia.md'), 'secreto externo');
  fs.symlinkSync(outside, path.join(dest, '.teleprompter'));
  const linked = await run(['guide'], { cwd: dest });
  assert.equal(linked.code, 3);
  assert.doesNotMatch(linked.stdout.join('\n'), /secreto externo/);

  // Nor must the final component be a symlink to outside.
  fs.unlinkSync(path.join(dest, '.teleprompter'));
  fs.mkdirSync(path.join(dest, '.teleprompter/p'), { recursive: true });
  fs.symlinkSync(path.join(outside, 'guia.md'), path.join(dest, '.teleprompter/p/guia.md'));
  const linkedFile = await run(['guide'], { cwd: dest });
  assert.equal(linkedFile.code, 3);
  assert.doesNotMatch(linkedFile.stdout.join('\n'), /secreto externo/);
});

test('guide rejects install options and extra arguments', async () => {
  for (const argv of [
    ['guide', 'a', 'b'], ['guide', '--path', 'x'], ['guide', '--dry-run'],
    ['guide', '--force'], ['guide', '-x'],
  ]) {
    const { code, stderr } = await run(argv, { cwd: tmp() });
    assert.equal(code, EXIT_USAGE, argv.join(' '));
    assert.match(stderr[0], /uso:/);
  }
});

// --- consulta del registro de instalación ---

test('list answers that nothing is installed when there is no lock', async () => {
  const { code, stdout } = await run(['list'], { cwd: tmp() });
  assert.equal(code, EXIT_OK);
  assert.deepEqual(stdout, ['no hay paquetes instalados']);
});

test('list shows name, version, date and written resources of a package', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', pkg, dest]);
  const { code, stdout } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.equal(stdout[0], 'paquetes instalados:');
  assert.match(stdout[1], /^ {2}p@1\.0\.0 — instalado \d{4}-\d{2}-\d{2}T/);
  assert.equal(stdout[2], '    a.txt');
});

test('list shows one entry per installed package', async () => {
  const dest = tmp();
  for (const name of ['uno', 'dos']) {
    const pkg = path.join(tmp(), name);
    writePkg(pkg, validManifest(name), { 'a.txt': 'a' });
    await run(['--path', pkg, dest]);
  }
  const { code, stdout } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {2}uno@1\.0\.0/);
  assert.match(stdout.join('\n'), / {2}dos@1\.0\.0/);
});

test('list shows recorded targets without hashes or internal actions', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'contenido propio');
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', pkg, dest, '--force']);
  const { code, stdout } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, / {4}a\.txt/);
  assert.doesNotMatch(out, /[0-9a-f]{64}|sha256|overwrite|create|skip/);
});

test('list does not list resources recorded as skipped', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      p: {
        version: '1.0.0',
        installedAt: '2026-09-28T10:00:00Z',
        files: [
          { target: 'a.txt', action: 'create' },
          { target: 'b.txt', action: 'skip' },
        ],
      },
    },
  }));
  const { code, stdout } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, / {4}a\.txt/);
  assert.doesNotMatch(out, /b\.txt/);
});

test('list shows an entry without installedAt without a date', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { p: { version: '1.0.0', files: [{ target: 'a.txt' }] } },
  }));
  const { code, stdout } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {2}p@1\.0\.0\n {4}a\.txt/);
  assert.doesNotMatch(stdout.join('\n'), /— instalado/);
});

test('list points to guide for a package with personalization', async () => {
  const dest = tmp();
  await run(['--path', guidePkg('con-guia', 'x'), dest]);
  const { code, stdout } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {4}guía: teleprompter guide con-guia/);
});

test('list warns on a corrupt lock and answers nothing installed', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), '{roto');
  const { code, stdout, stderr } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /aviso:.*corrupto/);
  assert.match(stdout.join('\n'), /no hay paquetes instalados/);
  assert.deepEqual(stderr, []);
});

test('list reads the working directory lock whatever the install origin', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const spy = spyFetch(okResponse(await remotePkg()));
  await run(['o/mi-paquete', dest], { tmpBase, fetch: spy.fetch });
  const { code, stdout } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {2}mi-paquete@1\.0\.0 — instalado /);
});

test('list rejects arguments and install options', async () => {
  for (const argv of [
    ['list', 'x'], ['list', 'a', 'b'], ['list', '--path', 'x'],
    ['list', '--dry-run'], ['list', '--force'], ['list', '-x'],
  ]) {
    const { code, stderr } = await run(argv, { cwd: tmp() });
    assert.equal(code, EXIT_USAGE, argv.join(' '));
    assert.match(stderr[0], /uso:/);
  }
});

// --- verificación del estado de los recursos instalados ---

test('check answers that nothing is installed when there is no lock', async () => {
  const { code, stdout } = await run(['check'], { cwd: tmp() });
  assert.equal(code, EXIT_OK);
  assert.deepEqual(stdout, ['no hay paquetes instalados']);
});

test('check reports an installed resource as intact', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', pkg, dest]);
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.equal(stdout[0], 'estado de los recursos:');
  assert.match(stdout[1], /^ {2}p@1\.0\.0$/);
  assert.match(stdout[2], /^ {4}intacto\s+a\.txt$/);
});

test('check reports an edited resource as modified', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', pkg, dest]);
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {4}modificado\s+a\.txt/);
});

test('check reports a deleted resource as missing', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', pkg, dest]);
  fs.rmSync(path.join(dest, 'a.txt'));
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {4}ausente\s+a\.txt/);
});

test('check reports each state across packages and resources', async () => {
  const dest = tmp();
  for (const name of ['uno', 'dos']) {
    const pkg = path.join(tmp(), name);
    writePkg(pkg, validManifest(name, {
      install: [
        { source: `${name}.txt`, target: `${name}.txt` },
        { source: 'extra.txt', target: `${name}-extra.txt` },
      ],
    }), { [`${name}.txt`]: name, 'extra.txt': 'extra' });
    await run(['--path', pkg, dest]);
  }
  fs.writeFileSync(path.join(dest, 'uno.txt'), 'editado');
  fs.rmSync(path.join(dest, 'dos-extra.txt'));
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, / {2}uno@1\.0\.0\n {4}modificado\s+uno\.txt\n {4}intacto\s+uno-extra\.txt/);
  assert.match(out, / {2}dos@1\.0\.0\n {4}intacto\s+dos\.txt\n {4}ausente\s+dos-extra\.txt/);
});

test('check does not report resources recorded as skipped', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      p: {
        version: '1.0.0',
        installedAt: '2026-09-28T10:00:00Z',
        files: [
          { target: 'a.txt', action: 'skip' },
          { target: 'b.txt', action: 'skip' },
        ],
      },
    },
  }));
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, / {2}p@1\.0\.0/);
  assert.doesNotMatch(out, /a\.txt|b\.txt/);
});

test('check reports a recorded entry without sha256 as unverifiable', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'a');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      p: { version: '1.0.0', files: [{ target: 'a.txt', action: 'create' }] },
    },
  }));
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {4}no verificable\s+a\.txt/);
});

test('check marks recorded paths that escape the destination as unverifiable', async () => {
  const dest = tmp();
  const outside = tmp();
  fs.writeFileSync(path.join(outside, 'a.txt'), 'ajeno');
  fs.symlinkSync(outside, path.join(dest, 'enlace'));
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      p: {
        version: '1.0.0',
        files: [
          { target: '../a.txt', action: 'create', sha256: '0'.repeat(64) },
          { target: 'enlace/a.txt', action: 'create', sha256: '0'.repeat(64) },
        ],
      },
    },
  }));
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, / {4}no verificable\s+\.\.\/a\.txt/);
  assert.match(out, / {4}no verificable\s+enlace\/a\.txt/);
});

test('check reports an unreadable resource as unverifiable', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', pkg, dest]);
  const target = path.join(dest, 'a.txt');
  fs.chmodSync(target, 0);
  const { code, stdout } = await run(['check'], { cwd: dest });
  fs.chmodSync(target, 0o644);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {4}no verificable\s+a\.txt/);
});

test('check reports a hand-written lock entry whose hash differs as modified', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'a');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      p: {
        version: '1.0.0',
        files: [{ target: 'a.txt', action: 'create', sha256: '0'.repeat(64) }],
      },
    },
  }));
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {4}modificado\s+a\.txt/);
});

test('check verifies the managed guide as a recorded resource', async () => {
  const dest = tmp();
  await run(['--path', guidePkg('con-guia', 'x'), dest]);
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'),
    / {4}intacto\s+\.teleprompter\/con-guia\/guia\.md/);
});

test('check reports drift in product language, without hashes or actions', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', pkg, dest]);
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  const { code, stdout } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.doesNotMatch(stdout.join('\n'),
    /[0-9a-f]{64}|sha256|overwrite|create|skip/);
});

test('check warns on a corrupt lock and answers nothing installed', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), '{roto');
  const { code, stdout, stderr } = await run(['check'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /aviso:.*corrupto/);
  assert.match(stdout.join('\n'), /no hay paquetes instalados/);
  assert.deepEqual(stderr, []);
});

test('check rejects arguments and install options', async () => {
  for (const argv of [
    ['check', 'x'], ['check', 'a', 'b'], ['check', '--path', 'x'],
    ['check', '--dry-run'], ['check', '--force'], ['check', '-x'],
  ]) {
    const { code, stderr } = await run(argv, { cwd: tmp() });
    assert.equal(code, EXIT_USAGE, argv.join(' '));
    assert.match(stderr[0], /uso:/);
  }
});
