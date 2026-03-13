const { spawn } = require('child_process');
const fs = require('fs');

const out = fs.openSync('./server-out.log', 'a');
const err = fs.openSync('./server-err.log', 'a');

console.log("Starting backend...");
const backend = spawn('node', ['server.js'], { cwd: './backend', stdio: ['ignore', out, err], detached: true, shell: true });

console.log("Starting frontend...");
const frontend = spawn('npm.cmd', ['run', 'dev'], { cwd: './frontend', stdio: ['ignore', out, err], detached: true, shell: true });

backend.unref();
frontend.unref();
console.log("Both servers spawned. Exiting wrapper.");
