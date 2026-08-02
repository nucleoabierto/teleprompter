#!/bin/bash
# Scan for TODO/FIXME comments in code changes
# Flags TODO/FIXME that lack self-contained context: the reader should
# understand what's pending and why without a ticket or external doc.
# A marker with fewer than 4 descriptive words after the colon, or one
# that only references a ticket, is flagged.
# Usage: ./scan-todos.sh <file_or_directory>

if [ -z "$1" ]; then
    echo "Usage: $0 <file_or_directory>"
    exit 1
fi

echo "Scanning for TODO/FIXME comments in: $1"
echo "========================================"

# TODO/FIXME with fewer than 4 words after the colon — too terse to be
# self-contained (e.g. "fix this", "ver T1", "hack").
echo -e "\n### TODO/FIXME without enough context (fewer than 4 words):"
grep -rnE "TODO:|FIXME:" "$1" | awk -F: '
{
    # Reconstruct the comment portion after "TODO:" or "FIXME:"
    line = $0
    sub(/^.*TODO:[[:space:]]*/, "", line)
    sub(/^.*FIXME:[[:space:]]*/, "", line)
    # Count words (sequences of non-space chars)
    n = split(line, words, /[[:space:]]+/)
    if (n < 4) print $0
}' || echo "None found"

# TODO/FIXME that only reference a ticket with no explanatory context
echo -e "\n### TODO/FIXME with ticket-only references (no explanatory context):"
grep -rnE "TODO:|FIXME:" "$1" | \
  grep -E "(ticket|ALE-[0-9]+|#[0-9]+)" | \
  grep -vE "(porque|para|cuando|actualmente|ya que|de modo|so that|because|when|currently|Implementar|Agregar|Remover|Validar)" || echo "None found"

# Search for XXX comments
echo -e "\n### XXX comments:"
grep -rn "XXX:" "$1" || echo "None found"

echo -e "\n========================================"
echo "Scan complete"
