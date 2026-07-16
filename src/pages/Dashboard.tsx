import React, { useEffect, useState } from 'react';
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

export const Dashboard: React.FC<DashboardProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayback();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalListenedHours: 12.4, favGenre: 'Synthwave', likedCount: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tracks`);
        if (response.data.success) {
          // Map database response to Track format
          const mappedTracks = response.data.data.map((t: any) => ({
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
            playCount: t.playCount
          }));
          setTracks(mappedTracks);
        }

        // Get favorites count
        if (user) {
          setStats((prev) => ({
            ...prev,
            likedCount: user.favorites?.length || 0,
          }));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard tracks:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Greeting based on hours
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleTrackPlay = (track: Track) => {
    playTrack(track);
    dispatch(addNotification({
      message: `Now playing: "${track.title}" by ${track.artist}`,
      type: 'info'
    }));
  };
  // Derived data for design sections (no dedicated backend endpoints yet)
  const heroTrack = tracks.length > 0
    ? [...tracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))[0]
    : null;

  const topArtists = Array.from(
    new Map(tracks.map(t => [t.artist, t])).values()
  ).slice(0, 3);
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

        {/* Trending Tracks + AI DJ Mix / Top Artists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Trending Tracks (2/3 width) */}
          <div className="lg:col-span-2 space-y-md">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-lg text-white font-bold">Trending Tracks</h3>
              <button className="text-xs font-mono uppercase text-on-surface-variant hover:text-white transition-colors">
                See All
              </button>
            </div>

            {loading ? (
              <div className="p-xl text-center font-mono text-xs text-on-surface-variant">
                Loading track library...
              </div>
            ) : tracks.length === 0 ? (
              <div className="p-xl text-center font-mono text-xs text-on-surface-variant border border-dashed border-charcoal rounded">
                No tracks found. Seed files by launching the server.
              </div>
            ) : (
              <div className="card-bg border border-charcoal rounded-lg p-md overflow-hidden">
                <div className="divide-y divide-charcoal">
                  {tracks.slice(0, 4).map((track, idx) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const isRowPlaying = isCurrent && isPlaying;
                    return (
                      <div
                        key={track.id}
                        onClick={() => handleTrackPlay(track)}
                        className={`flex items-center justify-between p-sm hover:bg-[#202020] transition-colors rounded cursor-pointer group ${isCurrent ? 'bg-[#202020] text-primary' : 'text-on-surface'
                          }`}
                      >
                        <div className="flex items-center gap-md min-w-0">
                          <span className="font-mono text-on-surface-variant text-xs w-5 text-center group-hover:hidden">
                            {idx + 1}
                          </span>
                          <span className="material-symbols-outlined text-primary text-[18px] w-5 text-center hidden group-hover:inline-block">
                            {isRowPlaying ? 'pause' : 'play_arrow'}
                          </span>
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-10 h-10 object-cover rounded border border-charcoal shrink-0"
                          />
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                              {track.title}
                            </p>
                            <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-xl text-xs font-mono text-on-surface-variant">
                          <span className="hidden sm:inline">{track.album}</span>
                          <span>{track.duration}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* AI DJ Mix + Top Artists (1/3 width) */}
          <div className="space-y-lg">
            <div className="space-y-sm">
              <h3 className="text-headline-lg text-white font-bold flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                AI DJ Mix
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Based on your recent listening history and favorite genres.
              </p>
              {tracks[0] && (
                <div
                  onClick={() => handleTrackPlay(tracks[0])}
                  className="card-bg border border-charcoal rounded-lg p-sm flex items-center gap-sm cursor-pointer hover:bg-[#202020] transition-colors"
                >
                  <img
                    src={tracks[0].coverUrl}
                    alt="AI Mix"
                    className="w-12 h-12 object-cover rounded border border-charcoal"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">Deep Focus Protocol</p>
                    <p className="text-xs text-on-surface-variant">Updates every 4 hours</p>
                  </div>
                </div>
              )}
            </div>

            {topArtists.length > 0 && (
              <div className="space-y-sm">
                <h3 className="text-headline-lg text-white font-bold">Top Artists</h3>
                <div className="flex gap-md">
                  {topArtists.map((track) => (
                    <div key={track.artist} className="flex flex-col items-center gap-xs">
                      <img
                        src={track.coverUrl}
                        alt={track.artist}
                        className="w-16 h-16 rounded-full object-cover border border-charcoal"
                      />
                      <span className="text-xs text-white text-center truncate max-w-[70px]">{track.artist}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recently Played */}
        <div className="space-y-md">
          <h3 className="text-headline-lg text-white font-bold">Recently Played</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md">
            {tracks.slice(0, 5).map((track) => (
              <div
                key={track.id}
                onClick={() => handleTrackPlay(track)}
                className="flex flex-col gap-sm p-sm rounded-lg card-bg border border-charcoal hover:border-[#404040] transition-colors cursor-pointer group"
              >
                <div className="w-full aspect-square rounded overflow-hidden relative shadow-lg">
                  <img alt={track.title} className="w-full h-full object-cover" src={track.coverUrl} />
                  <div className="absolute inset-0 bg-black/40 flex items-end justify-end p-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_arrow
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-label-md text-white truncate">{track.title}</h4>
                  <p className="text-body-sm text-on-surface-variant truncate mt-xs">
                    Album • {track.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
