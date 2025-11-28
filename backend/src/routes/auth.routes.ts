import express from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Inscription
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('username').isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  ],
  register
);

// Connexion
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis'),
  ],
  login
);

// Obtenir l'utilisateur actuel
router.get('/me', authMiddleware, getCurrentUser);

export default router;

