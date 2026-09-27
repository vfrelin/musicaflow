import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../services/api';

export default function FullPlayerModal() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    queue,
    currentIndex,
    isShuffle,
    repeatMode,
    isFav,
    errorMessage,
    isFullPlayerOpen,
    setIsFullPlayerOpen,
    togglePlayPause,
    handleNextTrack,
    handlePrevTrack,
    seek,
    toggleShuffle,
    cycleRepeat,
    handleToggleFavorite,
    playTrack,
    removeFromQueue
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [seekingValue, setSeekingValue] = useState(null);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const displayTime = seekingValue !== null ? seekingValue : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handleSliderChange = (e) => {
    setSeekingValue(parseFloat(e.target.value));
  };

  const handleSliderCommit = (e) => {
    const val = parseFloat(e.target.value);
    seek(val);
    setSeekingValue(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1c1c1c] via-[#0d0d0d] to-[#030303] flex flex-col justify-between p-6 overflow-y-auto safe-top safe-bottom animate-in fade-in slide-in-from-bottom-10 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsFullPlayerOpen(false)}
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            Reproduciendo
          </span>
          <p className="text-xs text-neutral-200 font-medium">MusicaFlow Stream</p>
        </div>

        <button
          onClick={() => setShowQueue(!showQueue)}
          className={`p-2.5 rounded-full transition-colors ${
            showQueue ? 'bg-[#FF0033] text-white' : 'bg-white/5 hover:bg-white/10 text-white'
          }`}
          title="Ver Cola"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>

      {/* Main Body: Switch between Artwork and Queue */}
      {!showQueue ? (
        <div className="flex-1 flex flex-col items-center justify-center my-6 max-w-sm mx-auto w-full">
          {/* Ambient Glow & Huge Album Art */}
          <div className="relative w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden shadow-2xl shadow-red-950/40 border border-white/10">
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`;
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#FF0033] animate-spin" />
              </div>
            )}
          </div>

          {/* Track Info & Like */}
          <div className="w-full mt-8 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-xl font-bold text-white truncate tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-sm font-medium text-neutral-400 truncate mt-1">
                {currentTrack.artist}
              </p>
            </div>
            <button
              onClick={handleToggleFavorite}
              className={`p-3 rounded-full transition-colors ${
                isFav ? 'text-[#FF0033]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Heart className={`w-7 h-7 ${isFav ? 'fill-[#FF0033]' : ''}`} />
            </button>
          </div>
        </div>
      ) : (
        /* Queue View */
        <div className="flex-1 flex flex-col my-4 max-w-md mx-auto w-full overflow-hidden bg-white/5 rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-[#FF0033]" />
              Cola de Reproducción ({queue.length})
            </h3>
            <button
              onClick={() => setShowQueue(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 my-2">
            {queue.map((t, idx) => {
              const isItemCurrent = idx === currentIndex;
              return (
                <div
                  key={`${t.id}-${idx}`}
                  onClick={() => playTrack(t, queue, idx)}
                  className={`flex items-center justify-between py-2.5 px-2 rounded-lg cursor-pointer ${
                    isItemCurrent ? 'bg-white/10 text-[#FF0033]' : 'hover:bg-white/5 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={t.thumbnail}
                      alt={t.title}
                      className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate leading-tight">{t.title}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{t.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isItemCurrent && (
                      <span className="text-[10px] bg-[#FF0033]/20 text-[#FF0033] px-2 py-0.5 rounded-full font-bold">
                        Sonando
                      </span>
                    )}
                    {queue.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(idx);
                        }}
                        className="text-neutral-500 hover:text-red-400 p-1"
                        title="Eliminar de la cola"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-xl flex items-center gap-2 mb-3 max-w-sm mx-auto w-full">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* Bottom Controls Area */}
      <div className="max-w-sm mx-auto w-full space-y-4">
        {/* Scrubber / Progress Bar */}
        <div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={displayTime}
              onChange={handleSliderChange}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400 font-mono mt-1.5">
            <span>{formatDuration(displayTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Buttons: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div className="flex items-center justify-between py-2">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition-colors ${
              isShuffle ? 'text-[#FF0033]' : 'text-neutral-400 hover:text-white'
            }`}
            title="Aleatorio"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={handlePrevTrack}
            className="p-3 text-neutral-200 hover:text-white transition-colors"
            title="Anterior"
          >
            <SkipBack className="w-7 h-7 fill-neutral-200" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-black animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 fill-black" />
            ) : (
              <Play className="w-8 h-8 fill-black ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={handleNextTrack}
            className="p-3 text-neutral-200 hover:text-white transition-colors"
            title="Siguiente"
          >
            <SkipForward className="w-7 h-7 fill-neutral-200" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            className={`p-2.5 rounded-full transition-colors ${
              repeatMode !== 'none' ? 'text-[#FF0033]' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repetir: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
