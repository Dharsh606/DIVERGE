<script lang="ts">
  import { page } from '$app/state';
  import { isLoggedIn, currentUser } from '$lib/stores/auth';
  import { player } from '$lib/stores/player';

  export let open = false;

  const navItems = [
    { href: '/',        icon: 'home',    label: 'Home' },
    { href: '/library', icon: 'library', label: 'Library' },
    { href: '/trace',   icon: 'trace',   label: 'Trace' },
    { href: '/sessions',icon: 'session', label: 'Sessions' },
  ];

  $: currentPath = page.url.pathname;
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
            {:else if item.icon === 'trace'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 L12 12 M12 12 L6 18 M12 12 L18 18"/><circle cx="12" cy="2" r="1.5"/><circle cx="6" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>
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

  <!-- Bottom: user / login -->
  <div class="sidebar-footer">
    {#if $isLoggedIn && $currentUser}
      <a href="/profile" class="user-chip" class:compact={!open} data-tooltip={!open ? $currentUser.username : undefined}>
        <div class="user-avatar">
          {$currentUser.username[0].toUpperCase()}
        </div>
        {#if open}
          <span class="user-name">{$currentUser.username}</span>
        {/if}
      </a>
    {:else}
      <a href="/login" class="btn btn-ghost login-btn" class:compact={!open} data-tooltip={!open ? 'Log in' : undefined}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        {#if open}<span>Log in</span>{/if}
      </a>
    {/if}
  </div>
</nav>

<style>
  .sidebar {
    grid-row: 1;
    grid-column: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    overflow: hidden;
    transition: width var(--t-normal) var(--ease-out-expo);
    z-index: 10;
  }

  .sidebar-header {
    padding: 0 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border-subtle);
    margin-bottom: 0.5rem;
  }

  .logo-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: var(--radius-sm);
    width: 100%;
    transition: background var(--t-fast) ease;
  }
  .logo-btn:hover { background: var(--color-surface-raised); }

  .logo-mark {
    width: 28px;
    height: 28px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .logo-wordmark {
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: var(--color-text);
    white-space: nowrap;
  }

  .nav-list {
    list-style: none;
    flex: 1;
    padding: 0 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow-y: auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.5rem 0.65rem;
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 500;
    transition:
      background var(--t-fast) ease,
      color var(--t-fast) ease,
      border-color var(--t-fast) ease;
    text-decoration: none;
    white-space: nowrap;
    border: 1px solid transparent;
  }
  .nav-item:hover {
    background: var(--color-surface-raised);
    color: var(--color-text);
    border-color: var(--color-border-subtle);
  }
  .nav-item.active {
    background: var(--color-primary-dim);
    color: #FFFFFF;
    font-weight: 600;
    border-color: rgba(120, 75, 255, 0.25);
  }
  .nav-item.active .nav-icon svg {
    stroke: var(--color-primary);
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .nav-icon svg {
    width: 20px;
    height: 20px;
  }

  .nav-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .sidebar-footer {
    padding: 0.75rem 0.75rem 0;
    border-top: 1px solid var(--color-border-subtle);
    margin-top: auto;
  }

  .user-chip {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: var(--radius-sm);
    text-decoration: none;
    transition: background var(--t-fast) ease;
    color: var(--color-text-muted);
    border: 1px solid transparent;
  }
  .user-chip:hover {
    background: var(--color-surface-raised);
    border-color: var(--color-border-subtle);
  }
  .user-chip.compact { justify-content: center; }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: #FFFFFF;
    font-weight: 700;
    font-size: var(--text-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .user-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .login-btn {
    width: 100%;
    justify-content: center;
  }
  .login-btn.compact {
    padding: 0.5rem;
    width: auto;
  }
</style>
