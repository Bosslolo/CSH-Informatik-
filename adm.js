#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

console.log("\n🚗 CSH-Auto-Data-Machine (ADM) Starting...");

// 1. Start Backend
const backend = spawn('npm', ['run', 'dev'], { 
    cwd: path.join(__dirname, 'backend'),
    shell: true,
    stdio: 'inherit'
});

// 2. Health Check before opening dashboard
console.log("Waiting for backend to sync with US timezone...");

function checkStatus() {
    http.get('http://localhost:3000/api/status', (res) => {
        if (res.statusCode === 200) {
            console.log("\n✅ BACKEND READY & UTC SYNCED");
            console.log("📍 Dashboard: http://localhost:3000/dashboard (In development, open index.html locally)");
            console.log("📍 API URL:   http://localhost:3000/api/live\n");
            // In a real CLI we would open the browser here
        } else {
            setTimeout(checkStatus, 500);
        }
    }).on('error', () => {
        setTimeout(checkStatus, 500);
    });
}

checkStatus();

process.on('SIGINT', () => {
    console.log("\n\n🛑 Shutting down gracefully...");
    backend.kill();
    process.exit();
});
