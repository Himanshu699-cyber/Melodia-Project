import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Track, Playlist } from '../data/mockData';

const PLAYLIST_API_URL = `${import.meta.env.VITE_API_URL}/api/playlists`;
const TRACK_API_URL = `${import.meta.env.VITE_API_URL}/api/tracks`;

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface PlaylistState {
  playlists: Playlist[];
  likedSongs: Track[];
  loading: boolean;
  error: string | null;
  notifications: AppNotification[];
}

const initialState: PlaylistState = {
  playlists: [],
  likedSongs: [],
  loading: false,
  error: null,
  notifications: [],
};

// Helper for JWT Token
const getAuthHeaders = () => {
  const token = localStorage.getItem('melodify_token') || sessionStorage.getItem('melodify_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Async Actions
export const fetchPlaylists = createAsyncThunk(
  'playlists/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(PLAYLIST_API_URL, getAuthHeaders());
      if (response.data.success) {
        // Map database response to Playlist model format
        return response.data.data.map((p: any) => ({
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
            liked: false, // will update dynamically on client
            playCount: t.playCount
          })),
          createdAt: p.createdAt
        }));
      }
      return thunkAPI.rejectWithValue(response.data.message || 'Fetch failed');
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch playlists');
    }
  }
);

export const createPlaylist = createAsyncThunk(
  'playlists/create',
  async (playlistDetails: { name: string; description: string; coverUrl?: string }, thunkAPI) => {
    try {
      const response = await axios.post(PLAYLIST_API_URL, playlistDetails, getAuthHeaders());
      if (response.data.success) {
        const p = response.data.data;
        const newPlaylist: Playlist = {
          id: p._id,
          name: p.name,
          description: p.description || '',
          coverUrl: p.coverUrl,
          creator: p.creator,
          tracks: [],
          createdAt: p.createdAt
        };
        
        // Trigger notification
        thunkAPI.dispatch(addNotification({
          message: `Playlist "${newPlaylist.name}" created successfully!`,
          type: 'success'
        }));

        return newPlaylist;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create playlist');
    }
  }
);

export const deletePlaylist = createAsyncThunk(
  'playlists/delete',
  async (id: string, thunkAPI) => {
    try {
      const response = await axios.delete(`${PLAYLIST_API_URL}/${id}`, getAuthHeaders());
      if (response.data.success) {
        thunkAPI.dispatch(addNotification({
          message: `Playlist deleted successfully!`,
          type: 'info'
        }));
        return id;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to delete playlist');
    }
  }
);

export const editPlaylist = createAsyncThunk(
  'playlists/edit',
  async (details: { id: string; name?: string; description?: string; coverUrl?: string; tracks?: string[] }, thunkAPI) => {
    try {
      const response = await axios.put(`${PLAYLIST_API_URL}/${details.id}`, details, getAuthHeaders());
      if (response.data.success) {
        const p = response.data.data;
        const updated: Playlist = {
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
        };

        thunkAPI.dispatch(addNotification({
          message: `Playlist "${updated.name}" updated successfully!`,
          type: 'success'
        }));

        return updated;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update playlist');
    }
  }
);

export const toggleLikeSong = createAsyncThunk(
  'playlists/toggleLike',
  async (track: Track, thunkAPI) => {
    try {
      const response = await axios.post(`${TRACK_API_URL}/${track.id}/favorite`, {}, getAuthHeaders());
      if (response.data.success) {
        const { isLiked } = response.data;
        
        // Trigger notification
        thunkAPI.dispatch(addNotification({
          message: isLiked ? `Added "${track.title}" to Liked Songs` : `Removed "${track.title}" from Liked Songs`,
          type: 'success'
        }));

        return { track, isLiked };
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to toggle like');
    }
  }
);

export const fetchLikedSongs = createAsyncThunk(
  'playlists/fetchLiked',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${TRACK_API_URL}/favorites`, getAuthHeaders());
      if (response.data.success) {
        return response.data.data.map((t: any) => ({
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
          liked: true,
          playCount: t.playCount
        }));
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch favorites');
    }
  }
);

export const generateAiPlaylistAction = createAsyncThunk(
  'playlists/generateAi',
  async (filters: { mood: string; genre: string; favoriteArtist?: string; description?: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${PLAYLIST_API_URL}/generate-ai`, filters, getAuthHeaders());
      if (response.data.success) {
        const p = response.data.playlist;
        const newPlaylist: Playlist = {
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
        };

        thunkAPI.dispatch(addNotification({
          message: `AI Playlist "${newPlaylist.name}" generated!`,
          type: 'success'
        }));

        return newPlaylist;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'AI playlist generation failed');
    }
  }
);

export const generateStudioSongAction = createAsyncThunk(
  'playlists/generateStudioSong',
  async (params: { prompt: string; genre: string; mood: string; language: string; tempo: string; duration: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${PLAYLIST_API_URL}/studio-generate`, params, getAuthHeaders());
      if (response.data.success) {
        const t = response.data.track;
        const generatedTrack: Track = {
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
        };

        thunkAPI.dispatch(addNotification({
          message: `AI Studio Song "${generatedTrack.title}" generated successfully!`,
          type: 'success'
        }));

        return generatedTrack;
      }
      return thunkAPI.rejectWithValue(response.data.message);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Studio song generation failed');
    }
  }
);

const playlistSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<{ message: string; type: AppNotification['type'] }>) => {
      const newNotification: AppNotification = {
        id: Math.random().toString(36).substr(2, 9),
        message: action.payload.message,
        type: action.payload.type,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(newNotification);
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => { n.read = true; });
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) notif.read = true;
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Playlists
      .addCase(fetchPlaylists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists = action.payload;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Playlist
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.playlists.push(action.payload);
      })
      // Delete Playlist
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.playlists = state.playlists.filter(p => p.id !== action.payload);
      })
      // Edit Playlist
      .addCase(editPlaylist.fulfilled, (state, action) => {
        const idx = state.playlists.findIndex(p => p.id === action.payload.id);
        if (idx > -1) {
          state.playlists[idx] = action.payload;
        }
      })
      // Fetch Liked Songs
      .addCase(fetchLikedSongs.fulfilled, (state, action) => {
        state.likedSongs = action.payload;
      })
      // Toggle Like Song
      .addCase(toggleLikeSong.fulfilled, (state, action) => {
        const { track, isLiked } = action.payload;
        if (isLiked) {
          if (!state.likedSongs.some(s => s.id === track.id)) {
            state.likedSongs.push({ ...track, liked: true });
          }
        } else {
          state.likedSongs = state.likedSongs.filter(s => s.id !== track.id);
        }
      })
      // Generate AI Playlist
      .addCase(generateAiPlaylistAction.fulfilled, (state, action) => {
        state.playlists.push(action.payload);
      });
  },
});

export const { addNotification, markAllNotificationsRead, clearNotifications, dismissNotification } = playlistSlice.actions;
export default playlistSlice.reducer;
