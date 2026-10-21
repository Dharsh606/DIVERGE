<script lang="ts">
  import { onMount } from 'svelte';
  import { songs as songsAPI, recommendations } from '$lib/services/api';
  import type { Song, PaginatedSongs, RecommendationResult } from '$lib/types';
  import SongCard from '$lib/components/cards/SongCard.svelte';
  import { player } from '$lib/stores/player';
  import { isLoggedIn } from '$lib/stores/auth';
  import { guestStore } from '$lib/stores/guest';
  import AuthAndIntroExperience from '$lib/components/auth/AuthAndIntroExperience.svelte';

  let trending: Song[] = [];
  let recommended: Song[] = [];
  let genres: string[] = [];
  let selectedGenre = '';
  let browseSongs: Song[] = [];
  let loading = true;
  let browseLoading = false;
  let replayingIntro = false;

  $: hasAccess = $isLoggedIn || $guestStore;

  onMount(async () => {
    await loadInitialData();
  });

  async function loadInitialData() {
    try {
      const [trendingRes, genresRes] = await Promise.all([
        songsAPI.trending() as Promise<Song[]>,
        songsAPI.genres(),
      ]);
      trending = trendingRes;
      genres = genresRes;

      if ($isLoggedIn) {
        const recRes = await recommendations.standard() as RecommendationResult;
        recommended = recRes.songs ?? [];
      }

      await loadBrowse();
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      loading = false;
    }
  }

  async function loadBrowse() {
    browseLoading = true;
    try {
      const res = await songsAPI.list({ limit: 20, genre: selectedGenre || undefined }) as PaginatedSongs;
      browseSongs = res.songs;
    } finally {
      browseLoading = false;
    }
  }

  async function selectGenre(g: string) {
    selectedGenre = selectedGenre === g ? '' : g;
    await loadBrowse();
  }

  function handleAuthSuccess() {
    replayingIntro = false;
    loadInitialData();
  }
</script>

<svelte:head>
  <title>DIVERGE — Curated Audio & Music Discovery</title>
  <meta name="description" content="Discover music on DIVERGE. Curated tracks, trending releases, acoustic exploration, and collaborative sessions." />
</svelte:head>

{#if !hasAccess || replayingIntro}
  <!-- ═══════════════════════════════════════════════════════════════════════
       STAGE 1 & 2: 3.5s DIVERGE LOGO ANIMATION + LUXURY AUTH EXPERIENCE
       ═══════════════════════════════════════════════════════════════════════ -->
  <AuthAndIntroExperience
    skipSplash={false}
    on:success={handleAuthSuccess}
  />
{:else}
  <!-- ═══════════════════════════════════════════════════════════════════════
       STAGE 3: NORMAL HOME EXPERIENCE (Shown after login, signup or guest)
       ═══════════════════════════════════════════════════════════════════════ -->
  <div class="home">
    {#if loading}
      <!-- Loading state -->
      <div class="section-header">
        <div class="skeleton" style="width: 180px; height: 24px;"></div>
      </div>
      <div class="song-grid">
        {#each Array(8) as _}
          <div class="skeleton" style="aspect-ratio: 1; border-radius: var(--radius-md);"></div>
        {/each}
      </div>
    {:else}
      <!-- Editorial header — human curated moment -->
      {#if trending.length}
        {@const featured = trending[0]}
        <section class="editorial" aria-label="Featured track">
          <div class="editorial-card">
            <div class="editorial-art">
              {#if featured.album?.cover_url}
                <img src={featured.album.cover_url} alt={featured.album.title} />
              {:else}
                <div class="editorial-art-placeholder" aria-hidden="true"></div>
              {/if}
            </div>
            <div class="editorial-meta">
              <div class="badge-row">
                <span class="badge badge-accent">Trending Now</span>
                {#if featured.genre}
                  <span class="badge badge-primary">{featured.genre}</span>
                {/if}
                <button
                  class="replay-intro-pill"
                  on:click={() => (replayingIntro = true)}
                  title="Replay cinematic 3D logo intro"
                  aria-label="Replay intro animation"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  <span>Intro Animation</span>
                </button>
              </div>
              <h1 class="editorial-title">{featured.title}</h1>
              <p class="editorial-artist text-muted">{featured.artist?.name ?? ''}</p>
              <div class="editorial-actions">
                <button
                  class="btn btn-primary"
                  on:click={() => player.playSong(featured, trending)}
                  id="play-featured-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Play Track
                </button>
                <a href="/song/{featured.id}" class="btn btn-ghost">Track Details</a>
              </div>
            </div>
          </div>
        </section>
      {/if}

      <!-- Genre filter pills -->
      {#if genres.length}
        <section class="genres-section" aria-label="Filter by genre">
          <div class="section-header">
            <h2 class="section-title">Explore Catalog</h2>
          </div>
          <div class="genre-strip" role="toolbar" aria-label="Genre filters">
            <button
              class="genre-pill"
              class:active={selectedGenre === ''}
              on:click={() => selectGenre('')}
              aria-pressed={selectedGenre === ''}
            >All</button>
            {#each genres as g}
              <button
                class="genre-pill"
                class:active={selectedGenre === g}
                on:click={() => selectGenre(g)}
                aria-pressed={selectedGenre === g}
                id="genre-{g}"
              >{g.charAt(0).toUpperCase() + g.slice(1)}</button>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Browse songs grid -->
      {#if browseLoading}
        <div class="song-grid">
          {#each Array(8) as _}
            <div class="skeleton" style="aspect-ratio: 1; border-radius: var(--radius-md);"></div>
          {/each}
        </div>
      {:else if browseSongs.length}
        <div class="song-grid" role="list" aria-label="Songs">
          {#each browseSongs as song (song.id)}
            <div role="listitem">
              <SongCard {song} queue={browseSongs} />
            </div>
          {/each}
        </div>
      {/if}

      <!-- Trending section -->
      {#if trending.length > 1}
        <section class="section" aria-label="Trending this week">
          <div class="section-header">
            <h2 class="section-title">Trending This Week</h2>
            <a href="/search" class="section-link">View all</a>
          </div>
          <div class="list-view">
            {#each trending.slice(1, 9) as song (song.id)}
              <SongCard {song} queue={trending} compact />
            {/each}
          </div>
        </section>
      {/if}

      <!-- Personalised recommendations (logged in only) -->
      {#if recommended.length}
        <section class="section" aria-label="Recommended for you">
          <div class="section-header">
            <h2 class="section-title">Curated For You</h2>
            <a href="/search?mode=recommendations" class="section-link">Refresh</a>
          </div>
          <div class="song-grid">
            {#each recommended.slice(0, 6) as song (song.id)}
              <SongCard {song} queue={recommended} />
            {/each}
          </div>
        </section>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .home {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    padding-bottom: 2rem;
  }

  /* Curated Editorial Moment */
  .editorial {
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .editorial-card {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 2rem;
    padding: 1.75rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    align-items: center;
  }
  .editorial-art {
    width: 180px;
    height: 180px;
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }
  .editorial-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .editorial-art-placeholder {
    width: 100%;
    height: 100%;
    background: var(--color-surface-raised);
  }

  .badge-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }

  .replay-intro-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.6rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--t-fast) ease;
    margin-left: auto;
  }
  .replay-intro-pill:hover {
    background: rgba(120, 75, 255, 0.12);
    border-color: rgba(120, 75, 255, 0.35);
    color: #FFFFFF;
  }

  .editorial-title {
    font-size: var(--text-2xl);
    font-weight: 700;
    letter-spacing: -0.025em;
    margin-bottom: 0.35rem;
    color: var(--color-text);
  }
  .editorial-artist {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    margin-bottom: 1.25rem;
  }

  .editorial-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  /* Genre Strip */
  .genre-strip {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
  }

  .genre-pill {
    font-family: inherit;
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 0.45rem 1rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
      background var(--t-fast) ease,
      color var(--t-fast) ease,
      border-color var(--t-fast) ease;
    letter-spacing: 0.02em;
  }
  .genre-pill:hover {
    background: var(--color-surface-raised);
    color: var(--color-text);
    border-color: var(--color-border-hover);
  }
  .genre-pill.active {
    background: var(--color-primary-dim);
    border-color: var(--color-primary);
    color: #C4AEFF;
  }

  /* Section */
  .section {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  @media (max-width: 600px) {
    .editorial-card {
      grid-template-columns: 1fr;
    }
    .editorial-art {
      width: 100%;
      height: 200px;
    }
    .replay-intro-pill {
      margin-left: 0;
    }
  }
</style>
