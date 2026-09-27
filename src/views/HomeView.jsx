import React, { useState, useEffect } from 'react';
import { Sparkles, History, Flame, Play, Music2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { searchTracks } from '../services/api';
import { getHistory, getFavorites } from '../services/storage';
import TrackListItem from '../components/TrackListItem';

export default function HomeView({ onOpenPlaylistModal, onNavigateToSearch }) {
  const { playTrack } = usePlayer();
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [historyTracks, setHistoryTracks] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setHistoryTracks(getHistory().slice(0, 6));
    setFavorites(getFavorites().slice(0, 6));

    // Fetch initial trending music
    async function loadTrending() {
      setLoadingTrending(true);
      try {
        const results = await searchTracks('Top 50 Hits Latino y Global');
        if (results && results.length > 0) {
          setTrendingTracks(results.slice(0, 15));
        } else {
          // Backup search
          const backup = await searchTracks('Hits 2026');
          setTrendingTracks(backup.slice(0, 15));
        }
      } catch (err) {
        console.warn('Failed to load trending tracks:', err);
      } finally {
        setLoadingTrending(false);
      }
    }
    loadTrending();
  }, []);

  return (
    <div className="space-y-8 pb-32">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/80 via-neutral-900 to-black border border-white/10 p-6 sm:p-8">
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF0033]/20 border border-[#FF0033]/40 text-[#FF0033] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Música Ilimitada en Segundo Plano
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Escucha sin anuncios y con la pantalla apagada
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300">
            Toda la música de YouTube en audio de alta calidad, guardada en tu móvil sin pagos ni suscripción.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateToSearch()}
              className="px-5 py-2.5 rounded-full bg-[#FF0033] hover:bg-[#CC0000] text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all active:scale-95"
            >
              Explorar Catálogo
            </button>
            {trendingTracks.length > 0 && (
              <button
                onClick={() => playTrack(trendingTracks[0], trendingTracks, 0)}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                Reproducir Éxitos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recently Played */}
      {historyTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-neutral-400" />
              Escuchado Recientemente
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {historyTracks.map((track) => (
              <TrackListItem
                key={track.id}
                track={track}
                onPlay={() => playTrack(track, historyTracks)}
                onOpenPlaylistModal={onOpenPlaylistModal}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Tracks */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF0033]" />
            Tendencias & Más Escuchadas
          </h2>
          {trendingTracks.length > 0 && (
            <button
              onClick={() => playTrack(trendingTracks[0], trendingTracks, 0)}
              className="text-xs text-[#FF0033] font-semibold hover:underline"
            >
              Reproducir todo
            </button>
          )}
        </div>

        {loadingTrending ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-16 rounded-xl bg-white/5 animate-pulse flex items-center p-3 gap-3"
              >
                <div className="w-12 h-12 rounded-lg bg-white/10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-3 bg-white/5 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : trendingTracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {trendingTracks.map((track, idx) => (
              <TrackListItem
                key={`${track.id}-${idx}`}
                track={track}
                onPlay={() => playTrack(track, trendingTracks, idx)}
                onOpenPlaylistModal={onOpenPlaylistModal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
            <Music2 className="w-10 h-10 text-neutral-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">Usa el buscador para comenzar a escuchar</p>
          </div>
        )}
      </section>
    </div>
  );
}
