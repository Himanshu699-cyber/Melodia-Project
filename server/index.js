import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import authRoutes from './routes/authRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import Track from './models/Track.js';
import Playlist from './models/Playlist.js';

// Load env vars
dotenv.config();

// Connect database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Body Parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'active', service: 'Melodify API Server' });
});

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Seed Database Helper
const seedDatabase = async () => {
  try {
    const trackCount = await Track.countDocuments();
    if (trackCount === 0) {
      console.log('🌱 Seeding default tracks to MongoDB database...');

      const seedTracks = [
        {
          title: "Neon Horizon",
          artist: "Aether Vibe",
          album: "Metropolis Dreamer",
          duration: "6:12",
          bpm: 122,
          bitrate: "320 kbps",
          coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60",
          genre: "Synthwave",
          mood: "Dreamy",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        },
        {
          title: "Midnight Shift",
          artist: "Cyber Cruiser",
          album: "Outrun the Dawn",
          duration: "7:05",
          bpm: 118,
          bitrate: "320 kbps",
          coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60",
          genre: "Synthwave",
          mood: "Productive",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        },
        {
          title: "Analog Whispers",
          artist: "Lofi Scholar",
          album: "Study Breaks Vol. 4",
          duration: "5:44",
          bpm: 84,
          bitrate: "256 kbps",
          coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=60",
          genre: "Lofi Hip Hop",
          mood: "Focused",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        },
        {
          title: "Subterranean Bass",
          artist: "Glow Worm",
          album: "Deep Sessions",
          duration: "5:02",
          bpm: 128,
          bitrate: "320 kbps",
          coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
          genre: "Techno",
          mood: "Dark & Heavy",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
        },
        {
          title: "Solar Eclipse",
          artist: "Helios Project",
          album: "Solar Cycles",
          duration: "6:03",
          bpm: 120,
          bitrate: "320 kbps",
          coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=60",
          genre: "Ambient",
          mood: "Relaxed",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
        },
        {
          title: "Glitch In The Rain",
          artist: "Pixelate",
          album: "Corrupted Memory",
          duration: "6:01",
          bpm: 95,
          bitrate: "256 kbps",
          coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60",
          genre: "Glitch Hop",
          mood: "Euphoric",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
        },
        {
          title: "Hyperdrive",
          artist: "Aether Vibe",
          album: "Metropolis Dreamer",
          duration: "5:42",
          bpm: 130,
          bitrate: "320 kbps",
          coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60",
          genre: "Synthwave",
          mood: "Energetic",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
        },
        {
          title: "Chilled Raindrops",
          artist: "Lofi Scholar",
          album: "Study Breaks Vol. 4",
          duration: "5:12",
          bpm: 80,
          bitrate: "320 kbps",
          coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=60",
          genre: "Lofi Hip Hop",
          mood: "Relaxed",
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
        }
      ];

      const insertedTracks = await Track.insertMany(seedTracks);
      console.log('✅ Seeding completed! Database populated.');

      // Also seed a default AI Generated playlist
      await Playlist.create({
        name: "Late Night Outrun",
        description: "Cruising down neon lit highways with synthesizers blaring. Perfect for midnight drives.",
        coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60",
        creator: "Melodify AI",
        tracks: [insertedTracks[0]._id, insertedTracks[1]._id, insertedTracks[6]._id],
        isAiGenerated: true
      });
      console.log('✅ Seeded default playlist.');
    }
  } catch (err) {
    console.error('❌ Database seeding error:', err.message);
  }
};

app.listen(PORT, async () => {
  console.log(`🚀 Melodify Server running in production-ready mode on port ${PORT}`);
  await seedDatabase();
});
