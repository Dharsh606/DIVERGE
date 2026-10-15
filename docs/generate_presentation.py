import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(filename="j:/DIVERGE/docs/presentation.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # DIVERGE color palette
    c_bg = RGBColor(0x11, 0x10, 0x19)       # Diverge Ink
    c_card = RGBColor(0x1B, 0x18, 0x27)     # Deep Aubergine
    c_iris = RGBColor(0xB1, 0x9A, 0xFF)     # Electric Iris
    c_coral = RGBColor(0xFF, 0x79, 0x6C)    # Signal Coral
    c_text = RGBColor(0xF5, 0xF0, 0xE8)     # Warm Ivory
    c_muted = RGBColor(0xAA, 0xA4, 0xBB)    # Muted Lavender

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = c_bg
        bg.line.fill.background() # no line
        return bg

    def add_header(slide, title_text, category="DIVERGE INTERNSHIP CAPSTONE"):
        # Category pill/text
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(10), Inches(0.4))
        tf = cat_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = category.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = c_iris

        # Title text
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11), Inches(0.8))
        tf2 = title_box.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = title_text
        p2.font.size = Pt(28)
        p2.font.bold = True
        p2.font.color.rgb = c_text

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 1: TITLE SLIDE
    # ─────────────────────────────────────────────────────────────────────────
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    tbox = s1.shapes.add_textbox(Inches(1.2), Inches(2.2), Inches(11), Inches(3.0))
    tf = tbox.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "DIVERGE"
    p0.font.size = Pt(54)
    p0.font.bold = True
    p0.font.color.rgb = c_iris
    p0.space_after = Pt(10)

    p1 = tf.add_paragraph()
    p1.text = "A High-Performance Music Streaming Platform Using Go and Svelte"
    p1.font.size = Pt(22)
    p1.font.color.rgb = c_text
    p1.space_after = Pt(20)

    p2 = tf.add_paragraph()
    p2.text = "Take the uncommon route. — 45-Day Capstone Project Evaluation"
    p2.font.size = Pt(14)
    p2.font.color.rgb = c_coral

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 2: EXECUTIVE SUMMARY & VISION
    # ─────────────────────────────────────────────────────────────────────────
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Executive Summary: Beyond The Algorithmic Mainstream")

    c1 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = c_card
    c1.line.color.rgb = c_iris
    tf = c1.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Platform Philosophy"
    p.font.bold = True
    p.font.size = Pt(18)
    p.font.color.rgb = c_iris
    p.space_after = Pt(14)
    bullets = [
        "Spotify-inspired core functionality with intentional discovery innovations.",
        "Engineered with Go (Fiber) backend and SvelteKit frontend.",
        "Deterministic Discovery: Powered by exact musicology attributes (BPM, Key, Energy, Valence).",
        "Strict anti-vibe product visual rules: No purple gradients, no pill buttons, no fake reviews."
    ]
    for b in bullets:
        bp = tf.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(13)
        bp.font.color.rgb = c_text
        bp.space_after = Pt(10)

    c2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(4.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = c_card
    c2.line.color.rgb = c_coral
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Key Deliverables"
    p.font.bold = True
    p.font.size = Pt(18)
    p.font.color.rgb = c_coral
    p.space_after = Pt(14)
    bullets2 = [
        "Deliverable 1: Complete Go backend + SvelteKit frontend source code.",
        "Deliverable 2: Professional 16-chapter PDF technical project report.",
        "Deliverable 3: 12-slide comprehensive presentation deck.",
        "Full local deployment with PostgreSQL 16 and Creative Commons audio streaming."
    ]
    for b in bullets2:
        bp = tf2.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(13)
        bp.font.color.rgb = c_text
        bp.space_after = Pt(10)

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 3: PROBLEM STATEMENT
    # ─────────────────────────────────────────────────────────────────────────
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Problem Statement: Flaws in Contemporary Streaming")

    probs = [
        ("Algorithmic Homogenization", "Collaborative filtering creates self-reinforcing echo chambers, funneling listeners into identical popular tracks.", c_coral),
        ("High Streaming Overhead", "Naive web players load entire uncompressed audio files into browser RAM, draining mobile battery and causing buffering stalls.", c_iris),
        ("Superficial Interface Slog", "Modern web products overuse generic purple gradients, pill buttons, and fake user reviews that detract from listening focus.", c_text)
    ]
    for i, (title, desc, col) in enumerate(probs):
        box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i*3.9), Inches(2.0), Inches(3.6), Inches(4.5))
        box.fill.solid()
        box.fill.fore_color.rgb = c_card
        box.line.color.rgb = col
        tf = box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.bold = True
        p.font.size = Pt(16)
        p.font.color.rgb = col
        p.space_after = Pt(14)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = c_muted

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 4: SYSTEM OBJECTIVES
    # ─────────────────────────────────────────────────────────────────────────
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Project Objectives & Scope of Work")

    items = [
        ("Core Music Streaming", "Browse songs, persistent player, HTTP Range requests, volume control, and shuffle/repeat modes."),
        ("Playlist Lifecycle", "Create, edit, reorder, delete, and publicly share playlists via direct URL tokens."),
        ("Offline Playback", "Cache permitted audio files in browser IndexedDB with a dedicated Service Worker."),
        ("Six Divergence Features", "Sound Canvas (2D map), Sessions (sync rooms), Track DNA (SVG glyphs), Anti-Algorithm, Trace (tree), Context Tags."),
        ("Performance Standards", "Sub-10ms API queries, instant audio seek via HTTP 206, and zero browser memory leaks.")
    ]
    for i, (head, text) in enumerate(items):
        row = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8 + i*1.0), Inches(11.7), Inches(0.85))
        row.fill.solid()
        row.fill.fore_color.rgb = c_card
        row.line.fill.background()
        tf = row.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{i+1}. {head}: "
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = c_iris
        run = p.add_run()
        run.text = text
        run.font.bold = False
        run.font.size = Pt(13)
        run.font.color.rgb = c_text

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 5: SYSTEM ARCHITECTURE
    # ─────────────────────────────────────────────────────────────────────────
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "High-Level System Architecture")

    layers = [
        ("Presentation Layer", "SvelteKit (Svelte 5)\nHTML5 Audio Engine\nIndexedDB Storage\nService Worker Cache", c_iris),
        ("API Gateway Layer", "Go Fiber Framework\nJWT Authentication\nCORS Middleware\nRate-limiting & Logger", c_text),
        ("Business Logic Layer", "Anti-Algorithm Engine\nTrack DNA Generator\nTrace Tree Builder\nSession Sync Manager", c_coral),
        ("Data & Storage Layer", "PostgreSQL 16 (UTF-8)\nNormalized GORM Models\nHTTP Range Streamer\nJamendo / CC Audio CDN", c_iris)
    ]
    for i, (name, details, col) in enumerate(layers):
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i*2.95), Inches(2.0), Inches(2.75), Inches(4.5))
        card.fill.solid()
        card.fill.fore_color.rgb = c_card
        card.line.color.rgb = col
        tf = card.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = name
        p.font.bold = True
        p.font.size = Pt(16)
        p.font.color.rgb = col
        p.space_after = Pt(16)
        for line in details.split("\n"):
            lp = tf.add_paragraph()
            lp.text = "• " + line
            lp.font.size = Pt(12)
            lp.font.color.rgb = c_text
            lp.space_after = Pt(8)

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 6: TECHNOLOGY STACK JUSTIFICATION
    # ─────────────────────────────────────────────────────────────────────────
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Technology Stack Justification")

    techs = [
        ("Backend: Go (Golang 1.22) & Fiber", "• Superior concurrency: Goroutines handle hundreds of simultaneous audio streams.\n• FastHTTP engine: Zero allocation router yields sub-millisecond response times.\n• Single binary deployment: Self-contained binary with zero external runtime dependencies.", c_iris),
        ("Frontend: SvelteKit & TypeScript", "• True reactivity: Compiles down to surgically precise DOM updates without Virtual DOM overhead.\n• Persistent app shell: Seamless audio playback across client-side page transitions.\n• Lightweight footprint: Minimal bundle size ensures fast time-to-interactive.", c_coral),
        ("Database: PostgreSQL 16.9", "• Strict relational integrity: Enforces foreign keys across playlists, users, and history.\n• Advanced indexing: Unique B-tree indexes on share tokens and composite indexes on tags.\n• UTF-8 compliance: Robust support for international track metadata.", c_text)
    ]
    for i, (title, content, col) in enumerate(techs):
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8 + i*1.7), Inches(11.7), Inches(1.5))
        card.fill.solid()
        card.fill.fore_color.rgb = c_card
        card.line.color.rgb = col
        tf = card.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.bold = True
        p.font.size = Pt(15)
        p.font.color.rgb = col
        p.space_after = Pt(6)
        for line in content.split("\n"):
            lp = tf.add_paragraph()
            lp.text = line
            lp.font.size = Pt(12)
            lp.font.color.rgb = c_text
            lp.space_after = Pt(2)

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 7: DATABASE DESIGN
    # ─────────────────────────────────────────────────────────────────────────
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Database Design: 9 Relational Entities")

    entities = [
        ("Users", "id, username, email, password_hash, avatar_url, created_at"),
        ("Artists", "id, name, bio, image_url, jamendo_id"),
        ("Albums", "id, artist_id, title, cover_url, release_year"),
        ("Songs", "id, title, album_id, artist_id, duration, bpm, energy, mood, genre, share_token"),
        ("Playlists", "id, user_id, name, description, cover_url, is_public, share_token"),
        ("PlaylistSongs", "playlist_id, song_id, position, added_at (Composite PK)"),
        ("ListeningHistories", "id, user_id, song_id, played_at, play_duration_seconds, context_tags"),
        ("ContextTags", "id, user_id, song_id, tag_name, created_at"),
        ("DivergeSessions", "id, host_user_id, name, share_code, current_song_id, position, is_playing")
    ]
    for i, (name, fields) in enumerate(entities):
        col_idx = i % 3
        row_idx = i // 3
        box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + col_idx*3.9), Inches(1.8 + row_idx*1.65), Inches(3.7), Inches(1.45))
        box.fill.solid()
        box.fill.fore_color.rgb = c_card
        box.line.color.rgb = c_iris if i%2==0 else c_coral
        tf = box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = name
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = c_iris if i%2==0 else c_coral
        p.space_after = Pt(4)
        p2 = tf.add_paragraph()
        p2.text = fields
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = c_muted

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 8: AUDIO STREAMING & HTTP RANGE SEEKING
    # ─────────────────────────────────────────────────────────────────────────
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Audio Streaming Engine & Range Seeking")

    left = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    left.fill.solid()
    left.fill.fore_color.rgb = c_card
    left.line.color.rgb = c_iris
    tf = left.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "HTTP 206 Partial Content Protocol"
    p.font.bold = True
    p.font.size = Pt(16)
    p.font.color.rgb = c_iris
    p.space_after = Pt(10)
    b_left = [
        "Browser transmits Range header: Range: bytes=1048576-2097151.",
        "Go backend parses byte boundaries and extracts requested chunk.",
        "Server replies with HTTP 206 Partial Content and Content-Range: bytes 1048576-2097151/8388608.",
        "Enables instantaneous timeline scrubbing without buffering entire file."
    ]
    for b in b_left:
        bp = tf.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(12)
        bp.font.color.rgb = c_text
        bp.space_after = Pt(8)

    right = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(4.8))
    right.fill.solid()
    right.fill.fore_color.rgb = c_card
    right.line.color.rgb = c_coral
    tf2 = right.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Persistent Svelte Audio Store"
    p.font.bold = True
    p.font.size = Pt(16)
    p.font.color.rgb = c_coral
    p.space_after = Pt(10)
    b_right = [
        "Audio element lives in persistent player singleton outside route DOM.",
        "Smooth navigation across /search, /canvas, /library without interruption.",
        "Fisher-Yates shuffle algorithm guarantees uniformly random track order.",
        "Three-state repeat mode: Repeat Off -> Repeat All -> Repeat One track."
    ]
    for b in b_right:
        bp = tf2.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(12)
        bp.font.color.rgb = c_text
        bp.space_after = Pt(8)

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 9: SIGNATURE FEATURES: SOUND CANVAS & ANTI-ALGORITHM
    # ─────────────────────────────────────────────────────────────────────────
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Feature Showcase: Sound Canvas & Anti-Algorithm")

    f1 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    f1.fill.solid()
    f1.fill.fore_color.rgb = c_card
    f1.line.color.rgb = c_iris
    tf = f1.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "1. Sound Canvas (2D Spatial Map)"
    p.font.bold = True
    p.font.size = Pt(16)
    p.font.color.rgb = c_iris
    p.space_after = Pt(10)
    b_f1 = [
        "X-Axis represents Energy Score (0.0 Calm -> 1.0 Intense).",
        "Y-Axis represents Mood Valence (0.0 Melancholic -> 1.0 Uplifting).",
        "Interactive quadrants: Ambient Calm, Euphoric Kinetic, Moody Introspective, and Tense Raw.",
        "One-click quadrant playback queues entire mood regions instantly."
    ]
    for b in b_f1:
        bp = tf.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(12)
        bp.font.color.rgb = c_text
        bp.space_after = Pt(8)

    f2 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(4.8))
    f2.fill.solid()
    f2.fill.fore_color.rgb = c_card
    f2.line.color.rgb = c_coral
    tf2 = f2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "2. The Anti-Algorithm Route"
    p.font.bold = True
    p.font.size = Pt(16)
    p.font.color.rgb = c_coral
    p.space_after = Pt(10)
    b_f2 = [
        "Calculates user centroid: Mean BPM, energy, mood, and primary genre.",
        "Inverts listening profile to discover under-explored sonic spaces.",
        "Serves curated divergence with explicit explanation rationale.",
        "Provides a dedicated discovery toggle directly inside the search bar."
    ]
    for b in b_f2:
        bp = tf2.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(12)
        bp.font.color.rgb = c_text
        bp.space_after = Pt(8)

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 10: SIGNATURE FEATURES: TRACK DNA, TRACE & SESSIONS
    # ─────────────────────────────────────────────────────────────────────────
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Feature Showcase: Track DNA, Trace & Sessions")

    feats = [
        ("3. Track DNA", "Deterministic generative SVG glyph produced per song based strictly on its BPM, key, and energy. Zero randomness; identical glyph per song every time.", c_iris),
        ("4. Trace Journey", "Branching tree visualization of user's listening path. Detects genre transitions and branches new exploration paths rather than flat history.", c_coral),
        ("5. Diverge Sessions", "Synchronized group listening rooms with 6-character room codes, live queue additions, and synchronized playback indicators.", c_text),
        ("6. Context Tags", "Personal context tagging (#midnight, #code-flow) allowing listeners to attach environments and retrieve context-filtered recommendations.", c_iris)
    ]
    for i, (title, desc, col) in enumerate(feats):
        c_idx = i % 2
        r_idx = i // 2
        card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + c_idx*5.95), Inches(1.8 + r_idx*2.5), Inches(5.7), Inches(2.25))
        card.fill.solid()
        card.fill.fore_color.rgb = c_card
        card.line.color.rgb = col
        tf = card.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.bold = True
        p.font.size = Pt(15)
        p.font.color.rgb = col
        p.space_after = Pt(8)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = c_text

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 11: OFFLINE PLAYBACK & TEST RESULTS
    # ─────────────────────────────────────────────────────────────────────────
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_header(s11, "Offline Architecture & Verification Results")

    l_box = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    l_box.fill.solid()
    l_box.fill.fore_color.rgb = c_card
    l_box.line.color.rgb = c_iris
    tf = l_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Offline Playback Engine"
    p.font.bold = True
    p.font.size = Pt(16)
    p.font.color.rgb = c_iris
    p.space_after = Pt(10)
    b_off = [
        "Browser IndexedDB database (`diverge_offline_db`) stores binary audio blobs.",
        "Custom Service Worker (`sw.js`) intercepts app shell requests during offline mode.",
        "Track blob URLs (`URL.createObjectURL`) feed directly into player audio element.",
        "Storage quota estimation (`navigator.storage.estimate`) prevents quota overflow."
    ]
    for b in b_off:
        bp = tf.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(12)
        bp.font.color.rgb = c_text
        bp.space_after = Pt(8)

    r_box = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(4.8))
    r_box.fill.solid()
    r_box.fill.fore_color.rgb = c_card
    r_box.line.color.rgb = c_coral
    tf2 = r_box.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "100% Verification Pass Rate"
    p.font.bold = True
    p.font.size = Pt(16)
    p.font.color.rgb = c_coral
    p.space_after = Pt(10)
    tests = [
        ("TC-01: PostgreSQL Cluster Initialization", "PASS"),
        ("TC-02: Go Backend Auto-Migration (9 tables)", "PASS"),
        ("TC-03: Catalog Seed (18 multi-quadrant songs)", "PASS"),
        ("TC-04: User Registration & Bcrypt Hashing", "PASS"),
        ("TC-05: JWT Session Cookie Authentication", "PASS"),
        ("TC-06: Sound Canvas Spatial Coordinates Query", "PASS"),
        ("TC-07: Anti-Algorithm Comfort Inversion", "PASS"),
        ("TC-08: Frontend Production Build & SSR Routing", "PASS")
    ]
    for t_name, t_res in tests:
        bp = tf2.add_paragraph()
        bp.text = f"✔ {t_name} — "
        bp.font.size = Pt(11)
        bp.font.color.rgb = c_text
        run = bp.add_run()
        run.text = t_res
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x4A, 0xDE, 0x80)

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 12: CONCLUSION & DELIVERABLES SUMMARY
    # ─────────────────────────────────────────────────────────────────────────
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12)
    add_header(s12, "Conclusion & Project Submission Summary")

    c_sum = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.8))
    c_sum.fill.solid()
    c_sum.fill.fore_color.rgb = c_card
    c_sum.line.color.rgb = c_iris
    tf = c_sum.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Internship Deliverables Complete"
    p.font.bold = True
    p.font.size = Pt(20)
    p.font.color.rgb = c_iris
    p.space_after = Pt(14)

    delivs = [
        ("Deliverable 1: Source Code Repository", "Complete Go backend (Fiber, GORM, JWT), complete SvelteKit frontend (TypeScript, custom CSS tokens), PostgreSQL schema, seeder CLI, and README.md."),
        ("Deliverable 2: Technical Project Report (PDF)", "16-chapter comprehensive documentation adhering to university/internship guidelines at `j:/DIVERGE/docs/project-report.pdf`."),
        ("Deliverable 3: Presentation Deck (PPTX)", "12-slide executive presentation covering architecture, features, and verification at `j:/DIVERGE/docs/presentation.pptx`."),
        ("Deployment & Verification", "Full local execution verified with PostgreSQL 16 on port 5432, Go API on port 8080, and SvelteKit frontend on port 5173.")
    ]
    for head, text in delivs:
        p_item = tf.add_paragraph()
        p_item.text = f"• {head}: "
        p_item.font.bold = True
        p_item.font.size = Pt(13)
        p_item.font.color.rgb = c_coral
        p_item.space_after = Pt(8)
        run = p_item.add_run()
        run.text = text
        run.font.bold = False
        run.font.color.rgb = c_text

    prs.save(filename)
    print("PowerPoint presentation generated successfully at:", filename)

if __name__ == '__main__':
    create_deck()
