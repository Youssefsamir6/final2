const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addFaceImages: addFaceImagesService,
  deleteFaceImages: deleteFaceImagesService
} = require('../services/user.service');
const { AppError } = require('../middleware/errorHandler');
const { logSuccess, logError, logDB } = require('../utils/logger');

const getUsers = async (req, res) => {
  const startTime = Date.now();
  const users = await getAllUsers();
  logDB('SELECT', 'Users', Date.now() - startTime);

  if (!users || !Array.isArray(users)) {
    throw new AppError('Failed to retrieve users', 500);
  }

  logSuccess('Retrieved all users', { count: users.length });
  res.json({ success: true, data: users });
};

const getUser = async (req, res) => {
  const startTime = Date.now();
  const user = await getUserById(req.params.id);
  logDB('SELECT', 'Users', Date.now() - startTime);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ success: true, data: user });
};

const createNewUser = async (req, res) => {
  const { email, password, name, role } = req.body;

  const startTime = Date.now();
  const user = await createUser({ email, password, name, role });
  logDB('INSERT', 'Users', Date.now() - startTime);

  if (!user) {
    throw new AppError('Failed to create user', 500);
  }

  logSuccess('User created', { userId: user.id, email });
  res.status(201).json({ success: true, data: user });
};

const updateExistingUser = async (req, res) => {
  const { id } = req.params;

  const startTime = Date.now();
  const user = await updateUser(id, req.body);
  logDB('UPDATE', 'Users', Date.now() - startTime);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  logSuccess('User updated', { userId: id });
  res.json({ success: true, data: user });
};

const deleteExistingUser = async (req, res) => {
  const { id } = req.params;

  const startTime = Date.now();
  await deleteUser(id);
  logDB('DELETE', 'Users', Date.now() - startTime);

  logSuccess('User deleted', { userId: id });
  res.json({ success: true, message: 'User deleted' });
};

const deleteOwnAccount = async (req, res) => {
  const userId = req.user.userId;

  const startTime = Date.now();
  await deleteUser(userId);
  logDB('DELETE', 'Users', Date.now() - startTime);

  logSuccess('Account deleted', { userId });
  res.json({ success: true, message: 'Account deleted successfully' });
};

const addFaceImages = async (req, res) => {
  const { id } = req.params;
  
  if (!req.files?.length && !req.body.image) {
    throw new AppError('No image provided', 400);
  }
  
  const images = req.files ? req.files.map(f => ({
    data: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`
  })) : [{ data: req.body.image }];
  
  const startTime = Date.now();
  const user = await addFaceImagesService(id, images);
  logDB('UPDATE', 'Users', Date.now() - startTime);
  
  if (!user) {
    throw new AppError('Failed to add face images', 500);
  }
  
  logSuccess('Face images added', { userId: id, count: images.length });
  res.json({ success: true, data: user });
};

const deleteFaceImages = async (req, res) => {
  const { id } = req.params;
  
  const startTime = Date.now();
  const user = await deleteFaceImagesService(id);
  logDB('UPDATE', 'Users', Date.now() - startTime);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  logSuccess('Face images deleted', { userId: id });
  res.json({ success: true, data: user });
};

module.exports = {
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser,
  deleteOwnAccount,
  addFaceImages,
  deleteFaceImages
};

