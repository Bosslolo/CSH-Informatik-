#!/bin/bash
# Double-click (macOS): install if needed, start server, open dashboard.
set -e
PKG="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$PKG/.." && pwd)"

echo ""
echo "  CSH Auto Data — starting..."
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  Node.js is required. Install from https://nodejs.org"
  read -r -p "Press Enter to close."
  exit 1
fi

if [ ! -d "$ROOT/backend/node_modules" ]; then
  echo "  First run: installing backend dependencies..."
  (cd "$ROOT/backend" && npm install)
  echo ""
fi

cd "$PKG"
npm start
