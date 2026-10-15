# DIVERGE — Music Streaming Platform

> **Take the uncommon route.**

DIVERGE is a high-performance web music streaming application engineered with a **Go (Fiber)** backend and a **SvelteKit** frontend, backed by **PostgreSQL** and the **Jamendo API** / Creative Commons audio stream repositories.

Designed from first principles to counteract algorithmic homogenization, DIVERGE enables users to discover music through spatial sonic maps, explore deterministic audio signatures, break out of recommendation echo chambers, visualize personal listening trajectories, and collaborate in synchronized listening rooms.

---

## 1. Core Architecture

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
                      GORM / SQL Pool  |         | HTTP Range Proxy / CDN
                                       v         v
                     +-------------------+     +-------------------------+
                     | PostgreSQL 16.9   |     | Audio Storage / Jamendo |
                     | (diverge_db)      |     | Creative Commons Stream |
                     +-------------------+     +-------------------------+
```

---

## 2. Feature Implementation

### Core Streaming Capabilities
* **Browse & Search:** High-performance catalog browsing with debounced search across titles, artists, and musical genres.
* **Music Player:** Persistent HTML5 audio player supporting HTTP 206 Partial Content range requests, custom playback controls, volume attenuation, mute toggle, Fisher-Yates shuffle, and repeat modes.
* **Playlists:** Comprehensive playlist management including playlist creation, song addition, song removal, reordering, and public shareable URLs.
* **Offline Playback:** Browser-native caching leveraging IndexedDB and a custom Service Worker for offline track storage and quota inspection.
* **Social Sharing:** Unique share tokens for songs and playlists allowing direct playback links without requiring recipient authentication.

### The Six Unique DIVERGE Features
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
* **Database:** PostgreSQL 16.9 (UTF-8 encoding with C collation).
* **Storage:** Browser IndexedDB for offline audio caching, HTTP Range streaming for remote audio delivery.

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

## 6. API Reference

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

---

## 7. Submission Deliverables

* **Source Code:** Clean, modular repository in `backend/` and `frontend/`.
* **Project Report:** Professional 16-chapter PDF documentation located in `docs/project-report.pdf`.
* **Presentation Slides:** 12-slide PowerPoint presentation located in `docs/presentation.pptx`.
