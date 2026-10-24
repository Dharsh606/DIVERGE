<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { playlists as playlistsAPI } from '$lib/services/api';
  import type { Playlist } from '$lib/types';
  import { player } from '$lib/stores/player';
  import SongCard from '$lib/components/cards/SongCard.svelte';

  let playlist: Playlist | null = null;
  let loading = true;
  let errorMsg = '';

  $: token = $page.params.token || '';

  onMount(async () => {
    try {
      playlist = await playlistsAPI.getByShareToken(token) as Playlist;
    } catch (err: any) {
      errorMsg = err.message || 'Shared playlist could not be loaded.';
    } finally {
      loading = false;
    }
  });

  function playAll() {
    if (playlist?.songs && playlist.songs.length > 0) {
      player.playSong(playlist.songs[0], playlist.songs);
    }
  }
</script>

<svelte:head>
  {#if playlist}
    <title>{playlist.name} - Shared Playlist - DIVERGE</title>
  {:else}
    <title>Shared Playlist - DIVERGE</title>
  {/if}
</svelte:head>

<div class="share-page">
  <div class="back-nav">
    <a href="/" class="back-link">&larr; Back to DIVERGE</a>
  </div>

  {#if loading}
    <div class="skeleton" style="height: 250px; border-radius: var(--radius-xl);"></div>
  {:else if errorMsg || !playlist}
    <div class="card not-found">
      <h2>Playlist Not Found</h2>
      <p class="text-muted">{errorMsg || 'This shared playlist does not exist or has been made private.'}</p>
      <a href="/" class="btn btn-primary">Go to DIVERGE Home</a>
    </div>
  {:else}
    <!-- Shared Playlist Banner -->
    <div class="share-banner card">
      <div class="banner-badge">
        <span class="badge badge-accent">Shared Collection</span>
      </div>

      <div class="pl-content">
        <h1>{playlist.name}</h1>
        {#if playlist.description}
          <p class="text-muted">{playlist.description}</p>
        {/if}
        <span class="text-faint">{playlist.songs?.length ?? 0} tracks shared with you</span>

        <div class="banner-actions">
          {#if playlist.songs && playlist.songs.length > 0}
            <button class="btn btn-primary" on:click={playAll}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Play Entire Playlist
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Song List -->
    <div class="tracks-list" role="list">
      {#each playlist.songs || [] as song (song.id)}
        <div role="listitem">
          <SongCard {song} queue={playlist.songs} compact />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .share-page {
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

  .share-banner {
    padding: 2rem;
    border-radius: var(--radius-xl);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .share-banner h1 {
    font-size: var(--text-3xl);
    font-weight: 700;
  }

  .banner-actions {
    margin-top: 1rem;
    display: flex;
    gap: 0.75rem;
  }

  .tracks-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .not-found {
    padding: 3rem 2rem;
    text-align: center;
    border-radius: var(--radius-lg);
  }
</style>
