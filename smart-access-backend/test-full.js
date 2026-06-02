const http = require('http');
const { spawn } = require('child_process');

let token = null;

function request(options, data = null) {

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Timeout')));
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Starting server for full API tests...\n');
  
  // Start server as child process
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'pipe'
  });
  
  let serverOutput = '';
  server.stdout.on('data', (d) => { serverOutput += d.toString(); });
  server.stderr.on('data', (d) => { serverOutput += d.toString(); });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const results = [];
  const base = { hostname: 'localhost', port: 5000 };


  // Test 1: Register
  try {
    const res = await request({ ...base, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } }, 
      { email: 'testuser@example.com', password: 'testpass123', name: 'Test User', role: 'student' });
    results.push({ test: 'Register', status: res.status, success: res.status === 201 || res.status === 200, data: res.data });
    if (res.data.token) token = res.data.token;
  } catch (e) {
    results.push({ test: 'Register', status: 'ERROR', success: false, error: e.message });
  }

  // Test 2: Login
  try {
    const res = await request({ ...base, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, 
      { email: 'testuser@example.com', password: 'testpass123' });
    results.push({ test: 'Login', status: res.status, success: res.status === 200, data: res.data });
    if (res.data.token) token = res.data.token;
  } catch (e) {
    results.push({ test: 'Login', status: 'ERROR', success: false, error: e.message });
  }

  // Test 3: Get users (with auth)
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await request({ ...base, path: '/api/users', headers });
    results.push({ test: 'Get Users (with auth)', status: res.status, success: res.status === 200, data: Array.isArray(res.data) ? `[${res.data.length} users]` : res.data });
  } catch (e) {
    results.push({ test: 'Get Users', status: 'ERROR', success: false, error: e.message });
  }

  // Test 4: Get logs (with auth)
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await request({ ...base, path: '/api/logs', headers });
    results.push({ test: 'Get Logs (with auth)', status: res.status, success: res.status === 200, data: Array.isArray(res.data) ? `[${res.data.length} logs]` : res.data });
  } catch (e) {
    results.push({ test: 'Get Logs', status: 'ERROR', success: false, error: e.message });
  }

  // Test 5: Get alerts (with auth)
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await request({ ...base, path: '/api/alerts', headers });
    results.push({ test: 'Get Alerts (with auth)', status: res.status, success: res.status === 200, data: Array.isArray(res.data) ? `[${res.data.length} alerts]` : res.data });
  } catch (e) {
    results.push({ test: 'Get Alerts', status: 'ERROR', success: false, error: e.message });
  }

  // Test 6: Get members (no auth required)
  try {
    const res = await request({ ...base, path: '/api/members' });
    results.push({ test: 'Get Members', status: res.status, success: res.status === 200, data: Array.isArray(res.data) ? `[${res.data.length} members]` : res.data });
  } catch (e) {
    results.push({ test: 'Get Members', status: 'ERROR', success: false, error: e.message });
  }

  // Test 7: Get people (no auth required)
  try {
    const res = await request({ ...base, path: '/api/people' });
    results.push({ test: 'Get People', status: res.status, success: res.status === 200, data: Array.isArray(res.data) ? `[${res.data.length} people]` : res.data });
  } catch (e) {
    results.push({ test: 'Get People', status: 'ERROR', success: false, error: e.message });
  }

  // Kill server
  server.kill();
  
  // Print results
  console.log('\n=== Server Output ===');
  console.log(serverOutput || '(no output)');
  
  console.log('\n=== Full API Test Results ===\n');
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    let data;
    if (typeof r.data === 'string') {
      data = r.data;
    } else if (r.data !== undefined && r.data !== null) {
      data = JSON.stringify(r.data).substring(0, 80);
    } else {
      data = 'no data';
    }
    console.log(`${icon} ${r.test}: ${r.status} ${r.error || data}`);
  });
  
  const passed = results.filter(r => r.success).length;
  console.log(`\n${passed}/${results.length} tests passed`);
  
  if (token) {
    console.log(`\nJWT Token obtained: ${token.substring(0, 30)}...`);
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
