<script lang="ts">
  import type { Song } from '$lib/types';
  import { player } from '$lib/stores/player';
  import TrackDNA from '$lib/components/dna/TrackDNA.svelte';
  import { formatTime } from '$lib/stores/player';

  export let song: Song;
  export let queue: Song[] = [];
  export let compact = false; // list-view vs card-view

  $: isCurrentSong = $player.currentSong?.id === song.id;
  $: isPlaying = isCurrentSong && $player.state === 'playing';

  function handlePlay() {
    if (isCurrentSong) {
      player.toggle();
    } else {
      player.playSong(song, queue.length ? queue : [song]);
    }
  }
</script>

{#if compact}
  <!-- List row view -->
  <div
    class="song-row"
    class:active={isCurrentSong}
    role="button"
    tabindex="0"
    on:click={handlePlay}
    on:keydown={(e) => e.key === 'Enter' && handlePlay()}
    aria-label="Play {song.title} by {song.artist?.name}"
  >
    <div class="row-art">
      {#if song.album?.cover_url}
        <img src={song.album.cover_url} alt="" loading="lazy" />
      {:else}
        <div class="art-placeholder" aria-hidden="true"></div>
      {/if}
      <div class="play-overlay" aria-hidden="true">
        {#if isPlaying}
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        {/if}
      </div>
    </div>

    <div class="row-meta">
      <span class="row-title" class:text-primary={isCurrentSong}>{song.title}</span>
      <span class="row-artist text-muted">{song.artist?.name ?? ''}</span>
    </div>

    <div class="row-dna" aria-hidden="true">
      <TrackDNA {song} size={28} />
    </div>

    <span class="row-duration text-faint">{formatTime(song.duration_seconds)}</span>
  </div>
{:else}
  <!-- Card view -->
  <div
    class="song-card card card-interactive"
    class:active={isCurrentSong}
    role="button"
    tabindex="0"
    on:click={handlePlay}
    on:keydown={(e) => e.key === 'Enter' && handlePlay()}
    aria-label="Play {song.title} by {song.artist?.name}"
  >
    <div class="card-art">
      {#if song.album?.cover_url}
        <img src={song.album.cover_url} alt="{song.album.title} cover" loading="lazy" />
      {:else}
        <div class="art-placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="32" height="32"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
      {/if}

      <!-- Play overlay -->
      <div class="card-play-overlay" aria-hidden="true">
        <button class="card-play-btn" tabindex="-1">
          {#if isPlaying}
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {/if}
        </button>
      </div>

      <!-- Equaliser indicator if playing -->
      {#if isPlaying}
        <div class="eq-indicator" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      {/if}
    </div>

    <div class="card-body">
      <div class="card-header-row">
        <TrackDNA {song} size={24} />
        {#if song.genre}
          <span class="badge badge-primary">{song.genre}</span>
        {/if}
      </div>
      <p class="card-title text-ellipsis" title={song.title}>{song.title}</p>
      <p class="card-artist text-ellipsis text-muted" title={song.artist?.name}>{song.artist?.name ?? ''}</p>
    </div>
  </div>
{/if}

<style>
  /* ─── List Row ─────────────────────────────────────────────────────────── */
  .song-row {
    display: grid;
    grid-template-columns: 44px 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--t-fast) ease;
  }
  .song-row:hover { background: var(--color-surface-raised); }
  .song-row.active { background: var(--color-primary-dim); }

  .row-art {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
  }
  .row-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-overlay {
    position: absolute;
    inset: 0;
    background: rgba(17, 16, 25, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--t-fast) ease;
    color: white;
  }
  .song-row:hover .play-overlay,
  .song-row.active .play-overlay { opacity: 1; }

  .row-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .row-title {
    font-size: var(--text-sm);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row-artist {
    font-size: var(--text-xs);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-dna { opacity: 0.6; }
  .row-duration { font-size: var(--text-xs); font-variant-numeric: tabular-nums; }

  /* ─── Card ─────────────────────────────────────────────────────────────── */
  .song-card {
    overflow: hidden;
    cursor: pointer;
  }
  .song-card.active {
    border-color: var(--color-primary);
    background: var(--color-primary-glow);
  }

  .card-art {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--color-surface-raised);
  }
  .card-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--t-slow) ease;
  }
  .song-card:hover .card-art img { transform: scale(1.04); }

  .art-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-faint);
  }

  .card-play-overlay {
    position: absolute;
    inset: 0;
    background: rgba(17, 16, 25, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--t-fast) ease;
  }
  .song-card:hover .card-play-overlay,
  .song-card.active .card-play-overlay { opacity: 1; }

  .card-play-btn {
    width: 39px;
    height: 39px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: #FFFFFF;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(120, 75, 255, 0.4);
    transform: scale(0.85);
    transition: transform var(--t-fast) ease, background var(--t-fast) ease;
  }
  .card-play-btn:hover {
    background: var(--color-primary-hover);
  }
  .song-card:hover .card-play-btn { transform: scale(1); }

  /* Equaliser bars animation */
  @keyframes eq-bar {
    0%, 100% { transform: scaleY(0.4); }
    50% { transform: scaleY(1); }
  }
  .eq-indicator {
    position: absolute;
    bottom: 7px;
    right: 7px;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 13px;
  }
  .eq-indicator span {
    width: 2.8px;
    height: 100%;
    background: var(--color-primary);
    border-radius: 2px;
    animation: eq-bar 0.8s ease-in-out infinite;
  }
  .eq-indicator span:nth-child(2) { animation-delay: 0.15s; }
  .eq-indicator span:nth-child(3) { animation-delay: 0.3s; }

  .card-body { padding: 0.68rem; }

  .card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.4rem;
  }

  .card-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.15rem;
  }
  .card-artist {
    font-size: var(--text-xs);
  }
</style>
