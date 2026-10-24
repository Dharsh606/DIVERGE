<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { songs as songsAPI } from '$lib/services/api';
  import type { Song, PaginatedSongs } from '$lib/types';
  import SongCard from '$lib/components/cards/SongCard.svelte';
  import { player } from '$lib/stores/player';

  let query = '';
  let selectedGenre = '';
  let genres: string[] = [];
  let results: Song[] = [];
  let loading = false;
  let debounceTimer: any = null;

  // Reactively track URL parameter changes from TopHeader or direct links
  $: urlQ = $page.url.searchParams.get('q');
  $: if (urlQ !== null && urlQ !== query) {
    query = urlQ;
    executeSearch();
  }

  const quickPills = [
    { label: 'Bollywood Hits', q: 'Arijit Singh' },
    { label: 'Tamil Hits', q: 'Anirudh Ravichander' },
    { label: 'Punjabi Beats', q: 'Diljit Dosanjh' },
    { label: 'Telugu Hits', q: 'Sid Sriram' },
    { label: 'A.R. Rahman', q: 'A.R. Rahman' },
    { label: 'World Pop', q: 'The Weeknd' },
    { label: 'Lo-Fi Chill', q: 'Lo-Fi' }
  ];

  onMount(async () => {
    try {
      genres = await songsAPI.genres();
    } catch (e) {
      console.error('Failed to load genres', e);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    const initialGenre = urlParams.get('genre');

    if (initialQuery) query = initialQuery;
    if (initialGenre) selectedGenre = initialGenre;

    executeSearch();
  });

  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      executeSearch();
    }, 240);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      executeSearch();
    }
  }

  async function executeSearch() {
    loading = true;
    const cleanQ = query.trim();
    try {
      if (cleanQ.length > 0) {
        // High-speed search returning full-length master tracks
        const liveRes = await songsAPI.searchLive(cleanQ, 30);
        results = liveRes.songs || [];
      } else if (selectedGenre) {
        const res = (await songsAPI.list({
          genre: selectedGenre,
          limit: 30
        })) as PaginatedSongs;
        results = res.songs || [];
      } else {
        const res = (await songsAPI.list({
          limit: 30
        })) as PaginatedSongs;
        results = res.songs || [];
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      loading = false;
    }
  }

  function applyQuickPill(q: string) {
    query = q;
    selectedGenre = '';
    executeSearch();
  }

  async function selectGenre(g: string) {
    selectedGenre = selectedGenre === g ? '' : g;
    executeSearch();
  }
</script>

<svelte:head>
  <title>Search & Discover - DIVERGE</title>
  <meta name="description" content="Search songs, movies, artists, and musical genres." />
</svelte:head>

<div class="search-page">
  <!-- Search input bar -->
  <div class="search-bar-wrap">
    <div class="search-input-box">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="search"
        class="search-input"
        placeholder="Search any song, movie, or artist (e.g. Baahubali, Kaththi, Arijit Singh, Anirudh)..."
        bind:value={query}
        on:input={handleInput}
        on:keydown={handleKeydown}
        aria-label="Search tracks"
      />
      {#if query}
        <button
          class="clear-btn"
          on:click={() => {
            query = '';
            executeSearch();
          }}
          aria-label="Clear search"
        >
          &times;
        </button>
      {/if}
    </div>
  </div>

  <!-- Quick discovery pills -->
  <div class="quick-pills-row" role="region" aria-label="Trending music filters">
    <span class="pills-label text-faint">Trending:</span>
    {#each quickPills as pill}
      <button
        class="pill-chip"
        class:active={query === pill.q}
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
          class:active={selectedGenre === g}
          on:click={() => selectGenre(g)}
        >
          {g.charAt(0).toUpperCase() + g.slice(1)}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Results Count -->
  <div class="results-header">
    <span class="results-count text-muted">
      {#if loading}
        Searching...
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

  .search-bar-wrap {
    display: flex;
    gap: 0.75rem;
    width: 100%;
  }

  .search-input-box {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 1.1rem;
    width: 18px;
    height: 18px;
    color: var(--color-text-faint);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 0.85rem 2.75rem 0.85rem 3rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-size: var(--text-base);
    font-family: inherit;
    transition: all var(--t-fast) ease;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(120, 75, 255, 0.2);
    background: var(--color-surface-raised);
  }

  .clear-btn {
    position: absolute;
    right: 1rem;
    background: none;
    border: none;
    color: var(--color-text-faint);
    font-size: 1.25rem;
    cursor: pointer;
    line-height: 1;
    padding: 0.2rem;
  }
  .clear-btn:hover {
    color: var(--color-text);
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
