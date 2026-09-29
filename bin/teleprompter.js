#!/usr/bin/env node
import { main } from '../src/cli.js';
import { createAsker } from '../src/prompt.js';

try {
  process.exitCode = await main(process.argv.slice(2), {
    interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    createAsker,
  });
} catch (error) {
  console.error(`error inesperado: ${error.message}`);
  process.exitCode = 3;
}
