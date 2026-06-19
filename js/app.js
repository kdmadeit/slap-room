/* =============================================
   THE SLAP ROOM — js/app.js
   UI logic, interactions, scroll effects
   ============================================= */

// -----------------------------------------------
// STATE
// -----------------------------------------------
let currentPlatform = 'instagram';

// -----------------------------------------------
// PLATFORM SWITCHER
// -----------------------------------------------
function setPlatform(el, platform) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  currentPlatform = platform;

  const placeholders = {
    instagram: 'Paste Instagram Reel or post URL...',
    facebook:  'Paste Facebook video URL...',
    tiktok:    'Paste TikTok video URL...',
    youtube:   'Paste YouTube video or Shorts URL...',
    twitter:   'Paste X/Twitter video URL...',
    pinterest: 'Paste Pinterest video pin URL...',
    vimeo:     'Paste Vimeo video URL...',
  };

  document.querySelector('.url-input').placeholder =
    placeholders[platform] || 'Paste video URL here...';
}

function focusWithPlatform(platform) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    const pill = [...document.querySelectorAll('.pill')]
      .find(p => p.getAttribute('onclick')?.includes(`'${platform}'`));
    if (pill) setPlatform(pill, platform);
    document.querySelector('.url-input').focus();
  }, 600);
}

// -----------------------------------------------
// PASTE BUTTON
// -----------------------------------------------
async function pasteUrl() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('videoUrl').value = text;
    showToast('URL pasted!');
  } catch {
    document.getElementById('videoUrl').focus();
    showToast('Paste with Ctrl+V / Cmd+V');
  }
}

// -----------------------------------------------
// MAIN DOWNLOAD FLOW
// -----------------------------------------------
async function processUrl() {
  const url = document.getElementById('videoUrl').value.trim();

  if (!url) {
    showToast('Please paste a video URL first');
    document.getElementById('videoUrl').focus();
    return;
  }

  if (!url.startsWith('http')) {
    showToast('Please enter a valid URL starting with https://');
    return;
  }

  // Reset UI
  hideResult();
  hideError();
  setLoading(true);
  startProgress();

  try {
    // Call api.js → fetchVideoInfo()
    const data = await fetchVideoInfo(url);
    finishProgress();
    setTimeout(() => renderResult(data), 300);
  } catch (err) {
    finishProgress();
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

// -----------------------------------------------
// RENDER RESULT
// -----------------------------------------------
function renderResult(data) {
  const card     = document.getElementById('resultCard');
  const thumb    = document.getElementById('resultThumb');
  const title    = document.getElementById('resultTitle');
  const meta     = document.getElementById('resultMeta');
  const grid     = document.getElementById('formatGrid');

  // Thumbnail
  if (data.thumbnail) {
    thumb.innerHTML = `<img src="${data.thumbnail}" alt="thumbnail">`;
  } else {
    thumb.textContent = _detectPlatform(document.getElementById('videoUrl').value).emoji;
  }

  title.textContent = data.title || `${data.platform} video`;
  meta.textContent  = data.duration
    ? `${data.duration} · ${data.formats.length} formats available`
    : `${data.formats.length} formats available`;

  // Format buttons
  grid.innerHTML = data.formats.map(f => `
    <button class="format-btn" onclick="downloadFormat('${f.url}', '${f.ext}', '${f.quality}')">
      <span class="fmt-badge">${f.ext.toUpperCase()}</span>
      <span class="fmt-label">${f.label}</span>
      <span class="fmt-size">${f.quality}${f.size ? ' · ' + f.size : ''}</span>
    </button>
  `).join('');

  card.style.display = 'block';
  setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

// -----------------------------------------------
// DOWNLOAD A SPECIFIC FORMAT
// -----------------------------------------------
function downloadFormat(url, ext, quality) {
  if (url === '#demo') {
    showToast('🔧 Demo mode — connect your backend in js/api.js');
    return;
  }

  showToast(`⬇️ Starting ${quality} download...`);

  // Flash the button
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = `<span style="color:white;font-weight:700;font-size:0.85rem">✓ Downloading...</span>`;
  btn.style.background = 'var(--cyan)';
  btn.style.borderColor = 'var(--cyan)';
  setTimeout(() => { btn.innerHTML = orig; btn.style = ''; }, 2500);

  // Trigger the actual download via api.js
  const filename = `slap_room_${quality}.${ext}`;
  triggerDownload(url, filename);
}

// -----------------------------------------------
// LOADING / PROGRESS
// -----------------------------------------------
let _progressInterval = null;

function setLoading(on) {
  const btn  = document.getElementById('downloadBtn');
  const text = document.getElementById('btnText');
  btn.classList.toggle('loading', on);
  text.textContent = on ? '🔍 Fetching video...' : '⚡ Get Download Links';
}

function startProgress() {
  const wrap = document.getElementById('progressWrap');
  const bar  = document.getElementById('progressBar');
  wrap.style.display = 'block';
  bar.style.width = '0%';
  let pct = 0;
  _progressInterval = setInterval(() => {
    pct += Math.random() * 14;
    if (pct > 88) pct = 88;
    bar.style.width = pct + '%';
  }, 220);
}

function finishProgress() {
  clearInterval(_progressInterval);
  const bar = document.getElementById('progressBar');
  bar.style.width = '100%';
  setTimeout(() => {
    document.getElementById('progressWrap').style.display = 'none';
    bar.style.width = '0%';
  }, 400);
}

// -----------------------------------------------
// ERROR / RESULT VISIBILITY
// -----------------------------------------------
function showError(msg) {
  const el = document.getElementById('apiError');
  el.textContent = '⚠️ ' + msg;
  el.style.display = 'block';
}

function hideError() {
  document.getElementById('apiError').style.display = 'none';
}

function hideResult() {
  document.getElementById('resultCard').style.display = 'none';
}

// -----------------------------------------------
// FAQ ACCORDION
// -----------------------------------------------
function toggleFaq(btn) {
  const item   = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// -----------------------------------------------
// TOAST NOTIFICATION
// -----------------------------------------------
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

// -----------------------------------------------
// SCROLL-TRIGGERED REVEAL
// -----------------------------------------------
const _observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => _observer.observe(el));

// -----------------------------------------------
// KEYBOARD SHORTCUT — Enter key on URL input
// -----------------------------------------------
document.getElementById('videoUrl').addEventListener('keydown', e => {
  if (e.key === 'Enter') processUrl();
});

// -----------------------------------------------
// INTERNAL HELPER (mirrors api.js _detectPlatform)
// -----------------------------------------------
function _detectPlatform(url) {
  const u = (url || '').toLowerCase();
  if (u.includes('instagram'))              return { name: 'Instagram',  emoji: '📸' };
  if (u.includes('facebook') || u.includes('fb.watch')) return { name: 'Facebook', emoji: '📘' };
  if (u.includes('tiktok'))                return { name: 'TikTok',     emoji: '🎵' };
  if (u.includes('youtube') || u.includes('youtu.be')) return { name: 'YouTube',  emoji: '▶️' };
  if (u.includes('twitter') || u.includes('x.com'))   return { name: 'X (Twitter)', emoji: '𝕏' };
  if (u.includes('pinterest') || u.includes('pin.it')) return { name: 'Pinterest', emoji: '📌' };
  if (u.includes('vimeo'))                 return { name: 'Vimeo',      emoji: '🎞️' };
  return { name: 'Video', emoji: '🎬' };
}
