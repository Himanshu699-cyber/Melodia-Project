import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayback } from '../hooks/usePlayback';
import Layout from '../components/Layout';

export interface FullPlayerProps {
  readonly className?: string;
}

export const FullPlayer: React.FC<FullPlayerProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    togglePlay,
    setVolume,
    playNext,
    playPrev,
  } = usePlayback();

  const [showLyrics, setShowLyrics] = useState(true);

  if (!currentTrack) {
    return (
      <Layout title="Now Playing" showSearch={false}>
        <div className="min-h-[60vh] flex flex-col justify-center items-center text-center p-lg">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-md">
            headphones
          </span>
          <h2 className="text-xl font-bold text-white mb-xs">No active track</h2>
          <p className="text-sm text-on-surface-variant max-w-[320px] mb-lg leading-relaxed">
            Select a song from your library or search catalog to launch the high-fidelity player.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-xl py-3 bg-primary text-white text-sm font-semibold rounded-full hover:scale-105 transition-transform"
          >
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const totalSeconds = parseDuration(currentTrack.duration);
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);
  const formattedCurrentTime = formatTime(currentSeconds);

  const lyricsLines = (currentTrack.lyrics || defaultLyrics(currentTrack)).split('\n').filter(l => l.trim() !== '');
  const activeLineIndex = Math.min(
    lyricsLines.length - 1,
    Math.floor((progress / 100) * lyricsLines.length)
  );

  return (
    <Layout title="Now Playing" showSearch={false} playbackBarVariant="expanded">
      <div className={`max-w-6xl mx-auto w-full relative ${className}`}>
        {/* Ambient glow scoped to content area only */}
        <div
          className="absolute -top-margin left-0 right-0 h-64 opacity-20 blur-[100px] pointer-events-none -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-start">
          {/* Left: Album Art + mini transport row */}
          <div className="flex flex-col gap-md">
            <div className="w-full aspect-square rounded-lg overflow-hidden border border-charcoal shadow-2xl">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>

            <div className="flex items-center justify-between bg-[#101010]/80 border border-charcoal rounded-lg px-md py-sm">
              <div className="flex items-center gap-md">
                <button
                  onClick={playPrev}
                  className="text-white hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    skip_previous
                  </span>
                </button>
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button
                  onClick={playNext}
                  className="text-white hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    skip_next
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-sm w-28 shrink-0">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  {volume === 0 ? 'volume_off' : 'volume_up'}
                </span>
                <div className="flex-1 h-1 bg-charcoal rounded-full relative cursor-pointer">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="h-full bg-white rounded-full" style={{ width: `${volume}%` }} />
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant w-8 text-right shrink-0">
                  {formattedCurrentTime}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Title/Artist + Lyrics panel */}
          <div className="flex flex-col gap-md h-full min-h-[400px] lg:min-h-[480px]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h1 className="text-4xl font-extrabold text-white truncate">{currentTrack.title}</h1>
                <p className="text-lg font-medium mt-xs">
                  <span className="text-primary">{currentTrack.artist}</span>
                  <span className="text-on-surface-variant mx-sm">•</span>
                  <span className="text-primary">{currentTrack.album}</span>
                </p>
              </div>
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className={`w-10 h-10 rounded-full border border-charcoal flex items-center justify-center transition-colors shrink-0 ${showLyrics ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">lyrics</span>
              </button>
            </div>

            {showLyrics && (
              <div className="flex-1 bg-[#101010]/80 border border-charcoal rounded-lg p-lg flex flex-col shadow-2xl">
                <div className="flex items-center justify-between border-b border-charcoal pb-sm mb-md">
                  <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                    Lyrics
                  </h4>
                  <button className="text-on-surface-variant hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                  </button>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-xs space-y-md">
                  {lyricsLines.map((line, i) => (
                    <p
                      key={i}
                      className={
                        i === activeLineIndex
                          ? 'text-lg font-bold text-white border-l-2 border-primary pl-md leading-snug'
                          : i < activeLineIndex
                            ? 'text-sm text-on-surface-variant/40 pl-md leading-snug'
                            : 'text-sm text-on-surface-variant pl-md leading-snug'
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

function defaultLyrics(currentTrack: { genre?: string; bpm?: number }): string {
  return `[Instrumental Beat]\n\n(${currentTrack.genre} tempo: ${currentTrack.bpm} BPM)\n\nThis track does not have lyrics.\nGenerate custom tracks with lyrics using the AI Music Studio.\nEnjoy streaming high-fidelity audio.`;
}

function parseDuration(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(':');
  if (parts.length === 2) {
    return Number(parts[0]) * 60 + Number(parts[1]);
  }
  return 0;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default FullPlayer;