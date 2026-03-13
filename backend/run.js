const { exec } = require('child_process');
const fs = require('fs');

console.log("Starting backend...");
exec('node server.js', (err, stdout, stderr) => {
    fs.writeFileSync('test.log', `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${err ? err.message : ''}`);
    console.log("Done.");
});
