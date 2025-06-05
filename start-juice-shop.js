const { spawn } = require('child_process');
const path = require('path');

// Start the Juice Shop application
const juiceShopPath = path.join(__dirname, 'juice-shop');

console.log('Starting Juice Shop application...');

// Start the server
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: juiceShopPath,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Start the client (Vite)
const clientProcess = spawn('npx', ['vite', '--port', '3001', '--host', '0.0.0.0'], {
  cwd: path.join(juiceShopPath, 'client'),
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('Server process error:', err);
});

clientProcess.on('error', (err) => {
  console.error('Client process error:', err);
});

console.log('Juice Shop started on port 3001');
console.log('Server PID:', serverProcess.pid);
console.log('Client PID:', clientProcess.pid);