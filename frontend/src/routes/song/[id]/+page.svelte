<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { songs as songsAPI, tags as tagsAPI, playlists as playlistsAPI } from '$lib/services/api';
  import type { Song, Playlist } from '$lib/types';
  import { player, formatTime } from '$lib/stores/player';
  import { isLoggedIn } from '$lib/stores/auth';
  import TrackDNA from '$lib/components/dna/TrackDNA.svelte';

  let song: Song | null = null;
  let loading = true;
  let newTagName = '';
  let attachingTag = false;
  let userPlaylists: Playlist[] = [];
  let selectedPlaylistId: number | null = null;
  let addedToPlaylistMsg = '';
  let copied = false;

  $: songId = Number(page.params.id);

  onMount(async () => {
    try {
      song = await songsAPI.get(songId) as Song;
      if ($isLoggedIn) {
        userPlaylists = await playlistsAPI.list() as Playlist[];
      }
    } catch (err) {
      console.error('Failed to load song', err);
    } finally {
      loading = false;
    }
  });

  function playCurrent() {
    if (song) {
      player.playSong(song);
    }
  }

  async function handleAddTag(e: Event) {
    e.preventDefault();
    if (!newTagName.trim() || !song) return;

    attachingTag = true;
    try {
      await tagsAPI.add(song.id, newTagName.trim().replace(/^#/, ''));
      newTagName = '';
      // refresh song
      song = await songsAPI.get(songId) as Song;
    } catch (err) {
      console.error('Failed to add tag', err);
    } finally {
      attachingTag = false;
    }
  }

  async function addToPlaylist() {
    if (!selectedPlaylistId || !song) return;
    try {
      await playlistsAPI.addSong(selectedPlaylistId, song.id);
      addedToPlaylistMsg = 'Added to playlist';
      setTimeout(() => { addedToPlaylistMsg = ''; }, 2000);
    } catch (err) {
      console.error('Failed to add to playlist', err);
    }
  }

  function copyShareUrl() {
    navigator.clipboard.writeText(window.location.href);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }
</script>

<svelte:head>
  {#if song}
    <title>{song.title} by {song.artist?.name} - DIVERGE</title>
    <meta name="description" content="Listen to {song.title} on DIVERGE. Explore its Track DNA and musical coordinates." />
  {:else}
    <title>Song Details - DIVERGE</title>
  {/if}
</svelte:head>

<div class="song-detail-page">
  <div class="back-nav">
    <a href="/search" class="back-link">&larr; Back to catalog</a>
  </div>

  {#if loading}
    <div class="skeleton" style="height: 300px; border-radius: var(--radius-xl);"></div>
  {:else if !song}
    <div class="card glass not-found">
      <h2>Track Not Found</h2>
      <p class="text-muted">The track you are looking for does not exist or has been removed.</p>
      <a href="/search" class="btn btn-primary">Discover other songs</a>
    </div>
  {:else}
    <!-- Song Hero Card -->
    <div class="song-hero glass">
      <div class="hero-art">
        {#if song.album?.cover_url}
          <img src={song.album.cover_url} alt="{song.album.title} cover" />
        {:else}
          <div class="art-empty"></div>
        {/if}
      </div>

      <div class="hero-info">
        <div class="badge-row">
          <span class="badge badge-primary">{song.genre}</span>
          <span class="badge badge-accent">{song.tempo_category} tempo</span>
        </div>

        <h1 class="song-title">{song.title}</h1>
        <p class="artist-name text-muted">{song.artist?.name ?? 'Unknown Artist'}</p>

        {#if song.album}
          <p class="album-name text-faint">Album: {song.album.title} ({song.album.release_year})</p>
        {/if}

        <div class="hero-actions">
          <button class="btn btn-primary play-btn-large" on:click={playCurrent}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Play Track
          </button>

          <button class="btn btn-ghost" on:click={copyShareUrl}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            {copied ? 'Link Copied' : 'Share Track'}
          </button>
        </div>
      </div>

      <!-- Large Track DNA Graphic -->
      <div class="dna-showcase">
        <div class="dna-glyph-container">
          <TrackDNA {song} size={120} />
        </div>
        <span class="dna-caption text-faint">Track DNA Signature</span>
      </div>
    </div>

    <!-- Sonic Attributes & DNA Breakdown -->
    <div class="stats-grid">
      <div class="stat-card card">
        <span class="stat-label text-muted">BPM</span>
        <span class="stat-value">{song.bpm}</span>
      </div>
      <div class="stat-card card">
        <span class="stat-label text-muted">Musical Key</span>
        <span class="stat-value">{song.musical_key || 'Standard'}</span>
      </div>
      <div class="stat-card card">
        <span class="stat-label text-muted">Energy Score</span>
        <span class="stat-value">{(song.energy_score * 100).toFixed(0)}%</span>
      </div>
      <div class="stat-card card">
        <span class="stat-label text-muted">Mood Valence</span>
        <span class="stat-value">{(song.mood_score * 100).toFixed(0)}%</span>
      </div>
      <div class="stat-card card">
        <span class="stat-label text-muted">Duration</span>
        <span class="stat-value">{formatTime(song.duration_seconds)}</span>
      </div>
    </div>

    <!-- Actions: Add to Playlist and Context Tags -->
    {#if $isLoggedIn}
      <div class="meta-management-grid">
        <!-- Add to Playlist -->
        <div class="card glass action-box">
          <h3>Add to Playlist</h3>
          {#if userPlaylists.length === 0}
            <p class="text-muted text-sm">You haven't created any playlists yet.</p>
            <a href="/library" class="btn btn-ghost">Create a Playlist</a>
          {:else}
            <div class="add-pl-form">
              <select class="input select-input" bind:value={selectedPlaylistId}>
                <option value={null}>Select a playlist...</option>
                {#each userPlaylists as pl}
                  <option value={pl.id}>{pl.name}</option>
                {/each}
              </select>
              <button class="btn btn-ghost" on:click={addToPlaylist} disabled={!selectedPlaylistId}>
                Add
              </button>
            </div>
            {#if addedToPlaylistMsg}
              <span class="feedback text-success text-xs">{addedToPlaylistMsg}</span>
            {/if}
          {/if}
        </div>

        <!-- Add Context Tag -->
        <div class="card glass action-box">
          <h3>Attach Context Tag</h3>
          <p class="text-muted text-xs">Tags attach personal listening contexts (e.g. #midnight, #deep-focus).</p>
          <form on:submit={handleAddTag} class="tag-form">
            <input
              type="text"
              class="input tag-input"
              placeholder="#tag-name"
              bind:value={newTagName}
            />
            <button type="submit" class="btn btn-ghost" disabled={attachingTag || !newTagName.trim()}>
              Attach
            </button>
          </form>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .song-detail-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 2rem;
  }

  .back-nav {
    margin-bottom: 0.5rem;
  }

  .back-link {
    color: var(--color-primary);
    font-size: var(--text-sm);
    text-decoration: none;
  }

  .song-hero {
    display: grid;
    grid-template-columns: 200px 1fr 160px;
    gap: 2rem;
    padding: 2rem;
    border-radius: var(--radius-xl);
    align-items: center;
  }

  .hero-art {
    width: 200px;
    height: 200px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-surface-raised);
    flex-shrink: 0;
  }

  .hero-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .art-empty {
    width: 100%;
    height: 100%;
  }

  .hero-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .badge-row {
    display: flex;
    gap: 0.5rem;
  }

  .song-title {
    font-size: var(--text-3xl);
    font-weight: 700;
  }

  .artist-name {
    font-size: var(--text-lg);
  }

  .album-name {
    font-size: var(--text-sm);
  }

  .hero-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .play-btn-large {
    padding: 0.75rem 1.5rem;
  }

  .dna-showcase {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .dna-glyph-container {
    padding: 1rem;
    background: var(--color-surface-raised);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .dna-caption {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .stat-label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-value {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text);
  }

  .meta-management-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .action-box {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-box h3 {
    font-size: var(--text-base);
  }

  .add-pl-form, .tag-form {
    display: flex;
    gap: 0.5rem;
  }

  .not-found {
    padding: 3rem 2rem;
    text-align: center;
  }

  .text-success { color: var(--color-success); }
  .text-xs { font-size: 11px; }

  @media (max-width: 800px) {
    .song-hero {
      grid-template-columns: 1fr;
      text-align: center;
    }
    .hero-art {
      margin: 0 auto;
    }
    .hero-actions {
      justify-content: center;
    }
  }
</style>
