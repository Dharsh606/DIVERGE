<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { authStore } from '$lib/stores/auth';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import TopHeader from '$lib/components/layout/TopHeader.svelte';
  import MusicPlayer from '$lib/components/player/MusicPlayer.svelte';
  import SlicedWaves from '$lib/components/background/SlicedWaves.svelte';

  let sidebarOpen = false;

  $: currentPath = page.url.pathname;
  $: isAuthPage = currentPath.startsWith('/login') ||
                  currentPath.startsWith('/register') ||
                  currentPath.startsWith('/signup') ||
                  currentPath.startsWith('/auth');

  onMount(async () => {
    await authStore.init();
  });
</script>

<svelte:head>
  <title>DIVERGE — Take the Uncommon Route</title>
  <meta name="description" content="DIVERGE — A music streaming experience that takes the uncommon route. Discover music beyond algorithmic echo chambers, share sessions, and explore your listening Trace." />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<!-- Global @react-bits/SlicedWaves ambient background at 40% opacity -->
<SlicedWaves opacity={0.4} />

<div class="app-shell" class:sidebar-open={sidebarOpen} class:auth-mode={isAuthPage}>
  {#if !isAuthPage}
    <Sidebar bind:open={sidebarOpen} />
  {/if}
  <div class="main-column" class:full-width={isAuthPage}>
    {#if !isAuthPage}
      <TopHeader />
    {/if}
    <main class="main-content" id="main-content" class:no-pad={isAuthPage}>
      <slot />
    </main>
  </div>
  {#if !isAuthPage}
    <MusicPlayer />
  {/if}
</div>
