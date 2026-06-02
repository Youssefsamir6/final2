const membersService = require('../services/members.service');
const historyService = require('../services/history.service');
const { getUserById } = require('../services/user.service');
const { AppError } = require('../middleware/errorHandler');
const { logSuccess, logError } = require('../utils/logger');

async function getUserEmail(userId) {
  if (!userId) return 'unknown';
  try {
    const user = await getUserById(userId);
    return user ? user.email || user.name || userId : userId;
  } catch {
    return userId;
  }
}

async function getMembers(req, res) {
  const data = await membersService.getMembers();
  
  if (!data || !Array.isArray(data)) {
    throw new AppError('Failed to retrieve members', 500);
  }
  
  logSuccess('Retrieved members', { count: data.length });
  res.json({ success: true, data, count: data.length });
}

async function createMember(req, res) {
  const { email, role, name } = req.body;
  
  const member = await membersService.createMember({ email, role, name });
  if (!member) {
    throw new AppError('Failed to create member', 500);
  }
  
  await historyService.addHistory({
    action: 'create',
    entityType: 'member',
    entityId: member.id,
    entityName: member.email || member.name,
    userEmail: await getUserEmail(req.user?.userId),
    userRole: req.user?.role,
    details: { role: member.role }
  }).catch(err => logError('Failed to log history', err));
  
  logSuccess('Member created', { memberId: member.id, email });
  res.status(201).json({ success: true, data: member });
}

async function deleteMember(req, res) {
  const id = req.params.id;
  const removed = await membersService.deleteMember(id);
  
  if (!removed) {
    throw new AppError('Member not found', 404);
  }
  
  await historyService.addHistory({
    action: 'delete',
    entityType: 'member',
    entityId: id,
    entityName: 'member',
    userEmail: await getUserEmail(req.user?.userId),
    userRole: req.user?.role,
    details: { deletedId: id }
  }).catch(err => logError('Failed to log history', err));
  
  logSuccess('Member deleted', { memberId: id });
  res.json({ success: true, message: 'Member deleted' });
}

async function updateMember(req, res) {
  const id = req.params.id;
  const member = await membersService.updateMember(id, req.body);
  
  if (!member) {
    throw new AppError('Member not found', 404);
  }
  
  await historyService.addHistory({
    action: 'update',
    entityType: 'member',
    entityId: member.id,
    entityName: 'member',
    userEmail: await getUserEmail(req.user?.userId),
    userRole: req.user?.role,
    details: req.body
  }).catch(err => logError('Failed to log history', err));
  
  logSuccess('Member updated', { memberId: id });
  res.json({ success: true, data: member });
}

module.exports = { getMembers, createMember, deleteMember, updateMember };
