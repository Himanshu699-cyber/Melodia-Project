import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { toggleShuffle, toggleRepeat } from '../store/playbackSlice';
import { toggleLikeSong } from '../store/playlistSlice';
import { usePlayback } from '../hooks/usePlayback';

export interface PlaybackBarProps {
  readonly className?: string;
  readonly variant?: 'default' | 'expanded';
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({ className = '', variant = 'default' }) => {
  const dispatch = useDispatch();
  const { likedSongs } = useSelector((state: RootState) => state.playlists);
  const { shuffle, repeat } = useSelector((state: RootState) => state.playback);

  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    togglePlay,
    setVolume,
    setProgress,
    playNext,
    playPrev,
  } = usePlayback();

  if (!currentTrack) {
    return (
      <div className={`h-[90px] md:h-20 fixed bottom-0 left-0 w-full z-50 bg-surface-container border-t border-outline-variant flex items-center justify-center text-xs text-on-surface-variant font-mono select-none ${className}`}>
        No track loaded. Select a song to begin streaming.
      </div>
    );
  }

  const totalSeconds = parseDuration(currentTrack.duration);
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);
  const formattedCurrentTime = formatTime(currentSeconds);
  const isLiked = likedSongs.some(s => s.id === currentTrack.id);

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(toggleLikeSong(currentTrack) as any);
  };

  return (
    <div className={`h-[90px] md:h-20 fixed bottom-0 left-0 w-full z-50 bg-surface-container border-t border-outline-variant shadow-[0_-4px_24px_rgba(0,0,0,0.5)] px-sm sm:px-xl flex items-center justify-between select-none ${className}`}>
      {/* Left Section */}
      {variant === 'expanded' ? (
        <div className="flex items-center gap-md w-1/3 min-w-0">
          <button
            onClick={handleLikeToggle}
            className={`hover:text-primary transition-colors shrink-0 ${isLiked ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>
              favorite
            </span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0">
            <span className="material-symbols-outlined text-[20px]">playlist_add</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0">
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-sm sm:gap-md w-1/3 min-w-0">
          <Link to="/player" className="w-12 h-12 sm:w-14 sm:h-14 rounded overflow-hidden shrink-0 shadow-md relative group cursor-pointer">
            <img alt={currentTrack.title} className="w-full h-full object-cover" src={currentTrack.coverUrl} />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="material-symbols-outlined text-white">expand_less</span>
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to="/player" className="font-label-md text-label-md text-on-surface hover:underline truncate block">
              {currentTrack.title}
            </Link>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface truncate block cursor-pointer">
              {currentTrack.artist}
            </span>
          </div>
          <button
            onClick={handleLikeToggle}
            className={`hover:text-primary transition-colors hidden sm:block shrink-0 ${isLiked ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>
              favorite
            </span>
          </button>
        </div>
      )}

      {/* Control Panel (Center) — unchanged except play button color */}
      <div className="flex flex-col items-center justify-center w-full max-w-[40%] px-sm">
        <div className="flex items-center gap-4 sm:gap-6 mb-1">
          <button
            onClick={() => dispatch(toggleShuffle())}
            className={`transition-colors hidden sm:block ${shuffle ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[20px]">shuffle</span>
          </button>
          <button onClick={playPrev} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
          </button>
          <button
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg ${variant === 'expanded' ? 'bg-primary text-white' : 'bg-on-surface text-surface'
              }`}
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button onClick={playNext} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
          </button>
          <button
            onClick={() => dispatch(toggleRepeat())}
            className={`transition-colors hidden sm:block relative ${repeat !== 'off' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[20px]">repeat</span>
            {repeat === 'one' && <span className="absolute -top-1 right-0 text-[9px] font-bold font-mono">1</span>}
            {repeat !== 'off' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>}
          </button>
        </div>

        <div className="w-full flex items-center gap-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant min-w-[35px] text-right font-mono">
            {formattedCurrentTime}
          </span>
          <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full cursor-pointer relative group">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="h-full bg-on-surface group-hover:bg-primary transition-colors rounded-full relative" style={{ width: `${progress || 0}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity" />
            </div>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant min-w-[35px] font-mono">
            {currentTrack.duration}
          </span>
        </div>
      </div>

      {/* Right Section */}
      {variant === 'expanded' ? (
        <div className="flex items-center justify-end gap-sm sm:gap-md w-1/3 hidden md:flex">
          <Link to="/library" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">queue_music</span>
          </Link>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">cast</span>
          </button>
          <div className="flex items-center gap-xs w-24 group">
            <button onClick={() => setVolume(volume === 0 ? 80 : 0)} className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0">
              <span className="material-symbols-outlined text-[20px]">{volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}</span>
            </button>
            <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full cursor-pointer relative">
              <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="h-full bg-on-surface group-hover:bg-primary transition-colors rounded-full" style={{ width: `${volume}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-sm sm:gap-md w-1/3 hidden md:flex">
          <Link to="/player" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">mic_external_on</span>
          </Link>
          <Link to="/library" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">queue_music</span>
          </Link>
          <div className="flex items-center gap-xs w-24 group">
            <button onClick={() => setVolume(volume === 0 ? 80 : 0)} className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0">
              <span className="material-symbols-outlined text-[20px]">{volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}</span>
            </button>
            <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full cursor-pointer relative">
              <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="h-full bg-on-surface group-hover:bg-primary transition-colors rounded-full" style={{ width: `${volume}%` }} />
            </div>
          </div>
          <Link to="/player" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">open_in_full</span>
          </Link>
        </div>
      )}
    </div>
  );
};

function parseDuration(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(':');
  if (parts.length === 2) return Number(parts[0]) * 60 + Number(parts[1]);
  return 0;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default PlaybackBar;