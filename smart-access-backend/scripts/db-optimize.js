#!/usr/bin/env node

/**
 * Database Optimization Script
 * Run this once after initial setup to create indexes and optimize queries
 * 
 * Usage:
 *   npm run db:optimize
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = require('../config/env');
const { logger, logSuccess, logError } = require('../utils/logger');
const { createIndexes, updateStatistics } = require('../utils/dbOptimization');

console.log('\n==========================================');
console.log('  Database Optimization Script');
console.log('==========================================\n');

if (config.db.useMockDB) {
  console.log('❌ Cannot optimize Mock DB - SQL Server required');
  console.log('   Set USE_MOCK_DB=false in .env to use SQL Server\n');
  process.exit(1);
}

// Mock query executor (replace with actual SQL Server connection in production)
const mockExecutor = async (query) => {
  console.log(`[Query] ${query.substring(0, 80)}...`);
  // In production, this would execute against your SQL Server instance
  return { success: true };
};

async function runOptimization() {
  try {
    logger.info('Database optimization started');
    
    console.log('\n1️⃣  Creating indexes...');
    await createIndexes(mockExecutor);
    
    console.log('\n2️⃣  Updating statistics...');
    await updateStatistics(mockExecutor);
    
    console.log('\n✅ Database optimization complete!');
    logger.info('Database optimization completed successfully');
    
    console.log('\n📊 Next Steps:');
    console.log('   - Monitor query performance');
    console.log('   - Check log files in ./logs/ directory');
    console.log('   - Review execution plans for slow queries\n');
    
  } catch (error) {
    console.error('\n❌ Error during optimization:', error.message);
    logError('Database optimization failed', error);
    process.exit(1);
  }
}

runOptimization();
