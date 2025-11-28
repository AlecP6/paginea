import express from 'express';
import { body } from 'express-validator';
import {
  createComment,
  deleteComment,
} from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Créer un commentaire
router.post(
  '/',
  authMiddleware,
  [body('content').notEmpty().withMessage('Le contenu est requis')],
  createComment
);

// Supprimer un commentaire
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;

