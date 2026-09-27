import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, ListPlus, Radio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { isFavorite, toggleFavorite } from '../services/storage';

export default function TrackListItem({ track, onOpenPlaylistModal, onPlay, isActive }) {
  const { currentTrack, isPlaying, togglePlayPause, addToQueue } = usePlayer();
  const [fav, setFav] = useState(() => isFavorite(track.id));
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentTrack?.id === track.id;

  const handleHeartClick = (e) => {
    e.stopPropagation();
    const updated = toggleFavorite(track);
    setFav(updated);
  };

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else if (onPlay) {
      onPlay();
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
        isCurrent
          ? 'bg-white/10 text-white shadow-inner'
          : 'hover:bg-white/5 text-neutral-200'
      }`}
    >
      {/* Left: Thumbnail & Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-900 shadow-md">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;
            }}
          />
          {/* Play/Pause overlay */}
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isCurrent && isPlaying ? (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-[#FF0033] h-full animate-bounce"></span>
                <span className="w-1 bg-[#FF0033] h-2/3 animate-bounce delay-75"></span>
                <span className="w-1 bg-[#FF0033] h-4/5 animate-bounce delay-150"></span>
              </div>
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 pr-2">
          <h4
            className={`text-sm font-semibold truncate leading-tight ${
              isCurrent ? 'text-[#FF0033]' : 'text-neutral-100'
            }`}
          >
            {track.title}
          </h4>
          <p className="text-xs text-neutral-400 truncate mt-0.5 font-normal">
            {track.artist}
          </p>
        </div>
      </div>

      {/* Right: Duration, Fav & Menu */}
      <div className="flex items-center gap-1.5 flex-shrink-0 relative">
        <span className="text-xs text-neutral-400 font-mono hidden sm:inline mr-1">
          {track.durationFormatted || '0:00'}
        </span>

        {/* Favorite Heart */}
        <button
          onClick={handleHeartClick}
          className={`p-2 rounded-full transition-colors ${
            fav ? 'text-[#FF0033]' : 'text-neutral-400 hover:text-white'
          }`}
          title={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-[#FF0033]' : ''}`} />
        </button>

        {/* Options Menu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(prev => !prev);
          }}
          className="p-2 rounded-full text-neutral-400 hover:text-white transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-10 z-40 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl py-1.5 min-w-[180px] backdrop-blur-xl"
          >
            <button
              onClick={() => {
                addToQueue(track);
                setShowMenu(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-200 hover:bg-white/10 flex items-center gap-2.5"
            >
              <ListPlus className="w-4 h-4 text-neutral-400" />
              Añadir a la cola
            </button>
            <button
              onClick={() => {
                if (onOpenPlaylistModal) onOpenPlaylistModal(track);
                setShowMenu(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-200 hover:bg-white/10 flex items-center gap-2.5"
            >
              <Radio className="w-4 h-4 text-neutral-400" />
              Guardar en playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
