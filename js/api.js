/* =============================================
   THE SLAP ROOM — js/api.js
   Backend API integration layer.

   HOW TO CONNECT YOUR BACKEND:
   1. Set API_BASE_URL to your server endpoint
   2. Implement the fetchVideoInfo() function
      to call your real API
   3. The response must match the VideoInfo shape
      described below
   ============================================= */

// -----------------------------------------------
// CONFIG — change this to your backend URL
// -----------------------------------------------
const API_BASE_URL = 'https://your-api.example.com'; // 🔧 Replace with your backend URL
const API_TIMEOUT_MS = 15000; // 15 seconds

// -----------------------------------------------
// EXPECTED RESPONSE SHAPE FROM YOUR BACKEND
// -----------------------------------------------
/*
  GET /api/video?url=<encoded_url>

  Success response (200):
  {
    "success": true,
    "title": "Video title here",
    "thumbnail": "https://...",      // optional
    "duration": "2:34",              // optional
    "platform": "Instagram",
    "formats": [
      {
        "label": "Full HD",
        "quality": "1080p",
        "ext": "mp4",
        "size": "85 MB",             // optional
        "url": "https://..."         // direct download URL
      },
      {
        "label": "HD",
        "quality": "720p",
        "ext": "mp4",
        "size": "42 MB",
        "url": "https://..."
      },
      {
        "label": "Audio Only",
        "quality": "320kbps",
        "ext": "mp3",
        "size": "4 MB",
        "url": "https://..."
      }
    ]
  }

  Error response (4xx / 5xx):
  {
    "success": false,
    "error": "Human-readable error message"
  }
*/

// -----------------------------------------------
// MAIN API CALL — called by app.js
// -----------------------------------------------
async function fetchVideoInfo(url) {
  // ⬇️ DEMO MODE: returns fake data while backend is not connected.
  // Delete this block once your backend is live.
  if (API_BASE_URL === 'https://your-api.example.com') {
    return _demoFetchVideoInfo(url);
  }

  // ---- Real backend call ----
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/video?url=${encodeURIComponent(url)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${YOUR_TOKEN}`, // add auth header if needed
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Server returned ${response.status}`);
    }

    return data;

  } catch (err) {
    clearTimeout(timeout);

    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw err;
  }
}

// -----------------------------------------------
// DOWNLOAD TRIGGER — called when user picks a format
// -----------------------------------------------
function triggerDownload(downloadUrl, filename) {
  // Option A: direct link (works for same-origin or CORS-enabled URLs)
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename || 'video';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Option B: if you need to proxy the download through your backend,
  // replace the above with a fetch + Blob approach:
  /*
  fetch(`${API_BASE_URL}/api/download?url=${encodeURIComponent(downloadUrl)}`)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'video';
      a.click();
      URL.revokeObjectURL(blobUrl);
    })
    .catch(err => showToast('Download failed: ' + err.message));
  */
}

// -----------------------------------------------
// DEMO MODE — simulates a backend response
// Remove or disable once your real API is live
// -----------------------------------------------
async function _demoFetchVideoInfo(url) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 2200));

  const platform = _detectPlatform(url);

  return {
    success: true,
    title: `${platform.name} video`,
    thumbnail: null,
    duration: '0:32',
    platform: platform.name,
    formats: [
      { label: '4K Ultra HD', quality: '2160p', ext: 'mp4', size: '~320 MB', url: '#demo' },
      { label: 'Full HD',     quality: '1080p', ext: 'mp4', size: '~85 MB',  url: '#demo' },
      { label: 'HD',          quality: '720p',  ext: 'mp4', size: '~42 MB',  url: '#demo' },
      { label: 'Standard',    quality: '480p',  ext: 'mp4', size: '~18 MB',  url: '#demo' },
      { label: 'Mobile',      quality: '360p',  ext: 'mp4', size: '~9 MB',   url: '#demo' },
      { label: 'Audio Only',  quality: '320kbps', ext: 'mp3', size: '~4 MB', url: '#demo' },
    ],
  };
}

// -----------------------------------------------
// HELPERS
// -----------------------------------------------
function _detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('instagram'))              return { name: 'Instagram',  emoji: '📸' };
  if (u.includes('facebook') || u.includes('fb.watch')) return { name: 'Facebook', emoji: '📘' };
  if (u.includes('tiktok'))                return { name: 'TikTok',     emoji: '🎵' };
  if (u.includes('youtube') || u.includes('youtu.be')) return { name: 'YouTube',  emoji: '▶️' };
  if (u.includes('twitter') || u.includes('x.com'))   return { name: 'X (Twitter)', emoji: '𝕏' };
  if (u.includes('pinterest') || u.includes('pin.it')) return { name: 'Pinterest', emoji: '📌' };
  if (u.includes('vimeo'))                 return { name: 'Vimeo',      emoji: '🎞️' };
  return { name: 'Video', emoji: '🎬' };
}
