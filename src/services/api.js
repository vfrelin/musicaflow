// Multi-instance fallback list for high availability and zero rate-limit blocks
export const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.tokhmi.xyz',
  'https://pipedapi.drgns.space',
  'https://pipedapi.leptons.xyz',
  'https://piped-api.garudalinux.org',
  'https://pa.il.ax'
];

export const INVIDIOUS_INSTANCES = [
  'https://invidious.f5.si',
  'https://vid.puffyan.us',
  'https://inv.riverside.rocks',
  'https://yt.artemislena.eu'
];

let currentInstanceIndex = 0;

export function getActiveInstance() {
  const saved = localStorage.getItem('musicaflow_custom_instance');
  if (saved) return saved;
  return PIPED_INSTANCES[currentInstanceIndex % PIPED_INSTANCES.length];
}

export function rotateInstance() {
  currentInstanceIndex = (currentInstanceIndex + 1) % PIPED_INSTANCES.length;
  console.log('Rotated to instance:', getActiveInstance());
  return getActiveInstance();
}

/**
 * Searches songs, artists, and videos with automatic instance fallback
 */
export async function searchTracks(query, filter = 'music_songs') {
  if (!query || !query.trim()) return [];

  // Try up to 3 instances
  for (let attempt = 0; attempt < 3; attempt++) {
    const instance = getActiveInstance();
    try {
      const url = `${instance}/search?q=${encodeURIComponent(query)}&filter=${filter}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.items || []);

      return items
        .filter(item => item.type === 'stream' || item.url?.includes('watch?v='))
        .map(item => {
          const videoId = item.url?.replace('/watch?v=', '') || item.id;
          return {
            id: videoId,
            title: cleanTitle(item.title),
            artist: item.uploaderName || item.author || 'Artista desconocido',
            duration: item.duration || 0,
            durationFormatted: formatDuration(item.duration),
            thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            uploadedDate: item.uploadedDate || ''
          };
        });
    } catch (err) {
      console.warn(`Search attempt ${attempt + 1} failed on ${instance}:`, err.message);
      rotateInstance();
    }
  }

  // Backup fallback: Search via Invidious API
  try {
    const invidiousUrl = `${INVIDIOUS_INSTANCES[0]}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
    const res = await fetch(invidiousUrl);
    if (res.ok) {
      const items = await res.json();
      return (items || []).map(item => ({
        id: item.videoId,
        title: cleanTitle(item.title),
        artist: item.author || 'Artista desconocido',
        duration: item.lengthSeconds || 0,
        durationFormatted: formatDuration(item.lengthSeconds),
        thumbnail: item.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
        uploadedDate: item.publishedText || ''
      }));
    }
  } catch (invErr) {
    console.warn('Invidious fallback also failed:', invErr);
  }

  return [];
}

/**
 * Resolves the direct audio stream URL for a given track videoId
 */
export async function getAudioStreamUrl(videoId) {
  if (!videoId) throw new Error('Missing videoId');

  for (let attempt = 0; attempt < PIPED_INSTANCES.length; attempt++) {
    const instance = getActiveInstance();
    try {
      const url = `${instance}/streams/${videoId}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data.audioStreams && data.audioStreams.length > 0) {
        // Pick best audio: prefer m4a (audio/mp4) for 100% iOS Safari compatibility, then opus/webm
        const m4aStreams = data.audioStreams.filter(s => s.mimeType?.includes('audio/mp4') || s.format === 'M4A');
        const sorted = (m4aStreams.length > 0 ? m4aStreams : data.audioStreams).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        
        const bestStream = sorted[0];
        return {
          streamUrl: bestStream.url,
          format: bestStream.format || 'm4a',
          bitrate: bestStream.bitrate,
          title: data.title || '',
          artist: data.uploader || '',
          thumbnail: data.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          duration: data.duration || 0
        };
      }
    } catch (err) {
      console.warn(`Stream fetch failed on ${instance}:`, err.message);
      rotateInstance();
    }
  }

  // Secondary fallback: Invidious audio proxy
  for (const invInstance of INVIDIOUS_INSTANCES) {
    try {
      const invUrl = `${invInstance}/api/v1/videos/${videoId}`;
      const res = await fetch(invUrl);
      if (res.ok) {
        const data = await res.json();
        const audios = data.adaptiveFormats?.filter(f => f.type?.includes('audio/')) || [];
        if (audios.length > 0) {
          const best = audios.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
          return {
            streamUrl: best.url,
            format: 'audio',
            bitrate: best.bitrate,
            title: data.title,
            artist: data.author,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: data.lengthSeconds
          };
        }
      }
    } catch (e) {
      // Continue next
    }
  }

  throw new Error('No se pudo extraer el audio de este tema. Intenta con otra canción.');
}

/**
 * Clean up clutter from YouTube titles like "(Official Video)", "[Lyrics]", "(Visualizer)"
 */
function cleanTitle(title) {
  if (!title) return '';
  return title
    .replace(/\[official (music )?video\]/gi, '')
    .replace(/\(official (music )?video\)/gi, '')
    .replace(/\(video oficial\)/gi, '')
    .replace(/\[video oficial\]/gi, '')
    .replace(/\(visualizer\)/gi, '')
    .replace(/\[visualizer\]/gi, '')
    .replace(/\(audio\)/gi, '')
    .replace(/\[audio\]/gi, '')
    .replace(/\(letra\)/gi, '')
    .replace(/\[letra\]/gi, '')
    .replace(/\(lyrics\)/gi, '')
    .replace(/\[lyrics\]/gi, '')
    .replace(/\(official audio\)/gi, '')
    .replace(/【Official.*】/gi, '')
    .trim();
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
