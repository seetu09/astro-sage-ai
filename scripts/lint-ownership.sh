#!/usr/bin/env bash
# Guard against client-side ownership flags coming back.
# Exits 0 if clean, exits 1 with a message if forbidden strings appear.
#
# Word boundaries (\b) ensure isPaidTier does NOT match (T is a word char).
# Comment lines (//, #, *) are excluded.

FORBIDDEN='\b(isPaid|markAsPaid|unlockToken)\b|astroveda-unlock-token'

# grep -n includes filename:line: prefix in output.
# We need to check if the CONTENT (after second colon) is a comment.
OUTPUT=$( \
  grep -rnE "$FORBIDDEN" app lib --include='*.ts' --include='*.tsx' 2>/dev/null \
  | while IFS= read -r line; do
      # Extract content after the second colon
      content="${line#*:*:}"
      # Skip if content starts with optional whitespace then // or # or *
      if echo "$content" | grep -qE '^\s*(//|#|\*)'; then
        continue
      fi
      echo "$line"
    done
)

if [ -n "$OUTPUT" ]; then
  echo "$OUTPUT"
  echo ""
  echo "FORBIDDEN: client-side ownership flag detected. Use server-side hasPurchasedReport instead."
  exit 1
fi

exit 0
