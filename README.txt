================================================================================
DIVERGE -- HIGH-PERFORMANCE DIGITAL AUDIO PLATFORM & MUSICOLOGY DISCOVERY SYSTEM
Tech Vedhu Internship Capstone Project Submission
================================================================================

AUTHOR / CANDIDATE DETAILS:
--------------------------------------------------------------------------------
Author / Intern     : Dharshan V
Role                : Software Developer (Full-Stack Web & Audio Systems)
Evaluation Program  : Tech Vedhu Internship Capstone Submission
Submission Track    : Full-Stack Web Development (Go, SvelteKit, PostgreSQL, Audio)
Contact Phone       : +91 6382546285
Contact Email       : dharshan.vreddy2819@gmail.com
Personal Portfolio  : https://dharshanvportfolio.netlify.app/
LinkedIn Profile    : https://www.linkedin.com/in/dharshanvreddy
GitHub Profile      : https://github.com/Dharsh606

OFFICIAL DEPLOYMENT & REPOSITORY LINKS:
--------------------------------------------------------------------------------
Live Web Application: https://diverge-music.vercel.app
GitHub Repository   : https://github.com/Dharsh606/DIVERGE
API Status          : Operational (HTTP 200 OK)
Deployment Platform : Vercel Global Edge Network


================================================================================
1. WELCOME & SUBMISSION OVERVIEW
================================================================================

Welcome to the official source code package and documentation for DIVERGE,
submitted as the final capstone project for the Tech Vedhu Internship Program
by Dharshan V.

DIVERGE is an enterprise-grade digital music streaming and acoustic discovery
platform engineered from the ground up to overcome the limitations of modern
algorithmic streaming services. It combines high-throughput backend services,
sub-second multi-catalog search, full-length master track streaming, and a
bespoke luxury user interface inspired directly by the 3D DIVERGE brand emblem.

The platform is fully deployed and accessible live in the browser without
requiring any local compilation or database setup:
>>> Launch Live Application: https://diverge-music.vercel.app <<<


================================================================================
2. SUBMISSION DELIVERABLES & DIRECTORY STRUCTURE
================================================================================

This ZIP package contains the complete source code, documentation assets,
and evaluation deliverables organized as follows:

DIVERGE/
│
├── README.txt                     <-- You are reading this file (Submission Guide)
├── README.md                      <-- High-contrast GitHub presentation & badges
│
├── docs/                          <-- EVALUATION DELIVERABLES & DOCUMENTATION
│   ├── project-report.pdf         <-- Comprehensive 12-page Technical Project Report
│   │                                  (Architecture, Schema, Testing Matrix, Q&A)
│   ├── presentation.pptx          <-- 12-Slide Widescreen (16:9) Pitch Deck
│   │                                  (Executive summary, design system, diagrams)
│   ├── ARCHITECTURE_AND_SETUP.md  <-- Complete Engineering & Local Setup Specification
│   ├── logo.png                   <-- Official 3D Brand Logo Wordmark
│   └── logo-mark.png              <-- High-DPI 3D Emblem Symbol
│
├── backend/                       <-- HIGH-PERFORMANCE GO BACKEND
│   ├── cmd/
│   │   ├── seed/                  <-- Catalog database seeder
│   │   ├── update_full_songs/     <-- Full-length track metadata updater
│   │   └── restore_real_songs/    <-- Acoustic attribute normalizer
│   ├── config/                    <-- Environment & configuration loader
│   ├── database/                  <-- PostgreSQL connection pool & GORM migrations
│   ├── handlers/                  <-- FastHTTP REST API route controllers
│   ├── middleware/                <-- JWT cookie validation & CORS handlers
│   ├── models/                    <-- 9 normalized relational database entities
│   ├── services/                  <-- Audio streaming, catalog & recommendation logic
│   ├── go.mod & go.sum            <-- Go 1.22 dependency definitions
│   └── main.go                    <-- Fiber server entrypoint & router initialization
│
└── frontend/                      <-- REACTIVE SVELTEKIT / SVELTE 5 CLIENT
    ├── src/
    │   ├── lib/
    │   │   ├── components/        <-- UI components (AudioPlayer, Search, Waves, Auth)
    │   │   ├── server/            <-- Server-side YouTube Music InnerTube proxy
    │   │   ├── services/          <-- Client REST API client & IndexedDB engine
    │   │   ├── stores/            <-- Reactive stores (player, auth, search, liked)
    │   │   └── types/             <-- TypeScript interfaces & data contracts
    │   └── routes/                <-- SvelteKit file-based routing (+layout, +page)
    │       ├── api/               <-- Serverless endpoints (songs, search, genres, auth)
    │       ├── search/            <-- Instant multi-genre search catalog view
    │       ├── library/           <-- Personal collection, playlists & Liked Songs
    │       ├── trace/             <-- Procedural acoustic journey graph
    │       └── profile/           <-- Account management & playback statistics
    ├── static/                    <-- Web App Manifest, Service Worker (PWA) & Icons
    ├── package.json               <-- Frontend dependencies & scripts
    └── vite.config.ts             <-- Vite bundler configuration


================================================================================
3. CORE ARCHITECTURAL CAPABILITIES & FEATURES
================================================================================

1. FULL-LENGTH MASTER AUDIO STREAMING
   - Delivers complete 3 to 6+ minute studio master recordings across the entire
     regional and international music catalog.
   - Built on HTTP 206 Partial Content range requests and YouTube Music InnerTube
     audio engine with zero artificial duration restrictions.

2. SUB-SECOND INSTANT UNIVERSAL SEARCH
   - Single central search hub with continuous rotating laser beam glow and global
     Ctrl + K hotkey shortcut.
   - Fast sub-800ms query resolution for Bollywood hits, South Indian cinema
     soundtracks (Tamil, Telugu, Kannada, Malayalam), Punjabi beats, and global pop.
   - Reactive in-memory search store with instant query switching (e.g. KGF, Salaar,
     Leo, Baahubali, Anirudh hits) without full-page reloads.

3. LIKED SONGS & PERSONAL PLAYLISTS
   - One-click heart favoriting on bottom player bar and all song cards.
   - Client-side persistence synchronized to local storage and IndexedDB.
   - Dedicated "Liked Songs" section in Library with instant queue compilation.

4. NATIVE OS DESKTOP MINIPLAYER (DOCUMENT PICTURE-IN-PICTURE)
   - Supports Google Chrome and Microsoft Edge Document Picture-in-Picture API.
   - Pops out as an actual always-on-top floating OS window on the Windows desktop.
   - Minimizing Chrome leaves the Miniplayer active with spinning vinyl art,
     waveform visualizer, and Next, Previous, and Play/Pause transport controls.
   - Fullscreen expand button (⤢) transitions directly into the Fullscreen Studio.

5. IMMERSIVE FULLSCREEN STUDIO VISUALIZER
   - Dedicated 24-bar real-time audio spectrum analyzer and high-res artwork.
   - Integrated "Up Next / Queue" slide-in drawer to easily browse and switch
     songs on the fly without exiting fullscreen mode.

6. PROGRESSIVE WEB APP (PWA) WITH CHROME OMNIBOX INSTALL
   - Fully compliant Web App Manifest with 192x192 and 512x512 maskable PNG icons.
   - Active Service Worker caching app shell assets for offline availability.
   - Natively triggers the "Install DIVERGE" desktop monitor icon in Google Chrome
     address bar next to extensions and bookmarks, plus an in-app Install button.

7. 10-MINUTE INACTIVITY SECURITY AUTO-LOGOUT
   - Monitors user interaction (mouse, keyboard, scroll, touch).
   - If 10 minutes pass with no user activity and NO song is actively playing,
     the session securely auto-terminates and redirects to the login screen.
   - Active music playback keeps the session alive so listening is never interrupted.

8. CLEAN AUTHENTICATION VIEWPORT HIERARCHY
   - The login and registration viewports strictly hide navigation sidebars and
     player bars, rendering a pristine, focused luxury spotlight card.


================================================================================
4. TECHNOLOGY STACK SUMMARY
================================================================================

Layer                 Technology                   Purpose
-------------------   --------------------------   -----------------------------
Backend Router        Go 1.22 + Fiber v2           Zero-allocation HTTP gateway
Frontend Framework    SvelteKit 2 + Svelte 5       Pure reactivity without vDOM
Database              PostgreSQL 16 (UTF-8, C)     ACID relational data storage
ORM & Schema          GORM (Go)                    Entity auto-migrations
Audio Protocol        HTTP 206 Partial Content     Byte-range chunked streaming
Client Storage        IndexedDB + Service Worker   Binary audio blob offline PWA
UI Motion Engine      React Bits + CSS3 Hardware   Canvas waves, spotlight card
Authentication        Signed JWT + Bcrypt (Cost 10) HTTP-only secure cookie sessions


================================================================================
5. HOW TO REVIEW THIS SUBMISSION
================================================================================

1. IMMEDIATE LIVE EVALUATION:
   Open https://diverge-music.vercel.app in any modern browser (Google Chrome or
   Microsoft Edge recommended for PWA and Picture-in-Picture capabilities).

2. PRESENTATION DECK & PROJECT REPORT:
   Review the deliverables located in the "docs/" folder:
   - docs/presentation.pptx : 12-slide executive presentation
   - docs/project-report.pdf : 12-page technical report with test cases

3. LOCAL ENVIRONMENT SETUP (OPTIONAL):
   If you wish to compile and run the Go backend and PostgreSQL database locally,
   detailed step-by-step instructions are provided in:
   - docs/ARCHITECTURE_AND_SETUP.md


================================================================================
DIVERGE -- Capstone Engineering Project Submission for Tech Vedhu
Designed & Engineered by Dharshan V (Software Developer)
Live Platform: https://diverge-music.vercel.app
Portfolio    : https://dharshanvportfolio.netlify.app/
LinkedIn     : https://www.linkedin.com/in/dharshanvreddy
================================================================================
