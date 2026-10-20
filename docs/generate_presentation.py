import os
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

    logo_path = "j:/DIVERGE/docs/logo.png"
    mark_path = "j:/DIVERGE/docs/logo-mark.png"

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = c_bg
        bg.line.fill.background() # no line
        return bg

    def add_header(slide, title_text, category="TECH VEDHU INTERNSHIP CAPSTONE"):
        # Header mark if exists
        if os.path.exists(mark_path):
            slide.shapes.add_picture(mark_path, Inches(12.0), Inches(0.4), width=Inches(0.65), height=Inches(0.65))

        # Category pill/text
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(10), Inches(0.35))
        tf = cat_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = category.upper()
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = c_iris

        # Title text
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11), Inches(0.8))
        tf2 = title_box.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = title_text
        p2.font.size = Pt(26)
        p2.font.bold = True
        p2.font.color.rgb = c_text

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 1: TITLE SLIDE
    # ─────────────────────────────────────────────────────────────────────────
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Logo left / title right
    if os.path.exists(logo_path):
        s1.shapes.add_picture(logo_path, Inches(1.0), Inches(1.8), width=Inches(3.2), height=Inches(3.29))

    tbox = s1.shapes.add_textbox(Inches(4.6), Inches(1.4), Inches(8.0), Inches(5.2))
    tf = tbox.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "DIVERGE"
    p0.font.size = Pt(50)
    p0.font.bold = True
    p0.font.color.rgb = c_iris
    p0.space_after = Pt(4)

    p_tag = tf.add_paragraph()
    p_tag.text = "Take the uncommon route."
    p_tag.font.size = Pt(18)
    p_tag.font.bold = True
    p_tag.font.color.rgb = c_coral
    p_tag.space_after = Pt(14)

    p1 = tf.add_paragraph()
    p1.text = "A High-Performance Music Streaming Platform Using Go & SvelteKit"
    p1.font.size = Pt(17)
    p1.font.color.rgb = c_text
    p1.space_after = Pt(18)

    p_author = tf.add_paragraph()
    p_author.text = "Author / Intern: Dharshan V | Software Developer"
    p_author.font.size = Pt(14)
    p_author.font.bold = True
    p_author.font.color.rgb = c_iris
    p_author.space_after = Pt(6)

    p_org = tf.add_paragraph()
    p_org.text = "Program: Tech Vedhu Internship Project Submission"
    p_org.font.size = Pt(12)
    p_org.font.color.rgb = c_muted
    p_org.space_after = Pt(4)

    p_track = tf.add_paragraph()
    p_track.text = "Primary Track: Full-Stack Web Development (Go, SvelteKit, PostgreSQL)"
    p_track.font.size = Pt(12)
    p_track.font.color.rgb = c_muted
    p_track.space_after = Pt(4)

    p_date = tf.add_paragraph()
    p_date.text = "Initiated: October 10, 2026 | Capstone Milestone | Submission: October 30, 2026"
    p_date.font.size = Pt(11)
    p_date.font.color.rgb = c_muted

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 2: EXECUTIVE SUMMARY & VISION
    # ─────────────────────────────────────────────────────────────────────────
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Executive Summary: Beyond The Algorithmic Mainstream")

    c1 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
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
        "Engineered with Go (Fiber) backend and SvelteKit frontend for high throughput.",
        "Deterministic Discovery: Powered by exact musicology attributes (BPM, Key, Energy, Valence).",
        "Full Song Audio Engine: Jamendo CDN & local storage delivering complete 3-6 min songs.",
        "Strict atmospheric visual rules: No purple gradients, no pill buttons, no fake reviews."
    ]
    for b in bullets:
        bp = tf.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(12.5)
        bp.font.color.rgb = c_text
        bp.space_after = Pt(10)

    c2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.0))
    c2.fill.solid()
    c2.fill.fore_color.rgb = c_card
    c2.line.color.rgb = c_coral
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Engineering Highlights"
    p.font.bold = True
    p.font.size = Pt(18)
    p.font.color.rgb = c_coral
    p.space_after = Pt(14)
    bullets2 = [
        "Sub-10ms API response times with Go Fiber zero-allocation routing.",
        "HTTP 206 Partial Content Range streaming enables instant timeline scrubbing.",
        "110 full-length songs seeded across 4 quadrants with deterministic Track DNA glyphs.",
        "IndexedDB + Service Worker offline storage for persistent offline playback.",
        "Synchronized multi-user Diverge Sessions with live room code sharing."
    ]
    for b in bullets2:
        bp = tf2.add_paragraph()
        bp.text = "• " + b
        bp.font.size = Pt(12.5)
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
        box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i*3.9), Inches(2.0), Inches(3.6), Inches(4.7))
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
        ("Core Music Streaming", "Browse 110 full-length tracks, persistent player, HTTP Range requests, volume control, and shuffle/repeat modes."),
        ("Playlist Lifecycle", "Create, edit, reorder, delete, and publicly share playlists via direct URL tokens."),
        ("Offline Playback", "Cache audio streams in browser IndexedDB with a dedicated Service Worker for zero-network playback."),
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
        ("Data & Storage Layer", "PostgreSQL 16 (UTF-8)\nNormalized GORM Models\nHTTP Range Streamer\nFull Audio CDN Pool", c_iris)
    ]
    for i, (name, details, col) in enumerate(layers):
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i*2.95), Inches(2.0), Inches(2.75), Inches(4.7))
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
        ("Database: PostgreSQL 16", "• Strict relational integrity: Enforces foreign keys across playlists, users, and history.\n• Advanced indexing: Unique B-tree indexes on share tokens and composite indexes on tags.\n• UTF-8 compliance: Robust support for international track metadata.", c_text)
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
        "Enables instantaneous timeline scrubbing across full 3-6 minute audio tracks."
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
        "Smooth navigation across /search, /canvas, /library without audio interruption.",
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
    # SLIDE 11: OFFLINE ARCHITECTURE & PLATFORM ROADMAP
    # ─────────────────────────────────────────────────────────────────────────
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_header(s11, "Verification Pass Rate & Platform Roadmap")

    l_box = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    l_box.fill.solid()
    l_box.fill.fore_color.rgb = c_card
    l_box.line.color.rgb = c_iris
    tf = l_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "100% Verification Pass Rate"
    p.font.bold = True
    p.font.size = Pt(16)
    p.font.color.rgb = c_iris
    p.space_after = Pt(10)
    tests = [
        ("TC-01: PostgreSQL Cluster Initialization", "PASS"),
        ("TC-02: Go Backend Auto-Migration (9 tables)", "PASS"),
        ("TC-03: Catalog Seed (110 full-length tracks)", "PASS"),
        ("TC-04: User Registration & Bcrypt Hashing", "PASS"),
        ("TC-05: JWT Session Cookie Authentication", "PASS"),
        ("TC-06: Full Audio Range Seek & Stream Redirect", "PASS"),
        ("TC-07: Sound Canvas Spatial Coordinates Query", "PASS"),
        ("TC-08: Anti-Algorithm Comfort Inversion", "PASS"),
        ("TC-09: IndexedDB Offline Blob Cache", "PASS"),
        ("TC-10: Frontend Production Build & SSR Routing", "PASS")
    ]
    for t_name, t_res in tests:
        bp = tf.add_paragraph()
        bp.text = f"✔ {t_name} — "
        bp.font.size = Pt(11)
        bp.font.color.rgb = c_text
        run = bp.add_run()
        run.text = t_res
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x4A, 0xDE, 0x80)

    r_box = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(1.8), Inches(5.6), Inches(4.8))
    r_box.fill.solid()
    r_box.fill.fore_color.rgb = c_card
    r_box.line.color.rgb = c_coral
    tf2 = r_box.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "Future Platform Expansion Roadmap"
    p.font.bold = True
    p.font.size = Pt(16)
    p.font.color.rgb = c_coral
    p.space_after = Pt(10)
    roadmap = [
        ("Cross-Platform Mobile Apps (iOS & Android)", "Native builds using Capacitor / Flutter bringing Sound Canvas and offline sync to smartphones."),
        ("Native Windows Desktop Executable (.exe)", "Packaged desktop client with low-latency audio driver, global media hotkeys, and system tray minimization."),
        ("Cloud Edge Deployment", "Serverless edge frontend on Vercel, containerized Go API on Render/Fly.io, and serverless Postgres on Neon."),
        ("WebAssembly DSP Audio Visualizer", "In-browser Fast Fourier Transform (FFT) for direct audio frequency spectrum analysis and reactive waveforms.")
    ]
    for r_head, r_desc in roadmap:
        bp = tf2.add_paragraph()
        bp.text = f"• {r_head}: "
        bp.font.bold = True
        bp.font.size = Pt(11.5)
        bp.font.color.rgb = c_coral
        bp.space_after = Pt(6)
        run = bp.add_run()
        run.text = r_desc
        run.font.bold = False
        run.font.color.rgb = c_text

    # ─────────────────────────────────────────────────────────────────────────
    # SLIDE 12: THANK YOU & DEVELOPER CONTACT
    # ─────────────────────────────────────────────────────────────────────────
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12)

    # Main Card
    c_card_box = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.0), Inches(10.933), Inches(5.5))
    c_card_box.fill.solid()
    c_card_box.fill.fore_color.rgb = c_card
    c_card_box.line.color.rgb = c_iris

    # Add Logo inside the card
    if os.path.exists(logo_path):
        s12.shapes.add_picture(logo_path, Inches(1.8), Inches(1.7), width=Inches(3.4), height=Inches(3.5))

    # Details Text Box on right
    det_box = s12.shapes.add_textbox(Inches(5.6), Inches(1.3), Inches(6.2), Inches(4.9))
    dtf = det_box.text_frame
    dtf.word_wrap = True

    dp0 = dtf.paragraphs[0]
    dp0.text = "Thank You"
    dp0.font.size = Pt(44)
    dp0.font.bold = True
    dp0.font.color.rgb = c_text
    dp0.space_after = Pt(4)

    dp_sub = dtf.add_paragraph()
    dp_sub.text = "DIVERGE - Take the uncommon route."
    dp_sub.font.size = Pt(16)
    dp_sub.font.bold = True
    dp_sub.font.color.rgb = c_coral
    dp_sub.space_after = Pt(14)

    dp_dev = dtf.add_paragraph()
    dp_dev.text = "Dharshan V"
    dp_dev.font.size = Pt(20)
    dp_dev.font.bold = True
    dp_dev.font.color.rgb = c_iris
    dp_dev.space_after = Pt(2)

    dp_role = dtf.add_paragraph()
    dp_role.text = "Software Developer | Full-Stack Web Development Track"
    dp_role.font.size = Pt(12)
    dp_role.font.color.rgb = c_text
    dp_role.space_after = Pt(4)

    dp_intern = dtf.add_paragraph()
    dp_intern.text = "Tech Vedhu Internship Project Submission"
    dp_intern.font.size = Pt(12)
    dp_intern.font.color.rgb = c_muted
    dp_intern.space_after = Pt(16)

    contact_items = [
        ("Phone", "+91 6382546285"),
        ("Email", "dharshan.vreddy2819@gmail.com"),
        ("Portfolio", "https://dharshanvportfolio.netlify.app/"),
        ("GitHub", "https://github.com/Dharsh606"),
        ("Repository", "https://github.com/Dharsh606/DIVERGE"),
        ("LinkedIn", "https://www.linkedin.com/in/dharshanvreddy")
    ]
    for label, val in contact_items:
        cp = dtf.add_paragraph()
        cp.text = f"{label}: "
        cp.font.bold = True
        cp.font.size = Pt(11)
        cp.font.color.rgb = c_coral
        cp.space_after = Pt(3)
        run = cp.add_run()
        run.text = val
        run.font.bold = False
        run.font.color.rgb = c_text

    prs.save(filename)
    print("PowerPoint presentation generated successfully at:", filename)

if __name__ == '__main__':
    create_deck()
