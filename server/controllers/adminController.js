import User from '../models/User.js';
import Track from '../models/Track.js';
import Playlist from '../models/Playlist.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTracks = await Track.countDocuments();
    const totalPlaylists = await Playlist.countDocuments();

    // Aggregate total play count
    const playStats = await Track.aggregate([
      { $group: { _id: null, totalPlays: { $sum: '$playCount' } } }
    ]);
    const totalPlays = playStats.length > 0 ? playStats[0].totalPlays : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTracks,
        totalPlaylists,
        totalPlays
      }
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user (plan/role)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  const { role, plan, username } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role || user.role;
    user.plan = plan || user.plan;
    user.username = username || user.username;

    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a track
// @route   POST /api/admin/tracks
// @access  Private/Admin
export const createTrack = async (req, res) => {
  const { title, artist, album, duration, bpm, bitrate, coverUrl, url, genre, mood } = req.body;

  try {
    const track = await Track.create({
      title,
      artist,
      album,
      duration,
      bpm: bpm || 120,
      bitrate: bitrate || '320 kbps',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60',
      url,
      genre,
      mood: mood || 'Energetic'
    });

    res.status(201).json({ success: true, data: track });
  } catch (error) {
    console.error('Create track error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update track metadata
// @route   PUT /api/admin/tracks/:id
// @access  Private/Admin
export const updateTrack = async (req, res) => {
  const { title, artist, album, duration, bpm, bitrate, coverUrl, url, genre, mood } = req.body;

  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    track.title = title || track.title;
    track.artist = artist || track.artist;
    track.album = album || track.album;
    track.duration = duration || track.duration;
    track.bpm = bpm !== undefined ? bpm : track.bpm;
    track.bitrate = bitrate || track.bitrate;
    track.coverUrl = coverUrl || track.coverUrl;
    track.url = url || track.url;
    track.genre = genre || track.genre;
    track.mood = mood || track.mood;

    await track.save();
    res.json({ success: true, data: track });
  } catch (error) {
    console.error('Update track error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a track
// @route   DELETE /api/admin/tracks/:id
// @access  Private/Admin
export const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    await track.deleteOne();
    res.json({ success: true, message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Delete track error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get aggregate lists of unique genres and artists
// @route   GET /api/admin/metadata
// @access  Private/Admin
export const getGenresAndArtists = async (req, res) => {
  try {
    const genres = await Track.distinct('genre');
    const artists = await Track.distinct('artist');

    res.json({
      success: true,
      data: {
        genres,
        artists
      }
    });
  } catch (error) {
    console.error('Get metadata error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
