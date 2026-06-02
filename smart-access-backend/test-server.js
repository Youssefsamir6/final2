const { spawn } = require('child_process');
const http = require('http');

async function testServer() {
  console.log('Starting server test...\n');
  
  // Start the server
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'pipe'
  });
  
  let output = '';
  server.stdout.on('data', (data) => { output += data.toString(); });
  server.stderr.on('data', (data) => { output += data.toString(); });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test endpoints
  const tests = [
    { name: 'Root endpoint', path: '/' },
    { name: 'Users API', path: '/api/users' },
    { name: 'Logs API', path: '/api/logs' },
    { name: 'Alerts API', path: '/api/alerts' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await makeRequest('localhost', 5000, test.path);
      results.push({ ...test, status: result.statusCode, success: result.statusCode < 500 });
    } catch (error) {
      results.push({ ...test, status: 'ERROR', success: false, error: error.message });
    }
  }
  
  // Kill the server
  server.kill();
  
  // Output results
  console.log('=== Server Output ===');
  console.log(output || '(no output)');
  console.log('\n=== Test Results ===');
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`${icon} ${r.name}: ${r.status} ${r.error || ''}`);
  });
  
  const allPassed = results.every(r => r.success);
  console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);
  process.exit(allPassed ? 0 : 1);
}

function makeRequest(host, port, path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host, port, path }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(3000, () => reject(new Error('Timeout')));
  });
}

testServer().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
