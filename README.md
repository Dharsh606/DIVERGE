# DIVERGE — Music Streaming Platform

<p align="center">
  <img src="frontend/static/logo.png" alt="DIVERGE Logo" width="160" />
</p>

<p align="center">
  <strong>Take the uncommon route.</strong>
</p>

---

### Project & Evaluation Overview
* **Author / Intern:** **Dharshan V**
* **Role / Title:** Software Developer
* **Program:** **Tech Vedhu Internship Project Submission**
* **Primary Track:** Full-Stack Web Development (Go, SvelteKit, PostgreSQL)
* **Project Scope:** Core Music Streaming, Sound Canvas, Diverge Sessions, Track DNA, Anti-Algorithm, Offline Storage
* **Development Timeline:** Initiated October 10, 2026 | 45-Day Capstone Milestone
* **Submission Date:** October 30, 2026
* **Version:** 1.0 Production Candidate

#### Contact & Developer Profiles
* **Portfolio:** [dharshanvportfolio.netlify.app](https://dharshanvportfolio.netlify.app/)
* **GitHub:** [github.com/Dharsh606](https://github.com/Dharsh606)
* **Repository:** [github.com/Dharsh606/DIVERGE](https://github.com/Dharsh606/DIVERGE)
* **LinkedIn:** [linkedin.com/in/dharshanvreddy](https://www.linkedin.com/in/dharshanvreddy)
* **Email:** dharshan.vreddy2819@gmail.com
* **Phone:** +91 6382546285

---

## 1. Core Architecture

DIVERGE is an asynchronous, high-throughput digital audio platform engineered with an idiomatic **Go (Fiber)** backend and a reactive **SvelteKit** frontend, backed by **PostgreSQL 16** and full-length Creative Commons / Jamendo CDN audio streams.

```
                                  +-------------------+
                                  |   Web Browser     |
                                  | (SvelteKit Client)|
                                  +---------+---------+
                                            |
                         REST API & Auth    |   Audio Stream / Range Requests
                           (Port 5173)      |   (Port 8080)
                                            v
                                  +-------------------+
                                  |    Go Backend     |
                                  |   (Fiber v2.52)   |
                                  +----+---------+----+
                                       |         |
                      GORM / SQL Pool  |         | HTTP 206 Partial Content / CDN
                                       v         v
                     +-------------------+     +-------------------------+
                     | PostgreSQL 16     |     | Jamendo CDN Stream Pool |
                     | (diverge_db)      |     | (Full-Length 3-6m MP3s) |
                     +-------------------+     +-------------------------+
```

---

## 2. Feature Implementation

### Core Streaming Capabilities
* **Full-Length Audio Playback:** All catalog songs play as complete multi-minute tracks (bypassing restrictive 30-second preview clips).
* **Browse & Search:** High-performance catalog browsing with debounced search across titles, artists, and musical genres.
* **Music Player:** Persistent HTML5 audio player supporting HTTP 206 Partial Content range requests, custom playback controls, volume attenuation, mute toggle, Fisher-Yates shuffle, and three-state repeat modes.
* **Playlists:** Comprehensive playlist management including playlist creation, song addition, song removal, reordering, and public shareable URLs.
* **Offline Playback:** Browser-native caching leveraging IndexedDB and a custom Service Worker for offline track storage and quota inspection.
* **Social Sharing:** Unique share tokens for songs and playlists allowing direct playback links without requiring recipient authentication.

### The Six Distinct Discovery Systems
1. **Sound Canvas:** An interactive 2D spatial exploration interface mapping all tracks along Energy (X-axis) and Mood Valence (Y-axis). Users can explore, inspect audio metadata, and queue entire mood quadrants.
2. **Diverge Sessions:** Collaborative group listening rooms with shared queues and synchronized playback indicators.
3. **Track DNA:** A deterministic generative SVG glyph produced per song based strictly on its musical attributes (BPM, musical key, energy, and mood). No random values; the same song always renders its unique geometric signature.
4. **Anti-Algorithm:** A discovery mode designed to break algorithmic echo chambers by serving tracks structurally dissimilar to the user's primary listening profile.
5. **Trace:** A branching tree graph mapping personal listening paths over time, visually delineating sequential plays from divergent musical leaps.
6. **Context Tags:** Contextual tagging allowing listeners to associate songs with listening environments (e.g., `#midnight`, `#deep-focus`) and retrieve context-filtered recommendations.

---

## 3. Technology Stack

* **Backend:** Go 1.22+, Fiber v2 web framework, GORM ORM, Golang JWT v5, pq PostgreSQL driver, bcrypt password hashing.
* **Frontend:** SvelteKit, TypeScript, Vite, custom responsive CSS design tokens.
* **Database:** PostgreSQL 16 (UTF-8 encoding with C collation).
* **Storage & Streaming:** Browser IndexedDB for offline audio caching, HTTP Range streaming and Jamendo CDN pool for full-length audio delivery.

---

## 4. Design System and Guidelines

DIVERGE adheres to strict visual and UX standards:
* **Color Palette:**
  * Background: Diverge Ink (`#111019`)
  * Surface: Deep Aubergine (`#1B1827`)
  * Surface Raised: `#272236`
  * Primary Accent: Electric Iris (`#B19AFF`)
  * Secondary Accent: Signal Coral (`#FF796C`)
  * Foreground Text: Warm Ivory (`#F5F0E8`)
  * Muted Text: Lavender Grey (`#AAA4BB`)
  * Borders: Quiet Border (`#343044`)
* **Styling Rules:**
  * Custom 3D gradient glowing brand emblem and wordmark.
  * No generic purple gradients across UI components.
  * No pill-shaped buttons (standard geometric radius of 8px to 12px).
  * No fake metrics, fake reviews, or animated visitor counters.
  * No emoji icons in system UI.
  * No em dashes in copy.
  * No cursor animations or scroll theater.

---

## 5. Local Setup and Execution

### Prerequisites
* Go 1.22 or higher
* Node.js 18+ and npm
* PostgreSQL 16+

### Step 1: Database Initialization
1. Ensure PostgreSQL is running on `localhost:5432`.
2. Connect and execute:
   ```sql
   CREATE DATABASE diverge_db WITH ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C';
   ```

### Step 2: Configure Environment Variables
Copy `.env.example` in `backend/` to `.env`:
```ini
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=diverge2024
DB_NAME=diverge_db
JWT_SECRET=diverge-secret-key-production-replace
PORT=8080
JAMENDO_CLIENT_ID=
```

### Step 3: Run Backend and Seed Catalog
1. Navigate to the backend directory:
   ```powershell
   cd backend
   go run .\cmd\seed\main.go
   go run .\cmd\update_full_songs\main.go
   go run main.go
   ```
2. The Fiber server will start listening on `http://127.0.0.1:8080`.

### Step 4: Run Frontend
1. In a separate terminal, navigate to `frontend`:
   ```powershell
   cd frontend
   npm install
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
2. Open your browser at `http://127.0.0.1:5173`.

---

## 6. Future Platform Roadmap

1. **Cross-Platform Mobile Applications:** Native iOS and Android application releases using Capacitor/Flutter to bring DIVERGE's Sound Canvas, offline playback sync, and lock-screen media controls directly to mobile devices.
2. **Native Desktop Executable (.exe):** Standalone Windows executable packaged with low-latency audio engine, global system media hotkeys, and system tray minimization.
3. **Cloud Edge Deployment:** Production hosting strategy leveraging Vercel for zero-cold-start frontend edge delivery, Render/Fly.io for the containerized Go API, and Neon serverless PostgreSQL for elastic database scaling.
4. **WebAssembly DSP Engine:** In-browser Fast Fourier Transform (FFT) for direct audio frequency spectrum analysis and reactive waveforms.

---

## 7. API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/health` | Health check endpoint | No |
| POST | `/api/auth/register` | Create user account | No |
| POST | `/api/auth/login` | Log in and receive session cookie | No |
| POST | `/api/auth/logout` | Terminate session | No |
| GET | `/api/auth/me` | Fetch authenticated user profile | Yes |
| GET | `/api/songs` | Paginated song listing with search & genre filter | Optional |
| GET | `/api/songs/:id` | Song details | Optional |
| GET | `/api/songs/:id/stream` | Audio range request streaming endpoint | Optional |
| GET | `/api/songs/:id/dna` | Song Track DNA metadata | No |
| GET | `/api/songs/trending` | Top played songs in past 7 days | No |
| GET | `/api/genres` | Unique musical genres list | No |
| GET | `/api/playlists` | User playlists | Yes |
| POST | `/api/playlists` | Create new playlist | Yes |
| GET | `/api/playlists/:id` | Playlist detail with tracks | Yes |
| DELETE | `/api/playlists/:id` | Delete playlist | Yes |
| GET | `/api/share/playlist/:token` | Public playlist resolver | No |
| GET | `/api/recommendations` | Standard history-based recommendations | Optional |
| GET | `/api/recommendations/anti` | Anti-Algorithm comfort-zone breaking songs | Optional |
| GET | `/api/recommendations/canvas` | 2D Sound Canvas spatial coordinates | No |
| GET | `/api/recommendations/context` | Context-tag-based recommendations | Yes |
| POST | `/api/history` | Log track playback event | Yes |
| GET | `/api/history/trace` | Branching tree listening path | Yes |
| GET | `/api/tags` | List user context tags | Yes |
| POST | `/api/tags` | Attach context tag to song | Yes |
