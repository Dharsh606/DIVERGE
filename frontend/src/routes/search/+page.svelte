<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { searchStore } from '$lib/stores/search';
  import { songs as songsAPI } from '$lib/services/api';
  import SongCard from '$lib/components/cards/SongCard.svelte';
  import { player } from '$lib/stores/player';

  let genres: string[] = [
    'Bollywood',
    'Tamil Hits',
    'Telugu Hits',
    'Kannada Hits',
    'Punjabi Beats',
    'Hip Hop',
    'Indian Hits',
    'World Pop',
    'A.R. Rahman',
    'Soundtrack',
    'Lo-Fi Chill',
    'Country'
  ];

  const quickPills = [
    { label: 'Bollywood Hits', q: 'Bollywood Hits' },
    { label: 'Tamil Hits', q: 'Tamil Hits' },
    { label: 'Telugu Hits', q: 'Telugu Hits' },
    { label: 'Kannada Hits', q: 'Kannada Hits' },
    { label: 'Punjabi Beats', q: 'Punjabi Hits' },
    { label: 'Hip Hop / Rap', q: 'Hip Hop India' },
    { label: 'A.R. Rahman', q: 'A.R. Rahman' },
    { label: 'Anirudh Hits', q: 'Anirudh Ravichander' },
    { label: 'World Pop', q: 'World Pop Hits' },
    { label: 'Soundtrack', q: 'Movie Soundtracks' },
    { label: 'Country', q: 'Country Music' },
    { label: 'Lo-Fi Chill', q: 'Lo-Fi Chill' }
  ];

  $: query = $searchStore.query;
  $: selectedGenre = $searchStore.selectedGenre;
  $: results = $searchStore.results;
  $: loading = $searchStore.loading;

  onMount(async () => {
    try {
      const g = await songsAPI.genres();
      if (g && g.length > 0) genres = g;
    } catch (e) {
      console.error('Failed to load genres', e);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    const initialGenre = urlParams.get('genre');

    if (initialQuery) {
      searchStore.setQuery(initialQuery, true);
    } else if (initialGenre) {
      searchStore.setGenre(initialGenre);
    } else if (!results.length) {
      searchStore.refresh();
    }
  });

  function applyQuickPill(q: string) {
    searchStore.setQuery(q, true);
    window.history.replaceState(null, '', `/search?q=${encodeURIComponent(q)}`);
  }

  function selectGenre(g: string) {
    searchStore.setGenre(g);
    if (g) {
      window.history.replaceState(null, '', `/search?genre=${encodeURIComponent(g)}`);
    } else {
      window.history.replaceState(null, '', '/search');
    }
  }

  function handleClearFilter() {
    searchStore.clear();
    window.history.replaceState(null, '', '/search');
  }
</script>

<svelte:head>
  <title>Search & Discover - DIVERGE</title>
  <meta name="description" content="Search songs, movies, artists, and musical genres." />
</svelte:head>

<div class="search-page">
  <!-- Search Page Header Banner -->
  <div class="search-hero">
    <div class="search-hero-content">
      {#if query.trim()}
        <h1 class="search-hero-title">
          Results for <span class="accent-text">"{query.trim()}"</span>
        </h1>
        <p class="search-hero-subtitle text-muted">
          Found {results.length} full-length {results.length === 1 ? 'track' : 'tracks'}
        </p>
      {:else if selectedGenre}
        <h1 class="search-hero-title">{selectedGenre} Showcase</h1>
        <p class="search-hero-subtitle text-muted">Curated full-length tracks in this frequency band</p>
      {:else}
        <h1 class="search-hero-title">Search & Music Discovery</h1>
        <p class="search-hero-subtitle text-muted">Explore movies, artists, and full-length releases via the top search bar</p>
      {/if}
    </div>
    {#if query.trim() || selectedGenre}
      <button
        class="btn btn-ghost btn-sm clear-query-btn"
        on:click={handleClearFilter}
      >
        Clear Filter ✕
      </button>
    {/if}
  </div>

  <!-- Quick discovery pills -->
  <div class="quick-pills-row" role="region" aria-label="Trending music filters">
    <span class="pills-label text-faint">Trending:</span>
    {#each quickPills as pill}
      <button
        class="pill-chip"
        class:active={query.toLowerCase() === pill.q.toLowerCase()}
        on:click={() => applyQuickPill(pill.q)}
      >
        {pill.label}
      </button>
    {/each}
  </div>

  <!-- Genre filters -->
  {#if genres.length > 0}
    <div class="genre-filter-row" role="region" aria-label="Genre filters">
      <button
        class="genre-chip"
        class:active={selectedGenre === '' && !query.trim()}
        on:click={() => selectGenre('')}
      >
        All Genres
      </button>
      {#each genres as g}
        <button
          class="genre-chip"
          class:active={selectedGenre.toLowerCase() === g.toLowerCase()}
          on:click={() => selectGenre(g)}
        >
          {g}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Results Count -->
  <div class="results-header">
    <span class="results-count text-muted">
      {#if loading}
        Searching catalog...
      {:else if query.trim()}
        Showing {results.length} {results.length === 1 ? 'track' : 'tracks'} for "{query.trim()}"
      {:else if selectedGenre}
        Showing {results.length} {selectedGenre} tracks
      {:else}
        Featured & Trending ({results.length} tracks)
      {/if}
    </span>
  </div>

  <!-- Results Grid -->
  {#if loading}
    <div class="loading-grid">
      {#each Array(10) as _}
        <div class="skeleton-card card">
          <div class="skeleton-art"></div>
          <div class="skeleton-line" style="width: 75%"></div>
          <div class="skeleton-line" style="width: 50%"></div>
        </div>
      {/each}
    </div>
  {:else if results.length === 0}
    <div class="empty-state">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <h3>No tracks found</h3>
      <p class="text-muted">Try searching with a different movie title, song name, or artist.</p>
    </div>
  {:else}
    <div class="results-grid">
      {#each results as song (song.id)}
        <SongCard {song} queue={results} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-bottom: 2.5rem;
  }

  .search-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .search-hero-title {
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0;
  }

  .accent-text {
    background: linear-gradient(135deg, #784BFF 0%, #FF5C58 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .search-hero-subtitle {
    font-size: var(--text-sm);
    margin: 0.25rem 0 0 0;
  }

  .clear-query-btn {
    flex-shrink: 0;
  }

  .quick-pills-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding: 0.25rem 0;
  }

  .pills-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-right: 0.25rem;
  }

  .pill-chip {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all var(--t-fast) ease;
  }
  .pill-chip:hover {
    border-color: var(--color-primary);
    color: var(--color-text);
  }
  .pill-chip.active {
    background: rgba(120, 75, 255, 0.2);
    border-color: var(--color-primary);
    color: #FFFFFF;
    font-weight: 600;
  }

  .genre-filter-row {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.35rem;
    scrollbar-width: thin;
  }

  .genre-chip {
    background: var(--color-surface);
    border: 1px solid var(--color-border-subtle);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 500;
    padding: 0.35rem 0.85rem;
    border-radius: var(--radius-full);
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--t-fast) ease;
  }
  .genre-chip:hover {
    background: var(--color-surface-raised);
    color: var(--color-text);
  }
  .genre-chip.active {
    background: var(--color-primary);
    color: #FFFFFF;
    border-color: var(--color-primary);
    font-weight: 600;
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.5rem;
  }
  .results-count {
    font-size: var(--text-sm);
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 1.15rem;
  }

  .loading-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 1.15rem;
  }

  .skeleton-card {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .skeleton-art {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--radius-sm);
    background: linear-gradient(90deg, #1A1727 25%, #252038 50%, #1A1727 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-line {
    height: 12px;
    border-radius: var(--radius-xs);
    background: linear-gradient(90deg, #1A1727 25%, #252038 50%, #1A1727 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1.5rem;
    text-align: center;
    gap: 0.75rem;
  }

  .empty-icon {
    color: var(--color-text-faint);
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    .results-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
  }
</style>
