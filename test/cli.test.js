import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { create as tarCreate } from 'tar';
import {
  main, EXIT_OK, EXIT_MANIFEST, EXIT_PLAN, EXIT_USAGE, EXIT_FETCH, EXIT_EXECUTION,
} from '../src/cli.js';
import { hashPath } from '../src/hash.js';

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

test('a usage error prints the full formatted help on stderr', async () => {
  const { code, stderr } = await run([]);
  assert.equal(code, EXIT_USAGE);
  const shown = stderr.join('\n');
  assert.match(shown, /uso: teleprompter/);
  assert.match(shown, /comandos:/);
  assert.match(shown, /opciones:/);
  assert.match(shown, /ejemplos:/);
});

test('help and --help print the general help on stdout and exit 0', async () => {
  for (const argv of [['help'], ['--help']]) {
    const { code, stdout, stderr } = await run(argv);
    assert.equal(code, EXIT_OK, argv.join(' '));
    assert.deepEqual(stderr, []);
    const shown = stdout.join('\n');
    for (const cmd of ['install', 'guide', 'list', 'check', 'update', 'uninstall', 'help']) {
      assert.match(shown, new RegExp(`^  *${cmd} `, 'm'), cmd);
    }
    for (const opt of ['--path', '--package', '--force', '--skip', '--dry-run', '--ref']) {
      assert.match(shown, new RegExp(opt.replace('-', '\\-')), opt);
    }
    assert.match(shown, /ejemplos:\n  teleprompter /);
  }
});

test('help <comando> prints the synopsis of that command', async () => {
  for (const cmd of ['install', 'guide', 'list', 'check', 'update', 'uninstall', 'help']) {
    const { code, stdout, stderr } = await run(['help', cmd]);
    assert.equal(code, EXIT_OK, cmd);
    assert.deepEqual(stderr, []);
    assert.match(stdout[0], new RegExp(`uso: teleprompter.*\\b${cmd}\\b`));
  }
});

test('--help beside an invocation prints that command\'s help', async () => {
  const cases = [
    [['install', '--help'], 'install'],
    [['guide', '--help'], 'guide'],
    [['list', '--help'], 'list'],
    [['check', '--help'], 'check'],
    [['update', '--help'], 'update'],
    [['uninstall', '--help'], 'uninstall'],
    [['help', '--help'], 'help'],
    [['o/pkg', '--help'], 'install'],
    [['--path', 'x', '--help'], 'install'],
  ];
  for (const [argv, topic] of cases) {
    const { code, stdout, stderr } = await run(argv);
    assert.equal(code, EXIT_OK, argv.join(' '));
    assert.deepEqual(stderr, []);
    assert.match(stdout[0], new RegExp(`uso: teleprompter.*\\b${topic}\\b`));
  }
});

test('help with an unknown topic or extra arguments is a usage error', async () => {
  for (const argv of [
    ['help', 'wat'], ['help', 'a', 'b'], ['help', '--path'], ['--help', 'x'],
    ['help', 'constructor'], ['help', 'toString'], ['help', '__proto__'],
  ]) {
    const { code, stderr } = await run(argv);
    assert.equal(code, EXIT_USAGE, argv.join(' '));
    assert.match(stderr[0], /uso:/);
  }
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

// --- colecciones ---

// A collection fixture: the index manifest at the root plus one
// package directory per member, built with the same writePkg helper.
function writeCollection(dir, members, index = {}) {
  writePkg(dir, {
    collection: true,
    name: path.basename(dir),
    packages: members.map(({ path: p }) => ({ path: p })),
    ...index,
  });
  for (const member of members) {
    writePkg(path.join(dir, member.path), member.manifest ?? validManifest(path.basename(member.path)), member.files ?? { 'a.txt': 'a' });
  }
}

test('a collection without --package prints the index and writes nothing', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'alfa', manifest: validManifest('alfa', { description: 'el primero' }) },
    { path: 'beta' },
  ]);
  const { code, stdout, stderr } = await run(['--path', coll, dest]);
  assert.equal(code, EXIT_USAGE);
  const shown = stdout.join('\n');
  assert.match(shown, /el origen es una colección/);
  assert.match(shown, /alfa\s+1\.0\.0\s+el primero/);
  assert.match(shown, /beta\s+1\.0\.0/);
  assert.match(stderr.join('\n'), /--package/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('a collection of one member still requires --package', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [{ path: 'alfa' }]);
  const { code, stderr } = await run(['--path', coll, dest]);
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /--package/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('--package installs the selected member of a local collection', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'alfa' },
    { path: 'beta', manifest: validManifest('beta', { install: [{ source: 'b.txt', target: 'b.txt' }] }), files: { 'b.txt': 'b' } },
  ]);
  const { code, stderr } = await run(['--path', coll, dest, '--package', 'beta']);
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.readFileSync(path.join(dest, 'b.txt'), 'utf8'), 'b');
  const lock = JSON.parse(fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'));
  assert.equal(lock.packages.beta.version, '1.0.0');
  assert.equal(lock.packages.alfa, undefined);
  assert.deepEqual(lock.packages.beta.origin, {
    type: 'path', path: coll, package: 'beta',
  });
});

test('several --package flags install each member in order with its own lock entry', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'alfa' },
    { path: 'beta', manifest: validManifest('beta', { install: [{ source: 'b.txt', target: 'b.txt' }] }), files: { 'b.txt': 'b' } },
  ]);
  const { code, stdout, stderr } = await run(
    ['--path', coll, dest, '--package', 'beta', '--package', 'alfa'],
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
  assert.equal(fs.readFileSync(path.join(dest, 'b.txt'), 'utf8'), 'b');
  const shown = stdout.join('\n');
  assert.ok(shown.indexOf('instalado: beta') < shown.indexOf('instalado: alfa'));
  const lock = JSON.parse(fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'));
  assert.equal(lock.packages.alfa.origin.package, 'alfa');
  assert.equal(lock.packages.beta.origin.package, 'beta');
});

test('a repeated --package name installs the member once', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [{ path: 'alfa' }]);
  const { code, stdout, stderr } = await run(
    ['--path', coll, dest, '--package', 'alfa', '--package', 'alfa'],
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(stdout.join('\n').match(/instalado: alfa/g).length, 1);
});

test('--package on a remote collection resolves inside the fetched tree', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const work = tmp();
  const root = path.join(work, 'familia-abc123');
  writeCollection(root, [
    { path: 'alfa' },
    { path: 'beta', manifest: validManifest('beta', { install: [{ source: 'b.txt', target: 'b.txt' }] }), files: { 'b.txt': 'b' } },
  ]);
  const archive = path.join(work, 'a.tgz');
  await tarCreate({ gzip: true, file: archive, cwd: work }, ['familia-abc123']);
  const spy = spyFetch(remoteOk(fs.readFileSync(archive)));
  const { code, stderr } = await run(
    ['o/familia', dest, '--package', 'beta'],
    { tmpBase, fetch: spy.fetch },
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.readFileSync(path.join(dest, 'b.txt'), 'utf8'), 'b');
  const lock = JSON.parse(fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'));
  assert.deepEqual(lock.packages.beta.origin, {
    type: 'github', repo: 'o/familia', commit: RESOLVED, package: 'beta',
  });
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('--package with a name absent from the index lists the available ones', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [{ path: 'alfa' }, { path: 'beta' }]);
  const { code, stderr } = await run(['--path', coll, dest, '--package', 'gamma']);
  assert.equal(code, EXIT_USAGE);
  const shown = stderr.join('\n');
  assert.match(shown, /no tiene el paquete "gamma"/);
  assert.match(shown, /disponibles: alfa, beta/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('--package with a package origin (not a collection) is an error', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'local-pkg');
  writePkg(pkg, validManifest('local-pkg'), { 'a.txt': 'a' });
  const { code, stderr } = await run(['--path', pkg, dest, '--package', 'a']);
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /no es una colección/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('--package is rejected by update', async () => {
  const { code, stderr } = await run(['update', 'a', '--package', 'b']);
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr[0], /uso:/);
});

test('duplicated basenames in the index make that selection ambiguous', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'uno/alfa' },
    { path: 'dos/alfa' },
    { path: 'beta' },
  ]);
  const { code, stderr } = await run(['--path', coll, dest, '--package', 'alfa']);
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /varias veces en el índice/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('a member with an invalid manifest fails only when selected', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'roto', manifest: { name: 'roto' } },
    { path: 'beta' },
  ]);
  const bad = await run(['--path', coll, dest, '--package', 'roto']);
  assert.equal(bad.code, EXIT_MANIFEST);
  assert.deepEqual(fs.readdirSync(dest), []);
  const good = await run(['--path', coll, dest, '--package', 'beta']);
  assert.equal(good.code, EXIT_OK, good.stderr.join('\n'));
});

test('an index member with a broken manifest shows marked in the index', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'roto', manifest: { name: 'roto' } },
    { path: 'beta' },
  ]);
  const { code, stdout } = await run(['--path', coll, dest]);
  assert.equal(code, EXIT_USAGE);
  assert.match(stdout.join('\n'), /roto\s+\(manifiesto inválido\)/);
});

test('an index entry pointing to another collection errors when selected', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'anidada', manifest: { collection: true, packages: [] } },
  ]);
  const { code, stderr } = await run(['--path', coll, dest, '--package', 'anidada']);
  assert.equal(code, EXIT_MANIFEST);
  assert.match(stderr.join('\n'), /colección/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('an index path that does not exist errors when selected', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writePkg(coll, {
    collection: true,
    name: 'coleccion',
    packages: [{ path: 'fantasma' }],
  });
  const { code, stderr } = await run(['--path', coll, dest, '--package', 'fantasma']);
  assert.equal(code, EXIT_MANIFEST);
  assert.match(stderr.join('\n'), /no existe/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('a failure on the Nth unit leaves the previous ones installed', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'alfa' },
    { path: 'beta', manifest: { name: 'beta' } },
  ]);
  const { code } = await run(['--path', coll, dest, '--package', 'alfa', '--package', 'beta']);
  assert.equal(code, EXIT_MANIFEST);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
  const lock = JSON.parse(fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'));
  assert.equal(lock.packages.alfa.version, '1.0.0');
  assert.equal(lock.packages.beta, undefined);
});

test('--dry-run with several --package prints every plan and writes nothing', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [{ path: 'alfa' }, { path: 'beta' }]);
  const { code, stdout, stderr } = await run(
    ['--path', coll, dest, '--package', 'alfa', '--package', 'beta', '--dry-run'],
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(stdout.join('\n').match(/plan de instalación:/g).length, 2);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('--skip applies to every selected unit', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'local');
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'alfa', manifest: validManifest('alfa', { install: [{ source: 'a.txt', target: 'a.txt' }] }) },
    { path: 'beta', manifest: validManifest('beta', { install: [{ source: 'a.txt', target: 'a.txt' }] }), files: { 'a.txt': 'a' } },
  ]);
  const { code, stderr } = await run(
    ['--path', coll, dest, '--package', 'alfa', '--package', 'beta', '--skip'],
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'local');
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

// A remote fetch resolves the ref before downloading: the spy
// routes the commits-API call to the commit response and every
// other call to the tarball.
const RESOLVED = 'f'.repeat(40);
const remoteOk = (buf) => (url) =>
  url.includes('/commits/')
    ? { ok: true, json: async () => ({ sha: RESOLVED }) }
    : okResponse(buf);

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
  const spy = spyFetch(remoteOk(await remotePkg()));
  const { code, stdout, stderr } = await run(['o/mi-paquete'], { cwd, tmpBase, fetch: spy.fetch });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /obteniendo: o\/mi-paquete/);
  assert.equal(fs.readFileSync(path.join(cwd, 'a.txt'), 'utf8'), 'a');
  assert.ok(fs.existsSync(path.join(cwd, 'teleprompter-lock.json')));
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('user/repo with OUT installs into it', async () => {
  const dest = tmp();
  const spy = spyFetch(remoteOk(await remotePkg()));
  const { code, stderr } = await run(['o/mi-paquete', dest], { fetch: spy.fetch });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
});

test('install is an alias of the short form', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const spy = spyFetch(remoteOk(await remotePkg()));
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

test('the ref reaches the resolution URL and the download anchors to its commit', async () => {
  for (const argv of [['o/mi-paquete@v9', tmp()], ['o/mi-paquete', tmp(), '--ref', 'v9']]) {
    const spy = spyFetch(remoteOk(await remotePkg()));
    const { code } = await run(argv, { fetch: spy.fetch });
    assert.equal(code, EXIT_OK);
    assert.equal(spy.urls[0], 'https://api.github.com/repos/o/mi-paquete/commits/v9');
    assert.equal(spy.urls[1], `https://codeload.github.com/o/mi-paquete/tar.gz/${'f'.repeat(40)}`);
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
  const spy = spyFetch(remoteOk(fs.readFileSync(archive)));
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
  const spy = spyFetch(remoteOk(await remotePkg()));
  const { code, stdout } = await run(['o/mi-paquete', dest, '--dry-run'], { tmpBase, fetch: spy.fetch });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /--dry-run/);
  assert.deepEqual(fs.readdirSync(dest), []);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('--skip resolves remote conflicts like a local origin', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'contenido propio');
  const spy = spyFetch(remoteOk(await remotePkg()));
  const { code } = await run(['o/mi-paquete', dest, '--skip'], { fetch: spy.fetch });
  assert.equal(code, EXIT_OK);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'contenido propio');
});

test('--force resolves remote conflicts like a local origin', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'contenido propio');
  const spy = spyFetch(remoteOk(await remotePkg()));
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
  const spy = spyFetch(remoteOk(buf));
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

test('guide exits 3 when the recorded guide path is not a file', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, '.teleprompter/p/guia.md'), { recursive: true });
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { p: { version: '1.0.0', files: [], personalization: '.teleprompter/p/guia.md' } },
  }));
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
  const spy = spyFetch(remoteOk(await remotePkg()));
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

// --- origen de la instalación en el registro ---

const readEntry = (dest, name) => JSON.parse(
  fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'),
).packages[name];

test('a --path install records the local origin as an absolute path', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', pkg, dest]);
  assert.deepEqual(readEntry(dest, 'p').origin,
    { type: 'path', path: path.resolve(pkg) });
});

test('a remote install records the repo, the used ref and the resolved commit', async () => {
  const dest = tmp();
  const spy = spyFetch(remoteOk(await remotePkg()));
  await run(['o/mi-paquete@v2', dest], { tmpBase: tmp(), fetch: spy.fetch });
  assert.deepEqual(readEntry(dest, 'mi-paquete').origin,
    { type: 'github', repo: 'o/mi-paquete', ref: 'v2', commit: RESOLVED });
});

test('a remote install without a ref records the repo and the resolved commit', async () => {
  const dest = tmp();
  const spy = spyFetch(remoteOk(await remotePkg()));
  await run(['o/mi-paquete', dest], { tmpBase: tmp(), fetch: spy.fetch });
  assert.deepEqual(readEntry(dest, 'mi-paquete').origin,
    { type: 'github', repo: 'o/mi-paquete', commit: RESOLVED });
});

test('each installed package keeps its own recorded origin', async () => {
  const dest = tmp();
  const pkg = path.join(tmp(), 'local');
  writePkg(pkg, validManifest('local'), { 'a.txt': 'a' });
  await run(['--path', pkg, dest]);
  const spy = spyFetch(remoteOk(await remotePkg()));
  await run(['o/mi-paquete', dest], { tmpBase: tmp(), fetch: spy.fetch });
  assert.deepEqual(readEntry(dest, 'local').origin,
    { type: 'path', path: path.resolve(pkg) });
  assert.deepEqual(readEntry(dest, 'mi-paquete').origin,
    { type: 'github', repo: 'o/mi-paquete', commit: RESOLVED });
});

test('a lock written before the origin field stays valid', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { p: { version: '1.0.0', files: [{ target: 'a.txt' }] } },
  }));
  const { code, stdout } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {2}p@1\.0\.0/);
});

test('a lock with a malformed origin degrades to no history', async () => {
  const malformed = [
    'en-ningun-sitio',
    null,
    [],
    { type: 'desconocido' },
    { type: 'github' },
    { type: 'github', repo: 'o/r', ref: 5 },
    { type: 'github', repo: 'o/r', commit: 5 },
    { type: 'path' },
    { type: 'github', repo: 'o/r', package: 7 },
    { type: 'path', path: '/x', package: 7 },
  ];
  for (const origin of malformed) {
    const dest = tmp();
    fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
      packages: { p: { version: '1.0.0', files: [], origin } },
    }));
    const { code, stdout } = await run(['list'], { cwd: dest });
    assert.equal(code, EXIT_OK, JSON.stringify(origin));
    assert.match(stdout.join('\n'), /aviso:.*corrupto/, JSON.stringify(origin));
    assert.match(stdout.join('\n'), /no hay paquetes instalados/);
  }
});

test('update records the commit resolved in that fetch, not the previous one', async () => {
  const dest = tmp();
  const spy1 = spyFetch(remoteOk(await remotePkg()));
  await run(['o/mi-paquete', dest], { fetch: spy1.fetch });
  assert.equal(readEntry(dest, 'mi-paquete').origin.commit, RESOLVED);
  const buf = await repoTarball(
    'mi-paquete', validManifest('mi-paquete', { version: '2.0.0' }), { 'a.txt': 'b' },
  );
  const spy2 = spyFetch((url) => (url.includes('/commits/')
    ? { ok: true, json: async () => ({ sha: 'e'.repeat(40) }) }
    : okResponse(buf)));
  const { code } = await run(['update', 'mi-paquete'], { cwd: dest, fetch: spy2.fetch });
  assert.equal(code, EXIT_OK);
  assert.equal(readEntry(dest, 'mi-paquete').origin.commit, 'e'.repeat(40));
});

test('a lock whose origin lacks the commit field stays valid and update fills it', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      p: {
        version: '1.0.0',
        files: [{ target: 'a.txt' }],
        origin: { type: 'github', repo: 'o/p' },
      },
    },
  }));
  const { code, stdout } = await run(['list'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), / {2}p@1\.0\.0/);
  const checked = await run(['check'], { cwd: dest });
  assert.equal(checked.code, EXIT_OK);
  const buf = await repoTarball(
    'p', validManifest('p', { version: '2.0.0' }), { 'a.txt': 'n' },
  );
  const spy = spyFetch(remoteOk(buf));
  const { code: code2 } = await run(['update', 'p'], { cwd: dest, fetch: spy.fetch });
  assert.equal(code2, EXIT_OK);
  assert.deepEqual(readEntry(dest, 'p').origin,
    { type: 'github', repo: 'o/p', commit: RESOLVED });
});

// --- update: llevar un paquete a la versión que publica su origen ---

// Installs `pkgV1` into a fresh destination, then hands the destination
// over so the test can drive `update` against it.
async function installed(manifest, files) {
  const dest = tmp();
  const pkg = path.join(tmp(), manifest.name);
  writePkg(pkg, manifest, files);
  const { code, stderr } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  return { dest, pkg };
}

function lockOf(dest) {
  return JSON.parse(fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'));
}

test('update re-fetches from the recorded --path origin and applies the plan', async () => {
  const { dest, pkg } = await installed(validManifest('up', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), { 'a.txt': 'viejo', 'b.txt': 'b' });
  writePkg(pkg, validManifest('up', {
    version: '2.0.0',
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'c.txt', target: 'c.txt' }],
  }), { 'a.txt': 'nuevo', 'c.txt': 'c' });
  const { code, stdout, stderr } = await run(['update', 'up'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const out = stdout.join('\n');
  assert.match(out, /plan de actualización:/);
  assert.match(out, /update\s+a\.txt/);
  assert.match(out, /retire\s+b\.txt/);
  assert.match(out, /create\s+c\.txt/);
  assert.match(out, /actualizado: up@2\.0\.0/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'nuevo');
  assert.equal(fs.readFileSync(path.join(dest, 'c.txt'), 'utf8'), 'c');
  assert.ok(!fs.existsSync(path.join(dest, 'b.txt')));
  const lock = lockOf(dest);
  assert.equal(lock.packages.up.version, '2.0.0');
  assert.deepEqual(lock.packages.up.origin, { type: 'path', path: pkg });
  assert.deepEqual(
    lock.packages.up.files.map((f) => f.target).sort(), ['a.txt', 'c.txt'],
  );
});

test('update keeps incoming children when the map moves from a directory to per-child targets', async () => {
  const { dest, pkg } = await installed(validManifest('granular', {
    install: [{ source: 'skills', target: 'skills/' }],
  }), { 'skills/a.txt': 'a', 'skills/b.txt': 'b', 'skills/viejo.txt': 'v' });
  writePkg(pkg, validManifest('granular', {
    version: '2.0.0',
    install: [
      { source: 'skills/a.txt', target: 'skills/a.txt' },
      { source: 'skills/b.txt', target: 'skills/b.txt' },
    ],
  }), { 'skills/a.txt': 'a', 'skills/b.txt': 'nuevo' });
  const { code, stdout, stderr } = await run(['update', 'granular'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const out = stdout.join('\n');
  assert.match(out, /identical\s+skills\/a\.txt/);
  assert.match(out, /update\s+skills\/b\.txt/);
  assert.match(out, /retire\s+skills\/viejo\.txt/);
  assert.doesNotMatch(out, /retire\s+skills\/$/m);
  assert.equal(fs.readFileSync(path.join(dest, 'skills/a.txt'), 'utf8'), 'a');
  assert.equal(fs.readFileSync(path.join(dest, 'skills/b.txt'), 'utf8'), 'nuevo');
  assert.ok(!fs.existsSync(path.join(dest, 'skills/viejo.txt')));
  const lock = lockOf(dest);
  assert.equal(lock.packages.granular.version, '2.0.0');
  // The `identical` child registers with its real action, same as
  // the updated one — the lock records everything managed.
  assert.deepEqual(
    lock.packages.granular.files.map((f) => [f.target, f.action]),
    [['skills/a.txt', 'identical'], ['skills/b.txt', 'overwrite']],
  );
});

test('install over identical content records every managed target in the lock', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'skills'));
  fs.writeFileSync(path.join(dest, 'skills', 'a.txt'), 'a');
  fs.writeFileSync(path.join(dest, 'skills', 'b.txt'), 'b');
  const pkg = path.join(tmp(), 'granular');
  writePkg(pkg, validManifest('granular', {
    install: [
      { source: 'skills/a.txt', target: 'skills/a.txt' },
      { source: 'skills/b.txt', target: 'skills/b.txt' },
    ],
  }), { 'skills/a.txt': 'a', 'skills/b.txt': 'b' });
  const { code, stdout, stderr } = await run(['install', '--path', pkg, dest]);
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /identical\s+skills\/a\.txt/);
  const { files } = lockOf(dest).packages.granular;
  assert.deepEqual(files.map((f) => f.target), ['skills/a.txt', 'skills/b.txt']);
  for (const f of files) {
    assert.equal(f.action, 'identical');
    assert.match(f.sha256, /^[0-9a-f]{64}$/);
  }
});

test('check and list cover the identical resources the lock recorded', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'a');
  const pkg = path.join(tmp(), 'granular');
  writePkg(pkg, validManifest('granular'), { 'a.txt': 'a' });
  assert.equal((await run(['install', '--path', pkg, dest])).code, EXIT_OK);
  const list = await run(['list'], { cwd: dest });
  assert.match(list.stdout.join('\n'), /a\.txt/);
  const check = await run(['check'], { cwd: dest });
  assert.match(check.stdout.join('\n'), /intacto\s+a\.txt/);
});

test('update replaces the subtree wholesale when the map collapses children into a directory target', async () => {
  const { dest } = await installed(validManifest('colapso', {
    install: [
      { source: 'skills/a.txt', target: 'skills/a.txt' },
      { source: 'skills/b.txt', target: 'skills/b.txt' },
    ],
  }), { 'skills/a.txt': 'a', 'skills/b.txt': 'b' });
  const nuevo = path.join(tmp(), 'colapso');
  writePkg(nuevo, validManifest('colapso', {
    version: '2.0.0',
    install: [{ source: 'skills', target: 'skills/' }],
  }), { 'skills/a.txt': 'a2', 'skills/c.txt': 'c' });
  const { code, stdout, stderr } = await run(
    ['update', 'colapso', '--path', nuevo, '--force'], { cwd: dest },
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.doesNotMatch(stdout.join('\n'), /retire/);
  assert.equal(fs.readFileSync(path.join(dest, 'skills/a.txt'), 'utf8'), 'a2');
  assert.equal(fs.readFileSync(path.join(dest, 'skills/c.txt'), 'utf8'), 'c');
  assert.ok(!fs.existsSync(path.join(dest, 'skills/b.txt')));
});

test('update backs up an overwritten conflict under the recorded version', async () => {
  const { dest, pkg } = await installed(validManifest('confb'), { 'a.txt': 'viejo' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  writePkg(pkg, validManifest('confb', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const { code, stdout, stderr } = await run(['update', 'confb', '--force'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const dirs = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
  assert.equal(dirs.length, 1);
  assert.match(dirs[0], /-confb@1\.0\.0$/);
  assert.equal(
    fs.readFileSync(
      path.join(dest, '.teleprompter', 'backups', dirs[0], 'a.txt'), 'utf8'),
    'editado',
  );
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'nuevo');
  assert.match(stdout.join('\n'), /respaldo \(\.teleprompter\/backups\//);
});

test('update backs up a removal conflict resolved to remove', async () => {
  const { dest, pkg } = await installed(validManifest('retira', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), {
    'a.txt': 'viejo', 'b.txt': 'b',
  });
  fs.writeFileSync(path.join(dest, 'b.txt'), 'editado también');
  writePkg(pkg, validManifest('retira', { version: '2.0.0' }), { 'a.txt': 'viejo' });
  const { code, stderr } = await run(['update', 'retira', '--force'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.existsSync(path.join(dest, 'b.txt')), false);
  const dirs = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
  assert.equal(dirs.length, 1);
  assert.match(dirs[0], /-retira@1\.0\.0$/);
  assert.equal(
    fs.readFileSync(
      path.join(dest, '.teleprompter', 'backups', dirs[0], 'b.txt'), 'utf8'),
    'editado también',
  );
});

test('update --skip creates no backup', async () => {
  const { dest, pkg } = await installed(validManifest('queda'), { 'a.txt': 'viejo' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  writePkg(pkg, validManifest('queda', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const { code, stderr } = await run(['update', 'queda', '--skip'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.existsSync(path.join(dest, '.teleprompter', 'backups')), false);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'editado');
});

test('update aborts the plan when the backup root escapes the destination', async () => {
  const { dest, pkg } = await installed(validManifest('fuera'), { 'a.txt': 'viejo' });
  const outside = tmp();
  fs.rmSync(path.join(dest, '.teleprompter'), { recursive: true, force: true });
  fs.symlinkSync(outside, path.join(dest, '.teleprompter'));
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  writePkg(pkg, validManifest('fuera', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const { code, stderr } = await run(['update', 'fuera', '--force'], { cwd: dest });
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /escapa de la raíz/);
  assert.equal(fs.existsSync(path.join(outside, 'backups')), false);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'editado');
});

test('a non-semver recorded version is not interpolated into the backup name', async () => {
  const { dest, pkg } = await installed(validManifest('version-rara'), { 'a.txt': 'viejo' });
  const lockPath = path.join(dest, 'teleprompter-lock.json');
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  lock.packages['version-rara'].version = 'x/../fuera';
  fs.writeFileSync(lockPath, `${JSON.stringify(lock)}\n`);
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  writePkg(pkg, validManifest('version-rara', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const { code, stderr } = await run(['update', 'version-rara', '--force'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const dirs = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
  assert.equal(dirs.length, 1);
  assert.match(dirs[0], /-version-rara$/);
  assert.equal(fs.existsSync(path.join(dest, 'fuera')), false);
});

test('a failed removal still reports the backup it already made', async () => {
  const { dest, pkg } = await installed(validManifest('bloquea', {
    install: [
      { source: 'a.txt', target: 'a.txt' },
      { source: 'sub/f.txt', target: 'sub/f.txt' },
    ],
  }), { 'a.txt': 'a', 'sub/f.txt': 'f' });
  fs.writeFileSync(path.join(dest, 'sub', 'f.txt'), 'editado');
  writePkg(pkg, validManifest('bloquea', { version: '2.0.0' }), { 'a.txt': 'a' });
  fs.chmodSync(path.join(dest, 'sub'), 0o555);
  try {
    const { code, stdout, stderr } = await run(
      ['update', 'bloquea', '--force'], { cwd: dest },
    );
    assert.equal(code, EXIT_EXECUTION);
    assert.match(stdout.join('\n'), /respaldo \(\.teleprompter\/backups\//);
    assert.match(stderr.join('\n'), /error de ejecución/);
    const dirs = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
    assert.equal(dirs.length, 1);
    assert.equal(
      fs.readFileSync(
        path.join(dest, '.teleprompter', 'backups', dirs[0], 'sub', 'f.txt'), 'utf8'),
      'editado',
    );
  } finally {
    fs.chmodSync(path.join(dest, 'sub'), 0o755);
  }
});

test('a failed intact removal reports an execution error', async () => {
  const { dest, pkg } = await installed(validManifest('retiro-falla', {
    install: [
      { source: 'a.txt', target: 'a.txt' },
      { source: 'sub/f.txt', target: 'sub/f.txt' },
    ],
  }), { 'a.txt': 'a', 'sub/f.txt': 'f' });
  writePkg(pkg, validManifest('retiro-falla', { version: '2.0.0' }), { 'a.txt': 'a' });
  fs.chmodSync(path.join(dest, 'sub'), 0o555);
  try {
    const { code, stderr } = await run(
      ['update', 'retiro-falla', '--force'], { cwd: dest },
    );
    assert.equal(code, EXIT_EXECUTION);
    assert.match(stderr.join('\n'), /error de ejecución/);
  } finally {
    fs.chmodSync(path.join(dest, 'sub'), 0o755);
  }
});

test('update reports already at that version when nothing changed', async () => {
  const { dest } = await installed(validManifest('igual'), { 'a.txt': 'a' });
  const { code, stdout } = await run(['update', 'igual'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /igual@1\.0\.0 ya está en esa versión/);
});

test('update exits 4 when the package is not installed', async () => {
  const { code, stderr } = await run(['update', 'fantasma'], { cwd: tmp() });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /no está instalado/);
});

test('update exits 4 when the package records no origin', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { viejo: { version: '1.0.0', files: [] } },
  }));
  const { code, stderr } = await run(['update', 'viejo'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /no registra un origen/);
});

test('update --path overrides the recorded origin and persists it', async () => {
  const { dest } = await installed(validManifest('movido'), { 'a.txt': 'viejo' });
  const nuevo = path.join(tmp(), 'movido');
  writePkg(nuevo, validManifest('movido', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const { code, stderr } = await run(['update', 'movido', '--path', nuevo], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'nuevo');
  assert.deepEqual(lockOf(dest).packages.movido.origin, { type: 'path', path: nuevo });
});

test('update uses the recorded github ref, and --ref overrides it', async () => {
  const dest = tmp();
  const spy1 = spyFetch(remoteOk(await remotePkg()));
  assert.equal(
    (await run(['o/mi-paquete@v1', dest], { fetch: spy1.fetch })).code, EXIT_OK,
  );
  const spy2 = spyFetch(remoteOk(
    await repoTarball('mi-paquete', validManifest('mi-paquete', { version: '2.0.0' }), { 'a.txt': 'b' }),
  ));
  const { code, stdout, stderr } = await run(
    ['update', 'mi-paquete'], { cwd: dest, fetch: spy2.fetch },
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /obteniendo: o\/mi-paquete@v1/);
  assert.match(spy2.urls[0], /commits\/v1/);

  const spy3 = spyFetch(remoteOk(
    await repoTarball('mi-paquete', validManifest('mi-paquete', { version: '3.0.0' }), { 'a.txt': 'c' }),
  ));
  const { code: code2 } = await run(
    ['update', 'mi-paquete', '--ref', 'v3'], { cwd: dest, fetch: spy3.fetch },
  );
  assert.equal(code2, EXIT_OK);
  assert.match(spy3.urls[0], /commits\/v3/);
});

test('update refetches the default branch when no ref was recorded', async () => {
  const dest = tmp();
  const spy1 = spyFetch(remoteOk(await remotePkg()));
  await run(['o/mi-paquete', dest], { fetch: spy1.fetch });
  const spy2 = spyFetch(remoteOk(
    await repoTarball('mi-paquete', validManifest('mi-paquete', { version: '2.0.0' }), { 'a.txt': 'b' }),
  ));
  const { code } = await run(['update', 'mi-paquete'], { cwd: dest, fetch: spy2.fetch });
  assert.equal(code, EXIT_OK);
  assert.match(spy2.urls[0], /commits\/HEAD/);
});

test('update with a positional repo spec overrides the recorded origin', async () => {
  const { dest } = await installed(validManifest('mi-paquete'), { 'a.txt': 'viejo' });
  const spy = spyFetch(remoteOk(
    await repoTarball('mi-paquete', validManifest('mi-paquete', { version: '2.0.0' }), { 'a.txt': 'n' }),
  ));
  const { code, stderr } = await run(
    ['update', 'mi-paquete', 'otro/mi-paquete@v2'], { cwd: dest, fetch: spy.fetch },
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(spy.urls[0], /otro\/mi-paquete\/commits\/v2/);
  assert.deepEqual(lockOf(dest).packages['mi-paquete'].origin, {
    type: 'github', repo: 'otro/mi-paquete', ref: 'v2', commit: RESOLVED,
  });
});

test('update aborts with pending conflicts and no console, writing nothing', async () => {
  const { dest, pkg } = await installed(validManifest('conf'), { 'a.txt': 'viejo' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  writePkg(pkg, validManifest('conf', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const { code, stderr } = await run(['update', 'conf'], { cwd: dest });
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /conflicto sin resolver: a\.txt/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'editado');
  assert.equal(lockOf(dest).packages.conf.version, '1.0.0');
});

test('update asks per resource, and a removal asks about removing', async () => {
  const { dest, pkg } = await installed(validManifest('inter', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), {
    'a.txt': 'viejo', 'b.txt': 'b',
  });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  fs.writeFileSync(path.join(dest, 'b.txt'), 'editado también');
  writePkg(pkg, validManifest('inter', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const answers = [true, false];
  const questions = [];
  const { code, stderr } = await run(['update', 'inter'], {
    cwd: dest,
    interactive: true,
    createAsker: () => ({
      ask: async (q) => { questions.push(q); return answers.shift(); },
      close: () => {},
    }),
  });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(questions[0], /sobrescribir/);
  assert.match(questions[1], /¿quitar\?/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'nuevo');
  assert.equal(fs.readFileSync(path.join(dest, 'b.txt'), 'utf8'), 'editado también');
});

test('update --force overwrites local edits and removes drifted retirements', async () => {
  const { dest, pkg } = await installed(validManifest('forzado', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), {
    'a.txt': 'viejo', 'b.txt': 'b',
  });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  fs.writeFileSync(path.join(dest, 'b.txt'), 'editado');
  writePkg(pkg, validManifest('forzado', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const { code, stderr } = await run(['update', 'forzado', '--force'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'nuevo');
  assert.ok(!fs.existsSync(path.join(dest, 'b.txt')));
});

test('update --skip keeps local edits and drifted retirements', async () => {
  const { dest, pkg } = await installed(validManifest('omite', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), {
    'a.txt': 'viejo', 'b.txt': 'b',
  });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  fs.writeFileSync(path.join(dest, 'b.txt'), 'editado');
  writePkg(pkg, validManifest('omite', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const { code, stdout, stderr } = await run(['update', 'omite', '--skip'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /b\.txt → keep/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'editado');
  assert.equal(fs.readFileSync(path.join(dest, 'b.txt'), 'utf8'), 'editado');
  // The kept file preserves its previous record: it was not written.
  const kept = lockOf(dest).packages.omite.files.find((f) => f.target === 'b.txt');
  assert.notEqual(kept.action, 'keep');
});

test('a pending conflict lists the diff of what would change', async () => {
  const { dest, pkg } = await installed(validManifest('dif'), { 'a.txt': 'viejo\n' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'viejo\neditado\n');
  writePkg(pkg, validManifest('dif', { version: '2.0.0' }), { 'a.txt': 'viejo\nnuevo\n' });
  const { code, stderr } = await run(['update', 'dif'], { cwd: dest });
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'),
    /conflicto sin resolver: a\.txt\n--- a\.txt \(destino\)\n\+\+\+ a\.txt \(paquete\)\n@@ -1,2 \+1,2 @@\n viejo\n-editado\n\+nuevo/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'viejo\neditado\n');
});

test('install shows the conflict diff in the non-interactive listing', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'local\n');
  const pkg = path.join(tmp(), 'inst');
  writePkg(pkg, validManifest('inst'), { 'a.txt': 'nuevo\n' });
  const { code, stderr } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'),
    /conflicto sin resolver: a\.txt\n--- a\.txt \(destino\)\n\+\+\+ a\.txt \(paquete\)\n@@ -1 \+1 @@\n-local\n\+nuevo/);
});

test('the interactive console shows each conflict diff before its question', async () => {
  const { dest, pkg } = await installed(validManifest('inter2', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), { 'a.txt': 'viejo\n', 'b.txt': 'b\n' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado\n');
  fs.writeFileSync(path.join(dest, 'b.txt'), 'editado también\n');
  writePkg(pkg, validManifest('inter2', { version: '2.0.0' }), { 'a.txt': 'nuevo\n' });
  const shown = [];
  const asked = [];
  const { code, stderr } = await run(['update', 'inter2'], {
    cwd: dest,
    interactive: true,
    out: (m) => shown.push(m),
    createAsker: () => ({
      ask: async (q) => { asked.push({ q, seen: shown.join('\n') }); return true; },
      close: () => {},
    }),
  });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  // When the question was asked its diff was already out, and the
  // next conflict's diff was not yet.
  assert.match(asked[0].seen, /--- a\.txt \(destino\)[\s\S]*-editado\n\+nuevo/);
  assert.doesNotMatch(asked[0].seen, /editado también/);
  assert.match(asked[1].seen, /--- b\.txt \(destino\)\n\+\+\+ b\.txt \(ausente\)\n@@ -1 \+0,0 @@\n-editado también/);
  assert.equal(asked.length, 2);
  assert.match(asked[0].q, /sobrescribir/);
  assert.match(asked[1].q, /¿quitar\?/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'nuevo\n');
  assert.ok(!fs.existsSync(path.join(dest, 'b.txt')));
});

test('--force and --skip resolve conflicts without showing a diff', async () => {
  for (const flag of ['--force', '--skip']) {
    const { dest, pkg } = await installed(validManifest('nodiff'), { 'a.txt': 'viejo\n' });
    fs.writeFileSync(path.join(dest, 'a.txt'), 'editado\n');
    writePkg(pkg, validManifest('nodiff', { version: '2.0.0' }), { 'a.txt': 'nuevo\n' });
    const { code, stdout, stderr } = await run(['update', 'nodiff', flag], { cwd: dest });
    assert.equal(code, EXIT_OK, stderr.join('\n'));
    assert.doesNotMatch([...stdout, ...stderr].join('\n'), /--- a\.txt/);
  }
});

test('a directory conflict shows the diff of each diverging file only', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'reglas'), { recursive: true });
  fs.writeFileSync(path.join(dest, 'reglas', 'igual.txt'), 'igual\n');
  fs.writeFileSync(path.join(dest, 'reglas', 'mod.txt'), 'viejo\n');
  fs.writeFileSync(path.join(dest, 'reglas', 'solo.txt'), 'solo destino\n');
  const pkg = path.join(tmp(), 'dirp');
  writePkg(pkg, validManifest('dirp', {
    install: [{ source: 'reglas', target: 'reglas' }],
  }), {
    'reglas/igual.txt': 'igual\n',
    'reglas/mod.txt': 'nuevo\n',
    'reglas/entrante.txt': 'solo paquete\n',
  });
  const { code, stderr } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
  const shown = stderr.join('\n');
  assert.match(shown, /conflicto sin resolver: reglas/);
  assert.match(shown,
    /--- reglas\/entrante\.txt \(ausente\)\n\+\+\+ reglas\/entrante\.txt \(paquete\)\n@@ -0,0 \+1 @@\n\+solo paquete/);
  assert.match(shown,
    /--- reglas\/mod\.txt \(destino\)\n\+\+\+ reglas\/mod\.txt \(paquete\)\n@@ -1 \+1 @@\n-viejo\n\+nuevo/);
  assert.match(shown,
    /--- reglas\/solo\.txt \(destino\)\n\+\+\+ reglas\/solo\.txt \(ausente\)\n@@ -1 \+0,0 @@\n-solo destino/);
  // The identical file inside the conflicted tree produces no diff.
  assert.doesNotMatch(shown, /igual\.txt \(/);
});

test('a removal conflict shows the local content it would retire', async () => {
  const { dest, pkg } = await installed(validManifest('ret', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), { 'a.txt': 'a\n', 'b.txt': 'b1\n' });
  fs.writeFileSync(path.join(dest, 'b.txt'), 'editado\nlocal\n');
  writePkg(pkg, validManifest('ret', { version: '2.0.0' }), { 'a.txt': 'a\n' });
  const { code, stderr } = await run(['update', 'ret'], { cwd: dest });
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'),
    /conflicto sin resolver: b\.txt\n--- b\.txt \(destino\)\n\+\+\+ b\.txt \(ausente\)\n@@ -1,2 \+0,0 @@\n-editado\n-local/);
});

test('a recorded target escaping the destination never dumps its content', async () => {
  const dest = tmp();
  const outside = tmp();
  fs.writeFileSync(path.join(outside, 'secreto.txt'), 'SECRETO\n');
  fs.writeFileSync(path.join(dest, 'a.txt'), 'a\n');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { p: {
      version: '1.0.0',
      files: [
        { target: 'a.txt', action: 'create', sha256: hashPath(path.join(dest, 'a.txt')) },
        {
          target: path.relative(dest, path.join(outside, 'secreto.txt')),
          action: 'create', sha256: 'f'.repeat(64),
        },
      ],
    } },
  }));
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p', { version: '2.0.0' }), { 'a.txt': 'b\n' });
  const { code, stderr } = await run(['update', 'p', '--path', pkg], { cwd: dest });
  assert.equal(code, EXIT_PLAN);
  const shown = stderr.join('\n');
  assert.match(shown, /conflicto sin resolver:/);
  assert.match(shown, /\(ruta insegura\)/);
  assert.doesNotMatch(shown, /SECRETO/);
});

test('a symlink conflict diffs the link target', async () => {
  const dest = tmp();
  fs.symlinkSync('viejo', path.join(dest, 'enlace'));
  const pkg = path.join(tmp(), 'links');
  writePkg(pkg, validManifest('links', {
    install: [{ source: 'enlace', target: 'enlace' }],
  }));
  fs.symlinkSync('nuevo', path.join(pkg, 'enlace'));
  const { code, stderr } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'),
    /--- enlace \(destino\)\n\+\+\+ enlace \(paquete\)\n@@ -1 \+1 @@\n--> viejo\n\+-> nuevo/);
});

test('update --dry-run prints the plan and writes nothing', async () => {
  const { dest, pkg } = await installed(validManifest('seco'), { 'a.txt': 'viejo' });
  writePkg(pkg, validManifest('seco', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  const { code, stdout } = await run(['update', 'seco', '--dry-run'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /plan de actualización:/);
  assert.match(stdout.join('\n'), /fin del plan \(--dry-run\)/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'viejo');
});

test('update exits 4 when the origin publishes a different package', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'a' });
  const otro = path.join(tmp(), 'otro-nombre');
  writePkg(otro, validManifest('otro-nombre', { version: '2.0.0' }), { 'a.txt': 'b' });
  const { code, stderr } = await run(['update', 'p', '--path', otro], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /publica "otro-nombre", no "p"/);
});

test('update rejects malformed invocations with code 4', async () => {
  const dest = tmp();
  for (const argv of [
    ['update'],
    ['update', 'p', 'a/b', 'extra'],
    ['update', 'p', '--path', 'x', '--ref', 'v1'],
    ['update', 'p', '--wat'],
    ['update', 'p', 'no-es-spec!'],
    ['update', 'p', '--ref', 'mal ref'],
  ]) {
    const { code } = await run(argv, { cwd: dest });
    assert.equal(code, EXIT_USAGE, argv.join(' '));
  }
});

test('update rejects --ref against a recorded local origin', async () => {
  const { dest } = await installed(validManifest('local'), { 'a.txt': 'a' });
  const { code, stderr } = await run(['update', 'local', '--ref', 'v2'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /--ref no aplica a un origen local/);
});

test('update exits 4 when the recorded local origin no longer exists', async () => {
  const { dest, pkg } = await installed(validManifest('ido'), { 'a.txt': 'a' });
  fs.rmSync(pkg, { recursive: true });
  const { code, stderr } = await run(['update', 'ido'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /no es un directorio/);
});

test('update exits 5 when the recorded remote origin is unreachable', async () => {
  const dest = tmp();
  const spy1 = spyFetch(remoteOk(await remotePkg()));
  await run(['o/mi-paquete', dest], { fetch: spy1.fetch });
  const spy2 = spyFetch(() => Promise.reject(new Error('ENOTFOUND')));
  const { code, stderr } = await run(
    ['update', 'mi-paquete'], { cwd: dest, fetch: spy2.fetch },
  );
  assert.equal(code, EXIT_FETCH);
  assert.match(stderr.join('\n'), /error de obtención/);
});

test('update exits 1 when the incoming manifest is invalid', async () => {
  const { dest, pkg } = await installed(validManifest('roto'), { 'a.txt': 'a' });
  fs.writeFileSync(path.join(pkg, 'teleprompter.json'), 'no es json');
  const { code } = await run(['update', 'roto'], { cwd: dest });
  assert.equal(code, EXIT_MANIFEST);
});

test('update exits 2 when the new version adds an unmet precondition', async () => {
  const { dest, pkg } = await installed(validManifest('pide'), { 'a.txt': 'a' });
  writePkg(pkg, validManifest('pide', {
    version: '2.0.0',
    requires: { paths: [{ path: 'falta/' }] },
  }), { 'a.txt': 'a' });
  const { code, stderr } = await run(['update', 'pide'], { cwd: dest });
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /precondición incumplida/);
});

test('update aborts when the managed guide destination escapes the root', async () => {
  const { dest, pkg } = await installed(validManifest('guia', {
    personalization: 'GUIA.md',
  }), { 'a.txt': 'a', 'GUIA.md': 'guía' });
  const outside = tmp();
  fs.rmSync(path.join(dest, '.teleprompter'), { recursive: true });
  fs.symlinkSync(outside, path.join(dest, '.teleprompter'));
  writePkg(pkg, validManifest('guia', {
    version: '2.0.0', personalization: 'GUIA.md',
  }), { 'a.txt': 'b', 'GUIA.md': 'guía' });
  const { code, stderr } = await run(['update', 'guia'], { cwd: dest });
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /escapa de la raíz/);
});

test('update exits 3 when the destination turns unwritable mid-execution', async () => {
  const { dest, pkg } = await installed(validManifest('falla'), { 'a.txt': 'viejo' });
  writePkg(pkg, validManifest('falla', {
    version: '2.0.0',
    install: [{ source: 'n.txt', target: 'n.txt' }, { source: 'a.txt', target: 'a.txt' }],
  }), { 'n.txt': 'n', 'a.txt': 'nuevo' });
  fs.chmodSync(dest, 0o555);
  const { code, stdout, stderr } = await run(['update', 'falla'], { cwd: dest });
  fs.chmodSync(dest, 0o755);
  assert.equal(code, EXIT_EXECUTION);
  assert.match(stderr.join('\n'), /error de ejecución/);
  assert.match(stdout.join('\n'), /create\s+n\.txt/);
});

test('update re-delivers the managed guide of the new version', async () => {
  const { dest, pkg } = await installed(validManifest('conguia', {
    personalization: 'GUIA.md',
  }), { 'a.txt': 'a', 'GUIA.md': 'guía vieja' });
  writePkg(pkg, validManifest('conguia', {
    version: '2.0.0', personalization: 'GUIA.md',
  }), { 'a.txt': 'b', 'GUIA.md': 'guía nueva' });
  const { code, stdout, stderr } = await run(['update', 'conguia'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /personalización \(/);
  assert.match(stdout.join('\n'), /guía nueva/);
});

test('update retires a drifted guide the new version replaces, without asking', async () => {
  const { dest, pkg } = await installed(validManifest('guia', {
    personalization: 'GUIA.md',
  }), { 'a.txt': 'a', 'GUIA.md': 'guía vieja' });
  fs.writeFileSync(path.join(dest, '.teleprompter/guia/GUIA.md'), 'editada');
  writePkg(pkg, validManifest('guia', {
    version: '2.0.0', personalization: 'NUEVA.md',
  }), { 'a.txt': 'b', 'NUEVA.md': 'guía nueva' });
  const questions = [];
  const { code, stderr } = await run(['update', 'guia'], {
    cwd: dest,
    interactive: true,
    createAsker: () => ({
      ask: async (q) => { questions.push(q); return true; },
      close: () => {},
    }),
  });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.deepEqual(questions, []);
  assert.ok(!fs.existsSync(path.join(dest, '.teleprompter/guia/GUIA.md')));
  assert.equal(
    fs.readFileSync(path.join(dest, '.teleprompter/guia/NUEVA.md'), 'utf8'),
    'guía nueva',
  );
  assert.equal(lockOf(dest).packages.guia.personalization, '.teleprompter/guia/NUEVA.md');
});

test('update still asks about a drifted guide the new version drops', async () => {
  const { dest, pkg } = await installed(validManifest('guia', {
    personalization: 'GUIA.md',
  }), { 'a.txt': 'a', 'GUIA.md': 'guía vieja' });
  fs.writeFileSync(path.join(dest, '.teleprompter/guia/GUIA.md'), 'editada');
  writePkg(pkg, validManifest('guia', { version: '2.0.0' }), { 'a.txt': 'b' });
  const questions = [];
  const { code, stderr } = await run(['update', 'guia'], {
    cwd: dest,
    interactive: true,
    createAsker: () => ({
      ask: async (q) => { questions.push(q); return false; },
      close: () => {},
    }),
  });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(questions[0], /¿quitar\?/);
  assert.equal(
    fs.readFileSync(path.join(dest, '.teleprompter/guia/GUIA.md'), 'utf8'),
    'editada',
  );
  // Kept as recorded content, but no longer the package's guide.
  const lock = lockOf(dest);
  assert.equal(lock.packages.guia.personalization, undefined);
  assert.ok(lock.packages.guia.files
    .some((f) => f.target === '.teleprompter/guia/GUIA.md'));
});

test('update tolerates a non-string personalization in the lock', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'a');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { p: {
      version: '1.0.0',
      files: [{ target: 'a.txt', action: 'create' }],
      personalization: 42,
    } },
  }));
  const pkg = path.join(tmp(), 'p');
  writePkg(pkg, validManifest('p', {
    version: '2.0.0', personalization: 'GUIA.md',
  }), { 'a.txt': 'a', 'GUIA.md': 'guía' });
  const { code, stderr } = await run(['update', 'p', '--path', pkg], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(lockOf(dest).packages.p.personalization, '.teleprompter/p/GUIA.md');
});

test('update warns on a corrupt lock and reports the package as not installed', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), '{"packages": 42}');
  const { code, stdout, stderr } = await run(['update', 'p'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stdout.join('\n'), /aviso: .*corrupto/);
  assert.match(stderr.join('\n'), /no está instalado/);
});

test('update surfaces verification warnings and required creates', async () => {
  const { dest, pkg } = await installed(validManifest('avisa'), { 'a.txt': 'a' });
  writePkg(pkg, validManifest('avisa', {
    version: '2.0.0',
    campo_raro: 'x',
    requires: { paths: [{ path: 'nuevodir/', create: true }] },
  }), { 'a.txt': 'b' });
  const { code, stdout, stderr } = await run(['update', 'avisa'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /aviso: campo desconocido ignorado: "campo_raro"/);
  assert.match(stdout.join('\n'), /mkdir\s+nuevodir\//);
  assert.ok(fs.statSync(path.join(dest, 'nuevodir')).isDirectory());
});

test('update reports applied actions when the lock write fails', async () => {
  const { dest, pkg } = await installed(validManifest('sinlock'), { 'a.txt': 'viejo' });
  writePkg(pkg, validManifest('sinlock', { version: '2.0.0' }), { 'a.txt': 'nuevo' });
  // A directory squatting on the temp name makes the lock write fail.
  fs.mkdirSync(path.join(dest, `teleprompter-lock.json.${process.pid}.tmp`));
  const { code, stdout, stderr } = await run(['update', 'sinlock'], { cwd: dest });
  assert.equal(code, EXIT_EXECUTION);
  assert.match(stdout.join('\n'), /overwrite\s+a\.txt/);
  assert.match(stderr.join('\n'), /error de ejecución/);
});

test('update exits 4 when the recorded repo origin is malformed', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      raro: {
        version: '1.0.0',
        files: [],
        origin: { type: 'github', repo: 'garbage' },
      },
    },
  }));
  const { code, stderr } = await run(['update', 'raro'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /no es un repositorio válido/);
});

test('an invalid collection manifest aborts with its errors', async () => {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writePkg(coll, {
    collection: true,
    name: 'coleccion',
    packages: [{ path: 'alfa' }],
    version: '1.0.0',
  });
  const { code, stderr } = await run(['--path', coll, dest, '--package', 'alfa']);
  assert.equal(code, EXIT_MANIFEST);
  assert.match(stderr.join('\n'), /manifiesto de colección inválido: version: campo de paquete/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('--force applies to every selected unit', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'local');
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'alfa', manifest: validManifest('alfa', { install: [{ source: 'a.txt', target: 'a.txt' }] }) },
    { path: 'beta', manifest: validManifest('beta', { install: [{ source: 'a.txt', target: 'a.txt' }] }), files: { 'a.txt': 'a' } },
  ]);
  const { code, stderr } = await run(
    ['--path', coll, dest, '--package', 'alfa', '--package', 'beta', '--force'],
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
});

test('a remote collection with @ref records ref and package in the origin', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const work = tmp();
  const root = path.join(work, 'familia-abc123');
  writeCollection(root, [{ path: 'alfa' }]);
  const archive = path.join(work, 'a.tgz');
  await tarCreate({ gzip: true, file: archive, cwd: work }, ['familia-abc123']);
  const spy = spyFetch(remoteOk(fs.readFileSync(archive)));
  const { code, stderr } = await run(
    ['o/familia@v2', dest, '--package', 'alfa'],
    { tmpBase, fetch: spy.fetch },
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const lock = JSON.parse(fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'));
  assert.deepEqual(lock.packages.alfa.origin, {
    type: 'github', repo: 'o/familia', ref: 'v2', commit: RESOLVED, package: 'alfa',
  });
});

// --- update desde colección ---

// Installs every member of a local collection into a fresh
// destination and hands both over so the test can mutate the
// collection and drive `update` against it.
async function installedFromCollection(members) {
  const dest = tmp();
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, members);
  for (const member of members) {
    const { code, stderr } = await run(
      ['--path', coll, dest, '--package', path.basename(member.path)],
    );
    assert.equal(code, EXIT_OK, stderr.join('\n'));
  }
  return { dest, coll };
}

test('update re-resolves the recorded member of a local collection', async () => {
  const { dest, coll } = await installedFromCollection([
    { path: 'alfa' },
    { path: 'beta', manifest: validManifest('beta', { install: [{ source: 'b.txt', target: 'b.txt' }] }), files: { 'b.txt': 'b' } },
  ]);
  writePkg(path.join(coll, 'alfa'), validManifest('alfa', {
    version: '2.0.0',
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'n.txt', target: 'n.txt' }],
  }), { 'a.txt': 'nuevo', 'n.txt': 'n' });

  const { code, stdout, stderr } = await run(['update', 'alfa'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /actualizado: alfa@2\.0\.0/);
  assert.equal(fs.readFileSync(path.join(dest, 'n.txt'), 'utf8'), 'n');
  const lock = lockOf(dest);
  assert.equal(lock.packages.alfa.version, '2.0.0');
  assert.deepEqual(lock.packages.alfa.origin, { type: 'path', path: coll, package: 'alfa' });
  assert.equal(lock.packages.beta.version, '1.0.0');
  assert.equal(fs.readFileSync(path.join(dest, 'b.txt'), 'utf8'), 'b');
});

test('update re-fetches the recorded remote collection and updates the member', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const build = async (version, content) => {
    const work = tmp();
    const root = path.join(work, 'familia-abc123');
    writeCollection(root, [{
      path: 'alfa',
      manifest: validManifest('alfa', { version }),
      files: { 'a.txt': content },
    }]);
    const archive = path.join(work, 'a.tgz');
    await tarCreate({ gzip: true, file: archive, cwd: work }, ['familia-abc123']);
    return fs.readFileSync(archive);
  };
  const spy1 = spyFetch(remoteOk(await build('1.0.0', 'viejo')));
  await run(['o/familia', dest, '--package', 'alfa'], { tmpBase, fetch: spy1.fetch });
  const spy2 = spyFetch(remoteOk(await build('2.0.0', 'nuevo')));
  const { code, stdout, stderr } = await run(
    ['update', 'alfa'], { cwd: dest, tmpBase, fetch: spy2.fetch },
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /actualizado: alfa@2\.0\.0/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'nuevo');
  assert.deepEqual(lockOf(dest).packages.alfa.origin, {
    type: 'github', repo: 'o/familia', commit: RESOLVED, package: 'alfa',
  });
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('update with an explicit collection source resolves the package by name', async () => {
  const dest = tmp();
  const collA = path.join(tmp(), 'familia-a');
  writeCollection(collA, [{ path: 'alfa' }]);
  await run(['--path', collA, dest, '--package', 'alfa']);
  const collB = path.join(tmp(), 'familia-b');
  writeCollection(collB, [{
    path: 'alfa',
    manifest: validManifest('alfa', { version: '3.0.0' }),
    files: { 'a.txt': 'de la otra familia' },
  }]);
  const { code, stdout, stderr } = await run(
    ['update', 'alfa', '--path', collB], { cwd: dest },
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /actualizado: alfa@3\.0\.0/);
  assert.deepEqual(lockOf(dest).packages.alfa.origin, {
    type: 'path', path: collB, package: 'alfa',
  });
});

test('--ref overrides the ref of a recorded collection origin', async () => {
  const dest = tmp();
  const tmpBase = tmp();
  const build = async (version) => {
    const work = tmp();
    const root = path.join(work, 'familia-abc123');
    writeCollection(root, [{
      path: 'alfa',
      manifest: validManifest('alfa', { version }),
      files: { 'a.txt': version },
    }]);
    const archive = path.join(work, 'a.tgz');
    await tarCreate({ gzip: true, file: archive, cwd: work }, ['familia-abc123']);
    return fs.readFileSync(archive);
  };
  const spy1 = spyFetch(remoteOk(await build('1.0.0')));
  await run(['o/familia@v1', dest, '--package', 'alfa'], { tmpBase, fetch: spy1.fetch });
  const spy2 = spyFetch(remoteOk(await build('2.0.0')));
  const { code, stderr } = await run(
    ['update', 'alfa', '--ref', 'v2'], { cwd: dest, tmpBase, fetch: spy2.fetch },
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(spy2.urls[0], /commits\/v2/);
  assert.deepEqual(lockOf(dest).packages.alfa.origin, {
    type: 'github', repo: 'o/familia', ref: 'v2', commit: RESOLVED, package: 'alfa',
  });
});

test('update reports a member retired from the collection index', async () => {
  const { dest, coll } = await installedFromCollection([{ path: 'alfa' }]);
  writePkg(coll, {
    collection: true,
    name: 'coleccion',
    packages: [{ path: 'beta' }],
  });
  writePkg(path.join(coll, 'beta'), validManifest('beta'), { 'a.txt': 'a' });
  const { code, stderr } = await run(['update', 'alfa'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  const shown = stderr.join('\n');
  assert.match(shown, /ya no está en la colección/);
  assert.match(shown, /disponibles: beta/);
  assert.equal(lockOf(dest).packages.alfa.version, '1.0.0');
});

test('update follows a collection dissolved into a single package', async () => {
  const dest = tmp();
  // The collection directory must be named after the member: the
  // dissolved single-package manifest has to pass checkName.
  const coll = path.join(tmp(), 'alfa');
  writeCollection(coll, [{ path: 'alfa' }]);
  await run(['--path', coll, dest, '--package', 'alfa']);
  writePkg(coll, validManifest('alfa', { version: '2.0.0' }), { 'a.txt': 'suelto' });
  const { code, stdout, stderr } = await run(['update', 'alfa'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /actualizado: alfa@2\.0\.0/);
  assert.deepEqual(lockOf(dest).packages.alfa.origin, { type: 'path', path: coll });
});

test('list, check and guide treat a collection-installed package like any other', async () => {
  const dest = tmp();
  const contenido = '# Guía\nde la colección';
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [{
    path: 'alfa',
    manifest: validManifest('alfa', { personalization: 'guia.md' }),
    files: { 'a.txt': 'a', 'guia.md': contenido },
  }]);
  await run(['--path', coll, dest, '--package', 'alfa']);

  const listed = await run(['list'], { cwd: dest });
  assert.equal(listed.code, EXIT_OK);
  assert.match(listed.stdout.join('\n'), /alfa/);

  const checked = await run(['check'], { cwd: dest });
  assert.equal(checked.code, EXIT_OK);
  assert.match(checked.stdout.join('\n'), / {4}intacto\s+a\.txt/);

  const guided = await run(['guide'], { cwd: dest });
  assert.equal(guided.code, EXIT_OK);
  assert.match(guided.stdout.join('\n'), /de la colección/);
});

test('update aborts when the collection manifest itself is invalid', async () => {
  const { dest, coll } = await installedFromCollection([{ path: 'alfa' }]);
  writePkg(coll, {
    collection: true,
    name: 'coleccion',
    packages: [{ path: 'alfa' }],
    version: '1.0.0',
  });
  const { code, stderr } = await run(['update', 'alfa'], { cwd: dest });
  assert.equal(code, EXIT_MANIFEST);
  assert.match(stderr.join('\n'), /manifiesto de colección inválido/);
});

test('uninstall removes an intact installed package and its lock entry', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [
      { source: 'a.txt', target: 'a.txt' },
      { source: 'b.txt', target: 'b.txt' },
    ],
  }), { 'a.txt': 'a', 'b.txt': 'b' });
  const { code, stdout, stderr } = await run(['uninstall', 'p'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const out = stdout.join('\n');
  assert.match(out, /plan de retirada:/);
  assert.match(out, /retire\s+a\.txt/);
  assert.match(out, /retire\s+b\.txt/);
  assert.match(out, /resultado:\n( {2}remove\s+\S+\n)+/);
  assert.match(out, /desinstalado: p@1\.0\.0/);
  assert.ok(!fs.existsSync(path.join(dest, 'a.txt')));
  assert.ok(!fs.existsSync(path.join(dest, 'b.txt')));
  assert.equal(lockOf(dest).packages.p, undefined);
});

test('uninstall removes a recorded directory whole', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [{ source: 'skills', target: 'skills/' }],
  }), { 'skills/a.txt': 'a', 'skills/b.txt': 'b' });
  const { code, stdout, stderr } = await run(['uninstall', 'p'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /retire\s+skills\//);
  assert.ok(!fs.existsSync(path.join(dest, 'skills')));
});

test('uninstall decides a recorded directory the user added content to', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [{ source: 'skills', target: 'skills/' }],
  }), { 'skills/a.txt': 'a' });
  fs.writeFileSync(path.join(dest, 'skills', 'mio.txt'), 'mío');
  const { code, stdout, stderr } = await run(['uninstall', 'p', '--skip'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const out = stdout.join('\n');
  assert.match(out, /conflict\s+skills\//);
  assert.match(out, /skills\/ → keep/);
  assert.equal(fs.readFileSync(path.join(dest, 'skills/mio.txt'), 'utf8'), 'mío');
  assert.equal(lockOf(dest).packages.p, undefined);
});

test('uninstall cleans the entry of a resource already gone', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [
      { source: 'a.txt', target: 'a.txt' },
      { source: 'b.txt', target: 'b.txt' },
    ],
  }), { 'a.txt': 'a', 'b.txt': 'b' });
  fs.rmSync(path.join(dest, 'a.txt'));
  const { code, stdout, stderr } = await run(['uninstall', 'p'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const out = stdout.join('\n');
  assert.doesNotMatch(out, /a\.txt/);
  assert.match(out, /retire\s+b\.txt/);
  assert.equal(lockOf(dest).packages.p, undefined);
});

test('uninstall does not touch a resource recorded as skipped', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'instalado');
  fs.writeFileSync(path.join(dest, 'b.txt'), 'ajeno');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      p: {
        version: '1.0.0',
        installedAt: '2026-09-28T10:00:00Z',
        files: [
          { target: 'a.txt', action: 'create', sha256: hashPath(path.join(dest, 'a.txt')) },
          { target: 'b.txt', action: 'skip' },
        ],
      },
    },
  }));
  const { code, stdout, stderr } = await run(['uninstall', 'p'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const out = stdout.join('\n');
  assert.doesNotMatch(out, /b\.txt/);
  assert.ok(!fs.existsSync(path.join(dest, 'a.txt')));
  assert.equal(fs.readFileSync(path.join(dest, 'b.txt'), 'utf8'), 'ajeno');
  assert.equal(lockOf(dest).packages.p, undefined);
});

test('uninstall retires the managed guide with its package', async () => {
  const { dest } = await installed(validManifest('p', {
    personalization: 'GUIA.md',
  }), { 'a.txt': 'a', 'GUIA.md': 'guía' });
  assert.ok(fs.existsSync(path.join(dest, '.teleprompter/p/GUIA.md')));
  const { code, stdout, stderr } = await run(['uninstall', 'p'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.match(stdout.join('\n'), /retire\s+\.teleprompter\/p\/GUIA\.md/);
  assert.ok(!fs.existsSync(path.join(dest, '.teleprompter/p/GUIA.md')));
  assert.equal(lockOf(dest).packages.p, undefined);
});

test('uninstall removes only the named entry from the registry', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', writePkg2('q'), dest]);
  const { code, stderr } = await run(['uninstall', 'p'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const lock = lockOf(dest);
  assert.equal(lock.packages.p, undefined);
  assert.equal(lock.packages.q.version, '1.0.0');
  assert.equal(fs.readFileSync(path.join(dest, 'q.txt'), 'utf8'), 'q');
});

test('uninstall of the last package leaves the lock with empty packages', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'a' });
  const { code } = await run(['uninstall', 'p'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  assert.deepEqual(lockOf(dest).packages, {});
  assert.ok(fs.existsSync(path.join(dest, 'teleprompter-lock.json')));
});

test('uninstall --skip keeps a locally modified resource and says so', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'viejo' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  const { code, stdout, stderr } = await run(['uninstall', 'p', '--skip'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const out = stdout.join('\n');
  assert.match(out, /a\.txt → keep/);
  assert.match(out, /keep\s+a\.txt/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'editado');
  assert.equal(lockOf(dest).packages.p, undefined);
});

test('uninstall never deletes a recorded path that is unsafe or unverifiable', async () => {
  const dest = tmp();
  const outside = path.join(path.dirname(dest), 'secreto.txt');
  fs.writeFileSync(outside, 'secreto');
  fs.writeFileSync(path.join(dest, 'sin-hash.txt'), 'dato');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      p: {
        version: '1.0.0',
        files: [
          { target: '../secreto.txt', action: 'create', sha256: '0'.repeat(64) },
          { target: 'sin-hash.txt', action: 'create' },
        ],
      },
    },
  }));
  const { code, stdout, stderr } = await run(['uninstall', 'p', '--skip'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const out = stdout.join('\n');
  assert.match(out, /\.\.\/secreto\.txt → keep/);
  assert.match(out, /sin-hash\.txt → keep/);
  assert.equal(fs.readFileSync(outside, 'utf8'), 'secreto');
  assert.equal(fs.readFileSync(path.join(dest, 'sin-hash.txt'), 'utf8'), 'dato');
  fs.rmSync(outside, { force: true });
});

test('uninstall --force on an unsafe recorded path fails as an execution error', async () => {
  const dest = tmp();
  const outside = path.join(path.dirname(dest), 'secreto.txt');
  fs.writeFileSync(outside, 'secreto');
  fs.writeFileSync(path.join(dest, 'sin-hash.txt'), 'dato');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      p: {
        version: '1.0.0',
        files: [
          { target: '../secreto.txt', action: 'create', sha256: '0'.repeat(64) },
          { target: 'sin-hash.txt', action: 'create' },
        ],
      },
    },
  }));
  const { code, stderr } = await run(['uninstall', 'p', '--force'], { cwd: dest });
  assert.equal(code, EXIT_EXECUTION);
  assert.match(stderr.join('\n'), /error de ejecución.*escapa de la raíz/);
  assert.equal(fs.readFileSync(outside, 'utf8'), 'secreto');
  assert.equal(fs.readFileSync(path.join(dest, 'sin-hash.txt'), 'utf8'), 'dato');
  assert.equal(lockOf(dest).packages.p.version, '1.0.0');
  fs.rmSync(outside, { force: true });
});

test('uninstall rejects malformed invocations with code 4', async () => {
  const dest = tmp();
  for (const argv of [
    ['uninstall'],
    ['uninstall', 'p', 'extra'],
    ['uninstall', 'p', '--path', 'x'],
    ['uninstall', 'p', '--ref', 'v1'],
    ['uninstall', 'p', '--package', 'x'],
    ['uninstall', 'p', '--force', '--skip'],
    ['uninstall', 'p', '--wat'],
  ]) {
    const { code } = await run(argv, { cwd: dest });
    assert.equal(code, EXIT_USAGE, argv.join(' '));
  }
});

test('uninstall exits 4 when the package is not installed or there is no lock', async () => {
  const dest = tmp();
  const { code, stderr } = await run(['uninstall', 'fantasma'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stderr.join('\n'), /no está instalado/);
});

test('uninstall, update and guide treat names inherited from Object.prototype as not installed', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'a' });
  for (const cmd of ['uninstall', 'update', 'guide']) {
    for (const name of ['__proto__', 'constructor', 'hasOwnProperty', 'toString']) {
      const { code, stderr } = await run([cmd, name], { cwd: dest });
      assert.equal(code, EXIT_USAGE, `${cmd} ${name}`);
      assert.match(stderr.join('\n'), /no está instalado/, `${cmd} ${name}`);
    }
  }
});

test('uninstall reads a lock entry recorded as own __proto__', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'a');
  const sha = hashPath(path.join(dest, 'a.txt'));
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'),
    `{"packages":{"__proto__":{"version":"1.0.0","files":[{"target":"a.txt","action":"create","sha256":"${sha}"}]}}}`);
  const { code, stderr } = await run(['uninstall', '__proto__'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.ok(!fs.existsSync(path.join(dest, 'a.txt')));
  assert.deepEqual(lockOf(dest).packages, {});
});

test('uninstall exits 4 on a corrupt lock after the warning', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), '{roto');
  const { code, stdout, stderr } = await run(['uninstall', 'p'], { cwd: dest });
  assert.equal(code, EXIT_USAGE);
  assert.match(stdout.join('\n'), /aviso:.*corrupto/);
  assert.match(stderr.join('\n'), /no está instalado/);
});

test('uninstall --dry-run shows the plan and writes nothing', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'a' });
  const { code, stdout } = await run(['uninstall', 'p', '--dry-run'], { cwd: dest });
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, /plan de retirada:/);
  assert.match(out, /retire\s+a\.txt/);
  assert.match(out, /fin del plan \(--dry-run\)/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
  assert.equal(lockOf(dest).packages.p.version, '1.0.0');
});

test('uninstall reports the applied actions when a removal fails midway', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [
      { source: 'sub/f.txt', target: 'sub/f.txt' },
      { source: 'a.txt', target: 'a.txt' },
    ],
  }), { 'sub/f.txt': 'f', 'a.txt': 'a' });
  fs.chmodSync(dest, 0o555);
  try {
    const { code, stdout, stderr } = await run(['uninstall', 'p'], { cwd: dest });
    assert.equal(code, EXIT_EXECUTION);
    assert.match(stdout.join('\n'), /remove\s+sub\/f\.txt/);
    assert.match(stderr.join('\n'), /error de ejecución/);
    assert.equal(lockOf(dest).packages.p.version, '1.0.0');
  } finally {
    fs.chmodSync(dest, 0o755);
  }
});

test('uninstall reports the applied actions when the lock rewrite fails', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [{ source: 'sub/f.txt', target: 'sub/f.txt' }],
  }), { 'sub/f.txt': 'f' });
  fs.chmodSync(dest, 0o555);
  try {
    const { code, stdout, stderr } = await run(['uninstall', 'p'], { cwd: dest });
    assert.equal(code, EXIT_EXECUTION);
    assert.match(stdout.join('\n'), /remove\s+sub\/f\.txt/);
    assert.match(stderr.join('\n'), /error de ejecución/);
  } finally {
    fs.chmodSync(dest, 0o755);
  }
});

test('after uninstall, list and check no longer report the package', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'a' });
  await run(['--path', writePkg2('q'), dest]);
  await run(['uninstall', 'p'], { cwd: dest });
  const listed = await run(['list'], { cwd: dest });
  assert.equal(listed.code, EXIT_OK);
  assert.match(listed.stdout.join('\n'), /q@1\.0\.0/);
  assert.doesNotMatch(listed.stdout.join('\n'), /p@/);
  const checked = await run(['check'], { cwd: dest });
  assert.equal(checked.code, EXIT_OK);
  assert.doesNotMatch(checked.stdout.join('\n'), /p@/);
});

test('uninstall lists a divergent resource with its diff and aborts without a console', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'viejo\n' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado\n');
  const { code, stdout, stderr } = await run(['uninstall', 'p'], { cwd: dest });
  assert.equal(code, EXIT_PLAN);
  assert.match(stdout.join('\n'), /conflict\s+a\.txt/);
  assert.match(stderr.join('\n'),
    /conflicto sin resolver: a\.txt\n--- a\.txt \(destino\)\n\+\+\+ a\.txt \(ausente\)\n@@ -1 \+0,0 @@\n-editado/);
  assert.match(stderr.join('\n'), /plan no ejecutable/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'editado\n');
  assert.equal(lockOf(dest).packages.p.version, '1.0.0');
  assert.equal(fs.existsSync(path.join(dest, '.teleprompter', 'backups')), false);
});

test('uninstall asks about removing each divergence with its diff shown first', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), { 'a.txt': 'viejo\n', 'b.txt': 'b\n' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado\n');
  fs.writeFileSync(path.join(dest, 'b.txt'), 'editado también\n');
  const shown = [];
  const asked = [];
  const answers = [true, false];
  const { code, stderr } = await run(['uninstall', 'p'], {
    cwd: dest,
    interactive: true,
    out: (m) => shown.push(m),
    createAsker: () => ({
      ask: async (q) => { asked.push({ q, seen: shown.join('\n') }); return answers.shift(); },
      close: () => {},
    }),
  });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(asked.length, 2);
  assert.match(asked[0].q, /¿quitar\?/);
  // When the question was asked its diff was already out, and the
  // next divergence's diff was not yet.
  assert.match(asked[0].seen, /--- a\.txt \(destino\)[\s\S]*-editado/);
  assert.doesNotMatch(asked[0].seen, /editado también/);
  assert.match(asked[1].seen, /--- b\.txt \(destino\)\n\+\+\+ b\.txt \(ausente\)/);
  const out = shown.join('\n');
  assert.match(out, /a\.txt → remove/);
  assert.match(out, /b\.txt → keep/);
  assert.ok(!fs.existsSync(path.join(dest, 'a.txt')));
  assert.equal(fs.readFileSync(path.join(dest, 'b.txt'), 'utf8'), 'editado también\n');
  const dirs = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
  assert.equal(dirs.length, 1);
  assert.equal(
    fs.readFileSync(path.join(dest, '.teleprompter', 'backups', dirs[0], 'a.txt'), 'utf8'),
    'editado\n',
  );
  assert.equal(lockOf(dest).packages.p, undefined);
});

test('uninstall --force removes every divergence with a backup', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), { 'a.txt': 'viejo', 'b.txt': 'b' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  fs.writeFileSync(path.join(dest, 'b.txt'), 'editado también');
  const { code, stdout, stderr } = await run(['uninstall', 'p', '--force'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.ok(!fs.existsSync(path.join(dest, 'a.txt')));
  assert.ok(!fs.existsSync(path.join(dest, 'b.txt')));
  const dirs = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
  assert.equal(dirs.length, 1);
  assert.match(dirs[0], /-p@1\.0\.0$/);
  assert.equal(
    fs.readFileSync(path.join(dest, '.teleprompter', 'backups', dirs[0], 'a.txt'), 'utf8'),
    'editado',
  );
  assert.equal(
    fs.readFileSync(path.join(dest, '.teleprompter', 'backups', dirs[0], 'b.txt'), 'utf8'),
    'editado también',
  );
  assert.match(stdout.join('\n'), /respaldo \(\.teleprompter\/backups\//);
  assert.match(stdout.join('\n'), /desinstalado: p@1\.0\.0/);
  assert.equal(lockOf(dest).packages.p, undefined);
});

test('uninstall --force backs up a divergent directory subtree, local files included', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [{ source: 'skills', target: 'skills/' }],
  }), { 'skills/a.txt': 'a' });
  fs.writeFileSync(path.join(dest, 'skills', 'mio.txt'), 'mío');
  const { code, stderr } = await run(['uninstall', 'p', '--force'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.ok(!fs.existsSync(path.join(dest, 'skills')));
  const dirs = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
  assert.equal(dirs.length, 1);
  assert.equal(
    fs.readFileSync(
      path.join(dest, '.teleprompter', 'backups', dirs[0], 'skills', 'mio.txt'), 'utf8'),
    'mío',
  );
});

test('uninstall --skip leaves the kept resource on disk and out of the registry', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'viejo' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  const { code, stderr } = await run(['uninstall', 'p', '--skip'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  assert.equal(fs.existsSync(path.join(dest, '.teleprompter', 'backups')), false);
  const checked = await run(['check'], { cwd: dest });
  assert.match(checked.stdout.join('\n'), /no hay paquetes instalados/);
});

test('uninstall --dry-run lists divergences and aborts, and resolves ahead with --force', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'viejo\n' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado\n');
  const aborted = await run(['uninstall', 'p', '--dry-run'], { cwd: dest });
  assert.equal(aborted.code, EXIT_PLAN);
  assert.match(aborted.stderr.join('\n'), /conflicto sin resolver: a\.txt/);
  const resolved = await run(['uninstall', 'p', '--dry-run', '--force'], { cwd: dest });
  assert.equal(resolved.code, EXIT_OK);
  const out = resolved.stdout.join('\n');
  assert.match(out, /a\.txt → remove/);
  assert.match(out, /fin del plan \(--dry-run\)/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'editado\n');
  assert.equal(lockOf(dest).packages.p.version, '1.0.0');
  assert.equal(fs.existsSync(path.join(dest, '.teleprompter', 'backups')), false);
});

test('uninstall retires the intact resources and decides the divergent ones', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [{ source: 'a.txt', target: 'a.txt' }, { source: 'b.txt', target: 'b.txt' }],
  }), { 'a.txt': 'a', 'b.txt': 'b' });
  fs.writeFileSync(path.join(dest, 'b.txt'), 'editado');
  const { code, stdout, stderr } = await run(['uninstall', 'p', '--skip'], { cwd: dest });
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const out = stdout.join('\n');
  assert.match(out, /retire\s+a\.txt/);
  assert.match(out, /conflict\s+b\.txt/);
  assert.ok(!fs.existsSync(path.join(dest, 'a.txt')));
  assert.equal(fs.readFileSync(path.join(dest, 'b.txt'), 'utf8'), 'editado');
  assert.equal(lockOf(dest).packages.p, undefined);
});

test('uninstall aborts the plan when the backup root escapes the destination', async () => {
  const { dest } = await installed(validManifest('p'), { 'a.txt': 'viejo' });
  const outside = tmp();
  fs.rmSync(path.join(dest, '.teleprompter'), { recursive: true, force: true });
  fs.symlinkSync(outside, path.join(dest, '.teleprompter'));
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  const { code, stderr } = await run(['uninstall', 'p', '--force'], { cwd: dest });
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /escapa de la raíz/);
  assert.equal(fs.existsSync(path.join(outside, 'backups')), false);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'editado');
  assert.equal(lockOf(dest).packages.p.version, '1.0.0');
});

test('uninstall does not interpolate a hostile package name into the backup path', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      'x/../../../fuera': {
        version: '1.0.0',
        files: [{ target: 'a.txt', action: 'create', sha256: '0'.repeat(64) }],
      },
    },
  }));
  const { code, stderr } = await run(
    ['uninstall', 'x/../../../fuera', '--force'], { cwd: dest },
  );
  assert.equal(code, EXIT_OK, stderr.join('\n'));
  const dirs = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
  assert.equal(dirs.length, 1);
  assert.doesNotMatch(dirs[0], /fuera/);
  assert.equal(fs.existsSync(path.join(dest, 'fuera@1.0.0')), false);
  assert.equal(
    fs.readFileSync(
      path.join(dest, '.teleprompter', 'backups', dirs[0], 'a.txt'), 'utf8'),
    'editado',
  );
});

test('uninstall reports the backup already made when a decided removal fails', async () => {
  const { dest } = await installed(validManifest('p', {
    install: [
      { source: 'a.txt', target: 'a.txt' },
      { source: 'sub/f.txt', target: 'sub/f.txt' },
    ],
  }), { 'a.txt': 'a', 'sub/f.txt': 'f' });
  fs.writeFileSync(path.join(dest, 'sub', 'f.txt'), 'editado');
  fs.chmodSync(path.join(dest, 'sub'), 0o555);
  try {
    const { code, stdout, stderr } = await run(
      ['uninstall', 'p', '--force'], { cwd: dest },
    );
    assert.equal(code, EXIT_EXECUTION);
    assert.match(stdout.join('\n'), /remove\s+a\.txt/);
    assert.match(stdout.join('\n'), /respaldo \(\.teleprompter\/backups\//);
    assert.match(stderr.join('\n'), /error de ejecución/);
    const dirs = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
    assert.equal(dirs.length, 1);
    assert.equal(
      fs.readFileSync(
        path.join(dest, '.teleprompter', 'backups', dirs[0], 'sub', 'f.txt'), 'utf8'),
      'editado',
    );
    assert.equal(lockOf(dest).packages.p.version, '1.0.0');
  } finally {
    fs.chmodSync(path.join(dest, 'sub'), 0o755);
  }
});

test('uninstall help documents the divergence flags', async () => {
  const { code, stdout } = await run(['help', 'uninstall']);
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, /--force\|--skip/);
  assert.match(out, /divergencias/);
});

function writePkg2(name) {
  const pkg = path.join(tmp(), name);
  writePkg(pkg, validManifest(name, {
    install: [{ source: `${name}.txt`, target: `${name}.txt` }],
  }), { [`${name}.txt`]: name });
  return pkg;
}
