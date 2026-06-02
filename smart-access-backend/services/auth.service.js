const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { executeQuery, sql } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId, role, email) => {
  return jwt.sign({ userId, role, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const register = async ({ email, password, role = 'student', name = '' }) => {
  try {
    // Check if email already exists
    const existing = await executeQuery(
      'SELECT id FROM users WHERE email = @email',
      [{ name: 'email', type: sql.VarChar, value: email }]
    );
    
    if (existing.length > 0) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insert new user with email and password_hash
    const result = await executeQuery(
      `INSERT INTO users (name, email, password_hash, role, status, created_at)
       VALUES (@name, @email, @password, @role, 'allowed', GETDATE());
       SELECT SCOPE_IDENTITY() AS id;`,
      [
        { name: 'name', type: sql.VarChar, value: name || email.split('@')[0] },
        { name: 'email', type: sql.VarChar, value: email },
        { name: 'password', type: sql.VarChar, value: hashedPassword },
        { name: 'role', type: sql.VarChar, value: role }
      ]
    );
    
    const userId = result[0]?.id;
    const token = generateToken(userId, role, email);

    return {
      user: { id: userId, email, name: name || email.split('@')[0], role },
      token
    };
  } catch (error) {
    console.error('Error in register:', error.message);
    throw error;
  }
};

const login = async ({ email, password }) => {
  try {
    // Find user by email
    const result = await executeQuery(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = @email',
      [{ name: 'email', type: sql.VarChar, value: email }]
    );
    
    if (result.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id, user.role, user.email);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  } catch (error) {
    console.error('Error in login:', error.message);
    throw error;
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { userId: decoded.userId, role: decoded.role, email: decoded.email };
  } catch (error) {
    // Fallback: support old mock tokens during transition
    if (token.startsWith('mock_')) {
      const parts = token.split('_');
      if (parts.length >= 3) {
        return { userId: parts[1], role: parts.slice(2).join('_') };
      }
    }
    throw new Error('Invalid token');
  }
};

module.exports = { register, login, verifyToken, generateToken };
