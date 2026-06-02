const { register, login } = require('../services/auth.service');
const { createLog } = require('../services/log.service');
const { AppError } = require('../middleware/errorHandler');

const registerUser = async (req, res) => {
  const { email, password, role } = req.body;
  
  const { user, token } = await register({ email, password, role });
  if (!user || !token) {
    throw new AppError('Failed to create user', 500);
  }
  
  res.status(201).json({ 
    success: true,
    data: { user, token }
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  // Log attempt
  await createLog({
    userId: null,
    status: 'Login Attempt',
    method: 'login',
    reason: `Email: ${email}`,
    gateName: 'Web Login'
  }).catch(err => console.error('Failed to log login attempt:', err));
  
  const { user, token } = await login({ email, password });
  
  if (!user || !token) {
    throw new AppError('Invalid credentials', 401);
  }
  
  // Log success
  await createLog({
    userId: user.id,
    status: 'Login Success',
    method: 'login',
    reason: `Role: ${user.role}`,
    gateName: 'Web Login'
  }).catch(err => console.error('Failed to log login success:', err));
  
  res.json({ 
    success: true,
    data: { user, token }
  });
};

module.exports = { registerUser, loginUser };

