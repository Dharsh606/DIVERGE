<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { isLoggedIn, currentUser, authStore } from '$lib/stores/auth';
  import { guestStore } from '$lib/stores/guest';
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
    guestStore.disableGuest();
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
    <div class="profile-card">
      <div class="card-accent-bar" aria-hidden="true"></div>

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
            <span class="badge badge-primary">Curator</span>
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
          <span class="stat-num">Lossless</span>
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
    <div class="profile-card" style="text-align: center; padding: 3rem;">
      <p class="text-muted">Loading account profile...</p>
    </div>
  {/if}
</div>

<style>
  .profile-container {
    max-width: 680px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .profile-card {
    position: relative;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 2.25rem;
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  .card-accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-brand-gradient);
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .avatar-ring {
    padding: 3px;
    border-radius: 50%;
    background: var(--color-brand-gradient);
    box-shadow: 0 2px 12px rgba(120, 75, 255, 0.3);
  }

  .profile-avatar {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: var(--color-surface-raised);
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
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
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .profile-email {
    font-size: 0.9rem;
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
    border-radius: var(--radius-sm);
    padding: 1.25rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-num {
    font-size: 1.4rem;
    font-weight: 700;
    color: #C4AEFF;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .profile-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .btn-danger {
    background: rgba(239, 68, 68, 0.12);
    color: #F87171;
    border: 1px solid rgba(239, 68, 68, 0.25);
    margin-left: auto;
  }

  .btn-danger:hover {
    background: rgba(239, 68, 68, 0.22);
    color: #FFFFFF;
  }

  @media (max-width: 600px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
    .profile-actions {
      flex-direction: column;
      align-items: stretch;
    }
    .btn-danger {
      margin-left: 0;
    }
  }
</style>
