#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

console.log("🚀 Starting CSH-Auto-Data-Machine (adm)...");

// Start Backend
const backend = spawn('node', [path.join(__dirname, '../backend/server.js')], {
  stdio: 'inherit'
});

// Wait 1 second then open frontend
setTimeout(() => {
  console.log("📂 Opening Dashboard...");
  const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(openCmd, [path.join(__dirname, '../client/index.html')], { shell: true });
}, 1000);

process.on('SIGINT', () => {
  console.log("\n🛑 Stopping services...");
  backend.kill();
  process.exit();
});
