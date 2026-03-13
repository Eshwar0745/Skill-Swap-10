const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(msg) {
  fs.appendFileSync('install.log', msg + '\n');
}

try {
  log('Installing backend...');
  execSync('npm install', { cwd: path.join(__dirname, 'backend') });
  log('Backend installed successfully.');
  
  log('Installing frontend...');
  execSync('pnpm install', { cwd: path.join(__dirname, 'frontend') });
  log('Frontend installed successfully.');
  
  log('All dependencies installed.');
} catch (e) {
  log('Error occurred:');
  log(e.message || e.toString());
  if (e.stdout) log('STDOUT: ' + e.stdout.toString());
  if (e.stderr) log('STDERR: ' + e.stderr.toString());
}
