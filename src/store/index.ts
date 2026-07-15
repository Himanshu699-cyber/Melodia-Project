import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import playbackReducer from './playbackSlice';
import playlistReducer from './playlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    playback: playbackReducer,
    playlists: playlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
