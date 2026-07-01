#!/bin/bash
# Double-click this file (macOS) to install deps if needed, start the server, and open the dashboard.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo ""
echo "  CSH Auto Data — starting..."
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  Node.js is required. Install from https://nodejs.org"
  read -r -p "Press Enter to close."
  exit 1
fi

if [ ! -d "backend/node_modules" ]; then
  echo "  First run: installing backend dependencies..."
  (cd backend && npm install)
  echo ""
fi

npm start
