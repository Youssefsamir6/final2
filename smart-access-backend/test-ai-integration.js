#!/usr/bin/env node

/**
 * Integration Test Suite for AI Face Recognition System
 * Tests the connection between Node.js backend and Python AI worker
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const AI_WORKER_URL = process.env.AI_URL || 'http://localhost:5000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️ ${message}`, 'cyan');
}

function warn(message) {
  log(`⚠️ ${message}`, 'yellow');
}

class AIIntegrationTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runTest(name, testFn) {
    info(`Running: ${name}`);
    try {
      await testFn();
      success(`Passed: ${name}`);
      this.passedTests++;
      this.testResults.push({ name, status: 'PASS' });
    } catch (err) {
      error(`Failed: ${name}`);
      error(`  Error: ${err.message}`);
      this.failedTests++;
      this.testResults.push({ name, status: 'FAIL', error: err.message });
    }
    console.log('');
  }

  async testAIWorkerHealth() {
    try {
      const response = await axios.get(`${AI_WORKER_URL}/health`, { timeout: 5000 });
      if (!response.data || response.data.status !== 'ok') {
        throw new Error('Health check failed');
      }
      info(`  AI Worker Status: ${response.data.status}`);
      info(`  AI Available: ${response.data.ai_available}`);
      info(`  Models Ready: ${response.data.models_ready}`);
    } catch (err) {
      throw new Error(`AI Worker health check failed: ${err.message}`);
    }
  }

  async testDatabaseStatus() {
    try {
      const response = await axios.get(`${AI_WORKER_URL}/db-status`, { timeout: 5000 });
      if (!response.data) {
        throw new Error('No response from db-status endpoint');
      }
      info(`  Database Status: ${response.data.status}`);
      info(`  People in Database: ${response.data.people}`);
      info(`  Database Ready: ${response.data.ready}`);
      if (response.data.people_list && response.data.people_list.length > 0) {
        info(`  People: ${response.data.people_list.join(', ')}`);
      }
    } catch (err) {
      throw new Error(`Failed to get database status: ${err.message}`);
    }
  }

  async testBackendHealth() {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      if (!response.data || response.data.status !== 'ok') {
        throw new Error('Backend health check failed');
      }
      info(`  Backend Status: ${response.data.status}`);
    } catch (err) {
      throw new Error(`Backend health check failed: ${err.message}`);
    }
  }

  async testFaceDatabaseHealthEndpoint() {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/face-db/health`, { timeout: 5000 });
      if (!response.data || !response.data.data) {
        throw new Error('Face database health endpoint failed');
      }
      info(`  Face DB Health Status: ${response.data.data.status}`);
    } catch (err) {
      throw new Error(`Face database health endpoint failed: ${err.message}`);
    }
  }

  async testRecognitionEndpointExists() {
    try {
      // Create a dummy base64 image (smallest valid JPEG)
      const dummyImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      const response = await axios.post(
        `${AI_WORKER_URL}/recognize`,
        { image: dummyImage, embedding_dim: 128 },
        { timeout: 10000 }
      ).catch(err => err.response);
      
      // Endpoint should respond (even with error/fallback)
      if (response && response.status !== undefined) {
        info(`  Recognition endpoint accessible (status: ${response.status})`);
        if (response.data && ('userId' in response.data || 'error' in response.data)) {
          info(`  Response format valid`);
        }
      } else {
        throw new Error('No response from recognition endpoint');
      }
    } catch (err) {
      throw new Error(`Failed to test recognition endpoint: ${err.message}`);
    }
  }

  async testEmbeddingEndpointExists() {
    try {
      const dummyImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      const response = await axios.post(
        `${AI_WORKER_URL}/embedding`,
        { image: dummyImage },
        { timeout: 10000 }
      ).catch(err => err.response);
      
      // Endpoint should respond (even with error/fallback)
      if (response && response.status !== undefined) {
        info(`  Embedding endpoint accessible (status: ${response.status})`);
        if (response.data && ('embedding' in response.data || 'error' in response.data || 'detail' in response.data)) {
          info(`  Response format valid`);
        }
      } else {
        throw new Error('No response from embedding endpoint');
      }
    } catch (err) {
      throw new Error(`Failed to test embedding endpoint: ${err.message}`);
    }
  }

  async testAddPersonEndpointExists() {
    try {
      // Just test that the endpoint exists and is protected
      const response = await axios.post(
        `${AI_WORKER_URL}/add-person`,
        {},
        { timeout: 5000 }
      ).catch(err => err.response);
      
      // Any response means the endpoint exists (even 400/422)
      if (response) {
        info(`  Add Person endpoint accessible`);
      } else {
        throw new Error('No response from add-person endpoint');
      }
    } catch (err) {
      throw new Error(`Failed to test add-person endpoint: ${err.message}`);
    }
  }

  async testRebuildDatabaseEndpointExists() {
    try {
      const response = await axios.post(
        `${AI_WORKER_URL}/rebuild-db`,
        {},
        { timeout: 10000 }
      ).catch(err => err.response);
      
      if (response) {
        info(`  Rebuild DB endpoint accessible`);
      } else {
        throw new Error('No response from rebuild-db endpoint');
      }
    } catch (err) {
      throw new Error(`Failed to test rebuild-db endpoint: ${err.message}`);
    }
  }

  async testBackendAIRoutes() {
    try {
      // Test that routes are registered (health check since we don't have auth in test)
      const response = await axios.get(
        `${BACKEND_URL}/api/face-db/health`,
        { timeout: 5000 }
      );
      
      if (!response.data) {
        throw new Error('Invalid response');
      }
      info(`  Backend AI routes accessible`);
    } catch (err) {
      throw new Error(`Backend AI routes not accessible: ${err.message}`);
    }
  }

  async printSummary() {
    console.log('\n');
    log('═'.repeat(60), 'blue');
    log('TEST SUMMARY', 'blue');
    log('═'.repeat(60), 'blue');
    console.log('');
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      const colorCode = result.status === 'PASS' ? 'green' : 'red';
      log(`${icon} ${result.name}`, colorCode);
      if (result.error) {
        log(`   └─ ${result.error}`, 'red');
      }
    });

    console.log('');
    log('═'.repeat(60), 'blue');
    success(`Passed: ${this.passedTests}/${this.passedTests + this.failedTests}`);
    if (this.failedTests > 0) {
      error(`Failed: ${this.failedTests}/${this.passedTests + this.failedTests}`);
    }
    log('═'.repeat(60), 'blue');
  }

  async runAllTests() {
    log('═'.repeat(60), 'cyan');
    log('AI FACE RECOGNITION INTEGRATION TEST SUITE', 'cyan');
    log('═'.repeat(60), 'cyan');
    console.log('');

    info(`Backend URL: ${BACKEND_URL}`);
    info(`AI Worker URL: ${AI_WORKER_URL}`);
    console.log('');

    // Run all tests
    await this.runTest('AI Worker Health Check', () => this.testAIWorkerHealth());
    await this.runTest('Database Status Check', () => this.testDatabaseStatus());
    await this.runTest('Backend Health Check', () => this.testBackendHealth());
    await this.runTest('Face DB Health Endpoint', () => this.testFaceDatabaseHealthEndpoint());
    await this.runTest('Recognition Endpoint', () => this.testRecognitionEndpointExists());
    await this.runTest('Embedding Endpoint', () => this.testEmbeddingEndpointExists());
    await this.runTest('Add Person Endpoint', () => this.testAddPersonEndpointExists());
    await this.runTest('Rebuild Database Endpoint', () => this.testRebuildDatabaseEndpointExists());
    await this.runTest('Backend AI Routes', () => this.testBackendAIRoutes());

    await this.printSummary();

    // Exit with appropriate code
    process.exit(this.failedTests > 0 ? 1 : 0);
  }
}

// Run tests
const tester = new AIIntegrationTester();
tester.runAllTests().catch(err => {
  error(`Test suite failed: ${err.message}`);
  process.exit(1);
});
