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

// SQL Server connection required
const { connectDB } = require('../config/db');

async function runOptimization() {
  try {
    // Ensure DB connection
    await connectDB();
    logger.info('Database optimization started');
    
    console.log('\n1️⃣  Creating indexes...');
    await createIndexes();
    
    console.log('\n2️⃣  Updating statistics...');
    await updateStatistics();
    
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
