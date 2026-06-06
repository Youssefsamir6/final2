#!/usr/bin/env node

/**
 * Database Seed Script for SQL Server
 * Creates test users and sample access logs
 * Usage: npm run seed
 */

require('dotenv').config();
const { connectDB, executeQuery, sql } = require('./config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('\n🌱 Starting database seed...\n');
    
    // Connect to SQL Server
    const pool = await connectDB();
    
    // Create test users
    const testUsers = [
      {
        email: 'admin@test.com',
        name: 'Admin User',
        idNumber: 'ADMIN001',
        password: 'admin123',
        role: 'admin'
      },
      {
        email: 'guard@test.com',
        name: 'Security Guard',
        idNumber: 'GUARD101',
        password: 'guard123',
        role: 'guard'
      },
      {
        email: 'user@test.com',
        name: 'John Student',
        idNumber: 'STUDENT456',
        password: 'user123',
        role: 'user'
      }
    ];

    // Insert users
    console.log('📝 Creating test users...');
    const createdUserIds = [];
    
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const query = `
        INSERT INTO Users (email, name, idNumber, password, role, created_at, updated_at)
        VALUES (@email, @name, @idNumber, @password, @role, @createdAt, @updatedAt);
        SELECT SCOPE_IDENTITY() AS id;
      `;
      
      const result = await executeQuery(query, [
        { name: 'email', type: sql.VarChar, value: userData.email },
        { name: 'name', type: sql.VarChar, value: userData.name },
        { name: 'idNumber', type: sql.VarChar, value: userData.idNumber },
        { name: 'password', type: sql.VarChar, value: hashedPassword },
        { name: 'role', type: sql.VarChar, value: userData.role },
        { name: 'createdAt', type: sql.DateTime, value: new Date() },
        { name: 'updatedAt', type: sql.DateTime, value: new Date() }
      ]);
      
      if (result.length > 0) {
        const userId = result[0].id;
        createdUserIds.push(userId);
        console.log(`  ✓ Created: ${userData.email} (ID: ${userId})`);
      }
    }

    // Create sample access logs
    if (createdUserIds.length > 0) {
      console.log('\n📋 Creating sample access logs...');
      
      const testUserId = createdUserIds[0]; // Use first user
      const sampleLogs = [
        { status: 'allowed', method: 'face', confidence: 0.92 },
        { status: 'denied', method: 'face', confidence: 0.23 },
        { status: 'allowed', method: 'card', confidence: 1.0 },
        { status: 'denied', method: 'unknown', confidence: 0.15 }
      ];

      for (const logData of sampleLogs) {
        const query = `
          INSERT INTO access_logs (user_id, status, access_time)
          VALUES (@userId, @status, @accessTime);
        `;
        
        await executeQuery(query, [
          { name: 'userId', type: sql.Int, value: testUserId },
          { name: 'status', type: sql.VarChar, value: logData.status },
          { name: 'accessTime', type: sql.DateTime, value: new Date() }
        ]);
        
        console.log(`  ✓ Created: ${logData.method} access (${logData.status})`);
      }
    }

    console.log('\n✅ Database seed complete!');
    console.log(`   Users created: ${createdUserIds.length}`);
    console.log(`   Sample logs: 4`);
    console.log('\n📌 Test Users:');
    testUsers.forEach(u => console.log(`   - ${u.email} / ${u.password}`));
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedData();

