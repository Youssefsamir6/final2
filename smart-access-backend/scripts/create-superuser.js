#!/usr/bin/env node
/**
 * create-superuser.js
 * Interactive CLI to create a superuser for the Smart Access system.
 *
 * Usage:
 *   node scripts/create-superuser.js
 */

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { connectDB, executeQuery, sql } = require('../config/db');
const { getPool } = require('../config/db');

function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
}

async function createInSQLServer(userData) {
  try {
    // Connect to database
    await connectDB();
    console.log('\nConnected to SQL Server');

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Insert user into database with email and password_hash
    const query = `
      INSERT INTO users (name, email, password_hash, role, status, created_at)
      VALUES (@name, @email, @password, @role, 'allowed', GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;
    
    const result = await executeQuery(query, [
      { name: 'name', type: sql.VarChar, value: userData.name || userData.email.split('@')[0] },
      { name: 'email', type: sql.VarChar, value: userData.email },
      { name: 'password', type: sql.VarChar, value: hashedPassword },
      { name: 'role', type: sql.VarChar, value: userData.role }
    ]);

    const userId = result[0]?.id;
    
    if (!userId) {
      console.error('\n❌ Failed to create user in database');
      process.exit(1);
    }

    console.log('\n✅ Superuser created successfully!');
    console.log(`   Email:    ${userData.email}`);
    console.log(`   Name:     ${userData.name || '(none)'}`);
    console.log(`   Role:     ${userData.role}`);
    console.log(`   ID:       ${userId}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('   Smart Access — Create Superuser');
  console.log('═══════════════════════════════════════════');
  console.log('Mode: SQL SERVER\n');

  // For interactive input, we'll use a non-interactive approach
  const args = process.argv.slice(2);
  
  let email, password, name, role;
  
  // Parse command line arguments or prompt
  if (args.length >= 2) {
    email = args[0];
    password = args[1];
    name = args[2] || '';
    role = args[3] || 'admin';
  } else {
    // Interactive mode
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Email
    do {
      email = await new Promise((resolve) => {
        rl.question('Email: ', (answer) => {
          resolve(answer.trim());
        });
      });
      if (!validateEmail(email)) console.log('   ⚠️  Please enter a valid email address.');
    } while (!validateEmail(email));

    // Password
    do {
      password = await new Promise((resolve) => {
        rl.question('Password: ', (answer) => {
          resolve(answer.trim());
        });
      });
      const validation = validatePassword(password);
      if (validation) {
        console.log(`   ⚠️  ${validation}`);
        password = null;
      }
    } while (!password);

    // Confirm password
    let confirmPassword;
    do {
      confirmPassword = await new Promise((resolve) => {
        rl.question('Confirm password: ', (answer) => {
          resolve(answer.trim());
        });
      });
      if (confirmPassword !== password) console.log('   ⚠️  Passwords do not match.');
    } while (confirmPassword !== password);

    // Name
    name = await new Promise((resolve) => {
      rl.question('Full name (optional): ', (answer) => {
        resolve(answer.trim());
      });
    });

    // Role
    role = await new Promise((resolve) => {
      rl.question('Role (admin/guard/user): ', (answer) => {
        const r = answer.trim() || 'admin';
        if (!['admin', 'guard', 'user'].includes(r)) {
          console.log('   ⚠️  Invalid role, defaulting to "admin".');
          resolve('admin');
        } else {
          resolve(r);
        }
      });
    });
    
    rl.close();
  }

  const userData = {
    email,
    password,
    name: name || undefined,
    role: role || 'admin'
  };

  console.log('\nCreating user...\n');

  await createInSQLServer(userData);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
