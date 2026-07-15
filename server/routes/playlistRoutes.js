import express from 'express';
import {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  generateAiPlaylist,
  generateStudioSong,
} from '../controllers/playlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createPlaylist);
router.get('/', protect, getPlaylists);
router.get('/:id', protect, getPlaylistById);
router.put('/:id', protect, updatePlaylist);
router.delete('/:id', protect, deletePlaylist);
router.post('/generate-ai', protect, generateAiPlaylist);
router.post('/studio-generate', protect, generateStudioSong);

export default router;
