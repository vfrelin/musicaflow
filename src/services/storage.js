const FAVORITES_KEY = 'musicaflow_favorites';
const PLAYLISTS_KEY = 'musicaflow_playlists';
const HISTORY_KEY = 'musicaflow_history';

// ---------------- FAVORITES ----------------
export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isFavorite(trackId) {
  const favs = getFavorites();
  return favs.some(t => t.id === trackId);
}

export function toggleFavorite(track) {
  const favs = getFavorites();
  const exists = favs.some(t => t.id === track.id);
  let updated;
  if (exists) {
    updated = favs.filter(t => t.id !== track.id);
  } else {
    updated = [track, ...favs];
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return !exists;
}

// ---------------- PLAYLISTS ----------------
export function getPlaylists() {
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY);
    if (!raw) {
      // Seed default playlist
      const defaultPlaylists = [
        {
          id: 'pl-favorites',
          name: 'Canciones que te gustan',
          description: 'Tus favoritas guardadas',
          isSystem: true,
          tracks: []
        }
      ];
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(defaultPlaylists));
      return defaultPlaylists;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function createPlaylist(name, description = '') {
  const playlists = getPlaylists();
  const newPl = {
    id: 'pl-' + Date.now(),
    name: name.trim(),
    description: description.trim(),
    createdAt: new Date().toISOString(),
    tracks: []
  };
  const updated = [...playlists, newPl];
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
  return newPl;
}

export function deletePlaylist(playlistId) {
  const playlists = getPlaylists();
  const updated = playlists.filter(p => p.id !== playlistId && !p.isSystem);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
  return updated;
}

export function addTrackToPlaylist(playlistId, track) {
  const playlists = getPlaylists();
  const index = playlists.findIndex(p => p.id === playlistId);
  if (index === -1) return false;

  const exists = playlists[index].tracks.some(t => t.id === track.id);
  if (!exists) {
    playlists[index].tracks.push(track);
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }
  return true;
}

export function removeTrackFromPlaylist(playlistId, trackId) {
  const playlists = getPlaylists();
  const index = playlists.findIndex(p => p.id === playlistId);
  if (index === -1) return false;

  playlists[index].tracks = playlists[index].tracks.filter(t => t.id !== trackId);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  return true;
}

// ---------------- HISTORY ----------------
export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addToHistory(track) {
  try {
    const history = getHistory().filter(t => t.id !== track.id);
    const updated = [track, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to update history', e);
  }
}

// ---------------- BACKUP / RESTORE ----------------
export function exportBackup() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites: getFavorites(),
    playlists: getPlaylists()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `musicaflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.favorites && Array.isArray(data.favorites)) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites));
    }
    if (data.playlists && Array.isArray(data.playlists)) {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(data.playlists));
    }
    return true;
  } catch (e) {
    console.error('Error importing backup:', e);
    return false;
  }
}
