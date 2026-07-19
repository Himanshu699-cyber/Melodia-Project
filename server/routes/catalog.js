import express from 'express';
import { getArtists, getAlbums } from '../controllers/catalogController.js';

const router = express.Router();

router.get('/artists', getArtists);
router.get('/albums', getAlbums);

export default router;