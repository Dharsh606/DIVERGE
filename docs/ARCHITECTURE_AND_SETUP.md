# DIVERGE — Technical Architecture, Setup & Engineering Specification

> **System**: DIVERGE Digital Audio Platform  
> **Author / Intern**: Dharshan V (Software Developer)  
> **Evaluation**: Tech Vedhu Internship Project Submission  
> **Backend**: Go 1.22 (Fiber, GORM) • **Frontend**: SvelteKit (Svelte 5, TypeScript)  
> **Database**: PostgreSQL 16 • **Audio Engine**: HTTP 206 Partial Content (Full-Length Songs) • **Offline**: IndexedDB & Service Worker  
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
   DB_PASSWORD=diverge2024
   DB_NAME=diverge_db
   DB_PORT=5432
   PORT=8080
   JWT_SECRET=diverge-production-secret-key-replace
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

### Audio Delivery Architecture (HTTP 206 Range Requests & Real Audio)
* Streaming uses `http.ServeContent` with HTTP 206 Partial Content byte ranges.
* All tracks utilize authentic master recording audio streams with real artist vocals and instrumentals.
* Rather than loading complete audio tracks into server or client memory, the browser requests specific byte boundaries (`Range: bytes=0-1048575`).
* Enables instant scrub-seeking without latency or memory degradation.

### Client-Side Offline Engine
* **Service Worker (`sw.js`)**: Intercepts network calls to serve cached application shell assets.
* **IndexedDB Store (`offline.ts`)**: Persists downloaded audio binary Blobs locally on disk.
* Playback off-grid generates local `blob:http` URLs, ensuring complete playback continuity without network connectivity.

### Signature Discovery Systems
1. **Anti-Algorithm Engine**: Geometric centroid inversion engine that queries tracks structurally opposite to the user's historical listening profile.
2. **Diverge Sessions**: Synchronized multi-client listening rooms utilizing lightweight real-time state coordination.
3. **Track DNA**: Deterministic procedural SVG rendering using FNV-1a hashing of acoustic attributes (BPM, key, energy, valence).
4. **Trace Journey**: Branching tree visualization representing listening progression and sonic departures.
5. **Context Tags**: Multi-dimensional tagging system linking acoustic profiles to environmental contexts.
6. **Multi-Attribute Discovery**: Real-time debounced catalog search across titles, artists, and genres with instant preview playback.

---

## 4. Future Platform Roadmap

* **Mobile Native Apps (iOS & Android):** Capacitor / Flutter native builds with background audio services and lock-screen widget integration.
* **Windows Desktop (.exe):** Native desktop executable with ASIO low-latency drivers and global hotkey listeners.
* **Cloud Edge Deployment:** Vercel frontend edge distribution + Render/Fly.io Go API + Neon serverless PostgreSQL.

---

## 5. Technical Architecture Review Reference

#### Q: How does audio streaming scale without memory exhaustion?
* **Details**: Go Fiber serves audio via chunked streaming with `c.SendFile` and Range headers. Files are streamed directly from disk or remote CDN proxies into socket buffers without buffering full payloads in RAM.

#### Q: What advantages does SvelteKit provide for a persistent media application?
* **Details**: Svelte eliminates the virtual DOM diffing layer by compiling to reactive vanilla JavaScript. Page transitions preserve the persistent bottom `<audio>` player context without unmounting or audio interruption.

#### Q: How is user authentication maintained?
* **Details**: Go issues signed JWT tokens (HMAC-SHA256) stored in `httpOnly` secure cookies. Cross-origin requests are handled via a Vite development proxy and dynamic Origin reflection, preventing CSRF and token leakage in `localStorage`.
