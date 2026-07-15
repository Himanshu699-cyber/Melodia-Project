import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Layout from '../components/Layout';
import { generateStudioSongAction, addNotification, toggleLikeSong } from '../store/playlistSlice';
import type { RootState } from '../store';
import { usePlayback } from '../hooks/usePlayback';
import type { Track } from '../data/mockData';

export interface AIStudioProps {
  readonly className?: string;
}

export const AIStudio: React.FC<AIStudioProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { playTrack, currentTrack, isPlaying } = usePlayback();
  const { likedSongs } = useSelector((state: RootState) => state.playlists);

  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Synthwave');
  const [mood, setMood] = useState('Dreamy');
  const [language, setLanguage] = useState('English');
  const [tempo, setTempo] = useState('Moderate');
  const [duration, setDuration] = useState('3:30');
  
  const [generating, setGenerating] = useState(false);
  const [studioTrack, setStudioTrack] = useState<any>(null);

  const genres = ['Synthwave', 'Lofi Hip Hop', 'Techno', 'Ambient', 'Glitch Hop', 'EDM', 'Bollywood'];
  const moods = ['Dreamy', 'Focused', 'Productive', 'Dark & Heavy', 'Relaxed', 'Romantic', 'Euphoric'];
  const languages = ['English', 'Hindi', 'Spanish', 'Japanese', 'German'];

  const handleGenerateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const resultAction = await dispatch(
        generateStudioSongAction({
          prompt,
          genre,
          mood,
          language,
          tempo,
          duration,
        }) as any
      );

      if (generateStudioSongAction.fulfilled.match(resultAction)) {
        setStudioTrack(resultAction.payload);
      }
    } catch (err) {
      console.error('Song generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePlaySong = () => {
    if (studioTrack) {
      playTrack(studioTrack);
    }
  };

  const handleLikeToggle = () => {
    if (studioTrack) {
      dispatch(toggleLikeSong(studioTrack) as any);
    }
  };

  const handleShare = () => {
    if (studioTrack) {
      const shareUrl = `${window.location.origin}/player?trackId=${studioTrack.id}`;
      navigator.clipboard.writeText(shareUrl);
      dispatch(addNotification({
        message: `Studio track link copied to clipboard!`,
        type: 'success'
      }));
    }
  };

  const handleDownloadMetadata = () => {
    if (!studioTrack) return;
    const metadata = {
      title: studioTrack.title,
      artist: studioTrack.artist,
      album: studioTrack.album,
      duration: studioTrack.duration,
      bpm: studioTrack.bpm,
      bitrate: studioTrack.bitrate,
      genre: studioTrack.genre,
      mood: studioTrack.mood,
      lyrics: studioTrack.lyrics,
      prompt: prompt,
      language: language,
      tempo: tempo,
      generatedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metadata, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${studioTrack.title.replace(/\s+/g, '_')}_metadata.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    dispatch(addNotification({
      message: `Metadata JSON downloaded!`,
      type: 'success'
    }));
  };

  const handleDeleteSong = async () => {
    if (!studioTrack) return;
    if (window.confirm('Are you sure you want to delete this generated song?')) {
      const token = localStorage.getItem('melodify_token') || sessionStorage.getItem('melodify_token');
      try {
        await axios.delete(`http://localhost:5000/api/admin/tracks/${studioTrack.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(addNotification({
          message: `Studio song deleted!`,
          type: 'info'
        }));
        setStudioTrack(null);
      } catch (err) {
        console.error('Delete generated song error:', err);
      }
    }
  };

  const liked = studioTrack ? likedSongs.some(s => s.id === studioTrack.id) : false;

  return (
    <Layout title="AI Music Studio" showSearch={false}>
      <div className={`space-y-xl ${className} select-none`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-xl">
          {/* Settings form (2/5 width) */}
          <div className="lg:col-span-2 space-y-md">
            <div className="card-bg border border-charcoal rounded-lg p-lg space-y-md">
              <h3 className="font-headline-lg text-headline-lg text-white font-bold flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">equalizer</span>
                AI Composer
              </h3>

              <form onSubmit={handleGenerateSong} className="space-y-md">
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                    Describe Song (Prompt)
                  </label>
                  <textarea
                    required
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-[#131313] border border-charcoal rounded-md px-md py-sm text-white focus:outline-none focus:border-primary text-sm min-h-[80px] resize-none input-focus font-sans"
                    placeholder="e.g. A romantic Bollywood song with acoustic guitar pads or lo-fi study beat..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  {/* Genre */}
                  <div className="space-y-xs">
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                      Genre
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-[#131313] border border-charcoal rounded-md px-sm py-2 text-white focus:outline-none focus:border-primary text-xs font-sans"
                    >
                      {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  {/* Mood */}
                  <div className="space-y-xs">
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                      Mood
                    </label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full bg-[#131313] border border-charcoal rounded-md px-sm py-2 text-white focus:outline-none focus:border-primary text-xs font-sans"
                    >
                      {moods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  {/* Language */}
                  <div className="space-y-xs">
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#131313] border border-charcoal rounded-md px-sm py-2 text-white focus:outline-none focus:border-primary text-xs font-sans"
                    >
                      {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-xs">
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-[#131313] border border-charcoal rounded-md px-sm py-2 text-white focus:outline-none focus:border-primary text-xs font-sans"
                    >
                      <option value="2:30">2:30</option>
                      <option value="3:30">3:30</option>
                      <option value="4:30">4:30</option>
                    </select>
                  </div>
                </div>

                {/* Tempo */}
                <div className="space-y-xs">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                    Tempo
                  </label>
                  <div className="flex gap-sm">
                    {['Slow', 'Moderate', 'Fast'].map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTempo(t)}
                        className={`flex-1 py-2 rounded text-xs border transition-colors ${
                          tempo === t
                            ? 'bg-primary border-primary text-white font-bold'
                            : 'bg-[#131313] border-charcoal text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full bg-primary text-white font-label-md text-label-md py-3 rounded hover:bg-opacity-90 transition-all flex items-center justify-center gap-xs font-bold active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px] animate-spin-slow">
                    music_note
                  </span>
                  {generating ? 'Composing Masterpiece...' : 'Generate AI Track'}
                </button>
              </form>
            </div>
          </div>

          {/* Lyrics and Song playback sheet (3/5 width) */}
          <div className="lg:col-span-3 space-y-md">
            {generating ? (
              <div className="card-bg border border-charcoal rounded-lg p-xl flex flex-col items-center justify-center text-center min-h-[450px] space-y-md">
                <span className="material-symbols-outlined text-[64px] text-primary animate-pulse">
                  album
                </span>
                <div>
                  <h4 className="font-headline-lg text-white font-bold">Generating Audio & Lyrics</h4>
                  <p className="text-sm text-on-surface-variant max-w-[320px] mx-auto mt-xs">
                    Calling LLM text generation model, orchestrating rhythm synthesizers, and creating output streams...
                  </p>
                </div>
              </div>
            ) : studioTrack ? (
              <div className="card-bg border border-charcoal rounded-lg p-lg space-y-md min-h-[450px] flex flex-col">
                {/* Header Track Details */}
                <div className="flex items-center gap-md border-b border-charcoal pb-md">
                  <img
                    src={studioTrack.coverUrl}
                    alt={studioTrack.title}
                    className="w-20 h-20 object-cover rounded border border-charcoal shadow-2xl"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-headline-lg text-headline-lg text-white font-bold truncate">
                      {studioTrack.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant font-mono">
                      {studioTrack.artist} • {studioTrack.genre}
                    </p>
                    <p className="text-xs text-on-surface-variant font-mono mt-xs">
                      BPM: {studioTrack.bpm} | Bitrate: {studioTrack.bitrate}
                    </p>
                  </div>
                  
                  {/* Action Bar */}
                  <div className="flex gap-xs shrink-0">
                    <button
                      onClick={handlePlaySong}
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_arrow
                      </span>
                    </button>
                    <button
                      onClick={handleLikeToggle}
                      className={`w-10 h-10 rounded-full border border-charcoal flex items-center justify-center hover:scale-105 transition-transform ${
                        liked ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                        favorite
                      </span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-10 h-10 rounded-full border border-charcoal text-on-surface-variant flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                  </div>
                </div>

                {/* Lyrics Display Section */}
                <div className="flex-1 overflow-y-auto max-h-60 bg-[#131313] border border-charcoal rounded p-md custom-scrollbar">
                  <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono mb-2">
                    Generated Lyrics
                  </h4>
                  <pre className="font-sans text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {studioTrack.lyrics || 'No lyrics generated.'}
                  </pre>
                </div>

                {/* Track Options */}
                <div className="flex justify-between items-center pt-md border-t border-charcoal mt-auto">
                  <button
                    onClick={handleDownloadMetadata}
                    className="px-md py-2 bg-[#131313] border border-charcoal hover:border-primary text-xs font-semibold text-white rounded transition-colors flex items-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download Metadata
                  </button>
                  <button
                    onClick={handleDeleteSong}
                    className="px-md py-2 border border-charcoal hover:border-primary text-xs font-semibold text-primary rounded transition-colors flex items-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Delete Song
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-bg border border-charcoal rounded-lg p-xl flex flex-col items-center justify-center text-center min-h-[450px] space-y-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px]">music_note</span>
                <div>
                  <h4 className="font-headline-lg text-white font-bold">Studio Session Empty</h4>
                  <p className="text-sm text-on-surface-variant max-w-[320px] mx-auto mt-xs">
                    Write a detailed prompt (like "A nostalgic jazz song about city lights") and let the composer create audio and lyrics.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIStudio;
