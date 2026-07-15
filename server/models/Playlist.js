import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a playlist name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  coverUrl: {
    type: String,
    required: true,
    default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
  },
  creator: {
    type: String,
    required: true,
    default: 'You',
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
  }],
  isAiGenerated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);
export default Playlist;
