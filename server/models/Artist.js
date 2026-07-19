import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  genres: {
    type: [String],
    default: [],
  },
  trackCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Artist = mongoose.model('Artist', ArtistSchema);
export default Artist;