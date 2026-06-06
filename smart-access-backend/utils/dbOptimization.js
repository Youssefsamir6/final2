/**
 * Database Optimization Scripts
 * Creates indexes and performs maintenance queries on SQL Server
 */

const config = require('../config/env');

/**
 * SQL Server index creation queries
 * These should be run once to optimize frequently queried columns
 */
const indexQueries = [
  // Users table indexes
  `CREATE NONCLUSTERED INDEX idx_user_email ON Users(email) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_user_role ON Users(role) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_user_studentid ON Users(studentId) WHERE deleted_at IS NULL;`,

  // Logs table indexes
  `CREATE NONCLUSTERED INDEX idx_log_userid ON Logs(userId) INCLUDE (status, timestamp) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_log_status ON Logs(status, timestamp) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_log_timestamp ON Logs(timestamp DESC) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_log_location ON Logs(location, timestamp) WHERE deleted_at IS NULL;`,

  // Alerts table indexes
  `CREATE NONCLUSTERED INDEX idx_alert_userid ON Alerts(userId) INCLUDE (isRead, severity) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_alert_isread ON Alerts(isRead, timestamp DESC) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_alert_type ON Alerts(type, severity) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_alert_timestamp ON Alerts(timestamp DESC) WHERE deleted_at IS NULL;`,

  // AccessEvents table indexes
  `CREATE NONCLUSTERED INDEX idx_accessevent_userid ON AccessEvents(userId, timestamp DESC) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_accessevent_location ON AccessEvents(location, timestamp DESC) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_accessevent_eventtype ON AccessEvents(eventType, timestamp) WHERE deleted_at IS NULL;`,

  // History table indexes (audit log)
  `CREATE NONCLUSTERED INDEX idx_history_userid ON History(userId, timestamp DESC) WHERE deleted_at IS NULL;`,
  `CREATE NONCLUSTERED INDEX idx_history_action ON History(action, timestamp DESC) WHERE deleted_at IS NULL;`,
];

/**
 * Statistics update queries
 * Helps SQL Server optimizer make better execution plans
 */
const statisticsQueries = [
  `UPDATE STATISTICS Users;`,
  `UPDATE STATISTICS Logs;`,
  `UPDATE STATISTICS Alerts;`,
  `UPDATE STATISTICS AccessEvents;`,
  `UPDATE STATISTICS History;`,
];

/**
 * Database maintenance queries
 */
const maintenanceQueries = [
  // Rebuild fragmented indexes (> 30% fragmentation)
  `DECLARE @db_id INT; SET @db_id = DB_ID();
   EXEC sp_MSForEachTable 'ALTER INDEX ALL ON ? REBUILD';`,

  // Update statistics
  `EXEC sp_updatestats;`,

  // Cleanup transaction log (if using simple recovery model)
  `DBCC SHRINKFILE(2, 100);`,
];

/**
 * Connection string formatter for SQL Server
 */
const getConnectionString = () => {
  const { server, name, user, password, port, encrypt, trustServerCertificate } = config.db;

  // SQL Server connection
  return {
    server,
    database: name,
    user,
    password,
    port,
    encrypt,
    trustServerCertificate,
    connectionTimeout: 15000,
    requestTimeout: 30000,
    pool: {
      min: 1,
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 60000,
      reapIntervalMillis: 1000
    }
  };
};

/**
 * Execute index creation queries
 * This should be run once in a migration script
 */
const createIndexes = async (queryExecutor) => {
  console.log('\n[DB Optimization] Creating indexes...');
  
  for (const query of indexQueries) {
    try {
      await queryExecutor(query);
      console.log(`✓ Index created: ${query.substring(0, 50)}...`);
    } catch (error) {
      // Index might already exist - this is OK
      if (!error.message.includes('already exists')) {
        console.error(`✗ Index creation failed: ${error.message}`);
      }
    }
  }
  
  console.log('[DB Optimization] Index creation complete\n');
};

/**
 * Update statistics for better query planning
 */
const updateStatistics = async (queryExecutor) => {
  console.log('\n[DB Optimization] Updating statistics...');
  
  for (const query of statisticsQueries) {
    try {
      await queryExecutor(query);
      console.log(`✓ Statistics updated`);
    } catch (error) {
      console.error(`✗ Statistics update failed: ${error.message}`);
    }
  }
  
  console.log('[DB Optimization] Statistics update complete\n');
};

/**
 * Perform maintenance operations
 */
const performMaintenance = async (queryExecutor) => {
  console.log('\n[DB Optimization] Performing maintenance...');
  
  for (const query of maintenanceQueries) {
    try {
      await queryExecutor(query);
      console.log(`✓ Maintenance operation completed`);
    } catch (error) {
      console.error(`✗ Maintenance failed: ${error.message}`);
    }
  }
  
  console.log('[DB Optimization] Maintenance complete\n');
};

/**
 * Query execution plan analyzer
 * Shows estimated rows vs actual rows for query tuning
 */
const analyzeQueryPlan = async (queryExecutor, query) => {
  try {
    await queryExecutor('SET STATISTICS IO ON;');
    await queryExecutor('SET STATISTICS TIME ON;');
    
    const result = await queryExecutor(query);
    
    console.log('\n[Query Analysis]');
    console.log('Estimated rows:', result.estimatedRows || 'N/A');
    console.log('Actual rows:', result.affectedRows || 'N/A');
    console.log('Execution time:', result.executionTime || 'N/A');
    
    return result;
  } catch (error) {
    console.error('Query analysis failed:', error.message);
    throw error;
  }
};

module.exports = {
  indexQueries,
  statisticsQueries,
  maintenanceQueries,
  getConnectionString,
  createIndexes,
  updateStatistics,
  performMaintenance,
  analyzeQueryPlan
};
