import express from 'express';
import { getTopBooks } from '../controllers/stats.controller';

const router = express.Router();

// Obtenir le top des livres les mieux notés
router.get('/top-books', getTopBooks);

export default router;

