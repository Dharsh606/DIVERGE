<script lang="ts">
  import { onMount } from 'svelte';
  import { isLoggedIn, currentUser } from '$lib/stores/auth';
  import { player } from '$lib/stores/player';
  import type { Song, DivergeSession } from '$lib/types';
  import TrackDNA from '$lib/components/dna/TrackDNA.svelte';

  let sessionCode = '';
  let activeSession: DivergeSession | null = null;
  let roomCodeInput = '';
  let sessionQueue: Song[] = [];
  let isHost = false;
  let joining = false;

  function createSession() {
    if (!$currentUser) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    activeSession = {
      id: Date.now(),
      host_user_id: $currentUser.id,
      host: $currentUser,
      name: `${$currentUser.username}'s Diverge Session`,
      share_code: code,
      current_song: $player.currentSong ?? undefined,
      current_position_seconds: $player.currentTime,
      is_playing: $player.state === 'playing'
    };
    isHost = true;
    sessionQueue = $player.queue.length ? [...$player.queue] : [];
  }

  function joinSession() {
    if (!roomCodeInput.trim() || !$currentUser) return;
    joining = true;
    setTimeout(() => {
      activeSession = {
        id: Date.now(),
        host_user_id: 999,
        host: { id: 999, username: 'Curator', email: 'c@diverge.local', avatar_url: '', created_at: '' },
        name: `Session #${roomCodeInput.trim().toUpperCase()}`,
        share_code: roomCodeInput.trim().toUpperCase(),
        current_song: $player.currentSong ?? undefined,
        current_position_seconds: 0,
        is_playing: true
      };
      isHost = false;
      joining = false;
    }, 400);
  }

  function leaveSession() {
    activeSession = null;
    isHost = false;
  }

  function copyCode() {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.share_code);
  }
</script>

<svelte:head>
  <title>Diverge Sessions - Real-Time Listening - DIVERGE</title>
  <meta name="description" content="Host and join shared synchronized listening sessions with your circle." />
</svelte:head>

<div class="sessions-page">
  <div class="sessions-header">
    <div>
      <h1>Diverge Sessions</h1>
      <p class="text-muted">Synchronized group listening with shared queue and coordinated playback.</p>
    </div>
  </div>

  {#if !$isLoggedIn}
    <div class="cta-box card">
      <h2>Collaborative Listening</h2>
      <p class="text-muted">Sign in to host a live Diverge Session or join a room via session code.</p>
      <div class="cta-actions">
        <a href="/login" class="btn btn-primary">Log in</a>
        <a href="/register" class="btn btn-ghost">Create account</a>
      </div>
    </div>
  {:else if !activeSession}
    <!-- Lobby: Create or Join -->
    <div class="lobby-grid">
      <!-- Create Room -->
      <div class="lobby-card card">
        <div class="card-icon-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M12 2v20M2 12h20"/>
          </svg>
        </div>
        <h2>Host a Session</h2>
        <p class="text-muted">Broadcast your listening queue in real time. Listeners can tune in and suggest tracks.</p>
        <button class="btn btn-primary" on:click={createSession}>
          Start Session
        </button>
      </div>

      <!-- Join Room -->
      <div class="lobby-card card">
        <div class="card-icon-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
          </svg>
        </div>
        <h2>Join with Code</h2>
        <p class="text-muted">Enter a 6-character room code to synchronize with an ongoing session.</p>
        <div class="join-form">
          <input
            type="text"
            class="input code-input"
            placeholder="e.g. KV78X2"
            maxlength="6"
            bind:value={roomCodeInput}
          />
          <button class="btn btn-ghost" on:click={joinSession} disabled={joining || !roomCodeInput.trim()}>
            {joining ? 'Connecting...' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  {:else}
    <!-- Active Room Dashboard -->
    <div class="room-dashboard card">
      <div class="room-top">
        <div class="room-title-area">
          <span class="badge badge-accent">Live Session</span>
          <h2>{activeSession.name}</h2>
          <span class="text-muted">Hosted by {activeSession.host?.username ?? 'Anonymous'}</span>
        </div>

        <div class="room-share">
          <span class="code-label text-muted">Room Code:</span>
          <button class="code-btn" on:click={copyCode} title="Click to copy code">
            <code>{activeSession.share_code}</code>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button class="btn btn-ghost" on:click={leaveSession}>Leave</button>
        </div>
      </div>

      <!-- Currently playing in room -->
      <div class="room-now-playing card">
        <div class="playing-header">
          <span class="text-muted text-xs uppercase">Synchronized Track</span>
          <div class="sync-indicator">
            <span class="pulse-dot"></span>
            <span class="text-xs">Live Sync</span>
          </div>
        </div>

        {#if $player.currentSong}
          <div class="sync-track">
            <TrackDNA song={$player.currentSong} size={48} />
            <div class="track-info">
              <span class="title">{$player.currentSong.title}</span>
              <span class="artist text-muted">{$player.currentSong.artist?.name ?? ''}</span>
            </div>
            <div class="track-stats">
              <span class="badge badge-primary">{$player.currentSong.genre}</span>
              <span class="text-muted text-xs">{$player.currentSong.bpm} BPM</span>
            </div>
          </div>
        {:else}
          <p class="text-muted" style="padding: 1rem 0;">No track currently playing in the room.</p>
        {/if}
      </div>

      <!-- Shared Queue -->
      <div class="room-queue-section">
        <h3>Room Queue ({$player.queue.length})</h3>
        {#if $player.queue.length === 0}
          <p class="text-muted">Queue is empty. Select songs from search or library to queue tracks for the room.</p>
        {:else}
          <div class="queue-list" role="list">
            {#each $player.queue as track, i (track.id)}
              <div class="queue-row" class:active-queue-row={$player.queueIndex === i} role="listitem">
                <span class="queue-pos text-muted">{i + 1}</span>
                <span class="queue-title text-ellipsis">{track.title}</span>
                <span class="queue-artist text-ellipsis text-muted">{track.artist?.name ?? ''}</span>
                <span class="queue-genre text-muted text-xs">{track.genre}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .sessions-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 2rem;
  }

  .cta-box {
    padding: 3rem 2rem;
    border-radius: var(--radius-lg);
    text-align: center;
    max-width: 520px;
    margin: 2rem auto;
  }

  .cta-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .lobby-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .lobby-card {
    padding: 2rem;
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .card-icon-badge {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    background: var(--color-primary-dim);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lobby-card h2 {
    font-size: var(--text-xl);
  }

  .join-form {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  .code-input {
    letter-spacing: 0.15em;
    font-family: monospace;
    font-weight: 700;
    text-transform: uppercase;
  }

  .room-dashboard {
    padding: 2rem;
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .room-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .room-title-area {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .room-share {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .code-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius-sm);
    color: var(--color-text);
    cursor: pointer;
  }

  .code-btn code {
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--color-primary);
  }

  .room-now-playing {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .playing-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sync-indicator {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-success);
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-success);
    animation: live-pulse 1.5s infinite;
  }

  @keyframes live-pulse {
    0% { transform: scale(0.95); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.5; }
    100% { transform: scale(0.95); opacity: 1; }
  }

  .sync-track {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .track-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .track-info .title {
    font-size: var(--text-base);
    font-weight: 600;
  }

  .track-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .queue-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.75rem;
  }

  .queue-row {
    display: grid;
    grid-template-columns: 24px 1fr 1fr 80px;
    gap: 0.75rem;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
  }

  .queue-row:hover {
    background: var(--color-surface-raised);
  }

  .active-queue-row {
    background: var(--color-primary-dim);
    color: var(--color-primary);
  }

  .text-xs { font-size: 11px; }
  .uppercase { text-transform: uppercase; }
</style>
