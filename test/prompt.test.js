import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { createAsker } from '../src/prompt.js';

const sink = () => new Writable({ write: (c, e, cb) => cb() });

// The line must be pushed after the question is pending: readline
// discards input lines emitted while no question is being asked.
test('createAsker resolves true for affirmative answers and false otherwise', async () => {
  const input = new Readable({ read() {} });
  const asker = createAsker(input, sink());
  const answers = ['s', 'yes', 'n', ''];
  const expected = [true, true, false, false];
  for (let i = 0; i < answers.length; i++) {
    const pending = asker.ask('? ');
    input.push(answers[i] + '\n');
    assert.equal(await pending, expected[i]);
  }
  asker.close();
  input.push(null);
});

// Covers the default stream arguments, which only the real CLI entry
// point would otherwise exercise.
test('createAsker works on the default stdio streams', () => {
  createAsker().close();
});
