import express from 'express';
import { searchBooks, getBookByIsbn, getNewReleases, getCommunityFavorites } from '../controllers/books.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Rechercher des livres dans Google Books
router.get('/search', authMiddleware, searchBooks);

// Obtenir un livre par ISBN
router.get('/isbn/:isbn', authMiddleware, getBookByIsbn);

// Obtenir les nouveautés
router.get('/new-releases', authMiddleware, getNewReleases);

// Obtenir les livres préférés de la communauté
router.get('/community-favorites', authMiddleware, getCommunityFavorites);

export default router;

