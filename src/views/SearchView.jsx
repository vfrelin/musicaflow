import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Music, Disc3, Sparkles } from 'lucide-react';
import { searchTracks } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import TrackListItem from '../components/TrackListItem';

const QUICK_TAGS = [
  'Bad Bunny',
  'Feid',
  'The Weeknd',
  'Karol G',
  'Peso Pluma',
  'Rock en Español',
  'Lo-Fi Relax',
  'Top 50 Global',
  'Electrónica 2026',
  'Trap Latino'
];

export default function SearchView({ onOpenPlaylistModal, initialQuery = '' }) {
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState('music_songs'); // 'music_songs' | 'videos'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = async (searchTerm = query, searchFilter = filter) => {
    const q = (searchTerm || '').trim();
    if (!q) return;

    // Check if user pasted a YouTube link
    let cleanQ = q;
    if (q.includes('youtube.com/watch?v=') || q.includes('youtu.be/')) {
      const match = q.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      if (match && match[1]) {
        cleanQ = match[1];
      }
    }

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchTracks(cleanQ, searchFilter);
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    handleSearch(tag, filter);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Search Input Bar */}
      <div className="sticky top-14 z-20 pt-2 pb-1 bg-[#030303]">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar canción, artista o pega un link de YouTube..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-24 py-3.5 bg-[#181818] border border-white/10 rounded-2xl text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0033] shadow-lg transition-all"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {query && (
              <button
                onClick={handleClear}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim() || loading}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF0033] hover:bg-[#CC0000] text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => {
              setFilter('music_songs');
              if (query) handleSearch(query, 'music_songs');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'music_songs'
                ? 'bg-white text-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Canciones (YouTube Music)
          </button>
          <button
            onClick={() => {
              setFilter('videos');
              if (query) handleSearch(query, 'videos');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'videos'
                ? 'bg-white text-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Todos los Videos
          </button>
        </div>
      </div>

      {/* Quick Suggestion Tags */}
      {!searched && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <Sparkles className="w-4 h-4 text-[#FF0033]" />
            Búsquedas sugeridas
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-200 text-xs font-medium transition-all hover:scale-105 active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-16 rounded-xl bg-white/5 animate-pulse flex items-center p-3 gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-white/10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
                <div className="h-3 bg-white/5 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-1">
          <div className="text-xs text-neutral-400 font-medium px-2 pb-2">
            {results.length} resultados encontrados para "{query}"
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {results.map((track, idx) => (
              <TrackListItem
                key={`${track.id}-${idx}`}
                track={track}
                onPlay={() => playTrack(track, results, idx)}
                onOpenPlaylistModal={onOpenPlaylistModal}
              />
            ))}
          </div>
        </div>
      ) : searched ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 max-w-md mx-auto">
          <Disc3 className="w-12 h-12 text-neutral-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm font-semibold text-white">No se encontraron resultados</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            Prueba con otro nombre o artista, o revisa en los ajustes la instancia del servidor extractor.
          </p>
        </div>
      ) : null}
    </div>
  );
}
