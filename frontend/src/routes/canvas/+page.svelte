<script lang="ts">
  import { onMount } from 'svelte';
  import { recommendations } from '$lib/services/api';
  import type { CanvasPoint, Song } from '$lib/types';
  import { player } from '$lib/stores/player';

  let points: CanvasPoint[] = [];
  let loading = true;
  let hoveredPoint: CanvasPoint | null = null;
  let selectedQuadrant: string | null = null;
  let filterGenre = '';
  let availableGenres: string[] = [];

  // Canvas bounds
  const width = 800;
  const height = 550;
  const padding = 50;

  onMount(async () => {
    try {
      points = await recommendations.canvas() as CanvasPoint[];
      const genreSet = new Set<string>();
      points.forEach(p => { if (p.genre) genreSet.add(p.genre); });
      availableGenres = Array.from(genreSet);
    } catch (err) {
      console.error('Failed to load canvas data', err);
    } finally {
      loading = false;
    }
  });

  $: filteredPoints = filterGenre
    ? points.filter(p => p.genre.toLowerCase() === filterGenre.toLowerCase())
    : points;

  function toScreenX(energy: number) {
    return padding + energy * (width - 2 * padding);
  }

  function toScreenY(mood: number) {
    // invert Y so high mood is top
    return height - padding - mood * (height - 2 * padding);
  }

  function playPoint(p: CanvasPoint) {
    // Construct song representation for player
    const songObj: any = {
      id: p.id,
      title: p.title,
      artist: p.artist,
      bpm: p.bpm,
      energy_score: p.x,
      mood_score: p.y,
      genre: p.genre,
      audio_url: '',
      share_token: ''
    };
    player.playSong(songObj);
  }

  function playQuadrant(quadrant: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') {
    selectedQuadrant = quadrant;
    let quadSongs: CanvasPoint[] = [];

    if (quadrant === 'top-left') {
      // Low Energy (<0.5), High Mood (>=0.5)
      quadSongs = filteredPoints.filter(p => p.x < 0.5 && p.y >= 0.5);
    } else if (quadrant === 'top-right') {
      // High Energy (>=0.5), High Mood (>=0.5)
      quadSongs = filteredPoints.filter(p => p.x >= 0.5 && p.y >= 0.5);
    } else if (quadrant === 'bottom-left') {
      // Low Energy (<0.5), Low Mood (<0.5)
      quadSongs = filteredPoints.filter(p => p.x < 0.5 && p.y < 0.5);
    } else if (quadrant === 'bottom-right') {
      // High Energy (>=0.5), Low Mood (<0.5)
      quadSongs = filteredPoints.filter(p => p.x >= 0.5 && p.y < 0.5);
    }

    if (quadSongs.length > 0) {
      const queue = quadSongs.map(p => ({
        id: p.id,
        title: p.title,
        artist: p.artist,
        bpm: p.bpm,
        energy_score: p.x,
        mood_score: p.y,
        genre: p.genre
      })) as Song[];
      player.playSong(queue[0], queue);
    }
  }
</script>

<svelte:head>
  <title>Sound Canvas - DIVERGE</title>
  <meta name="description" content="Explore music spatially by sonic energy and mood valence." />
</svelte:head>

<div class="canvas-page">
  <div class="canvas-header">
    <div>
      <h1>Sound Canvas</h1>
      <p class="text-muted">Navigate your music catalog along Energy and Mood coordinates.</p>
    </div>

    <!-- Filter by genre if available -->
    {#if availableGenres.length > 0}
      <div class="genre-select-wrap">
        <select bind:value={filterGenre} class="genre-select">
          <option value="">All Genres</option>
          {#each availableGenres as g}
            <option value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
          {/each}
        </select>
      </div>
    {/if}
  </div>

  <!-- Interactive 2D Sound Map -->
  <div class="canvas-card card">
    {#if loading}
      <div class="loading-wrap">
        <div class="skeleton" style="width: 100%; height: 500px; border-radius: var(--radius-md);"></div>
      </div>
    {:else}
      <div class="canvas-container">
        <svg
          viewBox="0 0 {width} {height}"
          class="sound-svg"
          aria-label="Interactive Sound Canvas map"
        >
          <!-- Background quadrant guides -->
          <!-- Top Left: Ambient / Melodic Calm -->
          <rect
            x={padding}
            y={padding}
            width={(width - 2 * padding) / 2}
            height={(height - 2 * padding) / 2}
            class="quad-zone"
            class:quad-active={selectedQuadrant === 'top-left'}
            on:click={() => playQuadrant('top-left')}
          />
          <!-- Top Right: Euphoric / Peak Energy -->
          <rect
            x={padding + (width - 2 * padding) / 2}
            y={padding}
            width={(width - 2 * padding) / 2}
            height={(height - 2 * padding) / 2}
            class="quad-zone"
            class:quad-active={selectedQuadrant === 'top-right'}
            on:click={() => playQuadrant('top-right')}
          />
          <!-- Bottom Left: Dark / Introspective -->
          <rect
            x={padding}
            y={padding + (height - 2 * padding) / 2}
            width={(width - 2 * padding) / 2}
            height={(height - 2 * padding) / 2}
            class="quad-zone"
            class:quad-active={selectedQuadrant === 'bottom-left'}
            on:click={() => playQuadrant('bottom-left')}
          />
          <!-- Bottom Right: Raw / High-Tension -->
          <rect
            x={padding + (width - 2 * padding) / 2}
            y={padding + (height - 2 * padding) / 2}
            width={(width - 2 * padding) / 2}
            height={(height - 2 * padding) / 2}
            class="quad-zone"
            class:quad-active={selectedQuadrant === 'bottom-right'}
            on:click={() => playQuadrant('bottom-right')}
          />

          <!-- Axis lines -->
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            class="axis-line"
          />
          <line
            x1={width / 2}
            y1={padding}
            x2={width / 2}
            y2={height - padding}
            class="axis-line"
          />

          <!-- Quadrant Labels -->
          <text x={padding + 15} y={padding + 25} class="quad-label">Ambient / Uplifting</text>
          <text x={width - padding - 15} y={padding + 25} text-anchor="end" class="quad-label">Euphoric / Energetic</text>
          <text x={padding + 15} y={height - padding - 15} class="quad-label">Moody / Introspective</text>
          <text x={width - padding - 15} y={height - padding - 15} text-anchor="end" class="quad-label">Tense / Kinetic</text>

          <!-- Axis labels -->
          <text x={padding} y={height / 2 - 8} class="axis-label">&larr; Low Energy</text>
          <text x={width - padding} y={height / 2 - 8} text-anchor="end" class="axis-label">High Energy &rarr;</text>
          <text x={width / 2 + 8} y={padding + 12} class="axis-label">&uarr; Uplifting</text>
          <text x={width / 2 + 8} y={height - padding} class="axis-label">&darr; Melancholic</text>

          <!-- Song Nodes -->
          {#each filteredPoints as pt (pt.id)}
            {@const cx = toScreenX(pt.x)}
            {@const cy = toScreenY(pt.y)}
            {@const isPlayingThis = $player.currentSong?.id === pt.id}

            <g
              class="node-group"
              class:playing={isPlayingThis}
              on:mouseenter={() => (hoveredPoint = pt)}
              on:mouseleave={() => (hoveredPoint = null)}
              on:click={() => playPoint(pt)}
              role="button"
              tabindex="0"
              aria-label="{pt.title} by {pt.artist?.name}"
            >
              <!-- Outer glow when active or playing -->
              {#if isPlayingThis}
                <circle {cx} {cy} r="16" class="playing-halo" />
              {/if}

              <!-- Core beacon dot -->
              <circle
                {cx}
                {cy}
                r={isPlayingThis ? 7 : 5}
                class="node-dot"
                style="fill: hsl({255 - pt.y * 60}, 80%, {55 + pt.x * 15}%);"
              />
            </g>
          {/each}
        </svg>

        <!-- Hover detail tooltip -->
        {#if hoveredPoint}
          <div
            class="canvas-tooltip glass"
            style="left: {toScreenX(hoveredPoint.x)}px; top: {toScreenY(hoveredPoint.y) - 60}px;"
          >
            <div class="tooltip-title">{hoveredPoint.title}</div>
            <div class="tooltip-sub text-muted">{hoveredPoint.artist?.name ?? ''}</div>
            <div class="tooltip-stats">
              <span>{hoveredPoint.bpm} BPM</span>
              <span>{hoveredPoint.genre}</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Quick Play Buttons by Mood Quadrant -->
      <div class="canvas-actions">
        <span class="action-caption text-muted">Play Quadrant:</span>
        <button class="btn btn-ghost" on:click={() => playQuadrant('top-left')}>Ambient / Calm</button>
        <button class="btn btn-ghost" on:click={() => playQuadrant('top-right')}>Euphoric / High Energy</button>
        <button class="btn btn-ghost" on:click={() => playQuadrant('bottom-left')}>Moody / Reflective</button>
        <button class="btn btn-ghost" on:click={() => playQuadrant('bottom-right')}>Tense / Kinetic</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .canvas-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 2rem;
  }

  .canvas-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .genre-select {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    outline: none;
  }

  .canvas-card {
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .canvas-container {
    position: relative;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }

  .sound-svg {
    width: 100%;
    height: auto;
    display: block;
    background: var(--color-surface-raised);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }

  .quad-zone {
    fill: transparent;
    cursor: pointer;
    transition: fill var(--t-fast) ease;
  }

  .quad-zone:hover {
    fill: rgba(177, 154, 255, 0.04);
  }

  .quad-zone.quad-active {
    fill: rgba(177, 154, 255, 0.08);
  }

  .axis-line {
    stroke: var(--color-border);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
  }

  .axis-label {
    fill: var(--color-text-faint);
    font-size: 11px;
    font-family: inherit;
    font-weight: 500;
  }

  .quad-label {
    fill: var(--color-text-faint);
    font-size: 12px;
    font-family: inherit;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .node-group {
    cursor: pointer;
    transition: transform var(--t-fast) ease;
  }

  .node-group:hover circle.node-dot {
    r: 9;
    filter: drop-shadow(0 0 8px currentColor);
  }

  .node-dot {
    transition: all var(--t-fast) ease;
  }

  .playing-halo {
    fill: none;
    stroke: var(--color-primary);
    stroke-width: 2;
    animation: pulse 1.8s ease-out infinite;
  }

  @keyframes pulse {
    0% { r: 6; opacity: 1; }
    100% { r: 20; opacity: 0; }
  }

  .canvas-tooltip {
    position: absolute;
    pointer-events: none;
    transform: translate(-50%, -100%);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    z-index: 10;
    min-width: 130px;
    box-shadow: var(--shadow-md);
  }

  .tooltip-title {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
  }

  .tooltip-sub {
    font-size: 11px;
    white-space: nowrap;
  }

  .tooltip-stats {
    display: flex;
    gap: 0.5rem;
    font-size: 10px;
    color: var(--color-primary);
    margin-top: 0.25rem;
  }

  .canvas-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border-subtle);
  }

  .action-caption {
    font-size: var(--text-sm);
  }
</style>
