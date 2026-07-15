import express from 'express';
import {
  getTracks,
  searchTracks,
  toggleFavorite,
  logPlay,
  getFavorites,
} from '../controllers/trackController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTracks);
router.get('/search', searchTracks);
router.get('/favorites', protect, getFavorites);
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/:id/play', protect, logPlay);

export default router;
