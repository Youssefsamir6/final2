#!/usr/bin/env node
/**
 * migrate-add-columns.js
 * Migration script to add email and password_hash columns to users table.
 * 
 * Usage: node scripts/migrate-add-columns.js
 */

const { connectDB, executeQuery, sql } = require('../config/db');

async function migrate() {
  try {
    console.log('Connecting to SQL Server...');
    await connectDB();
    console.log('Connected!\n');

    console.log('Running migrations...\n');

    // 1. Add email column if not exists
    try {
      await executeQuery(`
        ALTER TABLE users
        ADD email NVARCHAR(255) NULL
      `);
      console.log('✓ Added email column');
    } catch (err) {
      if (err.message.includes('column name')) {
        console.log('ℹ email column already exists');
      } else {
        throw err;
      }
    }

    // 2. Make email unique
    try {
      await executeQuery(`
        ALTER TABLE users
        ADD CONSTRAINT UQ_users_email UNIQUE (email)
      `);
      console.log('✓ Added unique constraint on email');
    } catch (err) {
      if (err.message.includes('constraint')) {
        console.log('ℹ unique constraint already exists');
      } else {
        throw err;
      }
    }

    // 3. Add password_hash column if not exists
    try {
      await executeQuery(`
        ALTER TABLE users
        ADD password_hash NVARCHAR(255) NULL
      `);
      console.log('✓ Added password_hash column');
    } catch (err) {
      if (err.message.includes('column name')) {
        console.log('ℹ password_hash column already exists');
      } else {
        throw err;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
