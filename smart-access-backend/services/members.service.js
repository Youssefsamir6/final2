const { executeQuery, sql } = require('../config/db');

function getMembers() {
  try {
    const query = 'SELECT id, name, role, status, created_at FROM users ORDER BY id';
    return executeQuery(query);
  } catch (error) {
    console.error('Error fetching members:', error.message);
    return [];
  }
}

async function createMember({ email, role = 'student', name = '' }) {
  try {
    const query = `
      INSERT INTO users (name, role, status, created_at)
      VALUES (@name, @role, 'allowed', GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const result = await executeQuery(query, [
      { name: 'name', type: sql.VarChar, value: name || email },
      { name: 'role', type: sql.VarChar, value: role }
    ]);
    
    return { 
      id: result[0]?.id, 
      email: name || email, 
      role, 
      isActive: true 
    };
  } catch (error) {
    console.error('Error creating member:', error.message);
    return null;
  }
}

async function deleteMember(id) {
  try {
    const query = 'DELETE FROM users WHERE id = @id';
    await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id }
    ]);
    return true;
  } catch (error) {
    console.error('Error deleting member:', error.message);
    return false;
  }
}

async function updateMember(id, updates) {
  try {
    const query = `
      UPDATE users 
      SET name = COALESCE(@name, name),
          role = COALESCE(@role, role),
          status = COALESCE(@status, status)
      WHERE id = @id
    `;
    await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id },
      { name: 'name', type: sql.VarChar, value: updates.name || null },
      { name: 'role', type: sql.VarChar, value: updates.role || null },
      { name: 'status', type: sql.VarChar, value: updates.status || null }
    ]);
    
    return { id, ...updates };
  } catch (error) {
    console.error('Error updating member:', error.message);
    return null;
  }
}

module.exports = { getMembers, createMember, deleteMember, updateMember };
