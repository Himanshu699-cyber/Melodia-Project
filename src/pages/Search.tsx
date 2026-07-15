import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Layout from '../components/Layout';
import type { Track } from '../data/mockData';
import { usePlayback } from '../hooks/usePlayback';
import { toggleLikeSong } from '../store/playlistSlice';
import type { RootState } from '../store';

export interface SearchProps {
  readonly className?: string;
}

export const Search: React.FC<SearchProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { likedSongs } = useSelector((state: RootState) => state.playlists);
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayback();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(
    JSON.parse(localStorage.getItem('melodify_recent_searches') || '["Synthwave", "Lofi Scholar", "Neon"]')
  );

  // Filters
  const [genreFilter, setGenreFilter] = useState('');

  const genresList = ["Synthwave", "Techno", "Cinematic", "Ambient", "Lo-Fi", "Deep House", "Industrial"];

  // Real-time suggestions & search
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/tracks/search?q=${query}`);
        if (response.data.success) {
          setSuggestions(response.data.suggestions || []);

          // Map tracks and apply filter
          const mapped = response.data.results.map((t: any) => ({
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
            liked: likedSongs.some((s) => s.id === t._id),
            playCount: t.playCount
          }));
          setResults(mapped);
        }
        setLoading(false);
      } catch (err) {
        console.error('Search error:', err);
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query, likedSongs]);

  // Execute full search with genre filter
  const executeFilterSearch = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/tracks?sort=popular`;
      if (query) url += `&search=${query}`;
      if (genreFilter) url += `&genre=${genreFilter}`;

      const response = await axios.get(url);
      if (response.data.success) {
        const mapped = response.data.data.map((t: any) => ({
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
          liked: likedSongs.some((s) => s.id === t._id),
          playCount: t.playCount
        }));
        setResults(mapped);

        // Add to recent searches
        if (query && !recentSearches.includes(query)) {
          const updated = [query, ...recentSearches.slice(0, 4)];
          setRecentSearches(updated);
          localStorage.setItem('melodify_recent_searches', JSON.stringify(updated));
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Filter search error:', err);
      setLoading(false);
    }
  };

  // Re-trigger search when genre filter changes
  useEffect(() => {
    executeFilterSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreFilter]);

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('melodify_recent_searches');
  };

  const handleLikeToggle = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLikeSong(track) as any);
  };

  // Derived data for design sections (no dedicated Artist/Album endpoints yet)
  const topResultArtist = results.length > 0 ? results[0].artist : null;
  const topResultTrack = results.length > 0 ? results[0] : null;

  const uniqueArtists = Array.from(
    new Map(results.map(t => [t.artist, t])).values()
  ).slice(0, 3);

  const uniqueAlbums = Array.from(
    new Map(results.map(t => [t.album, t])).values()
  ).slice(0, 3);

  return (
    <Layout title="Search" showSearch={false}>
      <div className={`space-y-xl ${className}`}>
        {/* Search Header Input bar */}
        <div className="space-y-md">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[24px]">
              search
            </span>
            <input
              type="text"
              className="w-full bg-[#131313] border-2 border-charcoal focus:border-primary rounded-lg py-4 pl-12 pr-6 text-white text-base focus:outline-none transition-colors placeholder-on-surface-variant"
              placeholder="Search for tracks, artists, or albums"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeFilterSearch()}
            />
          </div>

          {/* Autocomplete Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="bg-[#131313] border border-charcoal rounded-lg divide-y divide-charcoal overflow-hidden shadow-2xl">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const term = s.split(' - ')[0];
                    setQuery(term);
                    setSuggestions([]);
                  }}
                  className="px-lg py-3 hover:bg-[#202020] text-sm text-white cursor-pointer transition-colors"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Genre Filter Pills */}
        <div className="flex flex-wrap gap-sm">
          <button
            onClick={() => setGenreFilter('')}
            className={`px-md py-2 rounded text-sm font-medium border transition-colors ${genreFilter === ''
              ? 'bg-white text-black border-white font-bold'
              : 'bg-[#181818] border-charcoal text-white hover:border-[#404040]'
              }`}
          >
            All Results
          </button>
          {genresList.map((g) => (
            <button
              key={g}
              onClick={() => setGenreFilter(g)}
              className={`px-md py-2 rounded text-sm font-medium border transition-colors ${genreFilter === g
                ? 'bg-transparent border-primary text-primary font-bold'
                : 'bg-[#181818] border-charcoal text-white hover:border-[#404040]'
                }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="space-y-xl">
          {loading ? (
            <div className="p-xl text-center font-mono text-xs text-on-surface-variant">
              Searching database catalog...
            </div>
          ) : results.length === 0 ? (
            <div className="p-xl text-center font-mono text-xs text-on-surface-variant border border-dashed border-charcoal rounded-lg">
              {query ? 'No matching tracks found.' : 'Enter a prompt or select a genre above to browse.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
              {/* Top Result */}
              {topResultTrack && (
                <div className="space-y-md">
                  <h3 className="text-headline-lg text-white font-bold">Top Result</h3>
                  <div
                    onClick={() => playTrack(topResultTrack)}
                    className="card-bg border border-charcoal rounded-lg p-lg space-y-md cursor-pointer hover:bg-[#181818] transition-colors"
                  >
                    <img
                      src={topResultTrack.coverUrl}
                      alt={topResultArtist || ''}
                      className="w-32 h-32 rounded-lg object-cover border border-charcoal"
                    />
                    <div>
                      <h4 className="text-2xl font-extrabold text-white">{topResultArtist}</h4>
                      <span className="inline-block mt-xs px-sm py-1 bg-[#262626] text-on-surface-variant text-xs font-mono uppercase rounded">
                        Artist
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Songs */}
              <div className="space-y-md">
                <h3 className="text-headline-lg text-white font-bold">Songs</h3>
                <div className="space-y-xs">
                  {results.slice(0, 4).map((track) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const isRowPlaying = isCurrent && isPlaying;
                    const liked = likedSongs.some(s => s.id === track.id);
                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track)}
                        className={`flex items-center justify-between p-sm rounded hover:bg-[#181818] cursor-pointer transition-colors group ${isCurrent ? 'text-primary' : 'text-white'
                          }`}
                      >
                        <div className="flex items-center gap-md min-w-0">
                          <span className="font-mono text-on-surface-variant text-xs w-5 text-center group-hover:hidden">
                            {isCurrent ? '' : ''}
                          </span>
                          <img src={track.coverUrl} alt={track.title} className="w-10 h-10 object-cover rounded border border-charcoal shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{track.title}</p>
                            <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-lg text-xs font-mono text-on-surface-variant shrink-0">
                          <button
                            onClick={(e) => handleLikeToggle(track, e)}
                            className={`hover:text-primary transition-all opacity-0 group-hover:opacity-100 ${liked ? 'opacity-100 text-primary' : 'text-on-surface-variant'
                              }`}
                          >
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                              favorite
                            </span>
                          </button>
                          <span className="hidden sm:inline">{track.album}</span>
                          <span>{track.duration}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Artists */}
          {uniqueArtists.length > 0 && (
            <div className="space-y-md">
              <h3 className="text-headline-lg text-white font-bold">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-md">
                {uniqueArtists.map((track) => (
                  <div key={track.artist} className="space-y-sm">
                    <img
                      src={track.coverUrl}
                      alt={track.artist}
                      className="w-full aspect-square rounded-lg object-cover border border-charcoal"
                    />
                    <div>
                      <p className="text-sm font-bold text-white truncate">{track.artist}</p>
                      <p className="text-xs text-on-surface-variant font-mono uppercase">Artist</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums */}
          {uniqueAlbums.length > 0 && (
            <div className="space-y-md">
              <h3 className="text-headline-lg text-white font-bold">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-md">
                {uniqueAlbums.map((track) => (
                  <div key={track.album} className="space-y-sm">
                    <img
                      src={track.coverUrl}
                      alt={track.album}
                      className="w-full aspect-square rounded-lg object-cover border border-charcoal"
                    />
                    <div>
                      <p className="text-sm font-bold text-white truncate">{track.album}</p>
                      <p className="text-xs text-on-surface-variant truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;