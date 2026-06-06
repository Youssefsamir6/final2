#!/usr/bin/env node
/**
 * AUTH DEBUG SCRIPT
 * Traces the complete registration → login flow
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `debug_${Date.now()}@test.com`;
const TEST_PASSWORD = 'TestDebug123';

async function debug() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 AUTH DEBUG: Registration → Login Flow');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Test backend connectivity
    console.log('[1] Testing backend connectivity...');
    const healthResp = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log(`✓ Backend alive: ${healthResp.data.status}\n`);

    // Step 2: Register user
    console.log('[2] Registering user...');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    
    const regResp = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: 'Debug User',
      role: 'user'
    }, { timeout: 5000 });

    console.log(`✓ Registration succeeded`);
    console.log(`   User ID: ${regResp.data.user?.id}`);
    console.log(`   Name: ${regResp.data.user?.name}`);
    console.log(`   Token: ${regResp.data.token?.substring(0, 20)}...\n`);

    const userId = regResp.data.user?.id;
    if (!userId) {
      console.log('⚠️  WARNING: No user ID returned! This indicates DB insert may have failed.\n');
    }

    // Step 3: CRITICAL - Check if user exists in database via query endpoint
    console.log('[3] Checking if user exists in database...');
    try {
      // We'll try to login immediately to see what the database returns
      const checkResp = await axios.get(`${BASE_URL}/api/auth/me`, 
        {
          headers: { 'Authorization': `Bearer ${regResp.data.token}` },
          timeout: 5000,
          validateStatus: () => true  // Don't throw on any status
        }
      );
      console.log(`✓ Token verification: ${checkResp.status}`);
      if (checkResp.status === 200) {
        console.log(`   User data: ${JSON.stringify(checkResp.data)}\n`);
      } else {
        console.log(`   Response: ${checkResp.status} - ${JSON.stringify(checkResp.data)}\n`);
      }
    } catch (e) {
      console.log(`⚠️  Token check failed: ${e.message}\n`);
    }

    // Step 4: Try login immediately
    console.log('[4] Attempting login (immediate after registration)...');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}\n`);

    try {
      const loginResp = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      }, { timeout: 5000 });

      console.log(`✓ LOGIN SUCCEEDED!`);
      console.log(`   User ID: ${loginResp.data.user?.id}`);
      console.log(`   Email: ${loginResp.data.user?.email}`);
      console.log(`   Token: ${loginResp.data.token?.substring(0, 20)}...\n`);

    } catch (loginErr) {
      console.log(`✗ LOGIN FAILED`);
      console.log(`   Status: ${loginErr.response?.status}`);
      console.log(`   Error: ${loginErr.response?.data?.error?.message}\n`);

      // Step 5: Try second login attempt (after delay)
      console.log('[5] Retrying login after 2 second delay...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const retryResp = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        }, { timeout: 5000 });

        console.log(`✓ RETRY LOGIN SUCCEEDED!`);
        console.log(`   User ID: ${retryResp.data.user?.id}`);
        console.log(`   This suggests: connection pool issue or transaction commit delay\n`);

      } catch (retryErr) {
        console.log(`✗ RETRY LOGIN ALSO FAILED`);
        console.log(`   Status: ${retryErr.response?.status}`);
        console.log(`   Error: ${retryErr.response?.data?.error?.message}\n`);
      }
    }

    // Step 6: Diagnose
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 DIAGNOSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('Possible issues:');
    console.log('1. Database connection drops after INSERT');
    console.log('2. Transaction not committed - user data not persisted');
    console.log('3. Connection pool not handling multiple requests correctly');
    console.log('4. executeQuery silently fails and returns []');
    console.log('5. Password hash mismatch between registration and login\n');

    console.log('Check the backend logs for:');
    console.log('- "Query execution error" messages');
    console.log('- "Database not connected" warnings');
    console.log('- Failed INSERT statements\n');

  } catch (error) {
    console.error('❌ Debug script error:', error.message);
    console.error(error.response?.data || error);
  }
}

debug();
