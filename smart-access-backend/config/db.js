const sql = require('mssql');
const envConfig = require('./env');

// SQL Server configuration - uses environment variables from .env
const config = {
  server: envConfig.db.server,
  database: envConfig.db.name,
  port: envConfig.db.port,
  authentication: {
    type: 'default',
    options: {
      userName: envConfig.db.user,
      password: envConfig.db.password
    }
  },
  options: {
    trustServerCertificate: envConfig.db.trustServerCertificate,
    encrypt: envConfig.db.encrypt,
    enableArithAbort: true,
    connectionTimeout: 15000,
    requestTimeout: 15000
  }
};




let pool = null;

const connectDB = async () => {
  try {
    if (!pool || !pool.connected) {
      pool = await sql.connect(config);
      console.log(`✓ SQL Server Connected: ${config.server}:${config.port}/${config.database}`);
    }
    return pool;
  } catch (error) {
    console.error('✗ Database connection error:', error.message);
    throw error; // Don't silently fail - critical for production
  }
};

const getPool = () => pool;

const executeQuery = async (query, params = []) => {
  try {
    if (!pool || !pool.connected) {
      await connectDB();
    }
    if (!pool || !pool.connected) {
      console.warn('Database not connected, query skipped');
      return [];
    }
    const request = pool.request();
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });
    const result = await request.query(query);
    return result.recordset || [];
  } catch (error) {
    console.error('Query execution error:', error.message);
    return [];
  }
};

const executeStoredProc = async (procName, params = []) => {
  try {
    if (!pool || !pool.connected) {
      await connectDB();
    }
    if (!pool || !pool.connected) {
      return [];
    }
    const request = pool.request();
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });
    const result = await request.execute(procName);
    return result.recordset || [];
  } catch (error) {
    console.error('Stored procedure error:', error.message);
    return [];
  }
};

const closeDB = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
    }
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
};

module.exports = { connectDB, getPool, executeQuery, executeStoredProc, closeDB, sql };
