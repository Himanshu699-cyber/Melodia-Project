import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import Track from '../models/Track.js';
import dns from 'dns';
import { syncArtistAndAlbum } from '../utils/catalogSync.js';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0';

// Pull a good spread of genres so your catalog isn't one-note
const GENRES_TO_IMPORT = [
  'electronic', 'synthwave', 'ambient', 'rock', 'pop',
  'hiphop', 'jazz', 'classical', 'lofi', 'indie',
];

const TRACKS_PER_GENRE = 20; // adjust up/down as you like

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function fetchGenreTracks(genre, limit) {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  try {
    const response = await axios.get(`${JAMENDO_BASE}/tracks/`, {
      params: {
        client_id: clientId,
        format: 'json',
        limit,
        tags: genre,
        include: 'musicinfo',
        audioformat: 'mp32',
        order: 'popularity_total',
      },
    });
    return response.data.results || [];
  } catch (err) {
    console.error(`Failed to fetch genre "${genre}":`, err.message);
    return [];
  }
}

async function run() {
  if (!process.env.JAMENDO_CLIENT_ID) {
    console.error('JAMENDO_CLIENT_ID is not set in server/.env — aborting.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB. Starting Jamendo bulk import...\n');

  let totalSaved = 0;
  let totalSkipped = 0;

  for (const genre of GENRES_TO_IMPORT) {
    console.log(`Fetching "${genre}"...`);
    const rawTracks = await fetchGenreTracks(genre, TRACKS_PER_GENRE);

    for (const t of rawTracks) {
      const exists = await Track.findOne({ jamendoId: t.id });
      if (exists) {
        totalSkipped++;
        continue;
      }

      try {
  const trackData = {
    jamendoId: t.id,
    title: t.name,
    artist: t.artist_name,
    album: t.album_name || 'Single',
    duration: formatDuration(t.duration),
    bpm: t.musicinfo?.speed === 'high' ? 140 : t.musicinfo?.speed === 'low' ? 90 : 120,
    bitrate: '192 kbps',
    coverUrl: t.album_image || t.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60',
    url: t.audio,
    genre: t.musicinfo?.tags?.genres?.[0] || genre,
    mood: t.musicinfo?.tags?.vartags?.[0] || 'Dreamy',
  };
  await Track.create(trackData);
  await syncArtistAndAlbum(trackData); // NEW
  totalSaved++;
} catch (err) {
  console.warn(`Skipped one track ("${t.name}"):`, err.message);
}
    }
    console.log(`  → done with "${genre}"\n`);
  }

  console.log(`\nImport complete. Saved: ${totalSaved}, Skipped (already existed): ${totalSkipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

run();