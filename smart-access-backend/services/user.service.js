const { executeQuery, sql } = require('../config/db');

const getUsers = async () => {
  try {
    const query = 'SELECT id, name, role, status, created_at FROM users ORDER BY id';
    const result = await executeQuery(query);
    return result;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return [];
  }
};

const getUserById = async (id) => {
  try {
    const query = 'SELECT id, name, role, status, created_at FROM users WHERE id = @id';
    const result = await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id }
    ]);
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching user by id:', error.message);
    return null;
  }
};

const createUser = async (userData) => {
  try {
    const query = `
      INSERT INTO users (name, role, status, created_at)
      VALUES (@name, @role, @status, GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const result = await executeQuery(query, [
      { name: 'name', type: sql.VarChar, value: userData.name },
      { name: 'role', type: sql.VarChar, value: userData.role || 'student' },
      { name: 'status', type: sql.VarChar, value: userData.status || 'allowed' }
    ]);
    return { id: result[0]?.id, ...userData };
  } catch (error) {
    console.error('Error creating user:', error.message);
    return null;
  }
};

const updateUser = async (id, userData) => {
  try {
    const query = `
      UPDATE users 
      SET name = @name, role = @role, status = @status
      WHERE id = @id
    `;
    await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id },
      { name: 'name', type: sql.VarChar, value: userData.name },
      { name: 'role', type: sql.VarChar, value: userData.role },
      { name: 'status', type: sql.VarChar, value: userData.status }
    ]);
    return { id, ...userData };
  } catch (error) {
    console.error('Error updating user:', error.message);
    return null;
  }
};

const deleteUser = async (id) => {
  try {
    const query = 'DELETE FROM users WHERE id = @id';
    await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id }
    ]);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error.message);
    return false;
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
