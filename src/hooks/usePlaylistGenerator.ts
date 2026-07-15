import { useState } from 'react';
import type { Track } from '../data/mockData';
import { MOCK_TRACKS } from '../data/mockData';

export interface UsePlaylistGeneratorProps {}

export const usePlaylistGenerator = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<Track[]>([]);

  const handleGenerate = () => {
    if (!selectedGenre && !selectedMood && !prompt) return;
    
    setIsGenerating(true);
    // Mock API generation delay
    setTimeout(() => {
      // Filter tracks based on genre or just pick some random ones
      let filtered = MOCK_TRACKS;
      if (selectedGenre) {
        filtered = filtered.filter(t => t.genre.toLowerCase() === selectedGenre.toLowerCase());
      }
      
      // If we don't have matches, fallback to random tracks
      if (filtered.length === 0) {
        filtered = [MOCK_TRACKS[0], MOCK_TRACKS[2], MOCK_TRACKS[4]];
      } else {
        // shuffle and take up to 4
        filtered = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 4);
      }
      
      setGeneratedTracks(filtered);
      setIsGenerating(false);
    }, 1500);
  };

  const handleReset = () => {
    setSelectedGenre('');
    setSelectedMood('');
    setPrompt('');
    setGeneratedTracks([]);
  };

  return {
    selectedGenre,
    setSelectedGenre,
    selectedMood,
    setSelectedMood,
    prompt,
    setPrompt,
    isGenerating,
    generatedTracks,
    handleGenerate,
    handleReset
  };
};

export default usePlaylistGenerator;
