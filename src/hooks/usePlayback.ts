import { usePlaybackContext } from '../context/PlaybackContext';

export const usePlayback = () => {
  const {
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
  } = usePlaybackContext();

  return {
    currentTrack,
    isPlaying,
    progress,
    volume,
    playTrack,
    togglePlay,
    setVolume,
    setProgress: setProgressPercent,
    playNext,
    playPrev,
  };
};

export default usePlayback;
