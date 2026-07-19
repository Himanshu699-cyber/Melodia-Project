import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import type { RootState } from '../store';
import Layout from '../components/Layout';
import type { Track } from '../data/mockData';
import { usePlayback } from '../hooks/usePlayback';
import { addNotification } from '../store/playlistSlice';

interface Artist {
  _id: string;
  name: string;
  imageUrl: string;
  trackCount: number;
}

interface Album {
  _id: string;
  name: string;
  artistName: string;
  coverUrl: string;
  trackCount: number;
}

const TYPE_CONFIG: Record<string, { title: string; endpoint: string; kind: 'track' | 'artist' | 'album' }> = {
  trending: { title: 'Trending Now', endpoint: '/api/tracks?sort=popular', kind: 'track' },
  new: { title: 'New Releases', endpoint: '/api/tracks?sort=newest', kind: 'track' },
  'recently-played': { title: 'Recently Played', endpoint: '/api/tracks?sort=popular', kind: 'track' },
  artists: { title: 'Artists', endpoint: '/api/artists', kind: 'artist' },
  albums: { title: 'Albums', endpoint: '/api/albums', kind: 'album' },
};

const mapTrack = (t: any, user: any): Track => ({
  id: t._id,
  title: t.title,
  artist: t.artist,
  album: t.album,
  duration: t.duration,
  bpm: t.bpm,
  bitrate: t.bitrate,
  coverUrl: t.coverUrl,
  url: t.url,
  genre: t.genre,
  liked: user?.favorites?.some((fav: any) => (fav._id || fav) === t._id) || false,
  playCount: t.playCount,
});

export const CollectionPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { playTrack, currentTrack, isPlaying } = usePlayback();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const config = type ? TYPE_CONFIG[type] : undefined;

  useEffect(() => {
    if (!config) return;
    let mounted = true;
    setLoading(true);

    axios.get(`${import.meta.env.VITE_API_URL}${config.endpoint}`)
      .then((res) => {
        if (!mounted || !res.data.success) return;
        if (config.kind === 'track') {
          setTracks(res.data.data.map((t: any) => mapTrack(t, user)));
        } else if (config.kind === 'artist') {
          setArtists(res.data.data);
        } else if (config.kind === 'album') {
          setAlbums(res.data.data);
        }
      })
      .catch((err) => console.error('Collection fetch error:', err))
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [type, user]);

  const handleTrackPlay = (track: Track) => {
    playTrack(track);
    dispatch(addNotification({
      message: `Now playing: "${track.title}" by ${track.artist}`,
      type: 'info'
    }));
  };

  if (!config) {
    return (
      <Layout title="Not Found" showSearch={false}>
        <div className="p-xl text-center">
          <p className="text-on-surface-variant mb-md">This collection doesn't exist.</p>
          <button
            title="Back to Home"
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:underline"
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={config.title} showSearch={false}>
      <div className="space-y-lg">
        <button
          title="Back"
          onClick={() => navigate(-1)}
          className="flex items-center gap-xs text-sm text-on-surface-variant hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>

        <h2 className="text-headline-xl text-white font-bold">{config.title}</h2>

        {loading ? (
          <div className="p-xl text-center font-mono text-xs text-on-surface-variant">Loading...</div>
        ) : config.kind === 'track' ? (
          tracks.length === 0 ? (
            <div className="p-xl text-center font-mono text-xs text-on-surface-variant border border-dashed border-charcoal rounded">
              Nothing here yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md">
              {tracks.map((track) => {
                const isCurrent = currentTrack?.id === track.id;
                const isRowPlaying = isCurrent && isPlaying;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrackPlay(track)}
                    title={`Play ${track.title}`}
                    className="flex flex-col gap-sm cursor-pointer group"
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden relative border border-charcoal shadow-lg">
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {isRowPlaying ? 'pause_circle' : 'play_circle'}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>{track.title}</p>
                    <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                  </div>
                );
              })}
            </div>
          )
        ) : config.kind === 'artist' ? (
          artists.length === 0 ? (
            <div className="p-xl text-center font-mono text-xs text-on-surface-variant border border-dashed border-charcoal rounded">
              No artists yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-lg">
              {artists.map((artist) => (
                <div key={artist._id} title={artist.name} className="flex flex-col items-center gap-xs cursor-pointer group">
                  <img
                    src={artist.imageUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60'}
                    alt={artist.name}
                    className="w-full aspect-square rounded-full object-cover border border-charcoal group-hover:border-primary transition-colors"
                  />
                  <span className="text-sm text-white text-center truncate max-w-full">{artist.name}</span>
                  <span className="text-xs text-on-surface-variant">{artist.trackCount} tracks</span>
                </div>
              ))}
            </div>
          )
        ) : (
          albums.length === 0 ? (
            <div className="p-xl text-center font-mono text-xs text-on-surface-variant border border-dashed border-charcoal rounded">
              No albums yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md">
              {albums.map((album) => (
                <div key={album._id} title={album.name} className="flex flex-col gap-sm cursor-pointer group">
                  <div className="w-full aspect-square rounded-lg overflow-hidden border border-charcoal shadow-lg">
                    <img
                      src={album.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60'}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-label-md text-white truncate">{album.name}</h4>
                  <p className="text-body-sm text-on-surface-variant truncate">{album.artistName}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default CollectionPage;