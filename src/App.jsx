import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import MiniPlayer from './components/MiniPlayer';
import FullPlayerModal from './components/FullPlayerModal';
import PlaylistModal from './components/PlaylistModal';
import SettingsModal from './components/SettingsModal';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import LibraryView from './views/LibraryView';
import { PlayerProvider } from './context/PlayerContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [playlistTrack, setPlaylistTrack] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [libraryRefreshTrigger, setLibraryRefreshTrigger] = useState(0);

  // Register Service Worker for PWA offline & background capabilities
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  const handleOpenPlaylistModal = (track) => {
    setPlaylistTrack(track);
  };

  const handleReloadData = () => {
    setLibraryRefreshTrigger(prev => prev + 1);
  };

  return (
    <PlayerProvider>
      <div className="min-h-screen bg-[#030303] text-white flex flex-col justify-between selection:bg-[#FF0033]">
        {/* Top Navbar */}
        <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-4">
          {activeTab === 'home' && (
            <HomeView
              onOpenPlaylistModal={handleOpenPlaylistModal}
              onNavigateToSearch={() => setActiveTab('search')}
            />
          )}

          {activeTab === 'search' && (
            <SearchView onOpenPlaylistModal={handleOpenPlaylistModal} />
          )}

          {activeTab === 'library' && (
            <LibraryView
              key={libraryRefreshTrigger}
              onOpenPlaylistModal={handleOpenPlaylistModal}
            />
          )}
        </main>

        {/* Floating Mini Player */}
        <MiniPlayer />

        {/* Mobile Bottom Navigation */}
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Full Screen Player Modal */}
        <FullPlayerModal />

        {/* Add to Playlist Modal */}
        {playlistTrack && (
          <PlaylistModal
            track={playlistTrack}
            onClose={() => setPlaylistTrack(null)}
          />
        )}

        {/* Settings & Backup Modal */}
        {isSettingsOpen && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
            onReloadData={handleReloadData}
          />
        )}
      </div>
    </PlayerProvider>
  );
}
