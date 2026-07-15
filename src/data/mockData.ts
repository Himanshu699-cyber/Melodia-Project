export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string; // e.g., "3:45"
  bpm: number;
  bitrate: string; // e.g., "320 kbps"
  coverUrl: string;
  genre: string;
  mood?: string;
  url?: string;
  lyrics?: string;
  liked: boolean;
  playCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  creator: string;
  tracks: Track[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  joinedDate: string;
  totalPlaylists: number;
  totalTracks: number;
}

export const MOCK_TRACKS: Track[] = [
  {
    id: "t1",
    title: "Neon Horizon",
    artist: "Aether Vibe",
    album: "Metropolis Dreamer",
    duration: "3:42",
    bpm: 122,
    bitrate: "320 kbps",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60",
    genre: "Synthwave",
    liked: true,
    playCount: 1542
  },
  {
    id: "t2",
    title: "Midnight Shift",
    artist: "Cyber Cruiser",
    album: "Outrun the Dawn",
    duration: "4:15",
    bpm: 118,
    bitrate: "320 kbps",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=60",
    genre: "Synthwave",
    liked: false,
    playCount: 890
  },
  {
    id: "t3",
    title: "Analog Whispers",
    artist: "Lofi Scholar",
    album: "Study Breaks Vol. 4",
    duration: "2:58",
    bpm: 84,
    bitrate: "256 kbps",
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&auto=format&fit=crop&q=60",
    genre: "Lofi Hip Hop",
    liked: true,
    playCount: 2310
  },
  {
    id: "t4",
    title: "Subterranean Bass",
    artist: "Glow Worm",
    album: "Deep Sessions",
    duration: "5:04",
    bpm: 128,
    bitrate: "320 kbps",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=60",
    genre: "Techno",
    liked: true,
    playCount: 654
  },
  {
    id: "t5",
    title: "Solar Eclipse",
    artist: "Helios Project",
    album: "Solar Cycles",
    duration: "3:30",
    bpm: 120,
    bitrate: "320 kbps",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150&auto=format&fit=crop&q=60",
    genre: "Ambient",
    liked: false,
    playCount: 421
  },
  {
    id: "t6",
    title: "Glitch In The Rain",
    artist: "Pixelate",
    album: "Corrupted Memory",
    duration: "3:12",
    bpm: 95,
    bitrate: "256 kbps",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=60",
    genre: "Glitch Hop",
    liked: false,
    playCount: 778
  },
  {
    id: "t7",
    title: "Hyperdrive",
    artist: "Aether Vibe",
    album: "Metropolis Dreamer",
    duration: "4:01",
    bpm: 130,
    bitrate: "320 kbps",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60",
    genre: "Synthwave",
    liked: true,
    playCount: 1205
  },
  {
    id: "t8",
    title: "Chilled Raindrops",
    artist: "Lofi Scholar",
    album: "Study Breaks Vol. 4",
    duration: "2:40",
    bpm: 80,
    bitrate: "320 kbps",
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&auto=format&fit=crop&q=60",
    genre: "Lofi Hip Hop",
    liked: false,
    playCount: 1980
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: "p1",
    name: "Late Night Outrun",
    description: "Cruising down neon lit highways with synthesizers blaring. Perfect for midnight drives.",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60",
    creator: "Melodify AI",
    tracks: [MOCK_TRACKS[0], MOCK_TRACKS[1], MOCK_TRACKS[6]],
    createdAt: "2026-06-15"
  },
  {
    id: "p2",
    name: "Focus & Chill",
    description: "Relaxing lofi beats, vinyl crackles, and warm melodies to boost your study focus.",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60",
    creator: "You",
    tracks: [MOCK_TRACKS[2], MOCK_TRACKS[7], MOCK_TRACKS[4]],
    createdAt: "2026-07-01"
  },
  {
    id: "p3",
    name: "Dark Techno Session",
    description: "Hypnotic, driving baseline rhythms recorded live in Berlin underground vaults.",
    coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=60",
    creator: "VibeCurator",
    tracks: [MOCK_TRACKS[3], MOCK_TRACKS[1]],
    createdAt: "2026-07-10"
  }
];

export const MOCK_USER: UserProfile = {
  name: "Alex Mercer",
  email: "alex.mercer@melodify.io",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
  plan: "Pro",
  joinedDate: "October 2025",
  totalPlaylists: 12,
  totalTracks: 145
};

export const GENRES = [
  "Synthwave",
  "Lofi Hip Hop",
  "Techno",
  "Ambient",
  "Glitch Hop",
  "House",
  "Chillwave",
  "Drum & Bass"
];

export const MOODS = [
  "Focused",
  "Energetic",
  "Relaxed",
  "Melancholy",
  "Dreamy",
  "Productive",
  "Dark & Heavy",
  "Euphoric"
];
