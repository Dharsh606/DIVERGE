<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { playlists as playlistsAPI } from '$lib/services/api';
  import type { Playlist, Song } from '$lib/types';
  import { player, formatTime } from '$lib/stores/player';
  import SongCard from '$lib/components/cards/SongCard.svelte';
  import { currentUser } from '$lib/stores/auth';

  let playlist: Playlist | null = null;
  let loading = true;
  let copied = false;

  $: playlistId = Number(page.params.id);
  $: isOwner = $currentUser && playlist && $currentUser.id === playlist.user_id;

  onMount(async () => {
    try {
      playlist = await playlistsAPI.get(playlistId) as Playlist;
    } catch (err) {
      console.error('Failed to load playlist', err);
    } finally {
      loading = false;
    }
  });

  function playAll() {
    if (playlist?.songs && playlist.songs.length > 0) {
      player.playSong(playlist.songs[0], playlist.songs);
    }
  }

  async function removeSong(songId: number) {
    if (!playlist) return;
    try {
      await playlistsAPI.removeSong(playlist.id, songId);
      playlist.songs = playlist.songs?.filter(s => s.id !== songId);
    } catch (err) {
      console.error('Failed to remove song', err);
    }
  }

  function copyShare() {
    if (!playlist) return;
    const url = `${window.location.origin}/playlist/share/${playlist.share_token}`;
    navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }
</script>

<svelte:head>
  {#if playlist}
    <title>{playlist.name} - Playlist - DIVERGE</title>
  {:else}
    <title>Playlist - DIVERGE</title>
  {/if}
</svelte:head>

<div class="playlist-page">
  <div class="back-nav">
    <a href="/library" class="back-link">&larr; Back to Library</a>
  </div>

  {#if loading}
    <div class="skeleton" style="height: 250px; border-radius: var(--radius-xl);"></div>
  {:else if !playlist}
    <div class="card glass not-found">
      <h2>Playlist Not Found</h2>
      <p class="text-muted">This playlist does not exist or has been removed.</p>
      <a href="/library" class="btn btn-primary">Return to Library</a>
    </div>
  {:else}
    <!-- Playlist Header -->
    <div class="pl-header glass">
      <div class="pl-cover">
        {#if playlist.cover_url}
          <img src={playlist.cover_url} alt="" />
        {:else}
          <div class="cover-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        {/if}
      </div>

      <div class="pl-info">
        <span class="badge badge-primary">{playlist.is_public ? 'Public Playlist' : 'Private Playlist'}</span>
        <h1>{playlist.name}</h1>
        {#if playlist.description}
          <p class="text-muted">{playlist.description}</p>
        {/if}
        <span class="pl-meta text-faint">
          Curated by {playlist.user?.username ?? 'Listener'} &bull; {playlist.songs?.length ?? 0} tracks
        </span>

        <div class="pl-actions">
          {#if playlist.songs && playlist.songs.length > 0}
            <button class="btn btn-primary" on:click={playAll}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Play Playlist
            </button>
          {/if}

          <button class="btn btn-ghost" on:click={copyShare}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            {copied ? 'Share Link Copied' : 'Share Playlist'}
          </button>
        </div>
      </div>
    </div>

    <!-- Song List -->
    <div class="pl-tracks-section">
      {#if !playlist.songs || playlist.songs.length === 0}
        <div class="empty-pl glass">
          <h3>No tracks in this playlist</h3>
          <p class="text-muted">Browse the music catalog and add tracks to build your journey.</p>
          <a href="/search" class="btn btn-ghost">Browse Songs</a>
        </div>
      {:else}
        <div class="tracks-list" role="list">
          {#each playlist.songs as song, i (song.id)}
            <div class="track-row-wrap" role="listitem">
              <div class="track-index text-faint">{i + 1}</div>
              <div class="track-card-wrap">
                <SongCard {song} queue={playlist.songs} compact />
              </div>
              {#if isOwner}
                <button
                  class="btn btn-icon remove-btn"
                  on:click={() => removeSong(song.id)}
                  title="Remove from playlist"
                  aria-label="Remove track"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .playlist-page {
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

  .pl-header {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 2rem;
    padding: 2rem;
    border-radius: var(--radius-xl);
    align-items: center;
  }

  .pl-cover {
    width: 180px;
    height: 180px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-surface-raised);
    flex-shrink: 0;
  }

  .pl-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-faint);
  }

  .pl-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pl-info h1 {
    font-size: var(--text-3xl);
    font-weight: 700;
  }

  .pl-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .tracks-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .track-row-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .track-index {
    width: 24px;
    text-align: right;
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }

  .track-card-wrap {
    flex: 1;
    min-width: 0;
  }

  .remove-btn {
    opacity: 0.4;
    transition: opacity var(--t-fast) ease;
  }

  .track-row-wrap:hover .remove-btn {
    opacity: 1;
  }

  .empty-pl, .not-found {
    padding: 3rem 2rem;
    text-align: center;
    border-radius: var(--radius-lg);
  }

  @media (max-width: 650px) {
    .pl-header {
      grid-template-columns: 1fr;
      text-align: center;
    }
    .pl-cover {
      margin: 0 auto;
    }
    .pl-actions {
      justify-content: center;
    }
  }
</style>
