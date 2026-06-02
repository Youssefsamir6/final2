const sql = require('mssql');

// SQL Server configuration - using SQLEXPRESS instance
const config = {
  server: "127.0.0.1",
  database: "smart_access_system",
  port: 61812,
  authentication: {
    type: 'default',
    options: {
      userName: "smartaccess",
      password: "SmartAccess123!"
    }
  },
  options: {
    trustServerCertificate: true,
    encrypt: false,
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
      console.log(`SQL Server Connected: 127.0.0.1:49668`);

    }
    return pool;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return null;
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
