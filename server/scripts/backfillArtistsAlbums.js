import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';
import Track from '../models/Track.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Backfilling Artist/Album collections from existing tracks...\n');

  const tracks = await Track.find({});
  console.log(`Found ${tracks.length} existing tracks.\n`);

  let artistsCreated = 0;
  let albumsCreated = 0;

  for (const t of tracks) {
    if (!t.artist) continue;

    const existingArtist = await Artist.findOne({ name: t.artist });
    if (!existingArtist) {
      await Artist.create({
        name: t.artist,
        imageUrl: t.coverUrl || '',
        genres: t.genre ? [t.genre] : [],
        trackCount: 1,
      });
      artistsCreated++;
    } else {
      existingArtist.trackCount += 1;
      if (t.genre && !existingArtist.genres.includes(t.genre)) {
        existingArtist.genres.push(t.genre);
      }
      await existingArtist.save();
    }

    if (t.album && t.album !== 'Single') {
      const existingAlbum = await Album.findOne({ name: t.album, artistName: t.artist });
      if (!existingAlbum) {
        await Album.create({
          name: t.album,
          artistName: t.artist,
          coverUrl: t.coverUrl || '',
          trackCount: 1,
        });
        albumsCreated++;
      } else {
        existingAlbum.trackCount += 1;
        await existingAlbum.save();
      }
    }
  }

  console.log(`\nDone. Artists created: ${artistsCreated}, Albums created: ${albumsCreated}`);
  await mongoose.disconnect();
  process.exit(0);
}

run();