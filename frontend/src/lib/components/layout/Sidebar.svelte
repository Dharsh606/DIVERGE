<script lang="ts">
  import { page } from '$app/state';
  import { isLoggedIn, currentUser } from '$lib/stores/auth';
  import { player } from '$lib/stores/player';

  export let open = false;

  const navItems = [
    { href: '/',        icon: 'home',    label: 'Home' },
    { href: '/library', icon: 'library', label: 'Library' },
    { href: '/library?tab=liked', icon: 'heart', label: 'Liked Songs' },
    { href: '/trace',   icon: 'trace',   label: 'Trace' },
    { href: '/sessions',icon: 'session', label: 'Sessions' },
  ];
</script>

<nav
  class="sidebar"
  class:open
  aria-label="Main navigation"
>
  <!-- Logo area -->
  <div class="sidebar-header">
    <button
      class="logo-btn"
      on:click={() => (open = !open)}
      aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-expanded={open}
    >
      <!-- DIVERGE Official 3D Logo Mark -->
      <img src="/logo-mark.png" alt="DIVERGE" class="logo-mark" />
      {#if open}
        <span class="logo-wordmark">DIVERGE</span>
      {/if}
    </button>
  </div>

  <!-- Nav links -->
  <ul class="nav-list" role="list">
    {#each navItems as item}
      {@const currentPath = page.url.pathname}
      {@const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))}
      <li>
        <a
          href={item.href}
          class="nav-item"
          class:active={isActive}
          aria-label={item.label}
          aria-current={isActive ? 'page' : undefined}
          data-tooltip={!open ? item.label : undefined}
        >
          <span class="nav-icon" aria-hidden="true">
            {#if item.icon === 'home'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {:else if item.icon === 'search'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            {:else if item.icon === 'library'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            {:else if item.icon === 'heart'}
              <svg viewBox="0 0 24 24" fill="#FF5C58" stroke="#FF5C58" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {:else if item.icon === 'trace'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
            {:else if item.icon === 'session'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {/if}
          </span>
          {#if open}
            <span class="nav-label">{item.label}</span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>

  <!-- Bottom section with user profile link or sign-in link -->
  <div class="sidebar-footer">
    {#if $isLoggedIn && $currentUser}
      <a href="/profile" class="user-chip" class:open>
        {#if $currentUser.avatar_url}
          <img src={$currentUser.avatar_url} alt={$currentUser.username} class="avatar avatar-sm" />
        {:else}
          <div class="avatar avatar-sm avatar-placeholder">
            {$currentUser.username.charAt(0).toUpperCase()}
          </div>
        {/if}
        {#if open}
          <div class="user-meta text-ellipsis">
            <span class="username text-ellipsis">{$currentUser.username}</span>
            <span class="user-sub text-muted text-xs">Profile</span>
          </div>
        {/if}
      </a>
    {:else}
      <a href="/login" class="login-cta-btn" class:open>
        <span class="avatar avatar-sm avatar-placeholder">?</span>
        {#if open}
          <span class="text-sm">Sign in</span>
        {/if}
      </a>
    {/if}
  </div>
</nav>

<style>
  .sidebar {
    width: var(--sidebar-collapsed);
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: width var(--t-normal) var(--ease-out-expo);
    overflow: hidden;
    position: relative;
    z-index: 20;
    user-select: none;
    box-shadow: 2px 0 16px rgba(0, 0, 0, 0.4);
  }

  .sidebar.open {
    width: var(--sidebar-width);
  }

  /* ── Header / Logo ──────────────────────────────────────────────────────── */
  .sidebar-header {
    padding: 1.15rem 0.85rem;
    display: flex;
    align-items: center;
  }

  .logo-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--color-text);
    width: 100%;
    text-align: left;
    outline: none;
  }

  .logo-mark {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 8px rgba(120, 75, 255, 0.35));
    transition: transform var(--t-normal) var(--ease-out-expo);
  }

  .logo-btn:hover .logo-mark {
    transform: scale(1.08) rotate(-4deg);
  }

  .logo-wordmark {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    background: linear-gradient(135deg, #FFFFFF 0%, #C4AEFF 55%, #FFA39E 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    white-space: nowrap;
  }

  /* ── Navigation List ────────────────────────────────────────────────────── */
  .nav-list {
    list-style: none;
    padding: 0.5rem 0.65rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.65rem 0.75rem;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    transition: color var(--t-fast), background var(--t-fast);
    position: relative;
    white-space: nowrap;
    outline: none;
  }

  .nav-item:hover {
    color: var(--color-text);
    background: var(--color-surface-raised);
  }

  .nav-item.active {
    color: var(--color-text);
    background: var(--color-primary-dim);
    box-shadow: inset 0 0 0 1px var(--color-primary-glow);
  }

  .nav-item.active .nav-icon {
    color: var(--color-primary);
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .nav-icon svg {
    width: 19px;
    height: 19px;
  }

  .nav-label {
    font-size: var(--text-sm);
    font-weight: 500;
  }

  /* ── Footer ─────────────────────────────────────────────────────────────── */
  .sidebar-footer {
    padding: 0.85rem 0.65rem;
    border-top: 1px solid var(--color-border);
  }

  .user-chip, .login-cta-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.45rem;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: background var(--t-fast);
    overflow: hidden;
  }

  .user-chip:hover, .login-cta-btn:hover {
    background: var(--color-surface-raised);
    color: var(--color-text);
  }

  .avatar {
    width: 30px;
    height: 30px;
    border-radius: var(--radius-full);
    object-fit: cover;
    flex-shrink: 0;
  }

  .avatar-placeholder {
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .user-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .username {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }
</style>
