import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { addToHistory, isFavorite, toggleFavorite } from '../services/storage';

const PlayerContext = createContext(null);

// 1-second silent audio data URI to keep the mobile browser's audio session alive in background
const SILENT_AUDIO_URI = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

export function PlayerProvider({ children }) {
  const [ytPlayer, setYtPlayer] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const silentAudioRef = useRef(new Audio(SILENT_AUDIO_URI));

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all'); // 'none', 'all', 'one'
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isFav, setIsFav] = useState(false);

  // References to keep current values inside callbacks
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const currentTrackRef = useRef(currentTrack);
  const ytPlayerRef = useRef(ytPlayer);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { ytPlayerRef.current = ytPlayer; }, [ytPlayer]);

  // Favorite status
  useEffect(() => {
    if (currentTrack) {
      setIsFav(isFavorite(currentTrack.id));
    }
  }, [currentTrack]);

  // Initialize YouTube IFrame API
  useEffect(() => {
    // Configure silent audio for background loop
    silentAudioRef.current.loop = true;
    silentAudioRef.current.volume = 0.01;

    const initYT = () => {
      if (!window.YT || !window.YT.Player) return;

      new window.YT.Player('yt-hidden-player', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            console.log('YouTube Player Ready');
            setYtPlayer(event.target);
            ytPlayerRef.current = event.target;
            setIsPlayerReady(true);
          },
          onStateChange: (event) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (event.data === 1) { // Playing
              setIsPlaying(true);
              setIsLoading(false);
              silentAudioRef.current.play().catch(() => {});
            } else if (event.data === 2) { // Paused
              setIsPlaying(false);
              silentAudioRef.current.pause();
            } else if (event.data === 3) { // Buffering
              setIsLoading(true);
            } else if (event.data === 0) { // Ended
              handleNextTrack();
            }
          },
          onError: (event) => {
            console.warn('YouTube Player Error code:', event.data);
            setIsLoading(false);
            // Error codes: 2 (invalid param), 100 (not found), 101/150 (not allowed embed)
            if (event.data === 150 || event.data === 101) {
              setErrorMessage('Este video no permite reproducción externa. Pasando al siguiente...');
              setTimeout(() => handleNextTrack(), 1500);
            } else {
              setErrorMessage('Error al reproducir. Intentando con la siguiente canción...');
              setTimeout(() => handleNextTrack(), 1500);
            }
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = initYT;
      document.body.appendChild(tag);
    } else if (window.YT && window.YT.Player) {
      initYT();
    }
  }, []);

  // Time tracking interval while playing
  useEffect(() => {
    let interval = null;
    if (isPlaying && ytPlayer) {
      interval = setInterval(() => {
        try {
          if (ytPlayer.getCurrentTime && ytPlayer.getDuration) {
            const cur = ytPlayer.getCurrentTime() || 0;
            const dur = ytPlayer.getDuration() || 0;
            setCurrentTime(cur);
            setDuration(dur);

            // Update MediaSession Position State
            if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && dur > 0) {
              try {
                navigator.mediaSession.setPositionState({
                  duration: dur,
                  playbackRate: 1,
                  position: Math.min(cur, dur)
                });
              } catch (e) {}
            }
          }
        } catch (e) {}
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, ytPlayer]);

  // MediaSession API setup for lock screen & background controls
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

      navigator.mediaSession.setActionHandler('play', () => {
        if (ytPlayerRef.current?.playVideo) {
          ytPlayerRef.current.playVideo();
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (ytPlayerRef.current?.pauseVideo) {
          ytPlayerRef.current.pauseVideo();
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevTrack();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextTrack();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && ytPlayerRef.current?.seekTo) {
          ytPlayerRef.current.seekTo(details.seekTime, true);
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (ytPlayerRef.current?.getCurrentTime && ytPlayerRef.current?.seekTo) {
          const skip = details.seekOffset || 10;
          const target = Math.max(ytPlayerRef.current.getCurrentTime() - skip, 0);
          ytPlayerRef.current.seekTo(target, true);
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (ytPlayerRef.current?.getCurrentTime && ytPlayerRef.current?.seekTo) {
          const skip = details.seekOffset || 10;
          const target = ytPlayerRef.current.getCurrentTime() + skip;
          ytPlayerRef.current.seekTo(target, true);
        }
      });
    }
  }, [currentTrack]);

  /**
   * Play track directly using the YouTube Player engine
   */
  const playTrack = (track, newQueue = null, index = 0) => {
    if (!track) return;
    setErrorMessage(null);
    setIsLoading(true);
    setCurrentTrack(track);
    addToHistory(track);

    if (newQueue) {
      setQueue(newQueue);
      setCurrentIndex(index);
    } else {
      const exists = queueRef.current.findIndex(t => t.id === track.id);
      if (exists === -1) {
        setQueue(prev => [track, ...prev]);
        setCurrentIndex(0);
      } else {
        setCurrentIndex(exists);
      }
    }

    // Play in YouTube Player
    const player = ytPlayerRef.current;
    if (player && typeof player.loadVideoById === 'function') {
      try {
        player.loadVideoById(track.id);
        player.playVideo();
        silentAudioRef.current.play().catch(() => {});
      } catch (err) {
        console.error('Error loading video in YT Player:', err);
      }
    } else {
      // If player is still preparing, retry in 300ms
      const checkInterval = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          clearInterval(checkInterval);
          ytPlayerRef.current.loadVideoById(track.id);
          ytPlayerRef.current.playVideo();
          silentAudioRef.current.play().catch(() => {});
        }
      }, 300);
      setTimeout(() => clearInterval(checkInterval), 4000);
    }
  };

  const togglePlayPause = () => {
    const player = ytPlayerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
      silentAudioRef.current.play().catch(() => {});
    }
  };

  const handleNextTrack = () => {
    const q = queueRef.current;
    if (q.length === 0) return;

    if (repeatModeRef.current === 'one') {
      ytPlayerRef.current?.seekTo(0, true);
      ytPlayerRef.current?.playVideo();
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
    if (currentTime > 4) {
      ytPlayerRef.current?.seekTo(0, true);
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
    if (ytPlayerRef.current?.seekTo) {
      ytPlayerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
  };

  const toggleShuffle = () => setIsShuffle(prev => !prev);

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

  const addToQueue = (track) => setQueue(prev => [...prev, track]);
  const removeFromQueue = (index) => setQueue(prev => prev.filter((_, i) => i !== index));
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
        showVideo,
        setShowVideo,
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
