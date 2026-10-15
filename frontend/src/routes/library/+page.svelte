<script lang="ts">
  import { onMount } from 'svelte';
  import { playlists as playlistsAPI, tags as tagsAPI } from '$lib/services/api';
  import type { Playlist, ContextTag } from '$lib/types';
  import { isLoggedIn } from '$lib/stores/auth';
  import { player } from '$lib/stores/player';

  let userPlaylists: Playlist[] = [];
  let userTags: ContextTag[] = [];
  let loading = true;
  let showCreateModal = false;
  let newName = '';
  let newDesc = '';
  let isPublic = false;
  let creating = false;
  let activeTab: 'playlists' | 'tags' | 'offline' = 'playlists';
  let copiedId: number | null = null;

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
      const created = await playlistsAPI.create({
        name: newName.trim(),
        description: newDesc.trim(),
        is_public: isPublic
      }) as Playlist;
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
    setTimeout(() => { copiedId = null; }, 2000);
  }

  function playPlaylist(pl: Playlist) {
    if (pl.songs && pl.songs.length > 0) {
      player.playSong(pl.songs[0], pl.songs);
    }
  }
</script>

<svelte:head>
  <title>Library - DIVERGE</title>
  <meta name="description" content="Your personal collection of playlists, context tags, and offline tracks." />
</svelte:head>

<div class="library-page">
  <div class="library-header">
    <div>
      <h1>Library</h1>
      <p class="text-muted">Manage your saved playlists, personal context tags, and offline music.</p>
    </div>

    {#if $isLoggedIn}
      <button class="btn btn-primary" on:click={() => (showCreateModal = true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Playlist
      </button>
    {/if}
  </div>

  {#if !$isLoggedIn}
    <div class="cta-box glass">
      <h2>Your Personal Music Hub</h2>
      <p class="text-muted">Sign in to organize your tracks into playlists and attach personal context tags.</p>
      <div class="cta-btns">
        <a href="/login" class="btn btn-primary">Log in</a>
        <a href="/register" class="btn btn-ghost">Create account</a>
      </div>
    </div>
  {:else}
    <!-- Tab navigation -->
    <div class="tabs-row">
      <button
        class="tab-btn"
        class:active={activeTab === 'playlists'}
        on:click={() => (activeTab = 'playlists')}
      >
        Playlists ({userPlaylists.length})
      </button>
      <button
        class="tab-btn"
        class:active={activeTab === 'tags'}
        on:click={() => (activeTab = 'tags')}
      >
        Context Tags ({userTags.length})
      </button>
      <button
        class="tab-btn"
        class:active={activeTab === 'offline'}
        on:click={() => (activeTab = 'offline')}
      >
        Offline Cache
      </button>
    </div>

    <!-- Playlists Tab -->
    {#if activeTab === 'playlists'}
      {#if loading}
        <div class="playlists-grid">
          {#each Array(4) as _}
            <div class="skeleton" style="height: 200px; border-radius: var(--radius-lg);"></div>
          {/each}
        </div>
      {:else if userPlaylists.length === 0}
        <div class="empty-state glass">
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
      {#if userTags.length === 0}
        <div class="empty-state glass">
          <h3>No context tags created yet</h3>
          <p class="text-muted">Attach personal context tags like #focus, #midnight, or #kinetic to songs as you listen.</p>
        </div>
      {:else}
        <div class="tags-cluster">
          {#each userTags as t (t.id)}
            <div class="tag-card glass">
              <span class="tag-label">#{t.tag_name}</span>
              <span class="tag-target text-muted">{t.song?.title ?? 'Track #' + t.song_id}</span>
            </div>
          {/each}
        </div>
      {/if}
    {/if}

    <!-- Offline Tab -->
    {#if activeTab === 'offline'}
      <div class="empty-state glass">
        <h3>Offline Cache</h3>
        <p class="text-muted">Cached tracks in browser IndexedDB can be played anytime without network connectivity.</p>
        <span class="badge badge-primary">Storage Ready</span>
      </div>
    {/if}
  {/if}
</div>

<!-- Create Playlist Modal -->
{#if showCreateModal}
  <div class="modal-backdrop" on:click={() => (showCreateModal = false)}>
    <div class="modal card glass" on:click|stopPropagation>
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
    padding-bottom: 2rem;
  }

  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .cta-box {
    padding: 3rem 2rem;
    border-radius: var(--radius-lg);
    text-align: center;
    max-width: 520px;
    margin: 2rem auto;
  }

  .cta-btns {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .tabs-row {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
  }

  .tab-btn {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 500;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--t-fast) ease;
  }

  .tab-btn:hover {
    color: var(--color-text);
  }

  .tab-btn.active {
    background: var(--color-surface-raised);
    color: var(--color-primary);
  }

  .playlists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .playlist-card {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .card-cover {
    position: relative;
    aspect-ratio: 1;
    background: var(--color-surface-raised);
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
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: var(--color-bg);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: transform var(--t-fast) ease;
  }

  .play-playlist-btn:hover {
    transform: scale(1.06);
  }

  .card-details {
    padding: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .playlist-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  .playlist-count {
    font-size: var(--text-xs);
  }

  .playlist-desc {
    font-size: var(--text-xs);
    margin-top: 0.25rem;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 0.5rem;
  }

  .tags-cluster {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
  }

  .tag-card {
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tag-label {
    font-weight: 600;
    color: var(--color-accent);
    font-size: var(--text-sm);
  }

  .tag-target {
    font-size: var(--text-xs);
  }

  .empty-state {
    padding: 3rem 2rem;
    border-radius: var(--radius-lg);
    text-align: center;
    max-width: 500px;
    margin: 2rem auto;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }

  .modal {
    width: 100%;
    max-width: 440px;
    padding: 1.5rem;
  }

  .modal h2 {
    font-size: var(--text-xl);
    margin-bottom: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }

  .form-group label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    font-size: var(--text-sm);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
</style>
