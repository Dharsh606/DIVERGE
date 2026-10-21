# DIVERGE — Frontend Architecture & Design Specification

> **Framework**: SvelteKit 2 / Svelte 5 (TypeScript, Vite)  
> **Aesthetic Philosophy**: Human-crafted audio design derived directly from the DIVERGE 3D logo mark  
> **Motion Standards**: React Bits Spotlight cursor tracking, Magic UI rotating conic Border Beam, and 60fps CSS animations  
> **Production URL**: [https://diverge-music.vercel.app](https://diverge-music.vercel.app)

---

## 1. Directory & Component Hierarchy

```
frontend/src/
├── app.css                         # Global design system tokens & human surface definitions
├── app.html                        # HTML5 document template & high-DPI logo favicon
├── lib/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthAndIntroExperience.svelte # 3.5s cinematic logo splash + luxury spotlight auth card
│   │   ├── cards/
│   │   │   └── SongCard.svelte     # Curated song card & compact list row with hover play overlay
│   │   ├── dna/
│   │   │   └── TrackDNA.svelte     # Deterministic FNV-1a procedural SVG music glyph generator
│   │   ├── layout/
│   │   │   └── Sidebar.svelte      # Grounded obsidian navigation bar with brand emblem & user chip
│   │   └── player/
│   │       └── MusicPlayer.svelte  # Persistent bottom audio bar with range scrub seek & volume controls
│   ├── services/
│   │   ├── api.ts                  # REST API client with automatic token & origin management
│   │   └── offline.ts              # IndexedDB binary blob audio caching engine
│   ├── stores/
│   │   ├── auth.ts                 # Reactive authentication state store (User, JWT session)
│   │   ├── player.ts               # Audio playback state (track queue, position, shuffle, repeat)
│   │   └── guest.ts                # Session-persisted guest catalog exploration store
│   └── types/
│       └── index.ts                # TypeScript interfaces (Song, Album, Artist, User, Playlist, Trace)
└── routes/
    ├── +layout.svelte              # Universal shell orchestrator (conditional sidebar & bottom player)
    ├── +page.svelte                # Root route (orchestrates cinematic intro -> luxury auth -> home reveal)
    ├── login/+page.svelte          # Standalone Sign In route with spotlight & border-beam effects
    ├── register/+page.svelte       # Standalone Create Account route with password strength meter
    ├── search/+page.svelte         # Debounced catalog search across Indian & World master tracks
    ├── library/+page.svelte        # Playlist management, context tags, and offline cache inspector
    ├── trace/+page.svelte          # Branching tree graph mapping personal listening departures
    ├── sessions/+page.svelte       # Collaborative synchronized listening rooms
    ├── profile/+page.svelte        # User profile, listening stats, and intro replay control
    ├── song/[id]/+page.svelte      # Song deep-dive, acoustic attributes, and context tag attachment
    └── playlist/[id]/+page.svelte  # Curated playlist tracklist and public token sharing
```

---

## 2. User Experience & Motion Engineering

### Stage 1: Cinematic 3.5-Second Logo Onboarding
When visitors open the application without an active session:
* **Acoustic Harmonic Waves:** Three expanding concentric wave rings bloom outward from the center, simulating acoustic soundwaves.
* **3D Floating Emblem:** The official DIVERGE 3D logo mark rises with smooth spring physics, subtle perspective rotation, and an iridescent aura glow (`#784BFF` & `#FF5C58`).
* **Typographic Reveal:** The wordmark **DIVERGE** staggers in with expanding letter-spacing (`0.1em` to `0.32em`) and gradient fill, followed by the tagline *"Take the uncommon route."*
* **Precision Frequency Scrubber:** A progress track advances smoothly for 3.5 seconds with live frequency equalizer bars.
* **Skip Control:** A discrete "Skip intro &rarr;" pill allows immediate entry at any moment.

### Stage 2: Luxury Spotlight & Border-Beam Authentication
After 3.5 seconds, the intro dissolves seamlessly into the **Luxury Auth Card**:
* **React Bits Spotlight Effect:** Real-time cursor coordinates track across the card surface, projecting a silky radial spotlight (`#784BFF` / `#FF5C58`) beneath the mouse pointer.
* **Magic UI Rotating Conic Border Beam:** A continuous traveling light beam along the 1px rounded border using pure CSS `conic-gradient` with mask composite exclusion.
* **Fluid Segmented Switcher:** Instant spring slider transitioning between *Sign In* and *Create Account*.
* **Live Password Strength Analyzer:** 4-stage color progression (*Weak Coral* &rarr; *Fair Amber* &rarr; *Good Iris* &rarr; *Strong Emerald*).
* **Audio Equalizer Loader:** Replaces generic spinning circles with 4 real-time animated soundwave frequency bars (`||||`) during API authentication requests.
* **Frictionless Guest Exploration:** Immediate bypass option for visitors who wish to test full-length streaming without creating an account.

### Stage 3: Normal Home & Music Player Reveal
Once authenticated or in guest mode:
* The full navigation sidebar and persistent bottom audio bar animate into place.
* The home page displays curated editorial moments, genre filter pills, trending songs, and personalized picks.
* An **"Intro Animation"** pill on the home page allows users to replay the 3D logo intro whenever desired.

---

## 3. Design Tokens (Derived from 3D Brand Logo)

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

## 4. Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript & SvelteKit checks
npm run check

# Create production build
npm run build
```
