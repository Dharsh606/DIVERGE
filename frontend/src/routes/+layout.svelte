<script lang="ts">
  import '../app.css';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/state';
  import { authStore, isLoggedIn } from '$lib/stores/auth';
  import { guestStore } from '$lib/stores/guest';
  import { player, isPlaying } from '$lib/stores/player';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import TopHeader from '$lib/components/layout/TopHeader.svelte';
  import MusicPlayer from '$lib/components/player/MusicPlayer.svelte';
  import SlicedWaves from '$lib/components/background/SlicedWaves.svelte';

  let sidebarOpen = false;

  function isAuthPath(pathname: string): boolean {
    return pathname.startsWith('/login') ||
           pathname.startsWith('/register') ||
           pathname.startsWith('/signup') ||
           pathname.startsWith('/auth');
  }

  // 10 minutes inactivity auto-logout (600,000 ms)
  const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
  let inactivityTimer: any = null;

  function resetInactivityTimer() {
    if (!browser) return;
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      // If a track is actively playing, keep session alive
      if ($isPlaying) {
        resetInactivityTimer();
      } else if ($isLoggedIn || $guestStore) {
        performAutoLogout();
      }
    }, INACTIVITY_LIMIT_MS);
  }

  async function performAutoLogout() {
    try {
      player.pause();
      guestStore.disableGuest();
      await authStore.logout();
      goto('/login');
    } catch (e) {
      console.warn('Auto logout error:', e);
    }
  }

  function handleUserActivity() {
    resetInactivityTimer();
  }

  onMount(async () => {
    await authStore.init();

    // Register Service Worker for PWA install & offline caching (ensure cache is updated)
    if (browser && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => reg.update())
        .catch(() => {});
    }

    // Attach user activity listeners
    if (browser) {
      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
      events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
      resetInactivityTimer();
    }
  });

  onDestroy(() => {
    if (browser) {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    }
  });
</script>

<svelte:head>
  <title>DIVERGE — Take the Uncommon Route</title>
  <meta name="description" content="DIVERGE — A music streaming experience that takes the uncommon route. Discover music beyond algorithmic echo chambers, share sessions, and explore your listening Trace." />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<!-- Global @react-bits/SlicedWaves ambient background at 40% opacity -->
<SlicedWaves opacity={0.4} />

<div class="app-shell" class:sidebar-open={sidebarOpen} class:auth-mode={isAuthPath(page.url.pathname)}>
  {#if !isAuthPath(page.url.pathname)}
    <Sidebar bind:open={sidebarOpen} />
  {/if}
  <div class="main-column" class:full-width={isAuthPath(page.url.pathname)}>
    {#if !isAuthPath(page.url.pathname)}
      <TopHeader />
    {/if}
    <main class="main-content" id="main-content" class:no-pad={isAuthPath(page.url.pathname)}>
      <slot />
    </main>
  </div>
  {#if !isAuthPath(page.url.pathname)}
    <MusicPlayer />
  {/if}
</div>
