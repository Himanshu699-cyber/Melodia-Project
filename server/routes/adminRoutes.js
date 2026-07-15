import express from 'express';
import {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  createTrack,
  updateTrack,
  deleteTrack,
  getGenresAndArtists,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// Apply auth and admin protections to all admin endpoints
router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/tracks', createTrack);
router.put('/tracks/:id', updateTrack);
router.delete('/tracks/:id', deleteTrack);
router.get('/metadata', getGenresAndArtists);

export default router;
