import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  setCurrentTrack,
  setIsPlaying,
  setProgress,
  setVolumeState,
  nextTrack,
  prevTrack,
} from '../store/playbackSlice';
import { toggleLikeSong } from '../store/playlistSlice';
import type { Track } from '../data/mockData';
import axios from 'axios';

interface PlaybackContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setProgressPercent: (progress: number) => void;
  playNext: () => void;
  playPrev: () => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

interface PlaybackProviderProps {
  readonly children: React.ReactNode;
}

export const PlaybackProvider: React.FC<PlaybackProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { currentTrack, isPlaying, progress, volume } = useSelector(
    (state: RootState) => state.playback
  );

  // Initialize HTML5 Audio object
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Time update listener
    const handleTimeUpdate = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        dispatch(setProgress(pct));
      }
    };

    // Track ended listener -> skip next
    const handleEnded = () => {
      dispatch(nextTrack());
    };

    // Play/Pause sync listeners
    const handlePlay = () => dispatch(setIsPlaying(true));
    const handlePause = () => dispatch(setIsPlaying(false));

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Initial volume
    audio.volume = volume / 100;

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [dispatch]);

  // Sync volume state with HTML5 audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Sync track URL source changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (currentTrack) {
      const isSameSrc = audioRef.current.src === currentTrack.url;
      if (!isSameSrc) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
      }

      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Audio play request failed or interrupted:', err.message);
          dispatch(setIsPlaying(false));
        });
        
        // Log recently played track in Express backend asynchronously
        logTrackPlay(currentTrack.id);
      } else {
        audioRef.current.pause();
      }
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying, dispatch]);

  const logTrackPlay = async (trackId: string) => {
    const token = localStorage.getItem('melodify_token') || sessionStorage.getItem('melodify_token');
    if (!token) return;
    try {
      await axios.post(
        `http://localhost:5000/api/tracks/${trackId}/play`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn('Could not log track play to backend:', err);
    }
  };

  const playTrack = (track: Track) => {
    dispatch(setCurrentTrack(track));
    dispatch(setIsPlaying(true));
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current?.pause();
      dispatch(setIsPlaying(false));
    } else {
      audioRef.current?.play().catch(() => {});
      dispatch(setIsPlaying(true));
    }
  };

  const setVolume = (val: number) => {
    dispatch(setVolumeState(val));
  };

  const setProgressPercent = (pct: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const seekTime = (pct / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      dispatch(setProgress(pct));
    }
  };

  const playNext = () => {
    dispatch(nextTrack());
  };

  const playPrev = () => {
    dispatch(prevTrack());
  };

  return (
    <PlaybackContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        volume,
        playTrack,
        togglePlay,
        setVolume,
        setProgressPercent,
        playNext,
        playPrev,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlaybackContext = () => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlaybackContext must be used within a PlaybackProvider');
  }
  return context;
};
