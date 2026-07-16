import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { generateAiPlaylistAction } from '../store/playlistSlice';
import type { RootState } from '../store';
import { usePlayback } from '../hooks/usePlayback';
import type { Track } from '../data/mockData';

export interface PlaylistGeneratorProps {
  readonly className?: string;
}

export const PlaylistGenerator: React.FC<PlaylistGeneratorProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = usePlayback();
  const { loading } = useSelector((state: RootState) => state.playlists);
  const { user } = useSelector((state: RootState) => state.auth);

  const moods = ['Chill', 'Focused', 'High Energy', 'Melancholic', 'Late Night'];
  const genreOptions = ['Synthwave', 'Techno', 'Cinematic', 'Ambient', 'Dark Synth'];

  const [selectedMood, setSelectedMood] = useState('Chill');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Synthwave', 'Ambient']);

  const [artistQuery, setArtistQuery] = useState('');
  const [artistInfluences, setArtistInfluences] = useState<string[]>(['Tangerine Dream', 'Kavinsky']);

  const [generatedPlaylist, setGeneratedPlaylist] = useState<any>(null);
  const [suggestedTracks, setSuggestedTracks] = useState<Track[]>([]);
  const [suggestIndex, setSuggestIndex] = useState(0);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Fetch a couple of tracks to populate "AI Suggests" (no dedicated recommendation endpoint yet)
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tracks`);
        if (response.data.success) {
          const mapped = response.data.data.slice(0, 6).map((t: any) => ({
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
            playCount: t.playCount,
          }));
          setSuggestedTracks(mapped);
        }
      } catch (err) {
        console.error('Fetch suggestions failed:', err);
      }
    };
    fetchSuggestions();
  }, []);

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleAddArtist = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && artistQuery.trim()) {
      e.preventDefault();
      if (!artistInfluences.includes(artistQuery.trim())) {
        setArtistInfluences((prev) => [...prev, artistQuery.trim()]);
      }
      setArtistQuery('');
    }
  };

  const removeArtist = (name: string) => {
    setArtistInfluences((prev) => prev.filter((a) => a !== name));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const description = `A ${selectedMood.toLowerCase()} mix blending ${selectedGenres.join(', ') || 'various genres'}${artistInfluences.length ? `, inspired by ${artistInfluences.join(', ')}` : ''
      }.`;

    try {
      const resultAction = await dispatch(
        generateAiPlaylistAction({
          description,
          genre: selectedGenres[0] || 'Synthwave',
          mood: selectedMood,
        }) as any
      );

      if (generateAiPlaylistAction.fulfilled.match(resultAction)) {
        setGeneratedPlaylist(resultAction.payload);
      }
    } catch (err) {
      console.error('AI Generator failed:', err);
    }
  };

  const handlePlayGeneratedTrack = (track: Track) => {
    playTrack(track);
  };

  const trackCount = generatedPlaylist?.tracks?.length || 0;

  return (
    <Layout title="AI Playlist" showSearch={false}>
      <div className={`space-y-xl ${className} select-none`}>
        {/* Greeting Header */}
        <div>
          <h1 className="text-headline-xl text-white font-bold">
            {getGreeting()}, <span className="text-primary">{user?.username || 'Guest'}</span>.
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Let's build your perfect mix.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Left/Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-md">
            <form onSubmit={handleGenerate} className="space-y-md">
              {/* Vibe & Mood */}
              <div className="card-bg border border-charcoal rounded-lg p-lg space-y-md">
                <h3 className="text-headline-lg text-white font-bold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary">sentiment_satisfied</span>
                  Vibe & Mood
                </h3>
                <div className="flex flex-wrap gap-sm">
                  {moods.map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setSelectedMood(m)}
                      className={`px-md py-2 rounded text-sm font-medium border transition-colors ${selectedMood === m
                        ? 'bg-primary border-primary text-white font-bold'
                        : 'bg-[#131313] border-charcoal text-on-surface-variant hover:border-primary'
                        }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Anchors */}
              <div className="card-bg border border-charcoal rounded-lg p-lg space-y-md">
                <h3 className="text-headline-lg text-white font-bold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary">queue_music</span>
                  Genre Anchors
                </h3>
                <div className="flex flex-wrap gap-sm">
                  {genreOptions.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`px-md py-2 rounded text-sm font-medium border transition-colors ${selectedGenres.includes(g)
                        ? 'bg-primary border-primary text-white font-bold'
                        : 'bg-[#131313] border-charcoal text-on-surface-variant hover:border-primary'
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Artist Influences */}
              <div className="card-bg border border-charcoal rounded-lg p-lg space-y-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-headline-lg text-white font-bold flex items-center gap-xs">
                    <span className="material-symbols-outlined text-primary">mic</span>
                    Artist Influences
                  </h3>
                  <span className="text-xs font-mono uppercase text-on-surface-variant">Optional</span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={artistQuery}
                    onChange={(e) => setArtistQuery(e.target.value)}
                    onKeyDown={handleAddArtist}
                    placeholder="Search artists to seed playlist..."
                    className="w-full bg-[#131313] border border-charcoal rounded-lg py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-primary input-focus"
                  />
                </div>
                {artistInfluences.length > 0 && (
                  <div className="flex flex-wrap gap-sm">
                    {artistInfluences.map((artist) => (
                      <div
                        key={artist}
                        className="flex items-center gap-xs bg-[#131313] border border-charcoal rounded-full pl-1 pr-sm py-1"
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(artist)}`}
                          alt={artist}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-white">{artist}</span>
                        <button
                          type="button"
                          onClick={() => removeArtist(artist)}
                          className="text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white text-label-md py-4 rounded hover:bg-opacity-90 transition-all flex items-center justify-center gap-xs font-bold active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                {loading ? 'Analyzing Vibe...' : 'Generate Playlist'}
              </button>
            </form>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-md">
            {/* AI Suggests */}
            <div className="space-y-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-headline-lg text-white font-bold">AI Suggests</h3>
                <div className="flex gap-xs">
                  <button
                    type="button"
                    onClick={() => setSuggestIndex((i) => Math.max(0, i - 2))}
                    className="w-8 h-8 rounded border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuggestIndex((i) => Math.min(suggestedTracks.length - 2, i + 2))}
                    className="w-8 h-8 rounded border border-charcoal flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-sm">
                {suggestedTracks.slice(suggestIndex, suggestIndex + 2).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="card-bg border border-charcoal rounded-lg overflow-hidden cursor-pointer hover:border-[#404040] transition-colors"
                  >
                    <img src={track.coverUrl} alt={track.title} className="w-full aspect-square object-cover" />
                    <div className="p-sm">
                      <p className="text-sm font-bold text-white truncate">{track.title}</p>
                      <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Tracklist */}
            <div className="card-bg border border-charcoal rounded-lg p-lg space-y-md min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between border-b border-charcoal pb-sm">
                <h3 className="text-headline-md text-white font-bold">Output Tracklist</h3>
                <span className="text-xs font-mono text-on-surface-variant">{trackCount} Tracks</span>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-sm">
                  <span className="material-symbols-outlined text-[40px] text-primary animate-pulse">
                    auto_awesome
                  </span>
                  <p className="text-xs text-on-surface-variant">Compiling optimal sequence...</p>
                </div>
              ) : generatedPlaylist && trackCount > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-xs custom-scrollbar">
                  {generatedPlaylist.tracks.map((track: Track, idx: number) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const isPlayingRow = isCurrent && isPlaying;
                    return (
                      <div
                        key={track.id}
                        onClick={() => handlePlayGeneratedTrack(track)}
                        className={`flex items-center gap-sm py-2 px-xs hover:bg-[#202020] rounded cursor-pointer transition-colors group ${isCurrent ? 'text-primary' : 'text-white'
                          }`}
                      >
                        <span className="font-mono text-xs text-on-surface-variant w-4 text-center group-hover:hidden">
                          {idx + 1}
                        </span>
                        <span className="material-symbols-outlined text-primary text-[16px] w-4 text-center hidden group-hover:inline-block">
                          {isPlayingRow ? 'pause' : 'play_arrow'}
                        </span>
                        <img src={track.coverUrl} alt={track.title} className="w-9 h-9 object-cover rounded border border-charcoal" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{track.title}</p>
                          <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                        </div>
                        <span className="text-xs font-mono text-on-surface-variant shrink-0">{track.duration}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[40px]">hourglass_empty</span>
                  <p className="text-xs max-w-[220px]">
                    Awaiting input parameters to compile optimal sequence.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlaylistGenerator;