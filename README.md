# The Slap Room — Video Downloader

## Folder structure

```
slap_room/
├── index.html          ← Main page (all sections)
├── css/
│   └── style.css       ← All styles, brand tokens, animations
├── js/
│   ├── api.js          ← Backend integration layer  ← EDIT THIS
│   └── app.js          ← UI logic, interactions
├── assets/             ← Put logo images, favicon etc here
└── README.md
```

---

## Connecting your backend

Open **`js/api.js`** and do two things:

### 1. Set your API URL

```js
const API_BASE_URL = 'https://your-api.example.com'; // change this
```

Once changed, demo mode turns off automatically and real API calls begin.

### 2. Make sure your API returns this shape

```
GET /api/video?url=<encoded_video_url>
```

**Success (200):**
```json
{
  "success": true,
  "title": "My cool video",
  "thumbnail": "https://...",
  "duration": "1:23",
  "platform": "Instagram",
  "formats": [
    {
      "label": "Full HD",
      "quality": "1080p",
      "ext": "mp4",
      "size": "85 MB",
      "url": "https://direct-download-link.com/video.mp4"
    }
  ]
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": "Could not fetch this video. It may be private."
}
```

---

## Adding auth headers

In `js/api.js`, inside `fetchVideoInfo()`, uncomment:

```js
'Authorization': `Bearer ${YOUR_TOKEN}`,
```

---

## Recommended backend tools

| Tool | What it does |
|------|-------------|
| `yt-dlp` (Python) | Extracts video URLs from almost every platform |
| `cobalt.tools` API | Ready-made API for social video downloads |
| Node.js + `ytdl-core` | YouTube-specific downloader |
| Puppeteer | Headless browser scraping for harder platforms |

---

## Deploying

This is a pure static frontend — drop the folder on:
- **Netlify** (drag & drop the folder)
- **Vercel** (`vercel deploy`)
- **GitHub Pages**
- Any web host / CDN

Your backend can be a separate service (Node, Python, etc.) on any server.

---

## Brand colours

| Token | Hex | Use |
|-------|-----|-----|
| `--cyan` | `#00d9c0` | Primary accent, buttons |
| `--cyan-dark` | `#00b5a0` | Hover states, text |
| `--cyan-deeper` | `#008c7e` | Dark text on light bg |
| `--mint-bg` | `#d4fdf6` | Page background |
| `--text-dark` | `#0a2e2a` | Headings |
