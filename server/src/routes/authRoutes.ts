import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  getUsers
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import {
  registerValidator,
  loginValidator,
  profileValidator
} from '../validators/authValidator';

const router = Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.get('/profile', protect, getCurrentUser);
router.put('/profile', protect, profileValidator, updateProfile);
router.get('/users', protect, getUsers);

export default router;
