<script lang="ts">
  import { onMount } from 'svelte';
  import { songs as songsAPI, recommendations } from '$lib/services/api';
  import type { Song, PaginatedSongs, RecommendationResult } from '$lib/types';
  import SongCard from '$lib/components/cards/SongCard.svelte';
  import { player } from '$lib/stores/player';

  let query = '';
  let selectedGenre = '';
  let genres: string[] = [];
  let results: Song[] = [];
  let isAntiMode = false;
  let antiReason = '';
  let loading = false;
  let debounceTimer: any = null;

  onMount(async () => {
    try {
      genres = await songsAPI.genres();
    } catch (e) {
      console.error(e);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    const initialGenre = urlParams.get('genre');
    const mode = urlParams.get('mode');

    if (initialQuery) query = initialQuery;
    if (initialGenre) selectedGenre = initialGenre;

    if (mode === 'anti') {
      triggerAntiAlgorithm();
    } else {
      executeSearch();
    }
  });

  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      isAntiMode = false;
      executeSearch();
    }, 280);
  }

  async function executeSearch() {
    loading = true;
    try {
      const res = await songsAPI.list({
        search: query.trim() || undefined,
        genre: selectedGenre || undefined,
        limit: 30
      }) as PaginatedSongs;
      results = res.songs;
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      loading = false;
    }
  }

  async function selectGenre(g: string) {
    selectedGenre = selectedGenre === g ? '' : g;
    isAntiMode = false;
    executeSearch();
  }

  async function triggerAntiAlgorithm() {
    loading = true;
    isAntiMode = true;
    try {
      const res = await recommendations.anti() as RecommendationResult;
      results = res.songs || [];
      antiReason = res.reason || 'Curated to step outside your usual listening patterns.';
    } catch (err) {
      console.error('Anti-Algorithm failed', err);
      executeSearch();
    } finally {
      loading = false;
    }
  }

  function resetToNormal() {
    isAntiMode = false;
    executeSearch();
  }
</script>

<svelte:head>
  <title>Search & Discover - DIVERGE</title>
  <meta name="description" content="Search songs, filter by sonic attributes, or take the Anti-Algorithm route." />
</svelte:head>

<div class="search-page">
  <!-- Search input bar -->
  <div class="search-bar-wrap">
    <div class="search-input-box glass">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="search"
        class="search-input"
        placeholder="Search by track title, artist, or style..."
        bind:value={query}
        on:input={handleInput}
        aria-label="Search tracks"
      />
      {#if query}
        <button class="clear-btn" on:click={() => { query = ''; executeSearch(); }} aria-label="Clear search">
          &times;
        </button>
      {/if}
    </div>

    <!-- Anti-Algorithm Discovery Trigger -->
    <button
      class="btn anti-btn"
      class:active={isAntiMode}
      on:click={isAntiMode ? resetToNormal : triggerAntiAlgorithm}
      aria-pressed={isAntiMode}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
      </svg>
      {isAntiMode ? 'Exit Anti-Algorithm' : 'Anti-Algorithm Route'}
    </button>
  </div>

  {#if isAntiMode}
    <div class="anti-notice glass">
      <div class="anti-badge">Anti-Algorithm Active</div>
      <p class="anti-text">{antiReason}</p>
    </div>
  {/if}

  <!-- Genre filters -->
  <div class="genre-filter-row" role="region" aria-label="Genre filters">
    <button
      class="genre-chip"
      class:active={selectedGenre === '' && !isAntiMode}
      on:click={() => selectGenre('')}
    >
      All Genres
    </button>
    {#each genres as g}
      <button
        class="genre-chip"
        class:active={selectedGenre === g && !isAntiMode}
        on:click={() => selectGenre(g)}
      >
        {g.charAt(0).toUpperCase() + g.slice(1)}
      </button>
    {/each}
  </div>

  <!-- Results Count -->
  <div class="results-header">
    <span class="results-count text-muted">
      {#if loading}
        Searching...
      {:else if isAntiMode}
        Showing {results.length} uncommon divergence tracks
      {:else}
        Showing {results.length} {results.length === 1 ? 'track' : 'tracks'}
      {/if}
    </span>
  </div>

  <!-- Results View -->
  {#if loading}
    <div class="song-grid">
      {#each Array(10) as _}
        <div class="skeleton" style="aspect-ratio: 1; border-radius: var(--radius-lg);"></div>
      {/each}
    </div>
  {:else if results.length === 0}
    <div class="empty-state glass">
      <h3>No tracks found</h3>
      <p class="text-muted">Try adjusting your search terms or genre selection.</p>
      {#if isAntiMode}
        <button class="btn btn-ghost" on:click={resetToNormal}>Return to standard catalog</button>
      {/if}
    </div>
  {:else}
    <div class="song-grid" role="list">
      {#each results as song (song.id)}
        <div role="listitem">
          <SongCard {song} queue={results} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 2rem;
  }

  .search-bar-wrap {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-input-box {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 260px;
    padding: 0.65rem 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .search-icon {
    width: 18px;
    height: 18px;
    color: var(--color-text-muted);
    margin-right: 0.75rem;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text);
    font-size: var(--text-base);
    font-family: inherit;
  }

  .search-input::placeholder {
    color: var(--color-text-faint);
  }

  .clear-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0 0.25rem;
  }

  .anti-btn {
    background: transparent;
    border: 1px solid var(--color-accent);
    color: var(--color-accent);
    padding: 0.65rem 1.25rem;
    border-radius: var(--radius-md);
  }

  .anti-btn:hover {
    background: var(--color-accent-dim);
  }

  .anti-btn.active {
    background: var(--color-accent);
    color: var(--color-bg);
  }

  .anti-notice {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-accent);
  }

  .anti-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-accent);
    background: var(--color-accent-dim);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-xs);
    white-space: nowrap;
  }

  .anti-text {
    font-size: var(--text-sm);
    color: var(--color-text);
    margin: 0;
  }

  .genre-filter-row {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .genre-chip {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    padding: 0.35rem 0.85rem;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--t-fast) ease;
  }

  .genre-chip:hover {
    background: var(--color-surface-raised);
    color: var(--color-text);
  }

  .genre-chip.active {
    background: var(--color-primary-dim);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .results-count {
    font-size: var(--text-sm);
  }

  .empty-state {
    padding: 3rem 2rem;
    text-align: center;
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
</style>
