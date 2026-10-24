<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { player, isPlaying, progressPercent, formatTime } from '$lib/stores/player';
  import { preferences } from '$lib/stores/preferences';
  import { likedSongs } from '$lib/stores/liked';
  import type { Song } from '$lib/types';

  $: song = $player.currentSong;
  $: state = $player.state;
  $: volume = $player.volume;
  $: muted = $player.muted;
  $: shuffle = $player.shuffle;
  $: repeat = $player.repeat;
  $: queue = $player.queue;
  $: queueIndex = $player.queueIndex;

  // 4 Feature Toggles
  let showQueue = false;
  let showDevices = false;
  let showMiniplayer = false;
  let showFullscreen = false;

  // Device toast feedback
  let deviceToast = '';
  let deviceToastTimeout: any = null;

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

  function toggleQueue() {
    showQueue = !showQueue;
    if (showQueue) showDevices = false;
  }

  function toggleDevices() {
    showDevices = !showDevices;
    if (showDevices) showQueue = false;
  }

  function toggleMiniplayer() {
    showMiniplayer = !showMiniplayer;
  }

  function toggleFullscreen() {
    showFullscreen = !showFullscreen;
    if (browser && showFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else if (browser && !showFullscreen) {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function handleSelectDevice(deviceId: string) {
    preferences.selectDevice(deviceId);
    const d = $preferences.devicesList.find(item => item.id === deviceId);
    deviceToast = `Switched playback target to ${d ? d.name : deviceId}`;
    clearTimeout(deviceToastTimeout);
    deviceToastTimeout = setTimeout(() => {
      deviceToast = '';
    }, 3200);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (showFullscreen) showFullscreen = false;
      if (showQueue) showQueue = false;
      if (showDevices) showDevices = false;
    }
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<!-- ═══════════════════════════════════════════════════════════════════════════
     MAIN BOTTOM PLAYER BAR
     ═══════════════════════════════════════════════════════════════════════════ -->
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
      <div class="meta-action-btns">
        <button
          class="btn btn-icon like-btn"
          class:liked={$likedSongs.some(s => s.id === song?.id || (song?.youtube_id && s.youtube_id === song?.youtube_id))}
          on:click={() => song && likedSongs.toggleLike(song)}
          data-tooltip={$likedSongs.some(s => s.id === song?.id || (song?.youtube_id && s.youtube_id === song?.youtube_id)) ? "Liked" : "Add to Liked Songs"}
          aria-label="Add to Liked Songs"
        >
          {#if $likedSongs.some(s => s.id === song?.id || (song?.youtube_id && s.youtube_id === song?.youtube_id))}
            <svg viewBox="0 0 24 24" fill="#FF5C58" stroke="#FF5C58" stroke-width="2" width="16" height="16">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          {/if}
        </button>

        <button class="btn btn-icon share-btn" on:click={copyShareLink} data-tooltip="Copy share link" aria-label="Share song">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>
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

  <!-- Right: 4 New Major Features + Volume -->
  <div class="player-right">
    <!-- 1. Queue Drawer Button -->
    <button
      class="btn btn-icon feature-btn"
      class:btn-active={showQueue}
      on:click={toggleQueue}
      aria-label="Open Queue"
      title="Queue ({queue.length} tracks)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
      {#if queue.length > 0}
        <span class="feature-badge">{queue.length}</span>
      {/if}
    </button>

    <!-- 2. Connect to Device Button -->
    <button
      class="btn btn-icon feature-btn"
      class:btn-active={showDevices}
      on:click={toggleDevices}
      aria-label="Connect to a device"
      title="Connect to a device ({$preferences.activeDevice.name})"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      <span class="device-dot"></span>
    </button>

    <!-- 3. Open Miniplayer Button -->
    <button
      class="btn btn-icon feature-btn"
      class:btn-active={showMiniplayer}
      on:click={toggleMiniplayer}
      aria-label="Toggle Miniplayer"
      title="Open Miniplayer"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <rect x="12" y="12" width="7" height="7" rx="1" fill="currentColor"/>
      </svg>
    </button>

    <!-- 4. Enter Fullscreen Button -->
    <button
      class="btn btn-icon feature-btn"
      class:btn-active={showFullscreen}
      on:click={toggleFullscreen}
      aria-label="Enter Full Screen"
      title="Enter Full Screen"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>
    </button>

    <!-- Volume Mute Button -->
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

    <!-- Volume slider -->
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

<!-- ═══════════════════════════════════════════════════════════════════════════
     FEATURE 1: QUEUE DRAWER / POPOVER
     ═══════════════════════════════════════════════════════════════════════════ -->
{#if showQueue}
  <aside class="queue-drawer glass" aria-label="Playback Queue">
    <div class="drawer-header">
      <div class="drawer-title-box">
        <h4>Playback Queue</h4>
        <span class="queue-count-pill">{queue.length} Tracks</span>
      </div>
      <div class="drawer-header-actions">
        {#if queue.length > 0}
          <button class="btn btn-ghost btn-xs" on:click={() => player.clearQueue()}>Clear</button>
        {/if}
        <button class="btn btn-icon btn-xs" on:click={() => (showQueue = false)} aria-label="Close queue">✕</button>
      </div>
    </div>

    <!-- Now Playing in Queue -->
    <div class="queue-section">
      <span class="queue-section-label">Now Playing</span>
      {#if song}
        <div class="now-playing-card">
          <div class="queue-song-art">
            {#if song.album?.cover_url}
              <img src={song.album.cover_url} alt={song.title} />
            {:else}
              <div class="placeholder-box">♫</div>
            {/if}
          </div>
          <div class="queue-song-meta">
            <span class="song-title-now">{song.title}</span>
            <span class="song-artist-now text-muted">{song.artist?.name || 'Artist'}</span>
          </div>
          <!-- Equalizer animation -->
          <div class="equalizer-bars" aria-hidden="true">
            <span class="eq-bar bar1" class:eq-paused={!$isPlaying}></span>
            <span class="eq-bar bar2" class:eq-paused={!$isPlaying}></span>
            <span class="eq-bar bar3" class:eq-paused={!$isPlaying}></span>
          </div>
        </div>
      {:else}
        <div class="empty-queue-hint">No track currently active.</div>
      {/if}
    </div>

    <!-- Up Next in Queue -->
    <div class="queue-section queue-scrollable">
      <span class="queue-section-label">Next Up</span>
      {#if queue.length > 0}
        <div class="queue-items-list">
          {#each queue as track, idx}
            <div
              class="queue-item-row"
              class:queue-item-active={idx === queueIndex}
            >
              <div class="queue-item-drag-idx">{idx + 1}</div>
              <div class="queue-song-art-sm">
                {#if track.album?.cover_url}
                  <img src={track.album.cover_url} alt={track.title} />
                {:else}
                  <div class="placeholder-box">♫</div>
                {/if}
              </div>
              <button type="button" class="queue-song-meta queue-song-meta-btn" on:click={() => player.playIndex(idx)}>
                <span class="queue-track-title">{track.title}</span>
                <span class="queue-track-artist text-muted">{track.artist?.name || 'Artist'}</span>
              </button>
              <button
                class="remove-queue-btn"
                on:click={() => player.removeFromQueue(idx)}
                aria-label="Remove from queue"
                title="Remove"
              >
                ✕
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-queue-hint">
          Queue is empty. Select any song or playlist to append tracks.
        </div>
      {/if}
    </div>
  </aside>
{/if}

<!-- ═══════════════════════════════════════════════════════════════════════════
     FEATURE 2: CONNECT TO DEVICE POPOVER
     ═══════════════════════════════════════════════════════════════════════════ -->
{#if showDevices}
  <aside class="device-popover glass" aria-label="Connect to a Device">
    <div class="drawer-header">
      <div class="drawer-title-box">
        <h4>Connect to a Device</h4>
      </div>
      <button class="btn btn-icon btn-xs" on:click={() => (showDevices = false)} aria-label="Close device menu">✕</button>
    </div>

    <div class="device-list">
      {#each $preferences.devicesList as dev}
        <button
          class="device-card-item"
          class:device-card-active={dev.active}
          on:click={() => handleSelectDevice(dev.id)}
        >
          <div class="device-icon-box">
            {#if dev.type === 'browser'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            {:else if dev.type === 'cast'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><line x1="2" y1="20" x2="2.01" y2="20"/></svg>
            {:else if dev.type === 'airplay'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 15 17 21 7 21 12 15"/></svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M7 7l10 10-5 5V2l5 5L7 17"/></svg>
            {/if}
          </div>
          <div class="device-details">
            <span class="device-name">{dev.name}</span>
            <span class="device-sub">{dev.active ? 'Listening On This Device' : dev.quality}</span>
          </div>
          {#if dev.active}
            <div class="device-active-badge">
              <span class="active-pulse"></span>
              Active
            </div>
          {/if}
        </button>
      {/each}
    </div>

    {#if deviceToast}
      <div class="device-feedback-toast">{deviceToast}</div>
    {/if}
  </aside>
{/if}

<!-- ═══════════════════════════════════════════════════════════════════════════
     FEATURE 3: FLOATING DOCKED MINIPLAYER
     ═══════════════════════════════════════════════════════════════════════════ -->
{#if showMiniplayer && song}
  <div class="floating-miniplayer glass-raised" role="region" aria-label="Miniplayer">
    <div class="miniplayer-top-row">
      <span class="miniplayer-tag">MINIPLAYER</span>
      <div class="miniplayer-top-actions">
        <button class="mini-icon-btn" on:click={toggleFullscreen} title="Full Screen">⤢</button>
        <button class="mini-icon-btn" on:click={() => (showMiniplayer = false)} title="Close Miniplayer">✕</button>
      </div>
    </div>

    <div class="miniplayer-body">
      <!-- Rotating Vinyl Artwork -->
      <div class="vinyl-art-wrapper" class:vinyl-spinning={$isPlaying}>
        {#if song.album?.cover_url}
          <img src={song.album.cover_url} alt={song.title} class="mini-art-img" />
        {:else}
          <div class="mini-art-fallback">♫</div>
        {/if}
        <div class="vinyl-center-hole"></div>
      </div>

      <div class="miniplayer-track-info">
        <h5 class="mini-title text-ellipsis">{song.title}</h5>
        <span class="mini-artist text-ellipsis text-muted">{song.artist?.name || 'Artist'}</span>
        
        <!-- Live audio waveform bars -->
        <div class="mini-waveform">
          {#each Array(8) as _, i}
            <span
              class="waveform-bar"
              style="animation-delay: {i * 0.1}s;"
              class:wave-paused={!$isPlaying}
            ></span>
          {/each}
        </div>
      </div>
    </div>

    <!-- Mini transport controls -->
    <div class="miniplayer-controls">
      <button class="btn btn-icon btn-sm" on:click={() => player.prev()} aria-label="Prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
      </button>

      <button class="mini-play-btn" on:click={() => player.toggle()} aria-label={$isPlaying ? 'Pause' : 'Play'}>
        {#if $isPlaying}
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        {/if}
      </button>

      <button class="btn btn-icon btn-sm" on:click={() => player.next()} aria-label="Next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
      </button>
    </div>
  </div>
{/if}

<!-- ═══════════════════════════════════════════════════════════════════════════
     FEATURE 4: IMMERSIVE FULLSCREEN VISUALIZER
     ═══════════════════════════════════════════════════════════════════════════ -->
{#if showFullscreen && song}
  <div class="fullscreen-visualizer-overlay" role="dialog" aria-modal="true" aria-label="Fullscreen music visualizer">
    <!-- Ambient colored glow backdrop -->
    <div class="fs-ambient-backdrop"></div>

    <!-- Top bar inside fullscreen -->
    <div class="fs-top-bar">
      <div class="fs-brand">
        <img src="/logo-mark.png" alt="DIVERGE" class="fs-logo" />
        <span class="fs-brand-name">DIVERGE STUDIO</span>
      </div>
      <div class="fs-top-right">
        <span class="fs-quality-tag">FLAC 24-BIT 96KHZ LOSSLESS</span>
        <button class="fs-exit-btn" on:click={toggleFullscreen} aria-label="Exit fullscreen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>Exit (Esc)</span>
        </button>
      </div>
    </div>

    <!-- Center content -->
    <div class="fs-center-stage">
      <div class="fs-artwork-card">
        {#if song.album?.cover_url}
          <img src={song.album.cover_url} alt={song.title} class="fs-art-img" />
        {:else}
          <div class="fs-art-fallback">♫</div>
        {/if}
      </div>

      <div class="fs-typography">
        <h1 class="fs-title">{song.title}</h1>
        <h2 class="fs-artist">{song.artist?.name || 'Unknown Artist'}</h2>
        {#if song.album?.title}
          <span class="fs-album text-muted">Album: {song.album.title}</span>
        {/if}
      </div>

      <!-- Frequency Equalizer Spectrum -->
      <div class="fs-spectrum" aria-hidden="true">
        {#each Array(24) as _, i}
          <span
            class="fs-spectrum-bar"
            style="animation-delay: {i * 0.06}s; height: {20 + (i % 7) * 8}px;"
            class:spectrum-paused={!$isPlaying}
          ></span>
        {/each}
      </div>
    </div>

    <!-- Bottom Controls in Fullscreen -->
    <div class="fs-bottom-controls">
      <!-- Scrub row -->
      <div class="fs-scrub-row">
        <span class="fs-time">{formatTime($player.currentTime)}</span>
        <div class="fs-track-bar">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={$progressPercent}
            on:input={handleSeek}
            aria-label="Seek track"
          />
          <div class="fs-track-fill" style="width: {$progressPercent}%"></div>
        </div>
        <span class="fs-time">{formatTime($player.duration)}</span>
      </div>

      <!-- Main Controls Row -->
      <div class="fs-controls-cluster">
        <button class="btn btn-icon" on:click={() => player.toggleShuffle()} class:control-active={shuffle} aria-label="Shuffle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
        </button>

        <button class="btn btn-icon" on:click={() => player.prev()} aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
        </button>

        <button class="fs-play-circle" on:click={() => player.toggle()} aria-label={$isPlaying ? 'Pause' : 'Play'}>
          {#if $isPlaying}
            <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {/if}
        </button>

        <button class="btn btn-icon" on:click={() => player.next()} aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
        </button>

        <button class="btn btn-icon" on:click={() => player.cycleRepeat()} class:control-active={repeat !== 'none'} aria-label="Repeat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .player-bar {
    grid-row: 2;
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 2fr 1.35fr;
    align-items: center;
    gap: 1.25rem;
    padding: 0 1.5rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
    min-height: var(--player-height);
    z-index: 50;
    position: relative;
  }

  /* Left */
  .player-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .song-art {
    width: 44px;
    height: 44px;
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
  .song-art-placeholder svg { width: 19px; height: 19px; }

  .song-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .song-title {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--color-text);
    max-width: 165px;
  }
  .song-artist {
    font-size: 0.76rem;
    max-width: 165px;
  }

  .meta-action-btns {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }

  .like-btn {
    color: var(--color-text-faint);
    transition: transform var(--t-fast) ease, color var(--t-fast) ease;
  }
  .like-btn:hover {
    color: #FF5C58;
    transform: scale(1.12);
  }
  .like-btn.liked {
    color: #FF5C58;
  }

  .no-song-hint {
    font-size: var(--text-sm);
  }

  /* Centre */
  .player-centre {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
  }

  .controls-row {
    display: flex;
    align-items: center;
    gap: 0.22rem;
  }

  .control-btn {
    color: var(--color-text-muted);
    transition: color var(--t-fast) ease, transform var(--t-fast) ease;
  }
  .control-btn:hover { color: var(--color-text); transform: scale(1.1); }
  .control-active { color: var(--color-primary) !important; }
  .control-accent { color: var(--color-accent) !important; }

  .play-btn {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: var(--color-text);
    color: var(--color-bg);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 0.45rem;
    transition: transform var(--t-fast) ease, background var(--t-fast) ease;
    box-shadow: var(--shadow-sm);
  }
  .play-btn:hover { transform: scale(1.08); background: #FFFFFF; }
  .play-btn:active { transform: scale(0.95); }
  .play-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .progress-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    max-width: 490px;
  }

  .time-stamp {
    font-size: var(--text-xs);
    min-width: 34px;
    font-variant-numeric: tabular-nums;
  }

  .progress-track {
    position: relative;
    flex: 1;
    height: 4px;
    border-radius: var(--radius-full);
    background: var(--color-border);
    cursor: pointer;
  }
  .progress-track input[type="range"] {
    position: absolute;
    inset: -6px 0;
    width: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
    margin: 0;
  }
  .progress-fill {
    height: 100%;
    border-radius: var(--radius-full);
    background: var(--color-brand-gradient);
    pointer-events: none;
    position: relative;
  }
  .progress-track:hover .progress-fill::after {
    content: '';
    position: absolute;
    right: -4px;
    top: -4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  }

  /* Right */
  .player-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .feature-btn {
    position: relative;
    color: var(--color-text-muted);
    transition: color 0.15s ease, transform 0.15s ease;
  }
  .feature-btn:hover {
    color: var(--color-text);
    transform: scale(1.1);
  }
  .feature-btn.btn-active {
    color: var(--color-primary);
  }

  .feature-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    background: var(--color-primary);
    color: #FFFFFF;
    font-size: 0.6rem;
    font-weight: 800;
    padding: 0.1rem 0.35rem;
    border-radius: var(--radius-full);
  }

  .device-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-success);
    box-shadow: 0 0 6px var(--color-success);
  }

  .volume-slider {
    width: 80px;
    display: flex;
    align-items: center;
  }
  .volume-slider input[type="range"] {
    width: 100%;
    height: 4px;
    accent-color: var(--color-primary);
    cursor: pointer;
  }

  /* ─── Queue Drawer Styles ────────────────────────────────────────────────── */
  .queue-drawer {
    position: fixed;
    bottom: calc(var(--player-height) + 12px);
    right: 20px;
    width: 345px;
    max-height: min(455px, calc(100vh - var(--player-height) - 35px));
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-hover);
    background: rgba(18, 16, 27, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    z-index: 500;
    animation: fadeInSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeInSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .drawer-header {
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-border-subtle);
  }
  .drawer-title-box {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }
  .drawer-title-box h4 {
    font-size: var(--text-base);
    font-weight: 700;
  }
  .queue-count-pill {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-full);
    background: var(--color-surface-raised);
    color: var(--color-brand-gold);
    font-weight: 700;
  }

  .drawer-header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .queue-section {
    padding: 1rem 1.25rem;
  }
  .queue-section-label {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 0.6rem;
  }

  .now-playing-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    padding: 0.65rem;
    border-radius: var(--radius-md);
  }

  .queue-song-art {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    background: #000;
    flex-shrink: 0;
  }
  .queue-song-art img { width: 100%; height: 100%; object-fit: cover; }

  .queue-song-art-sm {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    background: #000;
    flex-shrink: 0;
  }
  .queue-song-art-sm img { width: 100%; height: 100%; object-fit: cover; }

  .queue-song-meta {
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }
  .queue-song-meta-btn {
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    color: inherit;
    font-family: inherit;
  }
  .song-title-now {
    font-size: var(--text-sm);
    font-weight: 600;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .song-artist-now {
    font-size: var(--text-xs);
    display: block;
  }

  /* Equalizer Animation */
  .equalizer-bars {
    display: flex;
    align-items: flex-end;
    gap: 2.5px;
    height: 18px;
    padding-right: 0.25rem;
  }
  .eq-bar {
    width: 3px;
    background: var(--color-accent);
    border-radius: 1px;
    animation: eqBounce 0.8s ease-in-out infinite alternate;
  }
  .bar1 { height: 60%; animation-delay: 0.1s; }
  .bar2 { height: 100%; animation-delay: 0.3s; }
  .bar3 { height: 40%; animation-delay: 0.2s; }
  .eq-paused { animation-play-state: paused; height: 30% !important; }

  @keyframes eqBounce {
    0% { height: 20%; }
    100% { height: 100%; }
  }

  .queue-scrollable {
    flex: 1;
    overflow-y: auto;
    border-top: 1px solid var(--color-border-subtle);
  }

  .queue-items-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .queue-item-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.45rem 0.5rem;
    border-radius: var(--radius-sm);
    transition: background 0.12s ease;
  }
  .queue-item-row:hover {
    background: var(--color-surface-raised);
  }
  .queue-item-active {
    background: rgba(120, 75, 255, 0.15);
    border-left: 2px solid var(--color-primary);
  }

  .queue-item-drag-idx {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    width: 16px;
    text-align: center;
  }

  .queue-track-title {
    font-size: var(--text-xs);
    font-weight: 600;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .queue-track-artist {
    font-size: 0.7rem;
    display: block;
  }

  .remove-queue-btn {
    background: none;
    border: none;
    color: var(--color-text-faint);
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0.2rem;
  }
  .remove-queue-btn:hover { color: var(--color-error); }

  .empty-queue-hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-align: center;
    padding: 1.5rem 0.5rem;
  }

  /* ─── Connect to Device Popover ──────────────────────────────────────────── */
  .device-popover {
    position: fixed;
    bottom: calc(var(--player-height) + 12px);
    right: 20px;
    width: 308px;
    max-height: min(400px, calc(100vh - var(--player-height) - 35px));
    overflow-y: auto;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-hover);
    background: rgba(18, 16, 27, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
    z-index: 500;
    animation: fadeInSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .device-list {
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .device-card-item {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.75rem;
    border-radius: var(--radius-md);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    width: 100%;
    color: inherit;
  }
  .device-card-item:hover {
    background: var(--color-border-hover);
    transform: translateY(-1px);
  }
  .device-card-active {
    border-color: var(--color-success);
    background: rgba(34, 197, 94, 0.1);
  }

  .device-icon-box {
    color: var(--color-text-muted);
  }
  .device-card-active .device-icon-box {
    color: var(--color-success);
  }

  .device-details {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .device-name {
    font-size: var(--text-sm);
    font-weight: 600;
  }
  .device-sub {
    font-size: 0.7rem;
    color: var(--color-text-muted);
  }
  .device-card-active .device-sub {
    color: var(--color-success);
    font-weight: 600;
  }

  .device-active-badge {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--color-success);
    background: rgba(34, 197, 94, 0.15);
    padding: 0.2rem 0.45rem;
    border-radius: var(--radius-full);
  }
  .active-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-success);
  }

  .device-feedback-toast {
    margin: 0.5rem 1rem 0.85rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    background: rgba(120, 75, 255, 0.2);
    border: 1px solid var(--color-primary);
    font-size: var(--text-xs);
    color: #FFFFFF;
    text-align: center;
  }

  /* ─── Floating Miniplayer Styles ─────────────────────────────────────────── */
  .floating-miniplayer {
    position: fixed;
    bottom: calc(var(--player-height) + 16px);
    right: 20px;
    width: 285px;
    border-radius: var(--radius-lg);
    border: 1.5px solid rgba(120, 75, 255, 0.35);
    background: rgba(18, 16, 27, 0.96);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 20px rgba(120, 75, 255, 0.25);
    padding: 0.95rem;
    z-index: 600;
    animation: fadeInSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .miniplayer-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  .miniplayer-tag {
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--color-brand-gold);
    letter-spacing: 0.08em;
  }
  .miniplayer-top-actions {
    display: flex;
    gap: 0.5rem;
  }
  .mini-icon-btn {
    background: none;
    border: none;
    color: var(--color-text-faint);
    cursor: pointer;
    font-size: 0.85rem;
  }
  .mini-icon-btn:hover { color: var(--color-text); }

  .miniplayer-body {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 0.85rem;
  }

  .vinyl-art-wrapper {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    background: #000;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  }
  .mini-art-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mini-art-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
  .vinyl-center-hole {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
  }

  .vinyl-spinning {
    animation: spinVinyl 6s linear infinite;
  }
  @keyframes spinVinyl {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .miniplayer-track-info {
    flex: 1;
    min-width: 0;
  }
  .mini-title {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-text);
  }
  .mini-artist {
    font-size: var(--text-xs);
    display: block;
    margin-bottom: 0.35rem;
  }

  .mini-waveform {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 12px;
  }
  .waveform-bar {
    width: 2.5px;
    background: var(--color-accent);
    border-radius: 1px;
    animation: wavePulse 0.7s ease-in-out infinite alternate;
  }
  .wave-paused { animation-play-state: paused; height: 3px !important; }

  @keyframes wavePulse {
    0% { height: 3px; }
    100% { height: 12px; }
  }

  .miniplayer-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-subtle);
  }

  .mini-play-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-text);
    color: var(--color-bg);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  /* ─── Immersive Fullscreen Visualizer ────────────────────────────────────── */
  .fullscreen-visualizer-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #0A0912;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.5rem 4rem;
    animation: fadeIn 0.3s ease;
  }

  .fs-ambient-backdrop {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 45%, rgba(120, 75, 255, 0.22) 0%, rgba(255, 92, 88, 0.12) 40%, #0A0912 80%);
    pointer-events: none;
    z-index: -1;
  }

  .fs-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .fs-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .fs-logo {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
  .fs-brand-name {
    font-size: var(--text-sm);
    font-weight: 800;
    letter-spacing: 0.2em;
    color: var(--color-text);
  }

  .fs-top-right {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
  .fs-quality-tag {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-brand-gold);
    background: rgba(255, 174, 51, 0.12);
    border: 1px solid rgba(255, 174, 51, 0.3);
    padding: 0.3rem 0.75rem;
    border-radius: var(--radius-full);
  }

  .fs-exit-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.4rem 0.85rem;
    border-radius: var(--radius-full);
    cursor: pointer;
    font-size: var(--text-xs);
    font-weight: 600;
  }
  .fs-exit-btn:hover { background: var(--color-border-hover); }

  .fs-center-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: auto 0;
  }

  .fs-artwork-card {
    width: 280px;
    height: 280px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(120, 75, 255, 0.35);
    margin-bottom: 2rem;
  }
  .fs-art-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .fs-art-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    background: var(--color-surface-raised);
  }

  .fs-typography {
    margin-bottom: 1.5rem;
  }
  .fs-title {
    font-size: 2.25rem;
    font-weight: 800;
    color: #FFFFFF;
    margin-bottom: 0.5rem;
  }
  .fs-artist {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--color-text-muted);
  }
  .fs-album {
    font-size: var(--text-sm);
    display: block;
    margin-top: 0.35rem;
  }

  .fs-spectrum {
    display: flex;
    align-items: flex-end;
    gap: 5px;
    height: 60px;
    margin-top: 1rem;
  }
  .fs-spectrum-bar {
    width: 6px;
    border-radius: 3px;
    background: linear-gradient(to top, #784BFF, #FF5C58);
    animation: spectrumWave 1s ease-in-out infinite alternate;
  }
  .spectrum-paused { animation-play-state: paused; height: 10px !important; }

  @keyframes spectrumWave {
    0% { height: 12px; }
    100% { height: 58px; }
  }

  .fs-bottom-controls {
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .fs-scrub-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }
  .fs-time {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }
  .fs-track-bar {
    position: relative;
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-full);
  }
  .fs-track-bar input[type="range"] {
    position: absolute;
    inset: -6px 0;
    width: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
  }
  .fs-track-fill {
    height: 100%;
    border-radius: var(--radius-full);
    background: linear-gradient(90deg, #784BFF, #FF5C58);
  }

  .fs-controls-cluster {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }

  .fs-play-circle {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #FFFFFF;
    color: #0A0912;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    transition: transform 0.15s ease;
  }
  .fs-play-circle:hover {
    transform: scale(1.08);
  }

  .placeholder-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-faint);
  }
</style>
