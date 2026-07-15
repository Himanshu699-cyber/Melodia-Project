import Playlist from '../models/Playlist.js';
import Track from '../models/Track.js';
import User from '../models/User.js';

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req, res) => {
  const { name, description, coverUrl } = req.body;

  try {
    const playlist = await Playlist.create({
      name,
      description,
      coverUrl,
      creator: req.user.username,
      creatorId: req.user.id,
      tracks: [],
    });

    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    console.error('Create playlist error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all playlists for user
// @route   GET /api/playlists
// @access  Private
export const getPlaylists = async (req, res) => {
  try {
    // Return user created playlists + public AI generated playlists
    const playlists = await Playlist.find({
      $or: [
        { creatorId: req.user.id },
        { isAiGenerated: true }
      ]
    }).populate('tracks');

    res.json({ success: true, count: playlists.length, data: playlists });
  } catch (error) {
    console.error('Get playlists error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single playlist details
// @route   GET /api/playlists/:id
// @access  Private
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('tracks');

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    res.json({ success: true, data: playlist });
  } catch (error) {
    console.error('Get playlist by id error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update playlist details (Rename/Edit)
// @route   PUT /api/playlists/:id
// @access  Private
export const updatePlaylist = async (req, res) => {
  const { name, description, coverUrl, tracks } = req.body;

  try {
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.creatorId && playlist.creatorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this playlist' });
    }

    playlist.name = name || playlist.name;
    playlist.description = description !== undefined ? description : playlist.description;
    playlist.coverUrl = coverUrl || playlist.coverUrl;
    if (tracks) playlist.tracks = tracks;

    await playlist.save();
    
    // Return populated playlist
    playlist = await Playlist.findById(playlist._id).populate('tracks');

    res.json({ success: true, data: playlist });
  } catch (error) {
    console.error('Update playlist error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.creatorId && playlist.creatorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this playlist' });
    }

    await playlist.deleteOne();
    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    AI Playlist Recommendation Generator
// @route   POST /api/playlists/generate-ai
// @access  Private
export const generateAiPlaylist = async (req, res) => {
  const { mood, genre, favoriteArtist, description } = req.body;

  try {
    // 1. Fetch user to inspect Liked Songs and Listening History
    const user = await User.findById(req.user.id);
    const userFavorites = user.favorites || [];
    const userHistory = user.recentlyPlayed.map(item => item.track) || [];

    // 2. Build recommendation filter criteria based on preferences
    let matchedTracks = [];
    
    // Find tracks matching mood or genre
    let searchCriteria = {};
    if (mood) {
      searchCriteria.mood = new RegExp(mood, 'i');
    }
    if (genre) {
      searchCriteria.genre = new RegExp(genre, 'i');
    }
    if (favoriteArtist) {
      searchCriteria.artist = new RegExp(favoriteArtist, 'i');
    }

    matchedTracks = await Track.find(searchCriteria);

    // If matches are too low, fallback to any tracks matching genre or mood
    if (matchedTracks.length < 5) {
      matchedTracks = await Track.find({
        $or: [
          { genre: new RegExp(genre || 'Synthwave', 'i') },
          { mood: new RegExp(mood || 'Dreamy', 'i') }
        ]
      });
    }

    // Reorder/prioritize based on user's Liked Songs and Play History
    const favoritedSet = new Set(userFavorites.map(id => id.toString()));
    const historySet = new Set(userHistory.map(id => id.toString()));

    matchedTracks.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (favoritedSet.has(a._id.toString())) scoreA += 5;
      if (favoritedSet.has(b._id.toString())) scoreB += 5;

      if (historySet.has(a._id.toString())) scoreA += 3;
      if (historySet.has(b._id.toString())) scoreB += 3;

      return scoreB - scoreA; // Descending score
    });

    // Limit to 8 tracks
    const selectedTracks = matchedTracks.slice(0, 8);

    if (selectedTracks.length === 0) {
      return res.status(404).json({ success: false, message: 'Could not generate recommendations based on these filters. Try broader inputs.' });
    }

    // 3. Save playlist in database
    const playlistName = description ? `AI: ${description.slice(0, 30)}` : `AI Vibe: ${mood || 'Chill'} ${genre || 'Beat'}`;
    const generatedPlaylist = await Playlist.create({
      name: playlistName,
      description: `AI recommended mix based on ${mood || 'any'} mood, ${genre || 'any'} genre, and your personalized play history.`,
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
      creator: 'Melodify AI',
      tracks: selectedTracks.map(t => t._id),
      isAiGenerated: true,
      creatorId: req.user.id
    });

    const populatedPlaylist = await Playlist.findById(generatedPlaylist._id).populate('tracks');

    res.json({
      success: true,
      playlist: populatedPlaylist
    });
  } catch (error) {
    console.error('AI Playlist generation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    AI Music Studio Song Generator (Lyrics & Audio)
// @route   POST /api/playlists/studio-generate
// @access  Private
export const generateStudioSong = async (req, res) => {
  const { prompt, genre, mood, language, tempo, duration } = req.body;

  try {
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Please provide a prompt describing your song' });
    }

    // 1. Mock LLM lyrics generation
    const generatedLyrics = `[Verse 1]\nSilent echoes in the night\nPrompted search for glowing light\n(${prompt || 'Writing melodies'})\nWe follow the rhythm, we find the way...\n\n[Chorus]\nOh, Melodify this feeling!\nHeartbeats dancing on the ceiling\nIn this ${genre || 'Chill'} style we are dreaming\nUnder the ${mood || 'Dreamy'} stars tonight.\n\n[Verse 2]\n(${tempo || 'Moderate'} beats, moving slow)\nIn ${language || 'English'} the words begin to flow\nNo limitations on where we can go.\n\n[Chorus]\nOh, Melodify this feeling!\nHeartbeats dancing on the ceiling\nIn this ${genre || 'Chill'} style we are dreaming\nUnder the ${mood || 'Dreamy'} stars tonight.`;

    // 2. Set direct MP3 stream URLs from direct CDNs (so users can stream without downloading)
    const audioUrls = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
    ];
    const mockAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    // 3. Set cover art based on mood/genre
    const coverUrls = [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=60'
    ];
    const mockCoverUrl = coverUrls[Math.floor(Math.random() * coverUrls.length)];

    // 4. Calculate BPM based on tempo selection
    let bpm = 120;
    if (tempo === 'Slow') bpm = 80;
    if (tempo === 'Fast') bpm = 140;

    // 5. Create new Track and save in database
    const title = prompt.split(' ').slice(0, 3).join(' ') + ' (AI)';
    const newTrack = await Track.create({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      artist: 'AI Studio Creator',
      album: 'Melodify Studio Sessions',
      duration: duration || '3:30',
      bpm,
      bitrate: '320 kbps',
      coverUrl: mockCoverUrl,
      url: mockAudioUrl,
      genre: genre || 'Synthwave',
      mood: mood || 'Dreamy',
      isStudioGenerated: true,
      lyrics: generatedLyrics,
      language: language || 'English',
      tempo: tempo || 'Moderate',
      prompt,
      creatorId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'AI Studio Song generated successfully!',
      track: newTrack
    });
  } catch (error) {
    console.error('AI Music Studio generation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
