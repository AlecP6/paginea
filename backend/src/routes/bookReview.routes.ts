import express from 'express';
import { body } from 'express-validator';
import {
  createBookReview,
  getBookReviews,
  getBookReviewById,
  updateBookReview,
  deleteBookReview,
  likeBookReview,
  unlikeBookReview,
  uploadBookCover,
} from '../controllers/bookReview.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// Créer une critique de livre
router.post(
  '/',
  authMiddleware,
  [
    body('bookTitle').notEmpty().withMessage('Le titre du livre est requis'),
    body('bookAuthor').notEmpty().withMessage('L\'auteur du livre est requis'),
    body('rating').isInt({ min: 1, max: 10 }).withMessage('La note doit être entre 1 et 10'),
  ],
  createBookReview
);

// Obtenir les critiques de livres
router.get('/', authMiddleware, getBookReviews);

// Obtenir une critique par ID
router.get('/:reviewId', authMiddleware, getBookReviewById);

// Mettre à jour une critique
router.put('/:reviewId', authMiddleware, updateBookReview);

// Upload de la couverture du livre
router.post('/:reviewId/cover', authMiddleware, upload.single('cover'), uploadBookCover);

// Supprimer une critique
router.delete('/:reviewId', authMiddleware, deleteBookReview);

// Liker une critique
router.post('/:reviewId/like', authMiddleware, likeBookReview);

// Unliker une critique
router.delete('/:reviewId/like', authMiddleware, unlikeBookReview);

export default router;

