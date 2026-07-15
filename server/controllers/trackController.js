import Track from '../models/Track.js';
import User from '../models/User.js';

// @desc    Get all tracks or search/filter
// @route   GET /api/tracks
// @access  Public
export const getTracks = async (req, res) => {
  try {
    const { genre, mood, search, sort } = req.query;
    let query = {};

    // Filtering
    if (genre) {
      query.genre = new RegExp(genre, 'i');
    }
    if (mood) {
      query.mood = new RegExp(mood, 'i');
    }

    // Searching
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { mood: { $regex: search, $options: 'i' } }
      ];
    }

    let apiQuery = Track.find(query);

    // Sorting
    if (sort) {
      if (sort === 'popular') {
        apiQuery = apiQuery.sort('-playCount');
      } else if (sort === 'title') {
        apiQuery = apiQuery.sort('title');
      } else if (sort === 'artist') {
        apiQuery = apiQuery.sort('artist');
      }
    }

    const tracks = await apiQuery;
    res.json({ success: true, count: tracks.length, data: tracks });
  } catch (error) {
    console.error('Get tracks error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search tracks (suggestions & details)
// @route   GET /api/tracks/search
// @access  Public
export const searchTracks = async (req, res) => {
  const { q } = req.query;

  try {
    if (!q) {
      return res.json({ success: true, suggestions: [], results: [] });
    }

    // Real-time suggestions (returns top titles & artists matching the string)
    const suggestionsQuery = await Track.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } }
      ]
    }).limit(5).select('title artist coverUrl');

    const suggestions = suggestionsQuery.map(t => `${t.title} - ${t.artist}`);

    // Detailed results
    const results = await Track.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
        { mood: { $regex: q, $options: 'i' } }
      ]
    });

    res.json({
      success: true,
      suggestions,
      results
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle track like (favorite)
// @route   POST /api/tracks/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    const user = await User.findById(req.user.id);
    const index = user.favorites.indexOf(track._id);

    let isLiked = false;
    if (index > -1) {
      // Already favorited, remove it
      user.favorites.splice(index, 1);
    } else {
      // Add to favorites
      user.favorites.push(track._id);
      isLiked = true;
    }

    await user.save();
    res.json({ success: true, isLiked, favoritesCount: user.favorites.length });
  } catch (error) {
    console.error('Toggle favorite error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log play history (Recently Played) and update play count
// @route   POST /api/tracks/:id/play
// @access  Private
export const logPlay = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    // Increment play count (This always works)
    track.playCount += 1;
    await track.save();

    // Wrap user history tracking in an inner try/catch so it fails gracefully
    try {
      if (req.user && req.user.id) {
        const user = await User.findById(req.user.id);
        if (user) {
          // Remove if already in history to move to top
          const existingIndex = user.recentlyPlayed.findIndex(
            (item) => item.track.toString() === track._id.toString()
          );
          if (existingIndex > -1) {
            user.recentlyPlayed.splice(existingIndex, 1);
          }

          // Add to start of history
          user.recentlyPlayed.unshift({ track: track._id, playedAt: new Date() });

          // Limit history size to 20
          if (user.recentlyPlayed.length > 20) {
            user.recentlyPlayed.pop();
          }

          await user.save();
        }
      }
    } catch (historyError) {
      console.error("Failed to log to user history, continuing playback:", historyError);
    }

    // Always send back a success status to prevent the frontend player from tripping up
    return res.json({ success: true, playCount: track.playCount });

  } catch (error) {
    console.error("Global logPlay error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user's favorites (Liked Songs)
// @route   GET /api/tracks/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json({ success: true, count: user.favorites.length, data: user.favorites });
  } catch (error) {
    console.error('Get favorites error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
