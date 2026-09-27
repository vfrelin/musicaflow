import React from 'react';
import { ArrowLeft, Play, Shuffle, Trash2, Music2, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { removeTrackFromPlaylist, deletePlaylist } from '../services/storage';
import TrackListItem from '../components/TrackListItem';

export default function PlaylistDetailView({ playlist, onBack, onUpdate, onOpenPlaylistModal }) {
  const { playTrack } = usePlayer();

  if (!playlist) return null;

  const tracks = playlist.tracks || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled, 0);
    }
  };

  const handleRemoveTrack = (trackId) => {
    removeTrackFromPlaylist(playlist.id, trackId);
    if (onUpdate) onUpdate();
  };

  const handleDeleteThisPlaylist = () => {
    if (window.confirm(`¿Seguro que deseas eliminar la playlist "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      onBack();
    }
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-150">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-300 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Biblioteca
        </button>

        {!playlist.isSystem && (
          <button
            onClick={handleDeleteThisPlaylist}
            className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
            title="Eliminar Playlist"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Playlist Header Card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-gradient-to-t from-white/5 to-white/10 p-6 rounded-3xl border border-white/10">
        <div className="w-40 h-40 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-2xl overflow-hidden">
          {tracks.length > 0 && tracks[0].thumbnail ? (
            <img
              src={tracks[0].thumbnail}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ListMusic className="w-16 h-16 text-[#FF0033]" />
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
            {playlist.isSystem ? 'Colección del Sistema' : 'Playlist Personal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-xs text-neutral-300">{playlist.description}</p>
          )}
          <p className="text-xs text-neutral-400 font-medium">
            {tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-2.5 justify-center sm:justify-start">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#FF0033] hover:bg-[#CC0000] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/50 disabled:opacity-50 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              Reproducir
            </button>
            <button
              onClick={handleShufflePlay}
              disabled={tracks.length === 0}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              Aleatorio
            </button>
          </div>
        </div>
      </div>

      {/* Song list */}
      <div className="space-y-1">
        {tracks.length > 0 ? (
          tracks.map((track, idx) => (
            <div key={`${track.id}-${idx}`} className="flex items-center gap-2 group">
              <span className="text-xs text-neutral-400 font-mono w-5 text-right flex-shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <TrackListItem
                  track={track}
                  onPlay={() => playTrack(track, tracks, idx)}
                  onOpenPlaylistModal={onOpenPlaylistModal}
                />
              </div>
              <button
                onClick={() => handleRemoveTrack(track.id)}
                className="p-2 text-neutral-400 hover:text-red-400 transition-colors rounded-full"
                title="Quitar de playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5">
            <Music2 className="w-10 h-10 text-neutral-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Esta playlist está vacía</p>
            <p className="text-xs text-neutral-400 mt-1">
              Busca tus canciones favoritas y agrégalas usando el menú de opciones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
