import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import type { RootState } from '../store';
import Layout from '../components/Layout';
import type { Track } from '../data/mockData';
import { usePlayback } from '../hooks/usePlayback';
import { addNotification } from '../store/playlistSlice';

export interface DashboardProps {
  readonly className?: string;
}

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

export const Dashboard: React.FC<DashboardProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { playTrack, currentTrack, isPlaying } = usePlayback();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const newReleasesScrollRef = useRef<HTMLDivElement>(null);
  const artistsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [trendingRes, newRes, artistsRes, albumsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/tracks?sort=popular`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/tracks?sort=newest`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/artists`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/albums`),
        ]);

        if (!mounted) return;

        if (trendingRes.data.success) {
          setTracks(trendingRes.data.data.map((t: any) => mapTrack(t, user)));
        }
        if (newRes.data.success) {
          setNewReleases(newRes.data.data.map((t: any) => mapTrack(t, user)));
        }
        if (artistsRes.data.success) {
          setArtists(artistsRes.data.data);
        }
        if (albumsRes.data.success) {
          setAlbums(albumsRes.data.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, [user]);

  const handleTrackPlay = (track: Track) => {
    playTrack(track);
    dispatch(addNotification({
      message: `Now playing: "${track.title}" by ${track.artist}`,
      type: 'info'
    }));
  };

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = 320;
    ref.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const heroTrack = tracks.length > 0 ? tracks[0] : null;

  return (
    <Layout title="Home" showSearch={false}>
      <div className={`space-y-xl ${className}`}>
        {/* Hero Banner */}
        {heroTrack && (
          <div
            className="relative w-full aspect-[21/9] rounded-lg overflow-hidden border border-charcoal bg-cover bg-center flex items-end"
            style={{ backgroundImage: `url(${heroTrack.coverUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative z-10 p-lg space-y-xs max-w-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                Exclusive Release
              </span>
              <h2 className="text-headline-xl text-white font-bold">{heroTrack.title}</h2>
              <p className="text-body-sm text-on-surface-variant">
                {heroTrack.artist} — {heroTrack.genre} track, now streaming in high fidelity.
              </p>
              <button
                title="Play Now"
                onClick={() => handleTrackPlay(heroTrack)}
                className="mt-sm bg-primary text-white text-label-md font-bold px-lg py-2 rounded-full hover:bg-opacity-90 transition-all flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                Play Now
              </button>
            </div>
          </div>
        )}

        {/* Trending — horizontal carousel with left/right toggle */}
        <div className="space-y-md">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <h3 className="text-headline-lg text-white font-bold">Trending Now</h3>
            <div className="flex items-center gap-md">
              <Link to="/collection/trending" title="See all trending" className="text-xs font-mono uppercase text-on-surface-variant hover:text-white transition-colors">
                See All
              </Link>
              <div className="flex items-center gap-xs">
                <button
                  title="Scroll left"
                  onClick={() => scrollCarousel(trendingScrollRef, 'left')}
                  className="w-8 h-8 rounded-full border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  title="Scroll right"
                  onClick={() => scrollCarousel(trendingScrollRef, 'right')}
                  className="w-8 h-8 rounded-full border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-xl text-center font-mono text-xs text-on-surface-variant">Loading tracks...</div>
          ) : tracks.length === 0 ? (
            <div className="p-xl text-center font-mono text-xs text-on-surface-variant border border-dashed border-charcoal rounded">
              No tracks found.
            </div>
          ) : (
            <div ref={trendingScrollRef} className="flex gap-md overflow-x-auto scroll-smooth pb-sm no-scrollbar">
              {tracks.slice(0, 10).map((track) => {
                const isCurrent = currentTrack?.id === track.id;
                const isRowPlaying = isCurrent && isPlaying;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrackPlay(track)}
                    title={`Play ${track.title}`}
                    className="flex-shrink-0 w-[160px] group cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden relative border border-charcoal shadow-lg mb-sm">
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
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
          )}
        </div>

        {/* New Releases */}
        {newReleases.length > 0 && (
          <div className="space-y-md">
            <div className="flex flex-wrap items-center justify-between gap-sm">
              <h3 className="text-headline-lg text-white font-bold">New Releases</h3>
              <div className="flex items-center gap-md">
                <Link to="/collection/new" title="See all new releases" className="text-xs font-mono uppercase text-on-surface-variant hover:text-white transition-colors">
                  See All
                </Link>
                <div className="flex items-center gap-xs">
                  <button
                    title="Scroll left"
                    onClick={() => scrollCarousel(newReleasesScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    title="Scroll right"
                    onClick={() => scrollCarousel(newReleasesScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
            <div ref={newReleasesScrollRef} className="flex gap-md overflow-x-auto scroll-smooth pb-sm no-scrollbar">
              {newReleases.slice(0, 10).map((track) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackPlay(track)}
                  title={`Play ${track.title}`}
                  className="flex-shrink-0 w-[160px] group cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden relative border border-charcoal shadow-lg mb-sm">
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">New</span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                  <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Played */}
        <div className="space-y-md">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <h3 className="text-headline-lg text-white font-bold">Recently Played</h3>
            <Link to="/collection/recently-played" title="See all recently played" className="text-xs font-mono uppercase text-on-surface-variant hover:text-white transition-colors">
              See All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md">
            {tracks.slice(0, 10).map((track) => (
              <div
                key={track.id}
                onClick={() => handleTrackPlay(track)}
                title={`Play ${track.title}`}
                className="flex flex-col gap-sm p-sm rounded-lg card-bg border border-charcoal hover:border-[#404040] transition-colors cursor-pointer group"
              >
                <div className="w-full aspect-square rounded overflow-hidden relative shadow-lg">
                  <img alt={track.title} className="w-full h-full object-cover" src={track.coverUrl} />
                  <div className="absolute inset-0 bg-black/40 flex items-end justify-end p-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-label-md text-white truncate">{track.title}</h4>
                  <p className="text-body-sm text-on-surface-variant truncate mt-xs">Album • {track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Artists */}
        {artists.length > 0 && (
          <div className="space-y-md">
            <div className="flex flex-wrap items-center justify-between gap-sm">
              <h3 className="text-headline-lg text-white font-bold">Artists</h3>
              <div className="flex items-center gap-md">
                <Link to="/collection/artists" title="See all artists" className="text-xs font-mono uppercase text-on-surface-variant hover:text-white transition-colors">
                  See All
                </Link>
                <div className="flex items-center gap-xs">
                  <button
                    title="Scroll left"
                    onClick={() => scrollCarousel(artistsScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    title="Scroll right"
                    onClick={() => scrollCarousel(artistsScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
            <div ref={artistsScrollRef} className="flex gap-lg overflow-x-auto scroll-smooth pb-sm no-scrollbar">
              {artists.slice(0, 10).map((artist) => (
                <div key={artist._id} title={artist.name} className="flex-shrink-0 flex flex-col items-center gap-xs cursor-pointer group">
                  <img
                    src={artist.imageUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60'}
                    alt={artist.name}
                    className="w-24 h-24 rounded-full object-cover border border-charcoal group-hover:border-primary transition-colors"
                  />
                  <span className="text-sm text-white text-center truncate max-w-[100px]">{artist.name}</span>
                  <span className="text-xs text-on-surface-variant">{artist.trackCount} tracks</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <div className="space-y-md">
            <div className="flex flex-wrap items-center justify-between gap-sm">
              <h3 className="text-headline-lg text-white font-bold">Albums</h3>
              <Link to="/collection/albums" title="See all albums" className="text-xs font-mono uppercase text-on-surface-variant hover:text-white transition-colors">
                See All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md">
              {albums.slice(0, 10).map((album) => (
                <div key={album._id} title={album.name} className="flex flex-col gap-sm cursor-pointer group">
                  <div className="w-full aspect-square rounded-lg overflow-hidden border border-charcoal shadow-lg">
                    <img
                      src={album.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60'}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="text-label-md text-white truncate">{album.name}</h4>
                    <p className="text-body-sm text-on-surface-variant truncate mt-xs">{album.artistName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;