#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

console.log('\n🚗 CSH-Auto-Data-Machine (ADM) Starting...');

const API_KEY = process.env.CSH_API_KEY || 'csh-secure-v1';

const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../backend'),
  shell: true,
  stdio: 'inherit',
});

console.log('Waiting for backend to start...');

function checkStatus() {
  http
    .get('http://localhost:4000/api/status', {
      headers: { 'x-api-key': API_KEY },
    }, (res) => {
      if (res.statusCode === 200) {
        console.log('\n✅ BACKEND READY');
        console.log('📍 Dashboard: http://localhost:4000\n');
        const openCmd =
          process.platform === 'darwin'
            ? 'open'
            : process.platform === 'win32'
              ? 'start'
              : 'xdg-open';
        spawn(openCmd, ['http://localhost:4000'], { shell: true });
      } else {
        setTimeout(checkStatus, 500);
      }
    })
    .on('error', () => {
      setTimeout(checkStatus, 500);
    });
}

checkStatus();

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  backend.kill();
  process.exit();
});
