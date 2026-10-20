<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { isLoggedIn, currentUser, authStore } from '$lib/stores/auth';
  import { playlists as playlistsAPI, history } from '$lib/services/api';
  import type { Playlist } from '$lib/types';

  let userPlaylists: Playlist[] = [];
  let historyCount = 0;
  let loading = true;

  onMount(async () => {
    if (!$isLoggedIn) {
      goto('/login');
      return;
    }

    try {
      const [plist, hist] = await Promise.all([
        playlistsAPI.list().catch(() => []),
        history.trace().catch(() => ({ nodes: [] }))
      ]);
      userPlaylists = plist as Playlist[];
      historyCount = hist?.nodes ? hist.nodes.length : 0;
    } catch {
      // Graceful fallback
    } finally {
      loading = false;
    }
  });

  async function handleLogout() {
    await authStore.logout();
    goto('/login');
  }
</script>

<svelte:head>
  <title>User Profile — DIVERGE</title>
  <meta name="description" content="View your account details and listening statistics on DIVERGE." />
</svelte:head>

<div class="profile-container">
  {#if $currentUser}
    <div class="profile-card glass">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-ring">
          <div class="profile-avatar">
            {$currentUser.username ? $currentUser.username[0].toUpperCase() : 'U'}
          </div>
        </div>
        <div class="profile-meta">
          <div class="badge-row">
            <span class="badge badge-accent">Verified Listener</span>
            <span class="badge badge-primary">Tech Vedhu Track</span>
          </div>
          <h1 class="profile-username">{$currentUser.username}</h1>
          <p class="profile-email text-muted">{$currentUser.email}</p>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-num">{userPlaylists.length}</span>
          <span class="stat-label text-muted">Saved Playlists</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{historyCount}</span>
          <span class="stat-label text-muted">Listening Traces</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">Full Audio</span>
          <span class="stat-label text-muted">Stream Quality</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Action Buttons -->
      <div class="profile-actions">
        <a href="/library" class="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Go to Library
        </a>
        <a href="/search" class="btn btn-ghost">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Discover Songs
        </a>
        <button class="btn btn-danger" on:click={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>
      </div>
    </div>
  {:else}
    <div class="profile-card glass" style="text-align: center; padding: 3rem;">
      <p class="text-muted">Loading account profile...</p>
    </div>
  {/if}
</div>

<style>
  .profile-container {
    max-width: 720px;
    margin: 2.5rem auto;
    padding: 0 1.5rem;
  }

  .profile-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: 2.5rem;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 1.75rem;
  }

  .avatar-ring {
    padding: 4px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    box-shadow: 0 4px 20px rgba(177, 154, 255, 0.35);
  }

  .profile-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--color-surface-raised);
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
  }

  .profile-meta {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .badge-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .profile-username {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--color-text);
    margin: 0;
  }

  .profile-email {
    font-size: 0.95rem;
    margin: 0;
  }

  .divider {
    height: 1px;
    background: var(--color-border-subtle);
    margin: 1.75rem 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-card {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-num {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .stat-label {
    font-size: 0.85rem;
  }

  .profile-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .btn-danger {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    margin-left: auto;
  }

  .btn-danger:hover {
    background: rgba(239, 68, 68, 0.28);
    color: #ffffff;
  }
</style>
