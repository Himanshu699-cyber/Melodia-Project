import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  artistName: {
    type: String,
    required: true,
    trim: true,
  },
  coverUrl: {
    type: String,
    default: '',
  },
  trackCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// An album is identified by its name + artist combo, not name alone
// (since two different artists could both have an album called "Reflections")
AlbumSchema.index({ name: 1, artistName: 1 }, { unique: true });

const Album = mongoose.model('Album', AlbumSchema);
export default Album;