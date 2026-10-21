<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { authStore, isLoggedIn } from '$lib/stores/auth';
  import { guestStore } from '$lib/stores/guest';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import MusicPlayer from '$lib/components/player/MusicPlayer.svelte';

  let sidebarOpen = false;

  // Pages that don't show the shell (standalone auth pages)
  $: isAuthPage = page.url.pathname.startsWith('/login') ||
                  page.url.pathname.startsWith('/register');

  // Shell is shown once user is logged in or active in guest exploration mode
  $: hasUnlockedApp = $isLoggedIn || $guestStore;
  $: showShell = !isAuthPage && hasUnlockedApp;

  onMount(async () => {
    await authStore.init();
  });
</script>

<svelte:head>
  <title>DIVERGE — Take the Uncommon Route</title>
  <meta name="description" content="DIVERGE — A music streaming experience that takes the uncommon route. Discover music beyond algorithmic echo chambers, share sessions, and explore your listening Trace." />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

{#if showShell}
  <div class="app-shell" class:sidebar-open={sidebarOpen}>
    <Sidebar bind:open={sidebarOpen} />
    <main class="main-content" id="main-content">
      <slot />
    </main>
    <MusicPlayer />
  </div>
{:else}
  <slot />
{/if}
