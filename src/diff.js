import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { recordedChainSafe, stripTargetSeps } from './paths.js';

// Unified-diff context: how many unchanged lines frame each change
// run. Two runs merge when the gap between them fits inside both
// context windows — at exactly 2*CONTEXT common lines the windows
// meet and `diff -u` emits a single hunk.
const CONTEXT = 3;

// The LCS table is O(n·m) in compared lines: past this many cells
// the matrix is not worth its memory, and the block degrades to a
// marker line instead of a hunk list.
const MAX_CELLS = 4_000_000;

// The minimum sequence of operations that turns `a` into `b`:
// ' ' keeps a shared line, '-' drops an `a` line, '+' adds a `b`
// line. A longest-common-subsequence table keeps the op count
// minimal — inputs are small config files, so the O(n·m) matrix is
// cheap and far simpler than an external dependency.
function diffOps(a, b) {
  const dp = Array.from({ length: a.length + 1 },
    () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ t: ' ', line: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      // Ties delete first: a replaced region prints its '-'
      // lines before its '+' lines, like `diff -u`.
      ops.push({ t: '-', line: a[i] });
      i++;
    } else {
      ops.push({ t: '+', line: b[j] });
      j++;
    }
  }
  while (i < a.length) ops.push({ t: '-', line: a[i++] });
  while (j < b.length) ops.push({ t: '+', line: b[j++] });
  return ops;
}

// Display escaping for anything that came from data — names, link
// targets, file lines: control characters forge lines or drive
// terminal escapes (C0, DEL, the 8-bit C1 range, and the bidi and
// format marks that reorder what the console shows). `\n` and
// `\r` get their short forms, the rest render as `\xNN` or
// `\uXXXX`; the tab stays as itself so indented content remains
// readable. Comparison happens on raw content — escaping is
// presentation, applied only here.
export function show(text) {
  return text.replace(
    /[\x00-\x08\x0a-\x1f\x7f-\x9f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,
    (c) => {
      if (c === '\n') return '\\n';
      if (c === '\r') return '\\r';
      const code = c.charCodeAt(0);
      return code < 0x100
        ? `\\x${code.toString(16).padStart(2, '0')}`
        : `\\u${code.toString(16).padStart(4, '0')}`;
    });
}

// The `-l,c` / `+l,c` piece of a hunk header. `before` is the number
// of that side's lines consumed ahead of the hunk: an empty range
// reports the line *before* the gap (`-0,0` for a pure insertion),
// and `,c` is omitted only when a single line is covered — the
// compact form `diff -u` writes.
function hunkRange(before, count) {
  const start = count === 0 ? before : before + 1;
  return count === 1 ? `${start}` : `${start},${count}`;
}

// Unified-diff hunks between two arrays of lines — no file headers,
// just `@@ -l,c +l,c @@` blocks whose lines carry ' ', '-' or '+'.
// Returns [] when the arrays are equal: callers showing nothing for
// identical content need no empty-hunk guard of their own. Inputs
// too large for the LCS table degrade to a marker line instead of
// exhausting memory.
export function diffLines(aLines, bLines) {
  if (aLines.length * bLines.length > MAX_CELLS) {
    return ['\\ (contenido demasiado extenso para el diff)'];
  }
  const ops = diffOps(aLines, bLines);
  // Prefix counts of consumed lines per side, so each hunk locates
  // its start and length without rescanning the op list.
  const aPre = new Array(ops.length + 1).fill(0);
  const bPre = new Array(ops.length + 1).fill(0);
  const changes = [];
  ops.forEach((op, i) => {
    aPre[i + 1] = aPre[i] + (op.t === '+' ? 0 : 1);
    bPre[i + 1] = bPre[i] + (op.t === '-' ? 0 : 1);
    if (op.t !== ' ') changes.push(i);
  });
  const out = [];
  for (let c = 0; c < changes.length; c++) {
    // Grow the hunk while the next change lies within reach of the
    // context window — a gap of 2*CONTEXT lines or less merges.
    let end = c;
    while (end + 1 < changes.length
        && changes[end + 1] - changes[end] - 1 <= 2 * CONTEXT) {
      end++;
    }
    const lo = Math.max(0, changes[c] - CONTEXT);
    const hi = Math.min(ops.length, changes[end] + CONTEXT + 1);
    out.push(`@@ -${hunkRange(aPre[lo], aPre[hi] - aPre[lo])}`
      + ` +${hunkRange(bPre[lo], bPre[hi] - bPre[lo])} @@`);
    for (let i = lo; i < hi; i++) out.push(`${ops[i].t}${show(ops[i].line)}`);
    c = end;
  }
  return out;
}

// A file's comparable leaf: {kind, lines, eol}. A buffer holding a
// NUL or invalid UTF-8 is not terminal text: it gets its own
// `binary` kind and compares by a fingerprinted
// `(binario, sha256 …)` line, so two differing binaries still show
// as a change instead of mojibake — or worse, a false "no
// difference" when a text file happens to hold the marker line.
// For text, split('\n') leaves a trailing '' for a
// newline-terminated file, which is dropped; whether the file ends
// in a newline is kept out of `lines` — a real line holding the
// marker text must never compare equal to a missing newline — and
// travels as `eol`, compared apart like the kind.
function fileLeaf(buf) {
  const content = buf.toString('utf8');
  if (buf.includes(0) || content.includes('�')) {
    const digest = crypto.createHash('sha256').update(buf).digest('hex');
    return { kind: 'binary', lines: [`(binario, sha256 ${digest.slice(0, 16)})`], eol: null };
  }
  const lines = content.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return { kind: 'file', lines, eol: content.length === 0 || content.endsWith('\n') };
}

// The comparable leaf of a directory entry: a symlink is its
// `-> destino` line — it compares as a link, never through its
// target —, a regular file is its lines plus its newline-ending
// flag, and anything else (fifo, socket, device) can neither be
// read safely nor diffed. A leaf that cannot be read degrades to
// the unreadable marker rather than aborting the whole diff. The
// kind travels with the lines: marker contents can collide with
// real text — a file containing `-> x` looks like the link `x` —
// and only the triple kind+lines+eol decides equality.
function leafLines(p, stat) {
  try {
    if (stat.isSymbolicLink()) {
      // The target stays raw: comparison works on the real data and
      // `show` escapes control characters only at display time.
      return {
        kind: 'link',
        lines: [`-> ${fs.readlinkSync(p)}`],
        eol: null,
      };
    }
    if (stat.isFile()) {
      return fileLeaf(fs.readFileSync(p));
    }
    return { kind: 'other', lines: ['(no legible)'], eol: null };
  } catch {
    return { kind: 'other', lines: ['(no legible)'], eol: null };
  }
}

// Fills `leaves` (rel -> {kind, lines, eol}) walking a tree. Children are
// classified from readdir's own entries — no stat per child — so
// there is no window where a vanished entry can throw; and links
// are never followed, the same reason hash.js lstats everything.
// Leaves are files, links, and empty or unreadable directories; a
// non-empty directory is not a leaf, its children are.
function walk(abs, rel, stat, leaves) {
  if (stat.isDirectory()) {
    let entries;
    try {
      entries = fs.readdirSync(abs, { withFileTypes: true });
    } catch {
      leaves.set(rel, { kind: 'dir', lines: ['(no legible)'], eol: null });
      return;
    }
    if (entries.length === 0) {
      leaves.set(rel, { kind: 'dir', lines: ['(directorio vacío)'], eol: null });
      return;
    }
    for (const entry of entries) {
      walk(path.join(abs, entry.name),
        rel ? `${rel}/${entry.name}` : entry.name, entry, leaves);
    }
    return;
  }
  leaves.set(rel, leafLines(abs, stat));
}

// The comparable leaf map of a whole resource — file, link or
// directory tree — keyed by inner-relative path ('' when the
// resource itself is the leaf). A root that cannot even be statted
// contributes no leaves, which is exactly how the "absent" side of
// a one-sided leaf is modeled downstream.
function collectLeaves(root) {
  const leaves = new Map();
  let stat;
  try {
    stat = fs.lstatSync(root);
  } catch {
    return leaves;
  }
  walk(root, '', stat, leaves);
  return leaves;
}

// The read side of a conflict must clear the same bar any recorded
// path clears: the manifest or the lock is data, not trust, and a
// target whose chain escapes the root — or runs through a linked
// directory — would turn the diff into a disclosure of outside
// content. The chain level is the right one: the leaf itself stays
// atomic (lstat), its parents must resolve under the root. An
// unsafe side contributes a single marker leaf, never its content.
function safeCollect(root, rel) {
  // Trailing separators come off before anything touches the path:
  // `lstat` on `d/` follows a leaf link, which would defeat the
  // leaf-is-atomic rule the chain level relies on — and makes a
  // file target read as ENOTDIR instead of showing its content.
  const clean = stripTargetSeps(rel);
  if (!recordedChainSafe(root, clean)) {
    return new Map([['', { kind: 'other', lines: ['(ruta insegura)'], eol: null }]]);
  }
  return collectLeaves(path.join(root, clean));
}

function sameLines(a, b) {
  return a.length === b.length && a.every((line, i) => line === b[i]);
}

// Leaf kinds in display language — used when two leaves differ in
// kind but their lines coincide (a file holding `-> x` next to the
// link `x`): the block shows the kind change instead of nothing.
const KIND_LABEL = {
  file: 'archivo', link: 'enlace', dir: 'directorio',
  binary: 'binario', other: 'otro',
};

// The diff blocks of one conflicted resource, as displayable lines:
// `--- <rel> (destino)` / `+++ <rel> (paquete)` headers followed by
// the unified hunks, one block per differing leaf of the pair of
// trees. Leaves present on one side only label the missing side
// `ausente` and show their whole content added or removed; a
// `removal` conflict has no incoming tree, so everything local is
// shown as withdrawn. Identical leaves emit nothing — a conflicted
// directory shows only what actually diverges, and [] means no
// difference at all.
export function diffResource(destDir, pkgDir, resource) {
  const destLeaves = safeCollect(destDir, resource.target);
  const pkgLeaves = resource.removal === true
    ? new Map()
    : safeCollect(pkgDir, resource.source);
  const keys = [...new Set([...destLeaves.keys(), ...pkgLeaves.keys()])].sort();
  // Displayed paths normalize the target: a directory recorded as
  // `d/` joins its leaves as `d/x`, not `d//x`.
  const base = stripTargetSeps(resource.target);
  const out = [];
  for (const key of keys) {
    const a = destLeaves.get(key);
    const b = pkgLeaves.get(key);
    if (a !== undefined && b !== undefined
        && a.kind === b.kind && a.eol === b.eol
        && sameLines(a.lines, b.lines)) continue;
    // Names come from the package, the lock or the disk — control
    // characters in one would forge diff lines in the output, so
    // the displayed path is escaped.
    const rel = show(key === '' ? base : `${base}/${key}`);
    out.push(`--- ${rel} (${a === undefined ? 'ausente' : 'destino'})`);
    out.push(`+++ ${rel} (${b === undefined ? 'ausente' : 'paquete'})`);
    const hunks = diffLines(a?.lines ?? [], b?.lines ?? []);
    if (hunks.length > 0) {
      out.push(...hunks);
      // The `diff -u` `\ No newline` note: also when hunks exist.
      if (a?.kind === 'file' && b?.kind === 'file' && a.eol !== b.eol) {
        out.push('\\ (la nueva línea final difiere)');
      }
    } else if (a !== undefined && b !== undefined) {
      // Equal lines but the leaf still differs — the block names
      // what changed rather than standing empty.
      const notes = [];
      if (a.kind !== b.kind) {
        notes.push(`el tipo difiere: ${KIND_LABEL[a.kind]} → ${KIND_LABEL[b.kind]}`);
      }
      if (a.kind === 'file' && b.kind === 'file' && a.eol !== b.eol) {
        notes.push('la nueva línea final difiere');
      }
      out.push(`\\ (${notes.join('; ')})`);
    } else {
      // A one-sided leaf with no lines: an empty file appearing
      // or disappearing.
      out.push('\\ (archivo vacío)');
    }
  }
  return out;
}
