import Artist from '../models/Artist.js';
import Album from '../models/Album.js';

export const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find({}).sort('-trackCount').limit(50);
    res.json({ success: true, count: artists.length, data: artists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find({}).sort('-trackCount').limit(50);
    res.json({ success: true, count: albums.length, data: albums });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};