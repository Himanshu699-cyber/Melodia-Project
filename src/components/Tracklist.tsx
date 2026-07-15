import React from 'react';
import { Play, Pause, Heart, Clock, MoreHorizontal } from 'lucide-react';
import type { Track } from '../data/mockData';
import { usePlayback } from '../hooks/usePlayback';

export interface TracklistProps {
  readonly tracks: Track[];
  readonly className?: string;
}

export const Tracklist: React.FC<TracklistProps> = ({ tracks, className = '' }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayback();

  return (
    <div className={`overflow-x-auto select-none ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant text-xs text-on-surface-variant font-mono uppercase tracking-wider">
            <th className="py-3 px-4 w-12 text-center">#</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4 hidden md:table-cell">Album</th>
            <th className="py-3 px-4 hidden sm:table-cell text-right">BPM</th>
            <th className="py-3 px-4 hidden lg:table-cell text-right">Bitrate</th>
            <th className="py-3 px-4 text-right w-20">
              <Clock className="w-4 h-4 ml-auto" />
            </th>
            <th className="py-3 px-4 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant text-sm font-sans">
          {tracks.map((track, index) => {
            const isCurrent = currentTrack?.id === track.id;
            const isRowPlaying = isCurrent && isPlaying;

            return (
              <tr
                key={track.id}
                onClick={() => playTrack(track)}
                className={`group hover:bg-surface-bright transition-colors cursor-pointer ${
                  isCurrent ? 'bg-surface-container-high/40 text-primary' : 'text-on-surface'
                }`}
              >
                {/* Index / Play Button */}
                <td className="py-3 px-4 text-center text-on-surface-variant font-mono">
                  <span className="group-hover:hidden">{index + 1}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) {
                        togglePlay();
                      } else {
                        playTrack(track);
                      }
                    }}
                    className="hidden group-hover:inline-block text-primary-container hover:text-primary transition-colors"
                  >
                    {isRowPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                  </button>
                </td>

                {/* Cover & Title */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover border border-outline-variant flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                    </div>
                  </div>
                </td>

                {/* Album */}
                <td className="py-3 px-4 hidden md:table-cell text-on-surface-variant max-w-[200px] truncate">
                  {track.album}
                </td>

                {/* BPM */}
                <td className="py-3 px-4 hidden sm:table-cell text-right font-mono text-on-surface-variant">
                  {track.bpm}
                </td>

                {/* Bitrate */}
                <td className="py-3 px-4 hidden lg:table-cell text-right font-mono text-on-surface-variant">
                  {track.bitrate}
                </td>

                {/* Duration */}
                <td className="py-3 px-4 text-right font-mono text-on-surface-variant">
                  {track.duration}
                </td>

                {/* More / Options */}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Likes would toggle here
                      }}
                      className={`text-on-surface-variant hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ${
                        track.liked ? 'opacity-100 text-red-500' : ''
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${track.liked ? 'fill-red-500' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Tracklist;
