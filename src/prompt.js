import readline from 'node:readline/promises';

// readline wrapper kept apart from the CLI so conflict resolution is
// testable with fake streams. Answers accept the usual affirmative
// spellings; anything else means skip, because the safe default for
// overwriting someone else's work must be "no".
export function createAsker(input = process.stdin, output = process.stdout) {
  const rl = readline.createInterface({ input, output });
  return {
    ask: async (question) => {
      const answer = await rl.question(question);
      return ['s', 'si', 'sí', 'y', 'yes'].includes(answer.trim().toLowerCase());
    },
    close: () => rl.close(),
  };
}
