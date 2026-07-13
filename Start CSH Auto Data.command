#!/bin/bash
# Double-click (macOS): install if needed, start dashboard in testing or real mode.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  CSH Auto Data — starting..."
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  Node.js is required. Install from https://nodejs.org"
  read -r -p "Press Enter to close."
  exit 1
fi

node "$ROOT/start-dashboard.js"
