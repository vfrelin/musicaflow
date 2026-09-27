import React, { useState, useEffect } from 'react';
import { Heart, Plus, ListMusic, History, Play, Trash2, FolderPlus } from 'lucide-react';
import { getFavorites, getPlaylists, getHistory, createPlaylist } from '../services/storage';
import { usePlayer } from '../context/PlayerContext';
import PlaylistDetailView from './PlaylistDetailView';
import TrackListItem from '../components/TrackListItem';

export default function LibraryView({ onOpenPlaylistModal }) {
  const { playTrack } = usePlayer();
  const [favorites, setFavorites] = useState(getFavorites);
  const [playlists, setPlaylists] = useState(getPlaylists);
  const [historyTracks, setHistoryTracks] = useState(getHistory);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlName, setNewPlName] = useState('');

  const refreshData = () => {
    setFavorites(getFavorites());
    setPlaylists(getPlaylists());
    setHistoryTracks(getHistory());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlName.trim()) return;
    createPlaylist(newPlName);
    setNewPlName('');
    setShowCreateModal(false);
    refreshData();
  };

  const handleOpenFavorites = () => {
    setSelectedPlaylist({
      id: 'pl-favorites',
      name: 'Canciones que te gustan',
      description: 'Todas tus canciones marcadas con corazón',
      isSystem: true,
      tracks: favorites
    });
  };

  // If a playlist is opened, show detail view
  if (selectedPlaylist) {
    // Keep it synced if it's the favorites playlist
    const activePl =
      selectedPlaylist.id === 'pl-favorites'
        ? { ...selectedPlaylist, tracks: favorites }
        : playlists.find(p => p.id === selectedPlaylist.id) || selectedPlaylist;

    return (
      <PlaylistDetailView
        playlist={activePl}
        onBack={() => {
          setSelectedPlaylist(null);
          refreshData();
        }}
        onUpdate={refreshData}
        onOpenPlaylistModal={onOpenPlaylistModal}
      />
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Tu Biblioteca</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
        >
          <Plus className="w-4 h-4 text-[#FF0033]" />
          Nueva Playlist
        </button>
      </div>

      {/* Favorites Banner Card */}
      <div
        onClick={handleOpenFavorites}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-700 to-neutral-900 p-6 cursor-pointer shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all group border border-white/10"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Canciones que te gustan</h2>
            <p className="text-xs text-red-100 font-medium">
              {favorites.length} {favorites.length === 1 ? 'canción' : 'canciones guardadas'}
            </p>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playTrack(favorites[0], favorites, 0);
              }}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"
            >
              <Play className="w-5 h-5 fill-black ml-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Playlists Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-neutral-400" />
          Tus Playlists ({playlists.filter(p => !p.isSystem).length})
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Create Card Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-center aspect-square rounded-2xl border border-dashed border-white/20 hover:border-[#FF0033] hover:bg-white/5 transition-all p-4 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-[#FF0033]/20 flex items-center justify-center mb-2 transition-colors">
              <FolderPlus className="w-6 h-6 text-neutral-400 group-hover:text-[#FF0033]" />
            </div>
            <span className="text-xs font-semibold text-neutral-300 group-hover:text-white">
              Crear playlist
            </span>
          </button>

          {/* User Playlists */}
          {playlists
            .filter((p) => !p.isSystem)
            .map((pl) => (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylist(pl)}
                className="group relative flex flex-col aspect-square rounded-2xl bg-[#181818] border border-white/10 p-4 cursor-pointer hover:bg-[#202020] transition-all overflow-hidden justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <ListMusic className="w-5 h-5 text-[#FF0033]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate">{pl.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{pl.tracks.length} temas</p>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Recent History */}
      {historyTracks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-neutral-400" />
              Historial de Reproducción
            </h2>
            <button
              onClick={() => {
                localStorage.removeItem('musicaflow_history');
                setHistoryTracks([]);
              }}
              className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
            >
              Borrar historial
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {historyTracks.slice(0, 10).map((track, idx) => (
              <TrackListItem
                key={`${track.id}-${idx}`}
                track={track}
                onPlay={() => playTrack(track, historyTracks, idx)}
                onOpenPlaylistModal={onOpenPlaylistModal}
              />
            ))}
          </div>
        </section>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-3">Nueva Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la playlist..."
                value={newPlName}
                onChange={(e) => setNewPlName(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0033]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-neutral-300 text-sm font-semibold hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newPlName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF0033] hover:bg-[#CC0000] text-white text-sm font-semibold disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
