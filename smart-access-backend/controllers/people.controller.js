const peopleService = require('../services/people.service');
const historyService = require('../services/history.service');
const { getUserById } = require('../services/user.service');

async function getUserEmail(userId) {
  if (!userId) return 'unknown';
  try {
    const user = await getUserById(userId);
    return user ? user.email || user.name || userId : userId;
  } catch {
    return userId;
  }
}


function getPeople(req, res) {
  const data = peopleService.getPeople();
  res.json(data);
}

function createPerson(req, res) {
  const { name, type, studentId, photo, places } = req.body || {};
  const allowed = ['student', 'professor', 'assistant', 'worker', 'vip'];
  if (!name) return res.status(400).json({ error: 'Name required' });
  if (!type || !allowed.includes(type)) return res.status(400).json({ error: 'Invalid type' });
  if (type === 'student' && !studentId) return res.status(400).json({ error: 'Student ID required' });
  const p = peopleService.createPerson({ name, type, studentId, photo, places });
  
  historyService.addHistory({
    action: 'create',
    entityType: 'person',
    entityId: p._id,
    entityName: p.name,
    userEmail: getUserEmail(req.user?.userId),
    userRole: req.user?.role,
    details: { type: p.type, studentId: p.studentId, places: p.places }
  });
  
  res.status(201).json(p);
}


function deletePerson(req, res) {
  const id = req.params.id;
  const removed = peopleService.deletePerson(id);
  if (!removed) return res.status(404).json({ error: 'Not found' });
  
  historyService.addHistory({
    action: 'delete',
    entityType: 'person',
    entityId: removed._id,
    entityName: removed.name,
    userEmail: getUserEmail(req.user?.userId),
    userRole: req.user?.role,
    details: { type: removed.type, studentId: removed.studentId }
  });
  
  res.json({ success: true, removed });
}


function updatePerson(req, res) {
  const id = req.params.id;
  const person = peopleService.updatePerson(id, req.body);
  if (!person) return res.status(404).json({ error: 'Not found' });
  
  historyService.addHistory({
    action: 'update',
    entityType: 'person',
    entityId: person._id,
    entityName: person.name,
    userEmail: getUserEmail(req.user?.userId),
    userRole: req.user?.role,
    details: req.body
  });
  
  res.json(person);
}


module.exports = { getPeople, createPerson, deletePerson, updatePerson };
