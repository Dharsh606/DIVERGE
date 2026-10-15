# DIVERGE — Clean Installation, Setup & Executive Presentation Guide

> **Project Title**: DIVERGE — Next-Generation Music Streaming Service  
> **Tech Stack**: Go (Fiber, GORM) • SvelteKit (Svelte 5, TypeScript) • PostgreSQL 16 • IndexedDB • Service Workers  
> **Evaluation Focus**: Full-stack web architecture, concurrent audio streaming, spatial algorithms, offline playback, and professional design systems.

---

## Part 1: Clean Installation & SQL Setup (Step-by-Step)

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Go** (v1.22+): Check with `go version`
* **Node.js** (v18+ or v20+): Check with `node -v`
* **PostgreSQL** (v15+ or v16+): Check with `psql --version`

---

### 2. Database Setup (SQL Commands)
DIVERGE uses standard PostgreSQL with UTF-8 encoding.

1. **Start PostgreSQL service** (if using installed PostgreSQL):
   ```powershell
   # Windows Services
   net start postgresql-x64-16
   ```
   *(If using portable PostgreSQL in `j:\DIVERGE\pgsql`)*:
   ```powershell
   & "j:\DIVERGE\pgsql\pgsql\bin\postgres.exe" -D "j:\DIVERGE\pgsql\data"
   ```

2. **Open PostgreSQL Shell (`psql`)**:
   ```powershell
   psql -U postgres
   ```

3. **Execute SQL Setup Commands**:
   ```sql
   -- 1. Create dedicated database with UTF-8 encoding
   CREATE DATABASE diverge_db WITH TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C';

   -- 2. Grant all privileges to postgres user
   GRANT ALL PRIVILEGES ON DATABASE diverge_db TO postgres;

   -- 3. Connect to diverge_db
   \c diverge_db;
   ```
   *Note*: You do **not** need to manually run `CREATE TABLE` scripts. When the Go backend boots up, GORM automatically runs `AutoMigrate()` and creates all 9 relational tables:
   * `users`, `artists`, `albums`, `songs`, `playlists`, `playlist_songs`, `listening_histories`, `context_tags`, `diverge_sessions`.

---

### 3. Backend Setup & Run (Go)

1. **Configure Environment Variables**:
   In `backend/.env` (or copy from `.env.example`):
   ```env
   DB_HOST=127.0.0.1
   DB_USER=postgres
   DB_PASSWORD=diverge2024
   DB_NAME=diverge_db
   DB_PORT=5432
   PORT=8080
   JWT_SECRET=diverge-super-secret-key-change-in-prod
   ```

2. **Download Go Dependencies & Compile**:
   ```powershell
   cd j:\DIVERGE\backend
   go mod tidy
   go build -o diverge_backend.exe .
   ```

3. **Seed Database with Indian & World Catalog (42+ Songs)**:
   ```powershell
   go run cmd/seed/main.go
   ```
   *This seeds iconic tracks across Bollywood (Arijit Singh, Pritam), Tamil (Anirudh), Punjabi (Diljit Dosanjh), Telugu (Sid Sriram), A.R. Rahman, Indie (Prateek Kuhad), plus World hits (The Weeknd, Coldplay, Ludovico Einaudi).*

4. **Start the Go Backend Server**:
   ```powershell
   .\diverge_backend.exe
   ```
   *Server will start listening on `http://127.0.0.1:8080`.*

---

### 4. Frontend Setup & Run (SvelteKit)

1. **Install NPM Packages**:
   ```powershell
   cd j:\DIVERGE\frontend
   npm install
   ```

2. **Start the Frontend Development Server**:
   ```powershell
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
   *Open browser at `http://127.0.0.1:5173`.*

---

## Part 2: Feature Walkthrough & Demonstration

### Core Music Streaming Features:
1. **Browse & Stream**:
   * Over 42 songs seeded across Indian (Hindi, Tamil, Telugu, Punjabi, Classical) and World genres.
   * Streaming uses **HTTP 206 Partial Content (Range Requests)** for instant audio playback and scrub-seeking without loading full files into memory.
2. **Persistent Audio Player**:
   * Bottom bar with playback controls, custom geometric slider, volume control, shuffle (Fisher-Yates algorithm), and repeat modes.
3. **Live Indian & World Search Network**:
   * Search any song or artist in real-time (e.g., *Arijit Singh, Anirudh, Diljit, The Weeknd*).
   * Live streaming preview audio, HD 600x600 cover artwork, and auto-computed Sound Canvas coordinates.
4. **Offline Playback (IndexedDB + Service Worker)**:
   * Click **Save for Offline** on any song.
   * Disconnect your Wi-Fi or turn on Airplane Mode.
   * The song plays instantly from the browser's local IndexedDB binary cache.
5. **Playlists & Social Sharing**:
   * Create custom playlists, reorder songs, and generate shareable links (`/playlist/share/[token]`).

### The Six Unique DIVERGE Features:
1. **Sound Canvas**: 2D spatial acoustic map plotting every track by Energy ($X$-axis) vs. Mood Valence ($Y$-axis). Click anywhere on the coordinate plane to discover songs by vibe.
2. **Diverge Sessions**: Synchronized collaborative listening rooms for real-time shared playback.
3. **Track DNA**: Procedural generative SVG glyphs mathematically rendered from each song's BPM, musical key, and acoustic energy.
4. **Anti-Algorithm Mode**: Comfort-zone breaking recommendations that calculate the inverse centroid of your listening history to expose you to fresh sounds.
5. **Trace**: A branching visual history tree showing musical ancestry and how you discovered each track.
6. **Context Tags**: Tag songs with real-world activity contexts (*Deep Work*, *Midnight Coding*, *Gym Surge*) for contextual playlist filtering.

---

## Part 3: How to Present in Front of Manager & HR

### 1. The 60-Second Elevator Pitch
> *"Good morning. I built **DIVERGE**, a high-performance music streaming application developed in Go and SvelteKit, backed by PostgreSQL. While mainstream platforms like Spotify keep listeners trapped in algorithmic echo chambers, DIVERGE introduces spatial discovery through a 2D Sound Canvas, deterministic generative Track DNA glyphs, and a comfort-zone-breaking Anti-Algorithm. Technically, it handles concurrent audio streaming via HTTP 206 Range requests, provides full offline playback via browser IndexedDB and Service Workers, and connects to an open live search network for Indian and World music."*

---

### 2. Five-Minute Live Demo Flow

1. **Step 1: The Home Page & Design System (1 min)**
   * Show the centered glassmorphic layout, Electric Iris to Signal Coral branding, and editorial trending section.
   * Play a track (e.g. *Kesariya* or *Hukum*) to demonstrate instant playback.
2. **Step 2: The Player & Range Seeking (30 sec)**
   * Drag the progress bar back and forth. Explain: *"Notice how seeking is instantaneous. That is powered by Go handling HTTP 206 Byte Range requests, so the browser only buffers the exact bytes needed rather than downloading the entire file."*
3. **Step 3: Sound Canvas & Track DNA (1 min)**
   * Open `/canvas`. Explain: *"Instead of endless vertical lists, this 2D plane plots tracks by Energy and Mood Valence. Clicking any point starts a spatial playlist based on mood."*
   * Click on a song to show its generative **Track DNA** glyph generated from its BPM and musical key.
4. **Step 4: Live Indian & World Search (1 min)**
   * Go to `/search`. Click on the **Live Network** tab or click the quick pills (*Bollywood Hits*, *Tamil & South*, *Punjabi Beats*).
   * Search for an artist (e.g. *Arijit Singh*). Demonstrate that it pulls live streamable tracks with HD artwork and adds them to the catalog in real-time.
5. **Step 5: Offline Playback Test (1 min)**
   * Open a song, click **Save for Offline**.
   * Open Developer Tools (`F12`), go to **Network**, check **Offline**.
   * Play the song again. Show that it plays smoothly directly from IndexedDB without internet.

---

### 3. Technical Questions Managers Will Ask (And What to Answer)

#### Q1: "Why did you choose Go for the backend instead of Node.js or Python?"
* **Answer**: *"Go provides native lightweight concurrency via goroutines, compile-time type safety, and minimal memory overhead. For music streaming, Go's `http.ServeContent` and Fiber's file handling make streaming HTTP 206 byte-ranges extremely efficient, allowing hundreds of concurrent audio streams without consuming gigabytes of RAM."*

#### Q2: "Why SvelteKit instead of React?"
* **Answer**: *"Svelte compiles away at build time into minimal imperative JavaScript rather than using a heavy virtual DOM. This results in ultra-fast initial page loads (< 1 second) and smooth 60fps animations for the audio progress bar and Sound Canvas coordinates, which is critical for a responsive audio player."*

#### Q3: "How does Offline Playback actually work?"
* **Answer**: *"It uses a two-tier browser architecture: the **Service Worker** intercepts network requests to serve the cached app shell (HTML/CSS/JS), while the audio files are converted into binary `Blob` objects and persisted in the browser's local **IndexedDB**. When offline, the player creates a local `blob:http` object URL and streams it directly from the user's hard drive."*

#### Q4: "How does the Anti-Algorithm work?"
* **Answer**: *"Traditional recommendation engines calculate collaborative filtering and cosine similarity to find songs closest to what you already listen to. The Anti-Algorithm computes the geometric centroid of your recent listening history on the Energy vs. Mood plane and queries tracks in the diametrically opposite quadrant with inverted acoustic parameters, encouraging musical divergence."*

---

### 4. HR & Behavioral Questions (And What to Answer)

#### Q1: "What was the most challenging bug you encountered and how did you resolve it?"
* **Answer**: *"During authentication, cross-origin requests between `localhost` and `127.0.0.1` caused the browser to throw a `Failed to fetch` CORS preflight error, and password length validation was misaligned. I resolved it by implementing a multi-layer solution: configuring a dev server proxy in Vite to ensure same-origin requests, upgrading Go's CORS middleware to dynamically reflect allowed origins with credentials, and harmonizing password length validation across both client and server."*

#### Q2: "How did you manage the project timeline to complete it within 45 days?"
* **Answer**: *"I followed a strict milestone plan: Week 1 for schema design and Go Fiber scaffolding, Week 2 for database migrations and audio streaming, Week 3 for the Svelte interface and music player, Week 4 for unique features like Sound Canvas and Track DNA, and the final weeks for offline playback, performance optimization, and presentation documentation."*

#### Q3: "What would you add next if you had another month?"
* **Answer**: *"I would implement WebRTC for peer-to-peer Diverge Sessions to enable live voice chat while co-listening, add Web Audio API frequency visualizers for real-time FFT spectrum analysis on the player, and deploy containerized Docker instances to a Kubernetes cluster."*
