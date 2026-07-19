import mongoose from 'mongoose';

const TrackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a track title'],
    trim: true,
  },
  artist: {
    type: String,
    required: [true, 'Please add an artist name'],
    trim: true,
  },
  album: {
    type: String,
    required: [true, 'Please add an album name'],
    trim: true,
  },
  duration: {
    type: String,
    required: [true, 'Please add a duration (e.g. 3:45)'],
  },
  bpm: {
    type: Number,
    required: true,
    default: 120,
  },
  bitrate: {
    type: String,
    required: true,
    default: '320 kbps',
  },
  coverUrl: {
    type: String,
    required: true,
    default: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60',
  },
  url: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
    trim: true,
  },
  mood: {
    type: String,
    required: true,
    trim: true,
    default: 'Dreamy',
  },
  playCount: {
    type: Number,
    default: 0,
  },
  isStudioGenerated: {
    type: Boolean,
    default: false,
  },
  lyrics: {
    type: String,
    default: '',
  },
  language: {
    type: String,
  },
  tempo: {
    type: String,
  },
  prompt: {
    type: String,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  jamendoId: {
  type: String,
  unique: true,
  sparse: true, // allows many tracks to have NO jamendoId (your existing/AI-generated tracks) without violating uniqueness
},
});

// Set text indexes for intelligent searching
TrackSchema.index({
  title: 'text',
  artist: 'text',
  album: 'text',
  genre: 'text',
  mood: 'text',
}, { timestamps: true });

const Track = mongoose.model('Track', TrackSchema);
export default Track;
