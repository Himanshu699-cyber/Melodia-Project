import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Track } from '../data/mockData';

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Track[];
  currentQueueIndex: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  recentlyPlayed: Track[];
}

const initialState: PlaybackState = {
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  volume: Number(localStorage.getItem('melodify_volume') || '80'),
  queue: [],
  currentQueueIndex: -1,
  shuffle: false,
  repeat: 'off',
  recentlyPlayed: [],
};

const playbackSlice = createSlice({
  name: 'playback',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<Track | null>) => {
      state.currentTrack = action.payload;
      if (action.payload) {
        // Find index in queue
        const idx = state.queue.findIndex(t => t.id === action.payload?.id);
        if (idx > -1) {
          state.currentQueueIndex = idx;
        } else {
          // If not in queue, add it and make it active
          state.queue.push(action.payload);
          state.currentQueueIndex = state.queue.length - 1;
        }

        // Add to recently played (limit to 10)
        state.recentlyPlayed = [
          action.payload,
          ...state.recentlyPlayed.filter(t => t.id !== action.payload?.id)
        ].slice(0, 10);
      }
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setVolumeState: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
      localStorage.setItem('melodify_volume', action.payload.toString());
    },
    setQueue: (state, action: PayloadAction<Track[]>) => {
      state.queue = action.payload;
      state.currentQueueIndex = 0;
      if (action.payload.length > 0) {
        state.currentTrack = action.payload[0];
      }
    },
    addToQueue: (state, action: PayloadAction<Track>) => {
      if (!state.queue.some(t => t.id === action.payload.id)) {
        state.queue.push(action.payload);
      }
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(t => t.id !== action.payload);
    },
    clearQueue: (state) => {
      state.queue = [];
      state.currentTrack = null;
      state.isPlaying = false;
      state.currentQueueIndex = -1;
      state.progress = 0;
    },
    nextTrack: (state) => {
      if (state.queue.length === 0) return;

      if (state.repeat === 'one' && state.currentTrack) {
        state.progress = 0;
        return;
      }

      if (state.shuffle) {
        const nextIndex = Math.floor(Math.random() * state.queue.length);
        state.currentQueueIndex = nextIndex;
        state.currentTrack = state.queue[nextIndex];
        state.progress = 0;
      } else {
        const nextIndex = state.currentQueueIndex + 1;
        if (nextIndex < state.queue.length) {
          state.currentQueueIndex = nextIndex;
          state.currentTrack = state.queue[nextIndex];
          state.progress = 0;
        } else if (state.repeat === 'all') {
          state.currentQueueIndex = 0;
          state.currentTrack = state.queue[0];
          state.progress = 0;
        } else {
          state.isPlaying = false;
        }
      }
    },
    prevTrack: (state) => {
      if (state.queue.length === 0) return;

      const prevIndex = state.currentQueueIndex - 1;
      if (prevIndex >= 0) {
        state.currentQueueIndex = prevIndex;
        state.currentTrack = state.queue[prevIndex];
        state.progress = 0;
      } else if (state.repeat === 'all') {
        state.currentQueueIndex = state.queue.length - 1;
        state.currentTrack = state.queue[state.queue.length - 1];
        state.progress = 0;
      } else {
        state.progress = 0;
      }
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
    toggleRepeat: (state) => {
      if (state.repeat === 'off') {
        state.repeat = 'all';
      } else if (state.repeat === 'all') {
        state.repeat = 'one';
      } else {
        state.repeat = 'off';
      }
    },
  },
});

export const {
  setCurrentTrack,
  setIsPlaying,
  setProgress,
  setVolumeState,
  setQueue,
  addToQueue,
  removeFromQueue,
  clearQueue,
  nextTrack,
  prevTrack,
  toggleShuffle,
  toggleRepeat,
} = playbackSlice.actions;

export default playbackSlice.reducer;
