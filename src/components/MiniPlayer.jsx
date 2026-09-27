import React from 'react';
import { Play, Pause, SkipForward, Heart, Loader2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    togglePlayPause,
    handleNextTrack,
    isFav,
    handleToggleFavorite,
    setIsFullPlayerOpen
  } = usePlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 left-2 right-2 sm:left-4 sm:right-4 z-20 max-w-3xl mx-auto">
      <div
        onClick={() => setIsFullPlayerOpen(true)}
        className="bg-[#181818]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 sm:p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#202020] transition-all overflow-hidden relative"
      >
        {/* Progress bar line at the very bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
          <div
            className="h-full bg-[#FF0033] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Left: Artwork & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
          <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 shadow">
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`;
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate leading-tight">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 flex-shrink-0"
        >
          {/* Favorite */}
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFav ? 'text-[#FF0033]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Me gusta"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FF0033]' : ''}`} />
          </button>

          {/* Play/Pause / Loading */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={handleNextTrack}
            className="p-2 text-neutral-300 hover:text-white transition-colors"
            title="Siguiente canción"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
