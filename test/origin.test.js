import test from 'node:test';
import assert from 'node:assert/strict';
import { reproductionSourceOf } from '../src/origin.js';
import { EXIT_USAGE } from '../src/exits.js';

// A commit as the lock records it: a full SHA, already resolved.
const COMMIT = 'f'.repeat(40);

// The translation reports through the `err` callback its caller
// injects; capturing it keeps each non-reproducible reason visible.
function capture() {
  const errors = [];
  return { errors, err: (m) => errors.push(m) };
}

test('a github origin anchors the spec to the recorded commit, not to the recorded ref', () => {
  const { errors, err } = capture();
  const resolved = reproductionSourceOf(err, 'p', {
    type: 'github', repo: 'o/r', ref: 'v9', commit: COMMIT,
  });
  assert.deepEqual(resolved, {
    source: { kind: 'repo', spec: { owner: 'o', name: 'r', ref: COMMIT } },
  });
  assert.deepEqual(errors, []);
});

test('a github origin without a recorded ref anchors to the commit all the same', () => {
  const { errors, err } = capture();
  const resolved = reproductionSourceOf(err, 'p', {
    type: 'github', repo: 'o/r', commit: COMMIT,
  });
  assert.deepEqual(resolved, {
    source: { kind: 'repo', spec: { owner: 'o', name: 'r', ref: COMMIT } },
  });
  assert.deepEqual(errors, []);
});

test('a path origin yields the recorded directory as the source', () => {
  const { errors, err } = capture();
  const resolved = reproductionSourceOf(err, 'p', {
    type: 'path', path: '/alguna/ruta',
  });
  assert.deepEqual(resolved, { source: { kind: 'path', dir: '/alguna/ruta' } });
  assert.deepEqual(errors, []);
});

test('an entry without an origin is a non-reproducible unit with its reason', () => {
  const { errors, err } = capture();
  const resolved = reproductionSourceOf(err, 'viejo', undefined);
  assert.deepEqual(resolved, { code: EXIT_USAGE });
  assert.deepEqual(errors, [
    'la unidad "viejo" no es reproducible: la entrada no registra un origen',
  ]);
});

test('a github origin recorded before the commit anchor is non-reproducible', () => {
  const { errors, err } = capture();
  const resolved = reproductionSourceOf(err, 'p', {
    type: 'github', repo: 'o/r', ref: 'v1',
  });
  assert.deepEqual(resolved, { code: EXIT_USAGE });
  assert.deepEqual(errors, [
    'la unidad "p" no es reproducible: el origen no registra el commit de la instalación',
  ]);
});

test('a recorded repo the grammar cannot parse is non-reproducible, not a crash', () => {
  const { errors, err } = capture();
  const resolved = reproductionSourceOf(err, 'p', {
    type: 'github', repo: 'no-es-repo', commit: COMMIT,
  });
  assert.deepEqual(resolved, { code: EXIT_USAGE });
  assert.deepEqual(errors, [
    'la unidad "p" no es reproducible: el origen registrado no es un repositorio válido: no-es-repo',
  ]);
});
