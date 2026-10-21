<script lang="ts">
  import { player, isPlaying, progressPercent, formatTime } from '$lib/stores/player';
  import type { Song } from '$lib/types';

  $: song = $player.currentSong;
  $: state = $player.state;
  $: volume = $player.volume;
  $: muted = $player.muted;
  $: shuffle = $player.shuffle;
  $: repeat = $player.repeat;

  function handleSeek(e: Event) {
    const input = e.target as HTMLInputElement;
    player.seek(($player.duration * Number(input.value)) / 100);
  }

  function handleVolume(e: Event) {
    const input = e.target as HTMLInputElement;
    player.setVolume(Number(input.value) / 100);
  }

  function copyShareLink() {
    if (!song) return;
    const url = `${window.location.origin}/song/${song.id}`;
    navigator.clipboard.writeText(url);
  }
</script>

<div
  class="player-bar"
  class:has-song={!!song}
  role="region"
  aria-label="Music player"
>
  <!-- Left: song info -->
  <div class="player-left">
    {#if song}
      <div class="song-art">
        {#if song.album?.cover_url}
          <img src={song.album.cover_url} alt={song.album.title} loading="lazy" />
        {:else}
          <div class="song-art-placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
        {/if}
      </div>
      <div class="song-meta">
        <span class="song-title text-ellipsis">{song.title}</span>
        <span class="song-artist text-ellipsis text-muted">{song.artist?.name ?? ''}</span>
      </div>
      <button class="btn btn-icon" on:click={copyShareLink} data-tooltip="Copy share link" aria-label="Share song">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      </button>
    {:else}
      <span class="no-song-hint text-muted">Pick a song to start</span>
    {/if}
  </div>

  <!-- Centre: controls + progress -->
  <div class="player-centre">
    <!-- Controls row -->
    <div class="controls-row">
      <!-- Shuffle -->
      <button
        class="btn btn-icon control-btn"
        class:control-active={shuffle}
        on:click={() => player.toggleShuffle()}
        aria-label="Shuffle"
        aria-pressed={shuffle}
        data-tooltip="Shuffle"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17">
          <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
          <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
          <line x1="4" y1="4" x2="9" y2="9"/>
        </svg>
      </button>

      <!-- Prev -->
      <button class="btn btn-icon control-btn" on:click={() => player.prev()} aria-label="Previous track" disabled={!song}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
      </button>

      <!-- Play/Pause — DIVERGE geometry -->
      <button
        class="play-btn"
        on:click={() => player.toggle()}
        aria-label={$isPlaying ? 'Pause' : 'Play'}
        disabled={!song}
      >
        {#if state === 'loading'}
          <div class="spinner" aria-hidden="true"></div>
        {:else if $isPlaying}
          <!-- Pause: two bars -->
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        {:else}
          <!-- Play: DIVERGE-style forward arrow -->
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        {/if}
      </button>

      <!-- Next -->
      <button class="btn btn-icon control-btn" on:click={() => player.next()} aria-label="Next track" disabled={!song}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
      </button>

      <!-- Repeat -->
      <button
        class="btn btn-icon control-btn"
        class:control-active={repeat !== 'none'}
        class:control-accent={repeat === 'one'}
        on:click={() => player.cycleRepeat()}
        aria-label="Repeat mode"
        data-tooltip={repeat === 'none' ? 'Repeat off' : repeat === 'all' ? 'Repeat all' : 'Repeat one'}
      >
        {#if repeat === 'one'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="11" y="14" font-size="6" fill="currentColor" stroke="none">1</text></svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="17" height="17"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        {/if}
      </button>
    </div>

    <!-- Progress bar -->
    <div class="progress-row">
      <span class="time-stamp text-faint">{formatTime($player.currentTime)}</span>
      <div class="progress-track">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={$progressPercent}
          on:input={handleSeek}
          disabled={!song}
          aria-label="Seek"
          style="--pct: {$progressPercent}%"
        />
        <div class="progress-fill" style="width: {$progressPercent}%"></div>
      </div>
      <span class="time-stamp text-faint">{formatTime($player.duration)}</span>
    </div>
  </div>

  <!-- Right: volume -->
  <div class="player-right">
    <button
      class="btn btn-icon"
      on:click={() => player.toggleMute()}
      aria-label={muted ? 'Unmute' : 'Mute'}
      data-tooltip={muted ? 'Unmute' : 'Mute'}
    >
      {#if muted || volume === 0}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
      {:else if volume < 0.5}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      {/if}
    </button>
    <div class="volume-slider">
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={muted ? 0 : Math.round(volume * 100)}
        on:input={handleVolume}
        aria-label="Volume"
      />
    </div>
  </div>
</div>

<style>
  .player-bar {
    grid-row: 2;
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    align-items: center;
    gap: 1rem;
    padding: 0 1.5rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
    min-height: var(--player-height);
    z-index: 50;
  }

  /* Left */
  .player-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .song-art {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    flex-shrink: 0;
    background: var(--color-surface-raised);
  }
  .song-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .song-art-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-faint);
  }
  .song-art-placeholder svg { width: 20px; height: 20px; }

  .song-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .song-title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
    max-width: 160px;
  }
  .song-artist {
    font-size: var(--text-xs);
    max-width: 160px;
  }

  .no-song-hint {
    font-size: var(--text-sm);
  }

  /* Centre */
  .player-centre {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .controls-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .control-btn {
    color: var(--color-text-muted);
    transition: color var(--t-fast) ease, transform var(--t-fast) ease;
  }
  .control-btn:hover { color: var(--color-text); transform: scale(1.1); }
  .control-active { color: var(--color-primary) !important; }
  .control-accent  { color: var(--color-accent)  !important; }

  /* The play button — geometric, DIVERGE-inspired */
  .play-btn {
    width: 42px;
    height: 42px;
    border-radius: var(--radius-sm);
    background: var(--color-primary);
    color: #FFFFFF;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition:
      background var(--t-fast) ease,
      transform var(--t-fast) ease,
      box-shadow var(--t-fast) ease;
  }
  .play-btn:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: scale(1.05);
    box-shadow: var(--shadow-glow-primary);
  }
  .play-btn:active:not(:disabled) { transform: scale(0.97); }
  .play-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(17, 16, 25, 0.3);
    border-top-color: #111019;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* Progress */
  .progress-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    max-width: 480px;
  }

  .progress-track {
    flex: 1;
    position: relative;
    height: 3px;
    display: flex;
    align-items: center;
  }
  .progress-track input[type="range"] {
    position: relative;
    z-index: 1;
    margin: 0;
  }
  .progress-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 3px;
    background: var(--color-primary);
    border-radius: var(--radius-full);
    pointer-events: none;
    transition: width 0.1s linear;
  }

  .time-stamp {
    font-size: var(--text-xs);
    min-width: 34px;
    font-variant-numeric: tabular-nums;
  }

  /* Right */
  .player-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .volume-slider {
    width: 90px;
  }

  @media (max-width: 768px) {
    .player-bar { grid-template-columns: 1fr 1fr; padding: 0 1rem; }
    .player-right { display: none; }
    .progress-row { max-width: 100%; }
  }
</style>
