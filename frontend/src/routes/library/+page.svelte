<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { playlists as playlistsAPI, tags as tagsAPI } from '$lib/services/api';
  import type { Playlist, ContextTag } from '$lib/types';
  import { isLoggedIn } from '$lib/stores/auth';
  import { player } from '$lib/stores/player';
  import { likedSongs } from '$lib/stores/liked';
  import SongCard from '$lib/components/cards/SongCard.svelte';

  let userPlaylists: Playlist[] = [];
  let userTags: ContextTag[] = [];
  let loading = true;
  let showCreateModal = false;
  let newName = '';
  let newDesc = '';
  let isPublic = false;
  let creating = false;
  let activeTab: 'liked' | 'playlists' | 'tags' | 'offline' = 'liked';
  let copiedId: number | null = null;

  $: paramTab = $page.url.searchParams.get('tab');
  $: if (
    paramTab === 'liked' ||
    paramTab === 'playlists' ||
    paramTab === 'tags' ||
    paramTab === 'offline'
  ) {
    activeTab = paramTab;
  }

  onMount(async () => {
    if (!$isLoggedIn) {
      loading = false;
      return;
    }

    try {
      const [plistRes, tagsRes] = await Promise.all([
        playlistsAPI.list() as Promise<Playlist[]>,
        tagsAPI.list() as Promise<ContextTag[]>
      ]);
      userPlaylists = plistRes || [];
      userTags = tagsRes || [];
    } catch (err) {
      console.error('Failed to load library', err);
    } finally {
      loading = false;
    }
  });

  async function handleCreatePlaylist(e: Event) {
    e.preventDefault();
    if (!newName.trim()) return;

    creating = true;
    try {
      const created = (await playlistsAPI.create({
        name: newName.trim(),
        description: newDesc.trim(),
        is_public: isPublic
      })) as Playlist;
      userPlaylists = [created, ...userPlaylists];
      newName = '';
      newDesc = '';
      isPublic = false;
      showCreateModal = false;
    } catch (err) {
      console.error('Failed to create playlist', err);
    } finally {
      creating = false;
    }
  }

  function copyShareLink(pl: Playlist) {
    const url = `${window.location.origin}/playlist/share/${pl.share_token}`;
    navigator.clipboard.writeText(url);
    copiedId = pl.id;
    setTimeout(() => {
      copiedId = null;
    }, 2000);
  }

  function playPlaylist(pl: Playlist) {
    if (pl.songs && pl.songs.length > 0) {
      player.playSong(pl.songs[0], pl.songs);
    }
  }
</script>

<svelte:head>
  <title>Library - DIVERGE</title>
  <meta name="description" content="Your personal collection of liked songs, playlists, and offline tracks." />
</svelte:head>

<div class="library-page">
  <div class="library-header">
    <div>
      <h1>Library</h1>
      <p class="text-muted">Manage your liked songs, custom playlists, and offline collection.</p>
    </div>

    {#if $isLoggedIn && activeTab === 'playlists'}
      <button class="btn btn-primary" on:click={() => (showCreateModal = true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Playlist
      </button>
    {/if}
  </div>

  <!-- Tab navigation -->
  <div class="tabs-row">
    <button
      class="tab-btn"
      class:active={activeTab === 'liked'}
      on:click={() => (activeTab = 'liked')}
    >
      <svg viewBox="0 0 24 24" fill={activeTab === 'liked' ? '#FF5C58' : 'none'} stroke={activeTab === 'liked' ? '#FF5C58' : 'currentColor'} stroke-width="2" width="15" height="15">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span>Liked Songs ({$likedSongs.length})</span>
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'playlists'}
      on:click={() => (activeTab = 'playlists')}
    >
      <span>Playlists ({userPlaylists.length})</span>
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'tags'}
      on:click={() => (activeTab = 'tags')}
    >
      <span>Context Tags ({userTags.length})</span>
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'offline'}
      on:click={() => (activeTab = 'offline')}
    >
      <span>Offline Cache</span>
    </button>
  </div>

  <!-- Liked Songs Tab -->
  {#if activeTab === 'liked'}
    <div class="liked-hero-card">
      <div class="liked-hero-badge">
        <svg viewBox="0 0 24 24" fill="#FF5C58" stroke="#FF5C58" stroke-width="2" width="36" height="36">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>
      <div class="liked-hero-details">
        <span class="liked-hero-label">Personal Collection</span>
        <h2 class="liked-hero-title">Liked Songs</h2>
        <p class="liked-hero-sub text-muted">
          {$likedSongs.length} {$likedSongs.length === 1 ? 'track' : 'tracks'} • Saved to your library
        </p>
      </div>
      <div class="liked-hero-actions">
        <button
          class="btn btn-primary play-liked-btn"
          disabled={$likedSongs.length === 0}
          on:click={() => likedSongs.playLikedSongs()}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Play Liked Songs
        </button>
        {#if $likedSongs.length > 0}
          <button class="btn btn-ghost" on:click={() => likedSongs.clearLiked()}>
            Clear
          </button>
        {/if}
      </div>
    </div>

    {#if $likedSongs.length === 0}
      <div class="empty-state card">
        <div class="empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h3>No liked songs yet</h3>
        <p class="text-muted">Tap the heart icon on any song while listening or searching to save your favorites here.</p>
        <a href="/search" class="btn btn-primary" style="margin-top: 0.5rem;">Explore Music</a>
      </div>
    {:else}
      <div class="liked-songs-list" role="list">
        {#each $likedSongs as song (song.id)}
          <SongCard {song} queue={$likedSongs} compact={true} />
        {/each}
      </div>
    {/if}
  {/if}

  <!-- Playlists Tab -->
  {#if activeTab === 'playlists'}
    {#if !$isLoggedIn}
      <div class="cta-box card">
        <h2>Save Playlists to the Cloud</h2>
        <p class="text-muted">Sign in to organize your tracks into custom cloud playlists and share them with friends.</p>
        <div class="cta-btns">
          <a href="/login" class="btn btn-primary">Log in</a>
          <a href="/register" class="btn btn-ghost">Create account</a>
        </div>
      </div>
    {:else if loading}
      <div class="playlists-grid">
        {#each Array(4) as _}
          <div class="skeleton" style="height: 200px; border-radius: var(--radius-lg);"></div>
        {/each}
      </div>
    {:else if userPlaylists.length === 0}
      <div class="empty-state card">
        <h3>No playlists yet</h3>
        <p class="text-muted">Create your first playlist to begin curating your journey.</p>
        <button class="btn btn-primary" on:click={() => (showCreateModal = true)}>Create Playlist</button>
      </div>
    {:else}
      <div class="playlists-grid" role="list">
        {#each userPlaylists as pl (pl.id)}
          <div class="playlist-card card" role="listitem">
            <div class="card-cover">
              {#if pl.cover_url}
                <img src={pl.cover_url} alt="" />
              {:else}
                <div class="cover-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
              {/if}

              {#if pl.songs && pl.songs.length > 0}
                <button
                  class="play-playlist-btn"
                  on:click={() => playPlaylist(pl)}
                  title="Play playlist"
                  aria-label="Play playlist {pl.name}"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>
              {/if}
            </div>

            <div class="card-details">
              <a href="/playlist/{pl.id}" class="playlist-title text-ellipsis">{pl.name}</a>
              <span class="playlist-count text-muted">
                {pl.songs ? pl.songs.length : 0} {pl.songs?.length === 1 ? 'track' : 'tracks'}
              </span>
              {#if pl.description}
                <p class="playlist-desc text-muted text-ellipsis">{pl.description}</p>
              {/if}

              <div class="card-footer">
                <button
                  class="btn btn-icon"
                  on:click={() => copyShareLink(pl)}
                  title="Copy share link"
                  aria-label="Copy share link"
                >
                  {#if copiedId === pl.id}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color: var(--color-success);">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  {:else}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  {/if}
                </button>
                <a href="/playlist/{pl.id}" class="btn btn-ghost" style="padding: 0.35rem 0.75rem; font-size: var(--text-xs);">Open</a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- Tags Tab -->
  {#if activeTab === 'tags'}
    {#if !$isLoggedIn}
      <div class="cta-box card">
        <h2>Context Tags</h2>
        <p class="text-muted">Sign in to tag songs with emotional and environmental contexts (#midnight, #focus, #driving).</p>
        <div class="cta-btns">
          <a href="/login" class="btn btn-primary">Log in</a>
        </div>
      </div>
    {:else if userTags.length === 0}
      <div class="empty-state card">
        <h3>No context tags created yet</h3>
        <p class="text-muted">Attach personal context tags like #focus, #midnight, or #kinetic to songs as you listen.</p>
      </div>
    {:else}
      <div class="tags-cluster">
        {#each userTags as t (t.id)}
          <div class="tag-card card">
            <span class="tag-label">#{t.tag_name}</span>
            <span class="tag-target text-muted">{t.song?.title ?? 'Track #' + t.song_id}</span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- Offline Tab -->
  {#if activeTab === 'offline'}
    <div class="empty-state card">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </div>
      <h3>Browser Offline Cache</h3>
      <p class="text-muted">Cached audio tracks in browser IndexedDB can be played anytime without network connectivity.</p>
      <span class="badge badge-primary" style="margin-top: 0.5rem;">IndexedDB Ready</span>
    </div>
  {/if}
</div>

<!-- Create Playlist Modal -->
{#if showCreateModal}
  <div
    class="modal-backdrop"
    role="button"
    tabindex="0"
    on:click={() => (showCreateModal = false)}
    on:keydown={(e) => e.key === 'Escape' && (showCreateModal = false)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="modal card" role="dialog" aria-modal="true" tabindex="-1" on:click|stopPropagation>
      <h2>New Playlist</h2>
      <form on:submit={handleCreatePlaylist}>
        <div class="form-group">
          <label for="pl-name">Name</label>
          <input
            id="pl-name"
            class="input"
            type="text"
            required
            placeholder="e.g. Nocturne Explorations"
            bind:value={newName}
          />
        </div>

        <div class="form-group">
          <label for="pl-desc">Description (optional)</label>
          <input
            id="pl-desc"
            class="input"
            type="text"
            placeholder="e.g. Atmospheric tracks for night study"
            bind:value={newDesc}
          />
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="pl-public" bind:checked={isPublic} />
          <label for="pl-public">Make playlist publicly shareable</label>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" on:click={() => (showCreateModal = false)}>Cancel</button>
          <button type="submit" class="btn btn-primary" disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .library-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 2.5rem;
  }

  .library-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .tabs-row {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
    overflow-x: auto;
  }

  .tab-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 500;
    padding: 0.5rem 0.85rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all var(--t-fast) ease;
    white-space: nowrap;
  }
  .tab-btn:hover {
    color: var(--color-text);
    background: var(--color-surface-raised);
  }
  .tab-btn.active {
    color: #FFFFFF;
    background: var(--color-surface-raised);
    font-weight: 600;
  }

  /* Liked Songs Hero Card */
  .liked-hero-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(120, 75, 255, 0.18), rgba(255, 92, 88, 0.18));
    border: 1px solid rgba(255, 92, 88, 0.25);
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    flex-wrap: wrap;
  }

  .liked-hero-badge {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, #784BFF, #FF5C58);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(255, 92, 88, 0.35);
    flex-shrink: 0;
  }
  .liked-hero-badge svg {
    color: #FFFFFF;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .liked-hero-details {
    flex: 1;
    min-width: 200px;
  }

  .liked-hero-label {
    font-size: var(--text-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #FF5C58;
  }

  .liked-hero-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: #FFFFFF;
    margin: 0.15rem 0 0.3rem 0;
  }

  .liked-hero-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .play-liked-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.7rem 1.4rem;
    font-weight: 600;
  }

  .liked-songs-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .playlists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
  }

  .playlist-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .card-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: var(--color-surface-raised);
    overflow: hidden;
  }
  .card-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-faint);
  }

  .play-playlist-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 42px;
    height: 42px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: #FFFFFF;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: transform var(--t-fast) ease;
  }
  .play-playlist-btn:hover {
    transform: scale(1.08);
  }

  .card-details {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .playlist-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text);
  }
  .playlist-count {
    font-size: var(--text-xs);
  }
  .playlist-desc {
    font-size: var(--text-xs);
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-subtle);
  }

  .tags-cluster {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .tag-card {
    padding: 0.6rem 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tag-label {
    font-weight: 600;
    color: var(--color-primary);
  }

  .empty-state {
    padding: 3rem 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
  }
  .empty-icon {
    color: var(--color-text-faint);
  }

  .cta-box {
    padding: 2.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
  }
  .cta-btns {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
  }
  .modal {
    width: 100%;
    max-width: 440px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 0.85rem;
  }
  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
</style>
