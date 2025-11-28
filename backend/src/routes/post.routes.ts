import express from 'express';
import { body } from 'express-validator';
import {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
} from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Créer un post
router.post(
  '/',
  authMiddleware,
  [body('content').notEmpty().withMessage('Le contenu est requis')],
  createPost
);

// Obtenir les posts (mur public et amis)
router.get('/', authMiddleware, getPosts);

// Obtenir un post par ID
router.get('/:postId', authMiddleware, getPostById);

// Supprimer un post
router.delete('/:postId', authMiddleware, deletePost);

// Liker un post
router.post('/:postId/like', authMiddleware, likePost);

// Unliker un post
router.delete('/:postId/like', authMiddleware, unlikePost);

export default router;

