const { executeQuery, sql } = require('../config/db');
const { addPersonToDatabase, rebuildDatabase, checkAIHealth } = require('./faceDatabase.service');

// In-memory people store for UI listing. Enrollment also syncs SQL Server users + AI face DB.
let people = [
  {
    _id: 'p1',
    name: 'John Doe',
    type: 'student',
    studentId: 'STU001',
    photo: null,
    places: ['North Gate', 'Library']
  }
];

function getPeople() {
  return people;
}

function dataUrlToJpegBase64Buffer(photo) {
  if (!photo) return null;
  // Accept: data:image/jpeg;base64,XXXX or raw base64
  let b64 = photo;
  if (photo.includes(',')) {
    b64 = photo.split(',')[1];
  }
  return Buffer.from(b64, 'base64');
}

async function createSqlUser({ name, role = 'user', status = 'allowed' }) {
  // users.id is IDENTITY -> do NOT insert explicit id.
  const insertSql = `
    INSERT INTO users (name, role, status, created_at)
    OUTPUT INSERTED.id as id
    VALUES (@name, @role, @status, GETDATE());
  `;

  const result = await executeQuery(insertSql, [
    { name: 'name', type: sql.VarChar, value: name },
    { name: 'role', type: sql.VarChar, value: role },
    { name: 'status', type: sql.VarChar, value: status }
  ]);

  return result?.[0]?.id ? Number(result[0].id) : null;
}

async function createPerson({ name, type, studentId, photo, places }) {
  const idStr = String(Date.now());
  const photoBuffer = dataUrlToJpegBase64Buffer(photo);
  const p = {
    _id: idStr,
    name,
    type,
    studentId: studentId || null,
    photo: photo || null,
    places: places || []
  };

  if (!photoBuffer) {
    people.unshift(p);
    return p;
  }

  // 0) Ensure AI worker is alive before doing any work.
  const health = await checkAIHealth().catch(() => null);
  if (health?.status === 'error') {
    throw new Error(`AI worker unavailable: ${health.error || 'unknown error'}`);
  }

  // 1) Create SQL Server user first (IDENTITY generates id)
  const roleMap = {
    student: 'user',
    professor: 'user',
    assistant: 'user',
    worker: 'user',
    vip: 'user'
  };

  const createdId = await createSqlUser({
    name,
    role: roleMap[type] || 'user',
    status: 'allowed'
  });

  if (!createdId) {
    throw new Error('Failed to create SQL user (cannot get identity id)');
  }

  // 2) Enroll into AI face DB using the SQL-generated id so recognition maps correctly.
  const filename = `${createdId}_${name.replace(/\s+/g, '_')}.jpg`;
  await addPersonToDatabase(String(createdId), photoBuffer, filename);

  // 3) Best-effort rebuild
  await rebuildDatabase().catch(() => null);

  // Store for UI listing (use SQL id as _id for consistency)
  p._id = String(createdId);
  p.studentId = studentId || null;
  people.unshift(p);
  return p;
}


function deletePerson(id) {
  const idx = people.findIndex(p => String(p._id) === String(id));
  if (idx === -1) return null;
  const [removed] = people.splice(idx, 1);
  return removed;
}

function updatePerson(id, updates) {
  const person = people.find(p => String(p._id) === String(id));
  if (!person) return null;
  Object.assign(person, updates);
  return person;
}

module.exports = { getPeople, createPerson, deletePerson, updatePerson };

