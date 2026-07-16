import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Layout from '../components/Layout';
import type { RootState } from '../store';
import { addNotification } from '../store/playlistSlice';
import type { Track } from '../data/mockData';

export interface AdminDashboardProps {
  readonly className?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'stats' | 'tracks' | 'users'>('stats');
  
  // Stats State
  const [stats, setStats] = useState({ totalUsers: 0, totalTracks: 0, totalPlaylists: 0, totalPlays: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Tracks State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);

  // Track Form Fields
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackAlbum, setTrackAlbum] = useState('');
  const [trackDuration, setTrackDuration] = useState('3:30');
  const [trackBpm, setTrackBpm] = useState(120);
  const [trackGenre, setTrackGenre] = useState('Synthwave');
  const [trackMood, setTrackMood] = useState('Dreamy');
  const [trackUrl, setTrackUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [trackCoverUrl, setTrackCoverUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60');

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const getHeaders = () => {
    const token = localStorage.getItem('melodify_token') || sessionStorage.getItem('melodify_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, getHeaders());
      if (response.data.success) {
        setStats(response.data.data);
      }
      setStatsLoading(false);
    } catch (err) {
      console.error('Fetch stats failed:', err);
      setStatsLoading(false);
    }
  };

  const fetchTracks = async () => {
    setTracksLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tracks`);
      if (response.data.success) {
        const mapped = response.data.data.map((t: any) => ({
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
          liked: false,
          playCount: t.playCount
        }));
        setTracks(mapped);
      }
      setTracksLoading(false);
    } catch (err) {
      console.error('Fetch tracks failed:', err);
      setTracksLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, getHeaders());
      if (response.data.success) {
        setUsers(response.data.data);
      }
      setUsersLoading(false);
    } catch (err) {
      console.error('Fetch users failed:', err);
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'tracks') fetchTracks();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // Track CRUD actions
  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/tracks`,
        {
          title: trackTitle,
          artist: trackArtist,
          album: trackAlbum,
          duration: trackDuration,
          bpm: Number(trackBpm),
          genre: trackGenre,
          mood: trackMood,
          url: trackUrl,
          coverUrl: trackCoverUrl,
        },
        getHeaders()
      );
      if (response.data.success) {
        dispatch(addNotification({ message: `Song "${trackTitle}" uploaded!`, type: 'success' }));
        setShowAddTrackModal(false);
        fetchTracks();
        clearTrackForm();
      }
    } catch (err) {
      console.error('Add track failed:', err);
    }
  };

  const handleEditTrackClick = (track: Track) => {
  setEditingTrack(track);
  setTrackTitle(track.title || '');
  setTrackArtist(track.artist || '');
  setTrackAlbum(track.album || '');
  setTrackDuration(track.duration || '');
  setTrackBpm(track.bpm);
  setTrackGenre(track.genre || '');
  setTrackMood(track.mood || 'Dreamy');
  setTrackUrl(track.url || '');
  setTrackCoverUrl(track.coverUrl || '');
};
  const handleUpdateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/tracks/${editingTrack.id}`,
        {
          title: trackTitle,
          artist: trackArtist,
          album: trackAlbum,
          duration: trackDuration,
          bpm: Number(trackBpm),
          genre: trackGenre,
          mood: trackMood,
          url: trackUrl,
          coverUrl: trackCoverUrl,
        },
        getHeaders()
      );
      if (response.data.success) {
        dispatch(addNotification({ message: `Song metadata updated!`, type: 'success' }));
        setEditingTrack(null);
        fetchTracks();
        clearTrackForm();
      }
    } catch (err) {
      console.error('Update track failed:', err);
    }
  };

  const handleDeleteTrack = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this track from library?')) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/tracks/${id}`, getHeaders());
        if (response.data.success) {
          dispatch(addNotification({ message: 'Song deleted from library catalog.', type: 'info' }));
          fetchTracks();
        }
      } catch (err) {
        console.error('Delete track failed:', err);
      }
    }
  };

  const clearTrackForm = () => {
    setTrackTitle('');
    setTrackArtist('');
    setTrackAlbum('');
    setTrackDuration('3:30');
    setTrackBpm(120);
    setTrackGenre('Synthwave');
    setTrackMood('Dreamy');
    setTrackUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    setTrackCoverUrl('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60');
  };

  // User Administration
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        { role: newRole },
        getHeaders()
      );
      if (response.data.success) {
        dispatch(addNotification({ message: 'User role updated successfully.', type: 'success' }));
        fetchUsers();
      }
    } catch (err) {
      console.error('Update user role failed:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Delete user account? This cannot be undone.')) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, getHeaders());
        if (response.data.success) {
          dispatch(addNotification({ message: 'User account removed.', type: 'info' }));
          fetchUsers();
        }
      } catch (err) {
        console.error('Delete user failed:', err);
      }
    }
  };

  return (
    <Layout title="Admin Studio Dashboard" showSearch={false}>
      <div className={`space-y-lg ${className} select-none`}>
        {/* Navigation Tabs */}
        <div className="flex border-b border-charcoal text-sm gap-lg overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-sm font-label-md text-label-md transition-colors ${
              activeTab === 'stats' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            System Statistics
          </button>
          <button
            onClick={() => setActiveTab('tracks')}
            className={`pb-sm font-label-md text-label-md transition-colors ${
              activeTab === 'tracks' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            Manage Tracks Catalog
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-sm font-label-md text-label-md transition-colors ${
              activeTab === 'users' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            Manage User Accounts
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'stats' && (
          <div className="space-y-lg">
            {statsLoading ? (
              <div className="text-center font-mono text-xs text-on-surface-variant">Loading system metrics...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-md">
                <div className="card-bg p-lg border border-charcoal rounded-lg flex flex-col justify-between h-[120px]">
                  <span className="text-xs font-mono uppercase text-on-surface-variant">Total Users</span>
                  <span className="text-3xl font-extrabold text-white">{stats.totalUsers}</span>
                </div>
                <div className="card-bg p-lg border border-charcoal rounded-lg flex flex-col justify-between h-[120px]">
                  <span className="text-xs font-mono uppercase text-on-surface-variant">Total Tracks</span>
                  <span className="text-3xl font-extrabold text-white">{stats.totalTracks}</span>
                </div>
                <div className="card-bg p-lg border border-charcoal rounded-lg flex flex-col justify-between h-[120px]">
                  <span className="text-xs font-mono uppercase text-on-surface-variant">Playlists</span>
                  <span className="text-3xl font-extrabold text-white">{stats.totalPlaylists}</span>
                </div>
                <div className="card-bg p-lg border border-charcoal rounded-lg flex flex-col justify-between h-[120px]">
                  <span className="text-xs font-mono uppercase text-on-surface-variant">Total Play Stream logs</span>
                  <span className="text-3xl font-extrabold text-white">{stats.totalPlays}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracks' && (
          <div className="space-y-md">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-lg text-white font-bold">Catalog Track List</h3>
              <button
                onClick={() => {
                  clearTrackForm();
                  setShowAddTrackModal(true);
                }}
                className="bg-primary text-white text-xs font-bold px-md py-2 rounded hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                Upload New Track
              </button>
            </div>

            {tracksLoading ? (
              <div className="text-center font-mono text-xs text-on-surface-variant">Loading tracks...</div>
            ) : (
              <div className="card-bg border border-charcoal rounded-lg p-md overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-charcoal text-xs text-on-surface-variant font-mono uppercase">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Artist</th>
                      <th className="py-3 px-4">Album</th>
                      <th className="py-3 px-4">Genre</th>
                      <th className="py-3 px-4 text-right">Plays</th>
                      <th className="py-3 px-4 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal text-white">
                    {tracks.map((track) => (
                      <tr key={track.id} className="hover:bg-[#202020] transition-colors">
                        <td className="py-3 px-4 font-semibold">{track.title}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{track.artist}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{track.album}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{track.genre}</td>
                        <td className="py-3 px-4 text-right font-mono text-on-surface-variant">{track.playCount}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-sm">
                            <button
                              onClick={() => handleEditTrackClick(track)}
                              className="text-on-surface-variant hover:text-white"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTrack(track.id)}
                              className="text-primary hover:text-white"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-md">
            <h3 className="font-headline-lg text-white font-bold">Registered Users Directory</h3>
            {usersLoading ? (
              <div className="text-center font-mono text-xs text-on-surface-variant">Loading users database...</div>
            ) : (
              <div className="card-bg border border-charcoal rounded-lg p-md overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-charcoal text-xs text-on-surface-variant font-mono uppercase">
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal text-white">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-[#202020] transition-colors">
                        <td className="py-3 px-4 font-semibold">{u.username}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{u.email}</td>
                        <td className="py-3 px-4 font-mono text-xs">{u.plan}</td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                            className="bg-[#131313] border border-charcoal text-xs rounded px-sm py-1 font-sans text-white focus:outline-none"
                            disabled={currentUser?.id === u._id} // can't demote self
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-primary hover:text-white"
                            disabled={currentUser?.id === u._id}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD / EDIT TRACK MODAL */}
      {(showAddTrackModal || editingTrack) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => {
            setShowAddTrackModal(false);
            setEditingTrack(null);
          }} />
          <div className="card-bg border border-charcoal rounded-lg p-lg w-full max-w-[600px] z-10 space-y-md relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-headline-lg text-headline-lg text-white font-bold">
              {editingTrack ? 'Edit Track' : 'Upload Song metadata'}
            </h3>
            
            <form onSubmit={editingTrack ? handleUpdateTrack : handleAddTrack} className="space-y-md text-sm">
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase font-mono">Title</label>
                  <input
                    type="text" required value={trackTitle} onChange={e => setTrackTitle(e.target.value)}
                    className="w-full bg-[#131313] border border-charcoal rounded px-sm py-2 text-white text-xs focus:outline-none focus:border-primary input-focus"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase font-mono">Artist</label>
                  <input
                    type="text" required value={trackArtist} onChange={e => setTrackArtist(e.target.value)}
                    className="w-full bg-[#131313] border border-charcoal rounded px-sm py-2 text-white text-xs focus:outline-none focus:border-primary input-focus"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase font-mono">Album</label>
                  <input
                    type="text" required value={trackAlbum} onChange={e => setTrackAlbum(e.target.value)}
                    className="w-full bg-[#131313] border border-charcoal rounded px-sm py-2 text-white text-xs focus:outline-none focus:border-primary input-focus"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase font-mono">Duration (e.g. 3:45)</label>
                  <input
                    type="text" required value={trackDuration} onChange={e => setTrackDuration(e.target.value)}
                    className="w-full bg-[#131313] border border-charcoal rounded px-sm py-2 text-white text-xs focus:outline-none focus:border-primary input-focus"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-sm">
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase font-mono">BPM</label>
                  <input
                    type="number" required value={trackBpm} onChange={e => setTrackBpm(Number(e.target.value))}
                    className="w-full bg-[#131313] border border-charcoal rounded px-sm py-2 text-white text-xs focus:outline-none focus:border-primary input-focus"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase font-mono">Genre</label>
                  <input
                    type="text" required value={trackGenre} onChange={e => setTrackGenre(e.target.value)}
                    className="w-full bg-[#131313] border border-charcoal rounded px-sm py-2 text-white text-xs focus:outline-none focus:border-primary input-focus"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase font-mono">Mood</label>
                  <input
                    type="text" required value={trackMood} onChange={e => setTrackMood(e.target.value)}
                    className="w-full bg-[#131313] border border-charcoal rounded px-sm py-2 text-white text-xs focus:outline-none focus:border-primary input-focus"
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase font-mono">Audio URL (Firebase Storage link)</label>
                <input
                  type="text" required value={trackUrl} onChange={e => setTrackUrl(e.target.value)}
                  className="w-full bg-[#131313] border border-charcoal rounded px-sm py-2 text-white text-xs focus:outline-none focus:border-primary input-focus"
                />
              </div>

              <div className="space-y-xs">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase font-mono">Cover Image URL</label>
                <input
                  type="text" required value={trackCoverUrl} onChange={e => setTrackCoverUrl(e.target.value)}
                  className="w-full bg-[#131313] border border-charcoal rounded px-sm py-2 text-white text-xs focus:outline-none focus:border-primary input-focus"
                />
              </div>

              <div className="flex gap-md pt-sm justify-end border-t border-charcoal mt-md">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTrackModal(false);
                    setEditingTrack(null);
                  }}
                  className="px-md py-sm border border-charcoal hover:bg-[#202020] text-xs font-semibold text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-md py-sm bg-primary hover:bg-opacity-95 text-xs font-bold text-white rounded"
                >
                  {editingTrack ? 'Save Changes' : 'Upload Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
