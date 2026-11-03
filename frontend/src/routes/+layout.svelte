<script lang="ts">
  import '../app.css';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/state';
  import { authStore, isLoggedIn } from '$lib/stores/auth';
  import { guestStore } from '$lib/stores/guest';
  import { player, isPlaying } from '$lib/stores/player';
  import { introStore } from '$lib/stores/intro';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import TopHeader from '$lib/components/layout/TopHeader.svelte';
  import MusicPlayer from '$lib/components/player/MusicPlayer.svelte';
  import SlicedWaves from '$lib/components/background/SlicedWaves.svelte';
  import IntroAnimationOverlay from '$lib/components/intro/IntroAnimationOverlay.svelte';

  let sidebarOpen = false;

  function isAuthPath(pathname: string): boolean {
    return pathname.startsWith('/login') ||
           pathname.startsWith('/register') ||
           pathname.startsWith('/signup') ||
           pathname.startsWith('/auth');
  }

  // 10 minutes inactivity trigger for cinematic intro animation (600,000 ms)
  const INTRO_INACTIVITY_MS = 10 * 60 * 1000;

  // 5 hours inactivity timeout for standard web browser sessions (18,000,000 ms)
  const BROWSER_SESSION_TIMEOUT_MS = 5 * 60 * 60 * 1000;

  let lastActiveTime = Date.now();
  let minimizedTimestamp: number | null = null;
  let fiveHourTimeoutTimer: any = null;

  function isStandaloneApp(): boolean {
    if (!browser) return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  function handleUserActivity() {
    lastActiveTime = Date.now();
    scheduleFiveHourTimeout();
  }

  function scheduleFiveHourTimeout() {
    if (!browser) return;
    if (fiveHourTimeoutTimer) clearTimeout(fiveHourTimeoutTimer);

    // In installed app (PWA), permanently logged in with no session timeout!
    if (isStandaloneApp()) return;

    // In standard browser tab, expire session after 5 hours of complete inactivity
    fiveHourTimeoutTimer = setTimeout(async () => {
      // If audio is actively playing, keep session alive
      if ($isPlaying) {
        scheduleFiveHourTimeout();
        return;
      }
      if ($isLoggedIn) {
        try {
          player.pause();
          guestStore.disableGuest();
          await authStore.logout();
          goto('/login');
        } catch (e) {
          console.warn('Session timeout logout error:', e);
        }
      }
    }, BROWSER_SESSION_TIMEOUT_MS);
  }

  function handleVisibilityOrFocus() {
    if (!browser) return;

    if (document.visibilityState === 'hidden') {
      minimizedTimestamp = Date.now();
    } else if (document.visibilityState === 'visible') {
      const now = Date.now();
      const timeAway = minimizedTimestamp ? (now - minimizedTimestamp) : (now - lastActiveTime);
      minimizedTimestamp = null;
      lastActiveTime = now;
      scheduleFiveHourTimeout();

      // If user minimized or was inactive for >= 10 minutes, replay intro animation
      // When intro finishes, it returns straight to the music catalog (no login prompt)
      if (timeAway >= INTRO_INACTIVITY_MS && !isAuthPath(page.url.pathname)) {
        introStore.play();
      }
    }
  }

  onMount(async () => {
    await authStore.init();

    // Register Service Worker for PWA install & offline caching
    if (browser && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => reg.update())
        .catch(() => {});
    }

    // Attach user activity and window visibility listeners
    if (browser) {
      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
      events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
      document.addEventListener('visibilitychange', handleVisibilityOrFocus);
      window.addEventListener('focus', handleVisibilityOrFocus);
      scheduleFiveHourTimeout();
    }
  });

  onDestroy(() => {
    if (browser) {
      if (fiveHourTimeoutTimer) clearTimeout(fiveHourTimeoutTimer);
      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    }
  });
</script>

<svelte:head>
  <title>DIVERGE — Take the Uncommon Route</title>
  <meta name="description" content="DIVERGE — A music streaming experience that takes the uncommon route. Discover music beyond algorithmic echo chambers, share sessions, and explore your listening Trace." />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<!-- Cinematic Intro Animation Overlay (Triggered on demand or after 10 mins inactivity) -->
{#if $introStore}
  <IntroAnimationOverlay />
{/if}

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
