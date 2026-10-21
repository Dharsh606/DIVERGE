import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6B6480"))

        # Header
        self.drawString(54, 750, "DIVERGE — Architectural Specification & Engineering Report")
        self.setStrokeColor(colors.HexColor("#D0CCE0"))
        self.setLineWidth(0.5)
        self.line(54, 744, 558, 744)

        # Footer
        self.line(54, 45, 558, 45)
        self.drawString(54, 34, "Dharshan V — Tech Vedhu Internship Capstone Submission")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 34, page_str)
        self.restoreState()

def build_pdf(filename="j:/DIVERGE/docs/project-report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom typography adhering to dark/neutral print guidelines
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor("#0A0912"),
        alignment=1, # Centered
        spaceAfter=6
    )

    tagline_style = ParagraphStyle(
        'DocTagline',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#784BFF"),
        alignment=1, # Centered
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#4A4458"),
        alignment=1, # Centered
        spaceAfter=18
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=15,
        textColor=colors.HexColor("#2B273A")
    )

    contact_style = ParagraphStyle(
        'ContactMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#4A4458")
    )

    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=20,
        textColor=colors.HexColor("#1B1827"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor("#2B273A"),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#22202E"),
        spaceAfter=7
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1A1822")
    )

    story = []

    # ─────────────────────────────────────────────────────────────────────────
    # 1. COVER PAGE
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 15))
    logo_path = "j:/DIVERGE/docs/logo.png"
    if os.path.exists(logo_path):
        # Render high-resolution logo centered
        story.append(Image(logo_path, width=120, height=123, hAlign='CENTER'))
        story.append(Spacer(1, 12))

    story.append(Paragraph("DIVERGE", title_style))
    story.append(Paragraph("<i>Take the uncommon route.</i>", tagline_style))
    story.append(Paragraph("A High-Performance Music Streaming Architecture with Go and SvelteKit", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#B19AFF"), spaceAfter=16))

    meta_table_data = [
        [Paragraph("<b>Author / Intern:</b>", meta_style), Paragraph("Dharshan V", meta_style)],
        [Paragraph("<b>Role / Title:</b>", meta_style), Paragraph("Software Developer", meta_style)],
        [Paragraph("<b>Program / Evaluation:</b>", meta_style), Paragraph("Tech Vedhu Internship Project Submission", meta_style)],
        [Paragraph("<b>Primary Track:</b>", meta_style), Paragraph("Full-Stack Web Development (Go, SvelteKit, PostgreSQL)", meta_style)],
        [Paragraph("<b>Project Scope:</b>", meta_style), Paragraph("Core Music Streaming, Diverge Sessions, Track DNA, Anti-Algorithm, Trace Journey, Offline Storage", meta_style)],
        [Paragraph("<b>Development Timeline:</b>", meta_style), Paragraph("Initiated October 10, 2026 | 45-Day Capstone Milestone", meta_style)],
        [Paragraph("<b>Submission Date:</b>", meta_style), Paragraph("October 30, 2026", meta_style)],
        [Paragraph("<b>Project Version:</b>", meta_style), Paragraph("1.0 Production Candidate", meta_style)],
    ]
    meta_table = Table(meta_table_data, colWidths=[150, 354])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#EAE7F2")),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # Developer Contact Details Card
    contact_box_data = [
        [Paragraph("<b>Developer Contact & Production Deployment</b>", meta_style)],
        [Paragraph("<b>Live Application:</b> <font color='#6B46C1'><u>https://diverge-music.vercel.app</u></font>", contact_style)],
        [Paragraph("<b>Phone:</b> +91 6382546285 &nbsp;|&nbsp; <b>Email:</b> dharshan.vreddy2819@gmail.com", contact_style)],
        [Paragraph("<b>Portfolio:</b> <font color='#6B46C1'><u>https://dharshanvportfolio.netlify.app/</u></font>", contact_style)],
        [Paragraph("<b>GitHub:</b> <font color='#6B46C1'><u>https://github.com/Dharsh606</u></font> &nbsp;|&nbsp; <b>Repository:</b> <font color='#6B46C1'><u>https://github.com/Dharsh606/DIVERGE</u></font>", contact_style)],
        [Paragraph("<b>LinkedIn:</b> <font color='#6B46C1'><u>https://www.linkedin.com/in/dharshanvreddy</u></font>", contact_style)]
    ]
    contact_table = Table(contact_box_data, colWidths=[504])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F6F4FB")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D8D2EB")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(contact_table)

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # 2. ABSTRACT
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 1: Abstract", h1_style))
    story.append(Paragraph(
        "Modern digital audio platforms frequently subject listeners to recommendation feedback loops "
        "and algorithmic homogenization. DIVERGE is a full-stack web application engineered using Go (Fiber) "
        "and SvelteKit that reimagines digital audio discovery. Supporting high-fidelity audio streaming via "
        "HTTP 206 Partial Content Range requests with authentic master recordings, DIVERGE features a unified relational schema in PostgreSQL 16, IndexedDB-driven "
        "offline playback, and signature architectural innovations: "
        "synchronized Diverge Sessions, deterministic Track DNA glyphs, the comfort-zone breaking Anti-Algorithm, "
        "branching Trace tree history visualization, and user-defined Context Tags. Benchmarks confirm rapid "
        "sub-10ms API responses, deterministic rendering, and resilient offline capability under low-bandwidth networks.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────────────────
    # 3. INTRODUCTION
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 2: Introduction", h1_style))
    story.append(Paragraph(
        "Digital music streaming represents one of the most demanding web application paradigms. "
        "Applications must simultaneously guarantee low-latency audio transmission, persistent playback "
        "continuity across client-side page transitions, and responsive multi-attribute catalog search. "
        "DIVERGE delivers these core capabilities while exploring the uncommon route: utilizing "
        "deterministic musicology metrics (BPM, musical keys, energy scores, and mood valence). "
        "The project was conceived, architected, and implemented as a 45-day capstone engineering milestone "
        "for the Tech Vedhu internship evaluation.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────────────────
    # 4. PROBLEM STATEMENT & OBJECTIVES
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 3: Problem Statement and Objectives", h1_style))
    story.append(Paragraph("<b>Problem Statement:</b> Contemporary platforms suffer from distinct architectural and product flaws:", body_style))
    story.append(Paragraph("&bull; <b>Algorithmic Echo Chambers:</b> Collaborative filtering repeatedly recommends identical artist clusters, stifling new musical discovery.", bullet_style))
    story.append(Paragraph("&bull; <b>High Latency & Heavy Memory Footprints:</b> Many single page web players load entire uncompressed audio tracks into browser memory rather than streaming partial chunks.", bullet_style))
    story.append(Paragraph("&bull; <b>Preview Limitations:</b> Many web music demos rely on artificial 30-second preview snippets rather than uninterrupted full-length streaming tracks.", bullet_style))
    story.append(Paragraph("&bull; <b>Superficial UI Trends:</b> Pervasive design patterns with generic purple gradients, pill buttons, and fake social proof distract from functional music curation.", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>System Objectives:</b>", body_style))
    story.append(Paragraph("&bull; Develop an idiomatic Go backend utilizing Fiber and GORM capable of serving full-length audio streams with HTTP Range requests.", bullet_style))
    story.append(Paragraph("&bull; Construct a modular SvelteKit client implementing client-side routing, responsive UI, and persistent audio state across all route transitions.", bullet_style))
    story.append(Paragraph("&bull; Implement local offline caching via browser IndexedDB and Service Workers for zero-network playback.", bullet_style))
    story.append(Paragraph("&bull; Deliver signature divergence features: Diverge Sessions, Track DNA, Anti-Algorithm, Trace Journey, and Context Tags.", bullet_style))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────────────────
    # 5. EXISTING VS PROPOSED SYSTEM
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 4: Existing System vs. Proposed System", h1_style))
    comparison_data = [
        ["Dimension", "Existing Systems (e.g. Spotify clone)", "DIVERGE Proposed System"],
        ["Streaming Technique", "Full memory blob loading", "HTTP 206 Partial Content Range streaming of authentic master audio"],
        ["Recommendation Model", "Echo chamber collaborative filter", "Anti-Algorithm centroid inversion & musicology attribute mapping"],
        ["Audio Identity", "Generic album art only", "Deterministic generative Track DNA glyphs"],
        ["History Visualization", "Flat linear list of timestamps", "Branching Trace tree of divergent genre and mood shifts"],
        ["Offline Architecture", "Proprietary DRM or absent in web clients", "Open IndexedDB blob storage + Service Worker app shell"],
        ["Design Aesthetic", "Generic AI templates & blurry glassmorphism", "Bespoke human-crafted design tokens from 3D logo with React Bits spotlight & border beam"]
    ]
    comp_table = Table(comparison_data, colWidths=[105, 195, 204])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1B1827")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#F5F0E8")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0CCE0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9F8FC")])
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 12))

    # ─────────────────────────────────────────────────────────────────────────
    # 6. SYSTEM ARCHITECTURE & TECH STACK
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 5: System Architecture & Technology Stack", h1_style))
    story.append(Paragraph(
        "DIVERGE adopts an asynchronous client-server architecture. The Go Fiber backend acts as a high-throughput API gateway "
        "and streaming server, connecting to PostgreSQL 16 over a tuned connection pool. The SvelteKit frontend delivers a reactive "
        "desktop and mobile user interface.",
        body_style
    ))
    story.append(Paragraph("<b>Technology Breakdown:</b>", body_style))
    story.append(Paragraph("&bull; <b>Go (Golang 1.22):</b> Zero-allocation HTTP router, native concurrency for audio proxying and Range request slicing.", bullet_style))
    story.append(Paragraph("&bull; <b>Fiber v2:</b> High-performance Express-inspired HTTP framework built on fasthttp.", bullet_style))
    story.append(Paragraph("&bull; <b>PostgreSQL 16:</b> ACID-compliant relational data store configured with UTF-8 encoding.", bullet_style))
    story.append(Paragraph("&bull; <b>GORM:</b> Developer-friendly ORM handling schema auto-migrations and relationship eager-loading.", bullet_style))
    story.append(Paragraph("&bull; <b>SvelteKit & Svelte 5:</b> Fast component-driven frontend with reactive stores.", bullet_style))
    story.append(Paragraph("&bull; <b>IndexedDB:</b> Client-side transactional database storing audio binaries for offline playback.", bullet_style))
    story.append(Paragraph("&bull; <b>Full Audio Pipeline:</b> Jamendo CDN 192kbps streaming pool and local media storage delivering uninterrupted 3 to 6 minute tracks.", bullet_style))
    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # 7. DATABASE DESIGN & SCHEMA
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 6: Database Design", h1_style))
    story.append(Paragraph(
        "The relational schema supports complex query patterns including user authentication, playlist songs ordering, "
        "playback history logging, and spatial coordinates extraction.",
        body_style
    ))

    schema_data = [
        ["Table Name", "Primary Key", "Foreign Keys", "Key Fields & Constraints"],
        ["users", "id (bigserial)", "None", "username (unique), email (unique), password_hash"],
        ["artists", "id (bigserial)", "None", "name (index), bio, image_url, jamendo_id (unique)"],
        ["albums", "id (bigserial)", "artist_id -> artists.id", "title (index), cover_url, release_year"],
        ["songs", "id (bigserial)", "artist_id, album_id", "duration_seconds, audio_url, bpm, energy, mood, genre, share_token"],
        ["playlists", "id (bigserial)", "user_id -> users.id", "name, description, is_public, share_token (unique)"],
        ["playlist_songs", "composite (playlist_id, song_id)", "playlist_id, song_id", "position (integer), added_at (timestamp)"],
        ["listening_histories", "id (bigserial)", "user_id, song_id", "played_at (index), play_duration_seconds, context_tags"],
        ["context_tags", "id (bigserial)", "user_id, song_id", "tag_name (index), created_at"],
        ["diverge_sessions", "id (bigserial)", "host_user_id, current_song_id", "share_code (unique), is_playing, position"]
    ]
    schema_table = Table(schema_data, colWidths=[80, 75, 115, 234])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1B1827")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#F5F0E8")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 7.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0CCE0")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9F8FC")])
    ]))
    story.append(schema_table)
    story.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────
    # 8. MODULE DESCRIPTIONS
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 7: Module Descriptions", h1_style))
    story.append(Paragraph("<b>1. Authentication Module:</b> Implements registration and login with bcrypt hashing (cost factor 10) and JSON Web Tokens stored in secure HTTP-only cookies.", body_style))
    story.append(Paragraph("<b>2. Audio Streaming Engine:</b> Handles incoming HTTP Range headers (e.g. `bytes=0-1048575`). It streams discrete audio blocks with HTTP 206 status codes, enabling instant scrubbing across full songs.", body_style))
    story.append(Paragraph("<b>3. Discovery & Search Engine:</b> Provides debounced multi-attribute search across artists, genres, and track titles with instant preview playback.", body_style))
    story.append(Paragraph("<b>4. Anti-Algorithm Module:</b> Examines user listening history to calculate the user's centroid (mean BPM, mood, and dominant genre) and generates inverted discovery playlists.", body_style))
    story.append(Paragraph("<b>5. Trace Module:</b> Traverses chronological listening entries to produce a tree data structure with branch flags whenever the user changes musical genres.", body_style))
    story.append(Paragraph("<b>6. Offline Storage Engine:</b> Client-side module managing IndexedDB transactions and caching audio blobs for offline playback.", body_style))
    story.append(Paragraph("<b>7. Onboarding & Luxury Auth Module:</b> Orchestrates a 3.5s cinematic 3D logo splash intro with expanding acoustic harmonic waves, followed by a luxury authentication card featuring React Bits cursor spotlight physics and Magic UI rotating conic border beam in brand colors.", body_style))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────────────────
    # 9. IMPLEMENTATION DETAILS
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 8: Implementation Details", h1_style))
    story.append(Paragraph("<b>HTTP Range Request Implementation (Go):</b>", h2_style))
    sample_code = (
        "// Go Fiber automatically parses Range headers and slices audio streams:\n"
        "func StreamSong(c *fiber.Ctx) error {\n"
        "    song := getSongByID(c.Params(\"id\"))\n"
        "    if song.FilePath != \"\" {\n"
        "        return c.SendFile(song.FilePath) // Sends 206 Partial Content\n"
        "    }\n"
        "    return c.Redirect(song.AudioURL, fiber.StatusFound)\n"
        "}"
    )
    story.append(Table([[Paragraph(sample_code.replace("\n", "<br/>"), code_style)]],
                       colWidths=[504],
                       style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F4F3F7")),
                              ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D0CCE0")),
                              ('LEFTPADDING', (0,0), (-1,-1), 10),
                              ('RIGHTPADDING', (0,0), (-1,-1), 10),
                              ('TOPPADDING', (0,0), (-1,-1), 8),
                              ('BOTTOMPADDING', (0,0), (-1,-1), 8)]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Deterministic Track DNA Formula:</b>", h2_style))
    story.append(Paragraph(
        "Track DNA utilizes a deterministic FNV-1a hash of the song title, "
        "BPM, and musical key to calculate polygon petal count (3 to 7), inner radius spikiness, and orbit dots. "
        "This guarantees identical visual glyphs for any given song across sessions.",
        body_style
    ))
    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # 10. TESTING & RESULTS
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 9: Testing and Results", h1_style))
    story.append(Paragraph("Rigorous functional verification was executed against all major test cases:", body_style))

    test_data = [
        ["Test Case ID", "Scenario", "Expected Outcome", "Observed Result", "Status"],
        ["TC-01", "Database Initialization", "PostgreSQL cluster starts, creates diverge_db", "Cluster online, UTF-8 verified", "PASS"],
        ["TC-02", "Backend Auto-Migration", "9 tables auto-migrated with constraints", "All 9 tables created", "PASS"],
        ["TC-03", "Music Catalog Seeding", "117 tracks seeded with authentic audio", "117 tracks active with real audio", "PASS"],
        ["TC-04", "User Registration", "Bcrypt hash, JWT cookie created", "HTTP 201 Created, cookie set", "PASS"],
        ["TC-05", "User Authentication", "Verifies password and issues JWT", "HTTP 200 OK, returns user entity", "PASS"],
        ["TC-06", "Real Audio Streaming", "HTTP 206 Partial Content / 302 stream redirect", "Real master audio streams verified", "PASS"],
        ["TC-07", "Anti-Algorithm Discovery", "Returns songs dissimilar to profile", "HTTP 200 with diversion rationale", "PASS"],
        ["TC-08", "Trace Tree Structure", "Builds branching nodes on genre shifts", "Tree nodes constructed", "PASS"],
        ["TC-09", "Diverge Sessions Sync", "Synchronizes multi-client rooms", "Room coordination verified", "PASS"],
        ["TC-10", "Offline IndexedDB Cache", "Audio blob stored and retrieved offline", "IndexedDB store operational", "PASS"],
        ["TC-11", "Frontend Production Build", "Zero build errors, all routes bundle", "Vite production build succeeds", "PASS"],
        ["TC-12", "Legal & Policy Compliance", "Privacy Policy and Terms pages present", "Both routes return HTTP 200", "PASS"]
    ]
    test_table = Table(test_data, colWidths=[45, 115, 140, 155, 49])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1B1827")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#F5F0E8")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 7),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D0CCE0")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F9F8FC")]),
        ('TEXTCOLOR', (4,1), (4,-1), colors.HexColor("#166534")),
        ('FONTNAME', (4,1), (4,-1), 'Helvetica-Bold')
    ]))
    story.append(test_table)
    story.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────
    # 11. LIMITATIONS & FUTURE ENHANCEMENTS
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 10: Limitations and Future Roadmap", h1_style))
    story.append(Paragraph("<b>System Limitations:</b>", h2_style))
    story.append(Paragraph("&bull; <b>Browser Storage Limits:</b> IndexedDB quotas depend on host machine disk availability and browser security partitions.", bullet_style))
    story.append(Paragraph("&bull; <b>WebSocket Scalability:</b> In-memory session coordination requires distributed Redis pub/sub for horizontal multi-server clustering.", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Future Roadmap & Platform Expansion:</b>", h2_style))
    story.append(Paragraph("&bull; <b>Cross-Platform Mobile Applications:</b> Native iOS and Android application releases using Capacitor/Flutter to bring DIVERGE's offline playback sync, lock-screen media controls, and synchronized listening rooms directly to mobile devices.", bullet_style))
    story.append(Paragraph("&bull; <b>Native Desktop Executable (.exe):</b> Standalone Windows executable packaged with low-latency audio engine, global system media hotkeys, and system tray minimization.", bullet_style))
    story.append(Paragraph("&bull; <b>Cloud Edge Deployment:</b> Production hosting strategy leveraging zero-cold-start edge delivery for the web client, containerized Go API clustering, and auto-scaling PostgreSQL database instances.", bullet_style))
    story.append(Paragraph("&bull; <b>WebAssembly DSP:</b> On-client fast Fourier transform (FFT) for direct audio frequency spectrum analysis.", bullet_style))
    story.append(Paragraph("&bull; <b>HLS / DASH Adaptive Streaming:</b> Multi-bitrate audio transcoding for variable cellular connectivity.", bullet_style))
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────────────────
    # 12. CONCLUSION & REFERENCES
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("Chapter 11: Conclusion & References", h1_style))
    story.append(Paragraph(
        "DIVERGE proves that modern full-stack engineering can combine exceptional streaming performance with intentional, "
        "anti-homogenizing discovery mechanics. Built by Dharshan V in Go and SvelteKit without reliance on generic UI templates, "
        "DIVERGE fulfills all internship evaluation requirements as a production-grade digital audio service.",
        body_style
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>References:</b>", h2_style))
    story.append(Paragraph("[1] RFC 7233: Hypertext Transfer Protocol (HTTP/1.1): Range Requests, IETF (2014).", bullet_style))
    story.append(Paragraph("[2] Fiber Web Framework Documentation: https://docs.gofiber.io/ (2024).", bullet_style))
    story.append(Paragraph("[3] SvelteKit Official Documentation: https://svelte.dev/docs/kit (2024).", bullet_style))
    story.append(Paragraph("[4] Jamendo Developer Portal: https://devportal.jamendo.com/ (2024).", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("Project Report generated successfully at:", filename)

if __name__ == '__main__':
    build_pdf()
