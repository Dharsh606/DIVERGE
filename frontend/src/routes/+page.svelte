<script lang="ts">
  import { onMount } from 'svelte';
  import { songs as songsAPI, recommendations } from '$lib/services/api';
  import type { Song, PaginatedSongs, RecommendationResult } from '$lib/types';
  import SongCard from '$lib/components/cards/SongCard.svelte';
  import { player } from '$lib/stores/player';
  import { isLoggedIn } from '$lib/stores/auth';

  let trending: Song[] = [];
  let recommended: Song[] = [];
  let genres: string[] = [];
  let selectedGenre = '';
  let browseSongs: Song[] = [];
  let loading = true;
  let browseLoading = false;

  onMount(async () => {
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
    } finally {
      loading = false;
    }
  });

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
</script>

<svelte:head>
  <title>DIVERGE — Home</title>
  <meta name="description" content="Discover music on DIVERGE. Trending tracks, personalised recommendations, and Sound Canvas exploration." />
</svelte:head>

<div class="home">
  {#if loading}
    <!-- Loading state -->
    <div class="section-header">
      <div class="skeleton" style="width: 180px; height: 24px;"></div>
    </div>
    <div class="song-grid">
      {#each Array(8) as _}
        <div class="skeleton" style="aspect-ratio: 1; border-radius: var(--radius-lg);"></div>
      {/each}
    </div>
  {:else}
    <!-- Editorial header — not a hero banner, an editorial moment -->
    {#if trending.length}
      {@const featured = trending[0]}
      <section class="editorial" aria-label="Featured track">
        <div class="editorial-inner glass">
          <div class="editorial-art">
            {#if featured.album?.cover_url}
              <img src={featured.album.cover_url} alt={featured.album.title} />
            {:else}
              <div class="editorial-art-placeholder" aria-hidden="true"></div>
            {/if}
          </div>
          <div class="editorial-meta">
            <span class="editorial-label badge badge-accent">Trending Now</span>
            <h1 class="editorial-title">{featured.title}</h1>
            <p class="editorial-artist text-muted">{featured.artist?.name ?? ''}</p>
            <div class="editorial-actions">
              <button
                class="btn btn-primary"
                on:click={() => player.playSong(featured, trending)}
                id="play-featured-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Play
              </button>
              <a href="/song/{featured.id}" class="btn btn-ghost">View details</a>
            </div>
          </div>
        </div>
      </section>
    {/if}

    <!-- Genre filter pills — not a grid of genre cards, a sparse horizontal filter -->
    {#if genres.length}
      <section class="genres-section" aria-label="Filter by genre">
        <div class="section-header">
          <h2 class="section-title">Browse</h2>
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
          <div class="skeleton" style="aspect-ratio: 1; border-radius: var(--radius-lg);"></div>
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
          <h2 class="section-title">Trending this week</h2>
          <a href="/search" class="section-link">See all</a>
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
          <h2 class="section-title">Picked for you</h2>
          <a href="/search?mode=recommendations" class="section-link">Refresh</a>
        </div>
        <div class="song-grid">
          {#each recommended.slice(0, 6) as song (song.id)}
            <SongCard {song} queue={recommended} />
          {/each}
        </div>
      </section>
    {:else if !$isLoggedIn}
      <section class="cta-section glass" aria-label="Sign up prompt">
        <div class="cta-inner">
          <h2>Take the uncommon route.</h2>
          <p>Sign in to get personalised picks, save playlists, and track your musical journey.</p>
          <div class="cta-actions">
            <a href="/register" class="btn btn-primary" id="home-cta-register">Create account</a>
            <a href="/login" class="btn btn-ghost" id="home-cta-login">Log in</a>
          </div>
        </div>
      </section>
    {/if}
  {/if}
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    padding-bottom: 2rem;
  }

  /* Editorial — not a hero, not a banner */
  .editorial {
    border-radius: var(--radius-xl);
    overflow: hidden;
  }
  .editorial-inner {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: var(--radius-xl);
    align-items: center;
  }
  .editorial-art {
    width: 160px;
    height: 160px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-surface-raised);
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

  .editorial-label { margin-bottom: 0.5rem; }

  .editorial-title {
    font-size: var(--text-2xl);
    font-weight: 700;
    letter-spacing: -0.03em;
    margin-bottom: 0.25rem;
    color: var(--color-text);
  }
  .editorial-artist { font-size: var(--text-base); margin-bottom: 1rem; }

  .editorial-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  /* Genre strip */
  .genre-strip {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
  }

  .genre-pill {
    font-family: inherit;
    font-size: var(--text-sm);
    font-weight: 500;
    padding: 0.4rem 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
      background var(--t-fast) ease,
      color var(--t-fast) ease,
      border-color var(--t-fast) ease;
    letter-spacing: 0.01em;
  }
  .genre-pill:hover {
    background: var(--color-surface-raised);
    color: var(--color-text);
  }
  .genre-pill.active {
    background: var(--color-primary-dim);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  /* Section */
  .section {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* CTA */
  .cta-section {
    border-radius: var(--radius-xl);
    padding: 2rem;
  }
  .cta-inner {
    max-width: 480px;
  }
  .cta-inner h2 {
    font-size: var(--text-2xl);
    margin-bottom: 0.5rem;
  }
  .cta-inner p {
    margin-bottom: 1.25rem;
  }
  .cta-actions {
    display: flex;
    gap: 0.75rem;
  }

  @media (max-width: 600px) {
    .editorial-inner {
      grid-template-columns: 1fr;
    }
    .editorial-art {
      width: 100%;
      height: 200px;
    }
  }
</style>
