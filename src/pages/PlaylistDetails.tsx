import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Layout from '../components/Layout';
import { usePlayback } from '../hooks/usePlayback';
import { setQueue, setCurrentTrack, setIsPlaying } from '../store/playbackSlice';
import { toggleLikeSong, addNotification } from '../store/playlistSlice';
import type { Track, Playlist } from '../data/mockData';
import type { RootState } from '../store';

export interface PlaylistDetailsProps {
  readonly className?: string;
}

function sumDurations(tracks: Track[]): string {
  const totalSeconds = tracks.reduce((acc, t) => {
    const [m, s] = (t.duration || '0:00').split(':').map(Number);
    return acc + (m * 60 + (s || 0));
  }, 0);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
}

export const PlaylistDetails: React.FC<PlaylistDetailsProps> = ({ className = '' }) => {
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch();

  const { playTrack, currentTrack, isPlaying } = usePlayback();
  const { likedSongs } = useSelector((state: RootState) => state.playlists);

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      const token = localStorage.getItem('melodify_token') || sessionStorage.getItem('melodify_token');
      try {
        const response = await axios.get(`http://localhost:5000/api/playlists/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const p = response.data.data;
          setPlaylist({
            id: p._id,
            name: p.name,
            description: p.description || '',
            coverUrl: p.coverUrl,
            creator: p.creator,
            tracks: p.tracks.map((t: any) => ({
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
              playCount: t.playCount
            })),
            createdAt: p.createdAt
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Fetch playlist details failed:', err);
        setLoading(false);
      }
    };

    if (id) {
      fetchPlaylistDetails();
    }
  }, [id]);

  const handlePlayPlaylist = () => {
    if (playlist && playlist.tracks.length > 0) {
      dispatch(setQueue(playlist.tracks));
      dispatch(setCurrentTrack(playlist.tracks[0]));
      dispatch(setIsPlaying(true));
      dispatch(addNotification({
        message: `Queue loaded with playlist: "${playlist.name}"`,
        type: 'info'
      }));
    }
  };

  const handlePlaySingleTrack = (track: Track) => {
    // If not in current queue, add playlist tracks to queue
    if (playlist) {
      dispatch(setQueue(playlist.tracks));
      playTrack(track);
    }
  };

  const handleLikeToggle = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLikeSong(track) as any);
  };

  if (loading) {
    return (
      <Layout title="Playlist" showSearch={false}>
        <div className="p-xl text-center font-mono text-xs text-on-surface-variant">
          Loading playlist details...
        </div>
      </Layout>
    );
  }

  if (!playlist) {
    return (
      <Layout title="Playlist" showSearch={false}>
        <div className="p-xl text-center font-mono text-xs text-on-surface-variant border border-dashed border-charcoal rounded-lg">
          Playlist not found.
          <Link to="/library" className="text-primary hover:underline block mt-md">Return to Library</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={playlist.name} showSearch={false}>
      <div className={`space-y-xl ${className} select-none`}>
        {/* Playlist Banner Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-lg pb-xl">
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-48 h-48 object-cover rounded-lg border border-charcoal shadow-2xl shrink-0"
          />
          <div className="space-y-sm text-center sm:text-left min-w-0 flex-1">
            <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant font-bold">
              Public Playlist
            </span>
            <h1 className="text-4xl sm:text-5xl text-white font-extrabold truncate">
              {playlist.name}
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
              {playlist.description || 'No description provided.'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-xs text-xs font-mono text-on-surface-variant">
              <span className="flex items-center gap-1 text-white font-bold">
                <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                {playlist.creator || 'Melodify'}
              </span>
              <span>•</span>
              <span>{playlist.tracks.length} tracks</span>
              <span>•</span>
              <span>{sumDurations(playlist.tracks)}</span>
            </div>

            {/* Action Buttons */}
            {playlist.tracks.length > 0 && (
              <div className="pt-sm flex items-center justify-center sm:justify-start gap-sm">
                <button
                  onClick={handlePlayPlaylist}
                  className="bg-primary text-white text-label-md px-xl py-3 rounded hover:bg-opacity-95 active:scale-95 transition-all flex items-center gap-xs font-bold"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  Play All
                </button>
                <button
                  onClick={handlePlayPlaylist}
                  className="bg-[#181818] border border-charcoal text-white text-label-md px-xl py-3 rounded hover:bg-[#262626] active:scale-95 transition-all flex items-center gap-xs font-bold"
                >
                  <span className="material-symbols-outlined text-[20px]">shuffle</span>
                  Shuffle
                </button>
                <button className="w-11 h-11 rounded-full border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <button className="w-11 h-11 rounded-full border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tracks List */}
        <div>
          {playlist.tracks.length === 0 ? (
            <div className="p-xl text-center border border-dashed border-charcoal rounded-lg font-mono text-xs text-on-surface-variant">
              This playlist is empty. Add songs from the Search page.
            </div>
          ) : (
            <div className="card-bg border border-charcoal rounded-lg p-md overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-charcoal text-xs text-on-surface-variant font-mono uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 hidden md:table-cell">Album</th>
                    <th className="py-3 px-4 text-right w-20">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                    </th>
                    <th className="py-3 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal text-sm text-white">
                  {playlist.tracks.map((track, idx) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const isRowPlaying = isCurrent && isPlaying;
                    const liked = likedSongs.some(s => s.id === track.id);

                    return (
                      <tr
                        key={track.id}
                        onClick={() => handlePlaySingleTrack(track)}
                        className={`group hover:bg-[#202020] transition-colors cursor-pointer border-l-2 ${isCurrent ? 'border-primary bg-surface-container-high/40 text-primary' : 'border-transparent'
                          }`}
                      >
                        <td className="py-3 px-4 text-center font-mono text-on-surface-variant">
                          {isCurrent ? (
                            <span className="material-symbols-outlined text-primary text-[18px]">equalizer</span>
                          ) : (
                            <>
                              <span className="group-hover:hidden">{idx + 1}</span>
                              <span className="material-symbols-outlined text-primary text-[18px] hidden group-hover:inline-block">
                                play_arrow
                              </span>
                            </>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-10 h-10 object-cover rounded border border-charcoal flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className={`font-semibold text-sm truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                                {track.title}
                              </p>
                              <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell text-on-surface-variant truncate max-w-[150px]">
                          {track.album}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-on-surface-variant">
                          {track.duration}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={(e) => handleLikeToggle(track, e)}
                            className={`hover:text-primary transition-all opacity-0 group-hover:opacity-100 ${liked ? 'opacity-100 text-primary' : 'text-on-surface-variant'
                              }`}
                          >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                              favorite
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlaylistDetails;