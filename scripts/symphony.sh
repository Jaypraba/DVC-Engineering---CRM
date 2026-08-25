#!/usr/bin/env bash
# Talk to Symphony from the terminal.
#
#   ./scripts/symphony.sh "Draft a follow-up to the Camden loft conversion lead"
#
# Reads SYMPHONY_API_TOKEN from the environment, falling back to .env.local.
# The token acts with the director's full authority — never commit it.

set -euo pipefail

BASE="${SYMPHONY_API_BASE:-https://symphony.wix.com/individuals-chat/poc/agent}"
SESSION_ID="${SYMPHONY_SESSION_ID:-dvc-crm-cli}"
TIMEOUT_SECONDS="${SYMPHONY_TIMEOUT_SECONDS:-120}"
POLL_SECONDS=3

MESSAGE="${*:-}"
if [ -z "$MESSAGE" ]; then
  echo "usage: $0 \"<message for Symphony>\"" >&2
  exit 64
fi

ENV_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.env.local"
if [ -z "${SYMPHONY_API_TOKEN:-}" ] && [ -f "$ENV_FILE" ]; then
  SYMPHONY_API_TOKEN="$(grep -m1 '^SYMPHONY_API_TOKEN=' "$ENV_FILE" | cut -d= -f2- || true)"
fi

if [ -z "${SYMPHONY_API_TOKEN:-}" ]; then
  echo "SYMPHONY_API_TOKEN is not set (export it, or add it to .env.local)" >&2
  exit 78
fi

call() {
  # call <path> <json-body>
  curl -sS --fail-with-body \
    -H "Authorization: Bearer $SYMPHONY_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$2" \
    "$BASE/$1"
}

json_field() {
  # json_field <field> <<< "$json" — no jq dependency
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const v=JSON.parse(s)[process.argv[1]];process.stdout.write(v==null?"":String(v))}catch{process.exit(1)}})' "$1"
}

BODY="$(node -e 'process.stdout.write(JSON.stringify({message:process.argv[1],sessionId:process.argv[2]}))' "$MESSAGE" "$SESSION_ID")"
RESPONSE="$(call ask "$BODY")"

REPLY="$(printf '%s' "$RESPONSE" | json_field reply)"
if [ -n "$REPLY" ]; then
  printf '%s\n' "$REPLY"
  exit 0
fi

CONVERSATION_ID="$(printf '%s' "$RESPONSE" | json_field conversationId)"
if [ -z "$CONVERSATION_ID" ]; then
  echo "Symphony returned no reply and no conversationId:" >&2
  printf '%s\n' "$RESPONSE" >&2
  exit 70
fi

echo "Symphony is working (conversation $CONVERSATION_ID)..." >&2

DEADLINE=$(( $(date +%s) + TIMEOUT_SECONDS ))
POLL_BODY="$(node -e 'process.stdout.write(JSON.stringify({conversationId:process.argv[1]}))' "$CONVERSATION_ID")"

while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  sleep "$POLL_SECONDS"
  RESPONSE="$(call reply "$POLL_BODY")"
  REPLY="$(printf '%s' "$RESPONSE" | json_field reply)"
  if [ -n "$REPLY" ]; then
    printf '%s\n' "$REPLY"
    exit 0
  fi
done

echo "Timed out after ${TIMEOUT_SECONDS}s. Resume with conversation $CONVERSATION_ID." >&2
exit 75
