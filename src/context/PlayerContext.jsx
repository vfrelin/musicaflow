import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getAudioStreamUrl } from '../services/api';
import { addToHistory, isFavorite, toggleFavorite } from '../services/storage';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all'); // 'none', 'all', 'one'
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isFav, setIsFav] = useState(false);

  // Keep references to state values inside callbacks
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // Update favorite status whenever current track changes
  useEffect(() => {
    if (currentTrack) {
      setIsFav(isFavorite(currentTrack.id));
    }
  }, [currentTrack]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = 'auto';

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (navigator.mediaSession && 'setPositionState' in navigator.mediaSession) {
        try {
          if (audio.duration && !isNaN(audio.duration)) {
            navigator.mediaSession.setPositionState({
              duration: audio.duration,
              playbackRate: audio.playbackRate,
              position: audio.currentTime
            });
          }
        } catch (e) {}
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);

    const onEnded = () => {
      handleNextTrack();
    };

    const onError = (e) => {
      console.error('Audio playback error:', e);
      setIsLoading(false);
      setIsPlaying(false);
      // Attempt retry with next in queue if available
      if (queueRef.current.length > 1) {
        setTimeout(() => handleNextTrack(), 1000);
      } else {
        setErrorMessage('Error al reproducir audio. Probando siguiente servidor...');
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Update MediaSession API for Background Playback & Lock Screen
  useEffect(() => {
    if (!currentTrack) return;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Música',
        artist: currentTrack.artist || 'Artista',
        album: 'MusicaFlow',
        artwork: [
          { src: currentTrack.thumbnail || '/icon.svg', sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.thumbnail || '/icon.svg', sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.thumbnail || '/icon.svg', sizes: '192x192', type: 'image/jpeg' },
          { src: currentTrack.thumbnail || '/icon.svg', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      // Actions
      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current.play().catch(console.warn);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextTrack();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime - skipTime, 0);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        audioRef.current.currentTime = Math.min(audioRef.current.currentTime + skipTime, audioRef.current.duration || 0);
      });
    }
  }, [currentTrack]);

  /**
   * Play a track directly, optionally replacing or prepending to queue
   */
  const playTrack = async (track, newQueue = null, index = 0) => {
    if (!track) return;
    setErrorMessage(null);
    setIsLoading(true);
    setCurrentTrack(track);
    addToHistory(track);

    if (newQueue) {
      setQueue(newQueue);
      setCurrentIndex(index);
    } else {
      // If not provided, add to current queue if not in it
      const existsIndex = queueRef.current.findIndex(t => t.id === track.id);
      if (existsIndex === -1) {
        setQueue(prev => [track, ...prev]);
        setCurrentIndex(0);
      } else {
        setCurrentIndex(existsIndex);
      }
    }

    try {
      const streamData = await getAudioStreamUrl(track.id);
      audioRef.current.src = streamData.streamUrl;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Play track stream error:', err);
      setIsLoading(false);
      setErrorMessage(err.message || 'Error cargando stream.');
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current.src) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.warn);
    }
  };

  const handleNextTrack = () => {
    const q = queueRef.current;
    if (q.length === 0) return;

    if (repeatModeRef.current === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
      return;
    }

    let nextIdx = currentIndexRef.current + 1;

    if (isShuffleRef.current) {
      nextIdx = Math.floor(Math.random() * q.length);
    } else if (nextIdx >= q.length) {
      if (repeatModeRef.current === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    if (q[nextIdx]) {
      playTrack(q[nextIdx], q, nextIdx);
    }
  };

  const handlePrevTrack = () => {
    const q = queueRef.current;
    if (audioRef.current.currentTime > 4) {
      // If track has been playing for > 4s, restart it
      audioRef.current.currentTime = 0;
      return;
    }

    if (q.length === 0) return;

    let prevIdx = currentIndexRef.current - 1;
    if (prevIdx < 0) {
      prevIdx = q.length - 1;
    }

    if (q[prevIdx]) {
      playTrack(q[prevIdx], q, prevIdx);
    }
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const cycleRepeat = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  const handleToggleFavorite = () => {
    if (!currentTrack) return;
    const newState = toggleFavorite(currentTrack);
    setIsFav(newState);
  };

  const addToQueue = (track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue(currentTrack ? [currentTrack] : []);
    setCurrentIndex(0);
  };

  return (
    <PlayerContext.Provider
      value={{
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
        playTrack,
        togglePlayPause,
        handleNextTrack,
        handlePrevTrack,
        seek,
        toggleShuffle,
        cycleRepeat,
        handleToggleFavorite,
        addToQueue,
        removeFromQueue,
        clearQueue
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
