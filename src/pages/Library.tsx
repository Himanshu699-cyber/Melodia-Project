import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import type { RootState } from '../store';
import {
  fetchPlaylists,
  fetchLikedSongs,
  createPlaylist,
  deletePlaylist,
  editPlaylist,
  toggleLikeSong,
  addNotification,
} from '../store/playlistSlice';
import { usePlayback } from '../hooks/usePlayback';
import type { Track, Playlist } from '../data/mockData';

export interface LibraryProps {
  readonly className?: string;
}

export const Library: React.FC<LibraryProps> = ({ className = '' }) => {
  const dispatch = useDispatch();

  const { playlists, likedSongs, loading } = useSelector((state: RootState) => state.playlists);
  const { playTrack, currentTrack, isPlaying } = usePlayback();

  const [showLikedList, setShowLikedList] = useState(false);

  // Create Playlist Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');

  // Rename Playlist State
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [renameName, setRenameName] = useState('');
  const [renameDesc, setRenameDesc] = useState('');

  useEffect(() => {
    dispatch(fetchPlaylists() as any);
    dispatch(fetchLikedSongs() as any);
  }, [dispatch]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    await dispatch(createPlaylist({
      name: playlistName,
      description: playlistDesc,
    }) as any);

    setPlaylistName('');
    setPlaylistDesc('');
    setShowCreateModal(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylist || !renameName.trim()) return;

    await dispatch(editPlaylist({
      id: editingPlaylist.id,
      name: renameName,
      description: renameDesc,
    }) as any);

    setEditingPlaylist(null);
  };

  const handleDeletePlaylist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      await dispatch(deletePlaylist(id) as any);
    }
  };

  const handleSharePlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
    navigator.clipboard.writeText(shareUrl);
    dispatch(addNotification({
      message: `Copied link for "${playlist.name}" to clipboard!`,
      type: 'success'
    }));
  };

  const handleLikeToggle = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLikeSong(track) as any);
  };

  // Stub: no real download-tracking system exists yet.
  // Approximated from liked songs until a proper `isDownloaded` field/endpoint exists.
  const downloadedTracks = likedSongs.slice(0, 2);

  return (
    <Layout title="My Library" showSearch={false}>
      <div className={`space-y-xl ${className} select-none`}>
        {/* Header and Create Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-headline-xl text-white font-bold">My Library</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white text-label-md px-md py-sm rounded hover:bg-opacity-95 active:scale-95 transition-all flex items-center gap-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Playlist
          </button>
        </div>

        {/* Liked Songs + Downloads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {/* Liked Songs Card */}
          <div
            onClick={() => setShowLikedList(!showLikedList)}
            className="relative bg-gradient-to-br from-primary/30 to-[#181818] border border-charcoal rounded-lg p-lg h-[220px] flex flex-col justify-between cursor-pointer hover:border-[#404040] transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-[32px] self-end" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
            <div>
              <h3 className="text-2xl font-extrabold text-white">Liked Songs</h3>
              <p className="text-sm text-on-surface-variant mt-xs">{likedSongs.length} tracks</p>
            </div>
          </div>

          {/* Downloads Panel */}
          <div className="card-bg border border-charcoal rounded-lg p-lg h-[220px] flex flex-col">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-headline-md text-white font-bold flex items-center gap-xs">
                <span className="material-symbols-outlined text-[20px]">download_done</span>
                Downloads
              </h3>
              <span className="text-xs font-mono uppercase text-on-surface-variant hover:text-white cursor-pointer transition-colors">
                View All
              </span>
            </div>
            <div className="space-y-sm flex-1 overflow-y-auto">
              {downloadedTracks.length === 0 ? (
                <p className="text-xs text-on-surface-variant font-mono">No downloaded tracks yet.</p>
              ) : (
                downloadedTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-sm">
                    <img src={track.coverUrl} alt={track.title} className="w-10 h-10 object-cover rounded border border-charcoal shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                      <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                    </div>
                    <span className="material-symbols-outlined text-green-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Expanded Liked Songs list (progressive disclosure, not in default Figma state) */}
        {showLikedList && (
          <div className="space-y-md">
            <h3 className="text-headline-lg text-white font-bold">Liked Songs</h3>
            {likedSongs.length === 0 ? (
              <div className="p-xl text-center border border-dashed border-charcoal rounded-lg font-mono text-xs text-on-surface-variant">
                No favorited tracks. Tap the heart button on songs to add them.
              </div>
            ) : (
              <div className="card-bg border border-charcoal rounded-lg p-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-charcoal text-xs text-on-surface-variant font-mono uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4 hidden md:table-cell">Album</th>
                      <th className="py-3 px-4 text-right w-20">Duration</th>
                      <th className="py-3 px-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal text-sm text-white">
                    {likedSongs.map((track, idx) => {
                      const isCurrent = currentTrack?.id === track.id;
                      const isRowPlaying = isCurrent && isPlaying;

                      return (
                        <tr
                          key={track.id}
                          onClick={() => playTrack(track)}
                          className={`group hover:bg-[#202020] transition-colors cursor-pointer ${isCurrent ? 'bg-surface-container-high/40 text-primary' : ''
                            }`}
                        >
                          <td className="py-3 px-4 text-center font-mono text-on-surface-variant">
                            <span className="group-hover:hidden">{idx + 1}</span>
                            <span className="material-symbols-outlined text-primary text-[18px] hidden group-hover:inline-block">
                              {isRowPlaying ? 'pause' : 'play_arrow'}
                            </span>
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
                              className="text-primary hover:text-white transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
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
        )}

        {/* My Playlists */}
        <div className="space-y-md">
          <h3 className="text-headline-lg text-white font-bold">My Playlists</h3>
          {loading ? (
            <div className="p-xl text-center font-mono text-xs text-on-surface-variant">
              Loading library playlists...
            </div>
          ) : playlists.length === 0 ? (
            <div className="p-xl text-center border border-dashed border-charcoal rounded-lg font-mono text-xs text-on-surface-variant">
              No playlists created yet. Click "Create Playlist" above to start.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-md">
              {playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="group card-bg border border-charcoal hover:border-[#404040] p-sm rounded-lg flex flex-col gap-sm relative transition-colors cursor-pointer"
                >
                  <div className="aspect-square w-full rounded overflow-hidden relative shadow-lg">
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setEditingPlaylist(playlist);
                          setRenameName(playlist.name);
                          setRenameDesc(playlist.description);
                        }}
                        className="w-8 h-8 rounded-full bg-[#353534] hover:bg-[#474746] text-white flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => handleSharePlaylist(playlist, e)}
                        className="w-8 h-8 rounded-full bg-[#353534] hover:bg-[#474746] text-white flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                      </button>
                      <button
                        onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                        className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-label-md text-white truncate">{playlist.name}</h4>
                    <p className="text-body-sm text-on-surface-variant truncate mt-xs">
                      {playlist.creator || 'You'} • {playlist.tracks?.length || 0} tracks
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recently Played */}
        <div className="space-y-md">
          <h3 className="text-headline-lg text-white font-bold">Recently Played</h3>
          {likedSongs.length === 0 && playlists.length === 0 ? (
            <div className="p-xl text-center border border-dashed border-charcoal rounded-lg font-mono text-xs text-on-surface-variant">
              No songs played recently.
            </div>
          ) : (
            <div className="card-bg border border-charcoal rounded-lg p-md divide-y divide-charcoal">
              {likedSongs.slice(0, 2).map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className="flex items-center justify-between py-3 px-sm hover:bg-[#202020] rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-md min-w-0">
                    <span className="font-mono text-xs text-on-surface-variant w-5 text-center">{idx + 1}</span>
                    <img src={track.coverUrl} alt={track.title} className="w-10 h-10 object-cover rounded border border-charcoal shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                      <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-lg text-xs font-mono text-on-surface-variant shrink-0">
                    <span>Recently played</span>
                    <span>{track.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE PLAYLIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="card-bg border border-charcoal rounded-lg p-lg w-full max-w-[480px] z-10 space-y-md relative">
            <h3 className="text-headline-lg text-white font-bold">New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-md">
              <div className="space-y-xs">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full bg-[#131313] border border-charcoal rounded-md px-md py-sm text-white focus:outline-none focus:border-primary text-sm input-focus"
                  placeholder="e.g. Synthwave chill study mix"
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                  Description
                </label>
                <textarea
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  className="w-full bg-[#131313] border border-charcoal rounded-md px-md py-sm text-white focus:outline-none focus:border-primary text-sm min-h-[80px] resize-none input-focus"
                  placeholder="Describe your playlist..."
                />
              </div>
              <div className="flex gap-md pt-sm justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-md py-sm border border-charcoal hover:bg-[#202020] text-sm text-white rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-sm bg-primary hover:bg-opacity-90 text-sm text-white rounded font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENAME/EDIT PLAYLIST MODAL */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingPlaylist(null)} />
          <div className="card-bg border border-charcoal rounded-lg p-lg w-full max-w-[480px] z-10 space-y-md relative">
            <h3 className="text-headline-lg text-white font-bold">Edit Playlist</h3>
            <form onSubmit={handleEditSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  className="w-full bg-[#131313] border border-charcoal rounded-md px-md py-sm text-white focus:outline-none focus:border-primary text-sm input-focus"
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                  Description
                </label>
                <textarea
                  value={renameDesc}
                  onChange={(e) => setRenameDesc(e.target.value)}
                  className="w-full bg-[#131313] border border-charcoal rounded-md px-md py-sm text-white focus:outline-none focus:border-primary text-sm min-h-[80px] resize-none input-focus"
                />
              </div>
              <div className="flex gap-md pt-sm justify-end">
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  className="px-md py-sm border border-charcoal hover:bg-[#202020] text-sm text-white rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-sm bg-primary hover:bg-opacity-90 text-sm text-white rounded font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Library;