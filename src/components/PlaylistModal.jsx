import React, { useState } from 'react';
import { X, Plus, FolderPlus, Check } from 'lucide-react';
import { getPlaylists, createPlaylist, addTrackToPlaylist } from '../services/storage';

export default function PlaylistModal({ track, onClose }) {
  const [playlists, setPlaylists] = useState(getPlaylists);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [addedMap, setAddedMap] = useState({});

  if (!track) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const created = createPlaylist(newPlaylistName);
    setPlaylists(getPlaylists());
    setNewPlaylistName('');
    setIsCreating(false);
    // Add track immediately to newly created playlist
    addTrackToPlaylist(created.id, track);
    setAddedMap(prev => ({ ...prev, [created.id]: true }));
  };

  const handleToggleAdd = (plId) => {
    addTrackToPlaylist(plId, track);
    setAddedMap(prev => ({ ...prev, [plId]: true }));
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#181818] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-white text-lg">Guardar en playlist</h3>
            <p className="text-xs text-neutral-400 truncate max-w-[260px]">{track.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Playlists */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2 max-h-60 pr-1">
          {playlists.map((pl) => {
            const isAdded = addedMap[pl.id] || pl.tracks.some(t => t.id === track.id);
            return (
              <button
                key={pl.id}
                onClick={() => handleToggleAdd(pl.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{pl.name}</p>
                  <p className="text-xs text-neutral-400">{pl.tracks.length} canciones</p>
                </div>
                {isAdded ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <Plus className="w-5 h-5 text-neutral-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Create New Playlist Button / Form */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-neutral-300 hover:text-white flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          >
            <FolderPlus className="w-5 h-5 text-[#FF0033]" />
            Crear nueva playlist
          </button>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3 pt-2">
            <input
              type="text"
              placeholder="Nombre de la playlist..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0033]"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-neutral-300 text-sm font-semibold hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#FF0033] hover:bg-[#CC0000] text-white text-sm font-semibold disabled:opacity-50"
              >
                Crear y Añadir
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
