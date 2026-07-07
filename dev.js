const { spawn } = require('child_process');

// Start the Next.js dev server
const nextDev = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev:next'], {
  stdio: 'inherit',
  shell: true
});

// Start the Express backend server
const serverDev = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev:server'], {
  stdio: 'inherit',
  shell: true
});

nextDev.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});

serverDev.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle kill signals to shut down both processes properly
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
  serverDev.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
  serverDev.kill('SIGTERM');
  process.exit();
});
