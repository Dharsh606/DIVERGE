<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { authStore } from '$lib/stores/auth';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import MusicPlayer from '$lib/components/player/MusicPlayer.svelte';

  let sidebarOpen = false;

  // Pages that don't show the shell (auth pages)
  $: isAuthPage = page.url.pathname.startsWith('/login') ||
                  page.url.pathname.startsWith('/register');

  onMount(async () => {
    await authStore.init();
  });
</script>

<svelte:head>
  <title>DIVERGE — Take the Uncommon Route</title>
  <meta name="description" content="DIVERGE — A music streaming experience that takes the uncommon route. Discover music beyond algorithmic echo chambers, share sessions, and explore your listening Trace." />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

{#if isAuthPage}
  <slot />
{:else}
  <div class="app-shell" class:sidebar-open={sidebarOpen}>
    <Sidebar bind:open={sidebarOpen} />
    <main class="main-content" id="main-content">
      <slot />
    </main>
    <MusicPlayer />
  </div>
{/if}
