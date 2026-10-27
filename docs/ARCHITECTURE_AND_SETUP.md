# DIVERGE — Technical Architecture, Setup & Engineering Specification

> **System**: DIVERGE Digital Audio Platform  
> **Author / Intern**: Dharshan V (Software Developer)  
> **Evaluation**: Tech Vedhu Internship Project Submission  
> **Backend**: Go 1.22 (Fiber, GORM) • **Frontend**: SvelteKit (Svelte 5, TypeScript)  
> **Database**: PostgreSQL 16 • **Audio Engine**: HTTP 206 Partial Content (Full-Length Songs) • **Offline**: IndexedDB & Service Worker  
> **Live Web App**: [https://diverge-music.vercel.app](https://diverge-music.vercel.app)  
> **Source Code & Project Package (Google Drive)**: [Download Complete Archive](https://drive.google.com/drive/folders/1sH8__JBExhQXRdiQBAk-ezA1-2RXRVys?usp=sharing)  
> **Contact**: +91 6382546285 | dharshan.vreddy2819@gmail.com | [Portfolio](https://dharshanvportfolio.netlify.app/) | [GitHub](https://github.com/Dharsh606)

---

## 1. System Setup & PostgreSQL Configuration

### Prerequisites
* **Go** (v1.22+)
* **Node.js** (v18+ or v20+)
* **PostgreSQL** (v15+ or v16+)

### Database Initialization (SQL)
DIVERGE requires a PostgreSQL database configured with UTF-8 encoding:

```sql
-- Create dedicated database with UTF-8 encoding and C collation
CREATE DATABASE diverge_db WITH TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE diverge_db TO postgres;
```

*Note*: GORM automatically manages schema migrations via `AutoMigrate()` on server startup, generating all 9 relational entities:
* `users`, `artists`, `albums`, `songs`, `playlists`, `playlist_songs`, `listening_histories`, `context_tags`, `diverge_sessions`.

---

## 2. Environment & Execution

### Backend Execution (Go)
1. Configure `backend/.env`:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=postgres
   DB_PASSWORD=your_db_password
   DB_NAME=diverge_db
   DB_PORT=5432
   PORT=8080
   JWT_SECRET=your_secure_jwt_secret
   ```
2. Build and seed catalog with full-length audio tracks:
   ```powershell
   cd backend
   go mod tidy
   go build -o diverge_backend.exe .
   go run cmd/seed/main.go
   go run cmd/update_full_songs/main.go
   .\diverge_backend.exe
   ```
   *The server initializes on `http://127.0.0.1:8080`.*

### Frontend Execution (SvelteKit)
```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
*Access interface on `http://127.0.0.1:5173`.*

---

## 3. Engineering & Architectural Specifications

### UI/UX Motion Engineering & Onboarding Flow
* **Cinematic 3.5s Logo Intro**:
  - Fullscreen Obsidian Midnight (`#0A0912`) canvas.
  - Three concentric acoustic harmonic rings pulsing outward from center, simulating speaker frequency displacement.
  - The official DIVERGE 3D emblem rises with smooth spring physics and a subtle iridescent aura glow (`#784BFF` to `#FF5C58`).
  - Staggered typographic expansion: "DIVERGE" tracking expands smoothly from `0.1em` to `0.32em` with dynamic gradient text clipping, followed by the tagline *"Take the uncommon route."*
  - Synchronized high-precision audio frequency progress scrubber with instant skip capability.
* **Luxury Spotlight & Border-Beam Authentication (`AuthAndIntroExperience.svelte`)**:
  - **React Bits Spotlight Card**: Real-time cursor coordinates track across the card surface, projecting a dynamic radial spotlight (`#784BFF` / `#FF5C58`) beneath the mouse pointer.
  - **Magic UI Rotating Conic Border Beam**: A continuous traveling light beam along the 1px rounded border using pure CSS `conic-gradient` with mask composite exclusion.
  - **Fluid Segmented Switcher**: Instant spring slider transitioning between *Sign In* and *Create Account*.
  - **Live Password Strength Analyzer**: 4-stage color progression (*Weak Coral* &rarr; *Fair Amber* &rarr; *Good Iris* &rarr; *Strong Emerald*).
  - **Audio Equalizer Loader**: Replaces generic spinning circles with 4 real-time animated soundwave frequency bars (`||||`) during API authentication requests.
  - **Frictionless Guest Exploration**: Immediate bypass option for visitors who wish to test full-length streaming without creating an account.
* **Human-Crafted Surface Architecture**:
  - Replaced all indiscriminate glassmorphism and fuzzy floating background orbs with solid, high-performance dark surfaces (`#12101B`, `#1A1727`) and razor-sharp 1px border separation (`#231F35`, `#3C3456`).

### Ambient Background & Advanced Interaction Architecture
* **@react-bits/SlicedWaves Ambient Canvas**:
  - Full-screen HTML5 Canvas background running at exactly **40% opacity** (`opacity: 0.4`).
  - Vertical slatted shutter ribbons undulating across multi-frequency harmonic sine waves.
  - Interactive cursor tracking: Smooth mathematical interpolation of mouse coordinates adjusts focal elevation, depth of field, and slat highlight caps in real time.
  - Official brand palette blending: `#784BFF` (Iris), `#FF5C58` (Coral), `#FFAE33` (Gold) over `#0A0912` (Midnight).
* **The New Art Piece of Search (Top Header Centerpiece)**:
  - Search relocated from the navigation sidebar to the top sticky header.
  - Conic laser gradient beam border with continuous traveling glow on focus (`#784BFF` to `#FF5C58`).
  - Global hotkey listener: `Ctrl + K` / `⌘ K` focuses the input from anywhere in the app.
  - Interactive live preview dropdown hub: Instant matches for songs, artists, and albums, accompanied by direct one-click play buttons, audio format tags (`LOSSLESS`), and quick discovery vibe pills (`#Bollywood Hits`, `#Tamil & South`, `#Synthwave`, `#Lossless Hi-Fi`, `#A.R. Rahman`, `#Lo-Fi Chill`).
* **Account Dropdown & Modals System**:
  - Activated via top-right avatar button with dark charcoal aesthetic.
  - 8 fully functional items: *Account* (details modal), *Profile* (routing), *Recents* (listening drawer), *Upgrade to Premium* (Studio Lossless modal), *Support* (help & diagnostics modal), *Private Session* (interactive toggle switch pausing history/Trace), *Settings* (audio quality, crossfade, normalization, canvas toggle), *Log Out*.
  - Activity confirmation: *Your Updates* section with verified checkmark (*"You're all caught up"*).
* **Enhanced 4-Feature Bottom Player Bar**:
  - **Queue Drawer**: Dedicated drawer displaying *Now Playing* with live animated equalizer bars and *Next Up* queue list with track removal and clear actions.
  - **Connect to Device**: Target selector switching between Web Browser Direct Engine (24-bit 96kHz), DIVERGE Studio Cast, Living Room Streamer, and Studio Reference Headphones.
  - **Floating Miniplayer (PiP)**: Docked floating widget with rotating vinyl artwork, real-time waveform bars, and transport controls.
  - **Fullscreen Studio Visualizer**: Immersive full-screen visualizer featuring large artwork, typography, 24-bar audio spectrum visualizer, scrub slider, and complete controls.

### Audio Streaming & Playback Architecture
* **Full-Length Audio Pipeline**:
  - Delivers complete, uninterrupted multi-minute master tracks across the entire global and regional music catalog.
  - Asynchronous audio engine in `player.ts` supporting both direct HTTP 206 Partial Content byte ranges and high-throughput streaming.
  - Precise timeline scrubbing across full track durations with responsive time tracking and visualizer sync.
* **Instant Universal Music Search**:
  - High-performance search service (`/api/search` and Go `SearchCatalog`) delivering sub-second response times (< 800ms).
  - Fast catalog resolution across movies, regional discographies (Tamil, Telugu, Hindi, Kannada, Punjabi), and international artists.
  - In-memory LRU caching layer ensuring instant responses for frequent queries.
  - Rich metadata parsing: clean song titles, artist credits, high-definition cover art, and true track durations.
* **Personal Library & Liked Songs**:
  - Dedicated Liked Songs collection with persistent local synchronization, instant favoriting, and one-click queue playback.
  - Custom playlist management with drag ordering and public share links.
  - Contextual tagging linking listening environments to songs.
* **OS MediaSession Integration**:
  - Integrates with operating system media controls, mobile lock screens, and hardware keyboard media keys (play, pause, seek, next, prev).

### Client-Side Offline Engine
* **Service Worker (`sw.js`)**: Intercepts network calls to serve cached application shell assets.
* **IndexedDB Store (`offline.ts`)**: Persists downloaded audio binary Blobs locally on disk.
* Playback off-grid generates local `blob:http` URLs, ensuring complete playback continuity without network connectivity.

### Multi-Tier Session Persistence & Viewport Architecture
* **Dual-Tier Session Cache**: Authenticated user state and guest exploration tokens synchronize across both encrypted cookie storage and persistent client-side session cache (`diverge_user`), ensuring a frictionless experience across page refreshes.
* **Balanced Viewport Height Proportioning**: Calibrated 14.4px root typography scale (exact 10% reduction from standard 16px baseline), 76px balanced bottom audio player, and 65px top navigation bar ensuring all cards, editorial moments, and exploration strips sit comfortably under the viewport height (100dvh) at 100% browser zoom with crisp, natural proportions.
* **Zero-Conflict Overlay Hierarchy**: Strict z-index isolation hierarchy preventing UI occlusion:
  * Modals (Account, Premium, Help, Settings): `z-index: 10000` (Full viewport fixed backdrop)
  * Account & Search Popovers: `z-index: 900` - `1000` (Bounded viewport-aware scroll containers)
  * Floating Miniplayer: `z-index: 600`
  * Playback Queue & Connect to Device Drawers: `z-index: 500`
  * Persistent Bottom Player: `z-index: 50`
  * SlicedWaves Ambient Canvas: `z-index: 0` (40% opacity, pointer-events none)

### Core Discovery & Library Systems
1. **Liked Songs Collection**: Instant personal favorites hub with offline persistence and dedicated queue playback.
2. **Track DNA**: Deterministic procedural SVG rendering using acoustic attributes (BPM, key, energy, valence).
3. **Diverge Sessions**: Synchronized multi-client listening rooms utilizing lightweight real-time state coordination.
4. **Trace Journey**: Branching tree visualization representing listening progression and sonic departures.
5. **Context Tags**: Multi-dimensional tagging system linking acoustic profiles to environmental contexts.

### Design System Tokens (Extracted from 3D Brand Logo)
| Token | Hex / Value | Architectural Role |
| :--- | :--- | :--- |
| **Obsidian Midnight Base** | `#0A0912` | Deep rich ink canvas matching the 3D emblem core |
| **Card & Sidebar Surface** | `#12101B` | Grounded, high-contrast dark surface |
| **Raised Surface** | `#1A1727` | Subtle elevation for cards, dropdowns, and active inputs |
| **Electric Iris** | `#784BFF` | Primary brand purple-violet sampled from the logo mark |
| **Signal Coral** | `#FF5C58` | Vibrant accent coral sampled from the logo gradient |
| **Amber Gold** | `#FFAE33` | Warm highlight accent for badges and tags |
| **Brand Gradient Topline** | `linear-gradient(90deg, #784BFF, #FF5C58)` | 3px top accent on cards and hero blocks |
| **Crisp Borders** | `#231F35` / `#3C3456` | 1px border separation for structural clarity |
| **High-Contrast Typography** | `#F7F6FB` & `#9D96B2` | Accessible, human typographic hierarchy |

---

## 4. Future Platform Roadmap

* **Mobile Native Apps (iOS & Android):** Capacitor / Flutter native builds with background audio services and lock-screen widget integration.
* **Windows Desktop (.exe):** Native desktop executable with ASIO low-latency drivers and global hotkey listeners.
* **Cloud Edge Deployment:** Distributed multi-region edge deployment for zero-latency audio streaming with automated elastic database scaling.

---

## 5. Technical Architecture Review Reference

#### Q: How does audio streaming scale without memory exhaustion?
* **Details**: Go Fiber serves audio via chunked streaming with `c.SendFile` and Range headers. Files are streamed directly from disk or remote CDN proxies into socket buffers without buffering full payloads in RAM.

#### Q: What advantages does SvelteKit provide for a persistent media application?
* **Details**: Svelte eliminates the virtual DOM diffing layer by compiling to reactive vanilla JavaScript. Page transitions preserve the persistent bottom `<audio>` player context without unmounting or audio interruption.

#### Q: How is user authentication maintained?
* **Details**: Go issues signed JWT tokens (HMAC-SHA256) stored in `httpOnly` secure cookies. Cross-origin requests are handled via a Vite development proxy and dynamic Origin reflection, preventing CSRF and token leakage in `localStorage`.
