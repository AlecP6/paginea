import express from 'express';
import { body } from 'express-validator';
import { getUserProfile, updateProfile, searchUsers, uploadAvatar } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// Rechercher des utilisateurs
router.get('/search', authMiddleware, searchUsers);

// Obtenir le profil d'un utilisateur
router.get('/:userId', authMiddleware, getUserProfile);

// Mettre à jour son profil
router.put(
  '/profile',
  authMiddleware,
  [
    body('username').optional().isLength({ min: 3 }),
    body('email').optional().isEmail(),
  ],
  updateProfile
);

// Upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

export default router;

