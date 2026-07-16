import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/Layout';
import type { RootState } from '../store';
import { loadProfile, logout } from '../store/authSlice';
import axios from 'axios';
import { addNotification } from '../store/playlistSlice';

export interface ProfileProps {
  readonly className?: string;
}

// Placeholder data — replace with real API/state once analytics & genre-tagging exist
const MOCK_LISTENING_STATS = {
  hoursStreamed: 1240,
  hoursStreamedChange: '+12%',
  topArtist: 'Kavinsky',
  newDiscoveries: 86,
};

const MOCK_FAVORITE_GENRES = ['Synthwave', 'Dark Synth', 'Techno', 'Ambient'];

const MOCK_BIO = 'Electronic music enthusiast, curator, and producer. Always hunting for the perfect nocturnal groove.';

export const Profile: React.FC<ProfileProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { playlists, likedSongs } = useSelector((state: RootState) => state.playlists);

  const [username, setUsername] = useState(user?.username || '');
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !user) return;

    setUpdating(true);
    const token = localStorage.getItem('melodify_token') || sessionStorage.getItem('melodify_token');
    try {
      const response = await axios.put(
       `${import.meta.env.VITE_API_URL}/api/admin/users/${user.id}`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        dispatch(loadProfile() as any);
        dispatch(addNotification({
          message: 'Profile details updated successfully!',
          type: 'success'
        }));
        setEditing(false);
      }
    } catch (err) {
      console.error('Update username error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const recentlyPlayed = user?.recentlyPlayed || [];

  return (
    <Layout title="User Profile" showSearch={true}>
      <div className={`space-y-xl ${className} select-none`}>
        {/* Profile Card Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-lg">
          <img
            src={user?.avatarUrl}
            alt={user?.username}
            className="w-32 h-32 rounded-lg object-cover border border-outline-variant shadow-2xl shrink-0"
          />
          <div className="flex-grow min-w-0 space-y-sm">
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="flex flex-col sm:flex-row items-center gap-sm">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#131313] border border-charcoal text-white text-sm font-semibold rounded px-sm py-2 focus:outline-none focus:border-primary input-focus max-w-[200px]"
                />
                <div className="flex gap-xs">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-md py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-opacity-90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(user?.username || '');
                      setEditing(false);
                    }}
                    className="px-md py-2 border border-charcoal text-xs font-semibold rounded hover:bg-[#202020] text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-md">
                <h1 className="text-4xl font-extrabold text-white truncate max-w-[300px]">{user?.username}</h1>
                <span className="flex items-center gap-xs bg-primary text-white text-xs font-bold uppercase px-sm py-1 rounded-full shrink-0">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  {user?.plan || 'Premium'}
                </span>
              </div>
            )}

            <p className="text-sm text-on-surface-variant max-w-xl leading-relaxed">
              {user?.bio || MOCK_BIO}
            </p>

            <div className="flex items-center gap-sm pt-xs">
              <button
                onClick={() => setEditing(true)}
                className="px-lg py-2 bg-primary text-white text-sm font-semibold rounded hover:bg-opacity-90 transition-colors"
              >
                Edit Profile
              </button>
              <Link
                to="/settings"
                className="flex items-center gap-xs px-lg py-2 border border-charcoal text-sm font-semibold rounded hover:bg-[#202020] text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Settings
              </Link>
              <button
                onClick={() => dispatch(logout() as any)}
                className="ml-auto flex items-center gap-xs text-sm text-on-surface-variant hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-charcoal" />

        {/* Listening Statistics + Favorite Genres */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
          <div className="lg:col-span-3">
            <h3 className="text-lg font-bold text-white mb-md">Listening Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
              <div className="card-bg p-md border border-charcoal rounded-lg">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant tracking-wider">Hours Streamed</span>
                <div className="flex items-baseline gap-xs mt-xs">
                  <span className="text-3xl font-extrabold text-white">{MOCK_LISTENING_STATS.hoursStreamed.toLocaleString()}</span>
                  <span className="text-xs font-bold text-green-400">↑{MOCK_LISTENING_STATS.hoursStreamedChange.replace('+', '')}</span>
                </div>
              </div>
              <div className="card-bg p-md border border-charcoal rounded-lg">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant tracking-wider">Top Artist</span>
                <div className="flex items-center gap-sm mt-xs">
                  <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                  </div>
                  <span className="text-lg font-extrabold text-white truncate">{MOCK_LISTENING_STATS.topArtist}</span>
                </div>
              </div>
              <div className="card-bg p-md border border-charcoal rounded-lg">
                <span className="text-[10px] uppercase font-mono text-on-surface-variant tracking-wider">New Discoveries</span>
                <div className="flex items-baseline gap-xs mt-xs">
                  <span className="text-3xl font-extrabold text-white">{MOCK_LISTENING_STATS.newDiscoveries}</span>
                  <span className="text-xs text-on-surface-variant">Tracks this month</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-md">Favorite Genres</h3>
            <div className="card-bg p-md border border-charcoal rounded-lg flex flex-wrap gap-xs">
              {MOCK_FAVORITE_GENRES.map((genre) => (
                <span
                  key={genre}
                  className="px-sm py-1.5 bg-[#202020] text-white text-xs font-semibold rounded-full"
                >
                  {genre}
                </span>
              ))}
              <button className="px-sm py-1.5 border border-charcoal text-on-surface-variant hover:text-white text-xs font-semibold rounded-full transition-colors">
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Playlists Created */}
        <div>
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-lg font-bold text-white">Playlists Created</h3>
            <Link to="/library" className="text-xs font-semibold text-on-surface-variant hover:text-white uppercase tracking-wider">
              View All
            </Link>
          </div>
          {playlists.length === 0 ? (
            <p className="text-sm text-on-surface-variant">You haven't created any playlists yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md">
              {playlists.slice(0, 4).map((playlist: any) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden border border-charcoal mb-sm">
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{playlist.name}</p>
                  <p className="text-xs text-on-surface-variant">{playlist.songs?.length ?? 0} Tracks</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recently Played */}
        <div>
          <h3 className="text-lg font-bold text-white mb-md">Recently Played</h3>
          {recentlyPlayed.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No listening history yet.</p>
          ) : (
            <div className="card-bg border border-charcoal rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-charcoal text-on-surface-variant text-xs uppercase font-mono">
                    <th className="p-md w-12">#</th>
                    <th className="p-md">Track Title</th>
                    <th className="p-md">Artist</th>
                    <th className="p-md text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlyPlayed.slice(0, 5).map((track: any, i: number) => (
                    <tr key={track.id || i} className="border-b border-charcoal last:border-0 hover:bg-[#181818] transition-colors">
                      <td className="p-md text-on-surface-variant">{i + 1}</td>
                      <td className="p-md text-white font-semibold">{track.title}</td>
                      <td className="p-md text-on-surface-variant">{track.artist}</td>
                      <td className="p-md text-on-surface-variant text-right font-mono">{track.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;