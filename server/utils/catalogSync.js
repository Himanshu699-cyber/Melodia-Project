import Artist from '../models/Artist.js';
import Album from '../models/Album.js';

// Call this any time a new Track is saved — keeps Artist/Album collections in sync
export async function syncArtistAndAlbum(trackData) {
  const { artist, album, coverUrl, genre } = trackData;
  if (!artist) return;

  // Upsert Artist
  await Artist.findOneAndUpdate(
    { name: artist },
    {
      $setOnInsert: { imageUrl: coverUrl || '' },
      $addToSet: { genres: genre },
      $inc: { trackCount: 1 },
    },
    { upsert: true, new: true }
  );

  // Upsert Album (skip if no real album name)
  if (album && album !== 'Single') {
    await Album.findOneAndUpdate(
      { name: album, artistName: artist },
      {
        $setOnInsert: { coverUrl: coverUrl || '' },
        $inc: { trackCount: 1 },
      },
      { upsert: true, new: true }
    );
  }
}