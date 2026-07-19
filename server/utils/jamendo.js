import axios from 'axios';

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0';

// Converts Jamendo's raw seconds duration into "M:SS" to match your existing format
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export async function searchJamendoTracks(query, limit = 10) {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (!clientId) {
    console.warn('JAMENDO_CLIENT_ID not set — skipping Jamendo search');
    return [];
  }

  try {
    const response = await axios.get(`${JAMENDO_BASE}/tracks/`, {
      params: {
        client_id: clientId,
        format: 'json',
        limit,
        namesearch: query,
        include: 'musicinfo',
        audioformat: 'mp32',
      },
    });

    const results = response.data.results || [];

    return results.map((t) => ({
      jamendoId: t.id,
      title: t.name,
      artist: t.artist_name,
      album: t.album_name || 'Single',
      duration: formatDuration(t.duration),
      bpm: t.musicinfo?.speed === 'high' ? 140 : t.musicinfo?.speed === 'low' ? 90 : 120,
      bitrate: '192 kbps',
      coverUrl: t.album_image || t.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60',
      url: t.audio,
      genre: t.musicinfo?.tags?.genres?.[0] || 'Various',
      mood: t.musicinfo?.tags?.vartags?.[0] || 'Dreamy',
    }));
  } catch (error) {
    console.error('Jamendo API error:', error.message);
    return [];
  }
}