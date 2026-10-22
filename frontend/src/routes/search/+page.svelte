<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
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
  let searchScope: 'all' | 'live' = 'all';

  // Reactively track URL parameter changes (e.g. from TopHeader search)
  $: urlQ = page.url.searchParams.get('q');
  $: if (urlQ !== null && urlQ !== query) {
    query = urlQ;
    executeSearch();
  }

  const quickPills = [
    { label: 'Bollywood Hits', q: 'Arijit Singh' },
    { label: 'Tamil & South', q: 'Anirudh Ravichander' },
    { label: 'Punjabi Beats', q: 'Diljit Dosanjh' },
    { label: 'Telugu Melodies', q: 'Sid Sriram' },
    { label: 'A.R. Rahman', q: 'A.R. Rahman' },
    { label: 'World Pop', q: 'The Weeknd' },
    { label: 'Alternative Rock', q: 'Coldplay' },
    { label: 'Piano & Ambient', q: 'Ludovico Einaudi' }
  ];

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
    }, 320);
  }

  async function executeSearch() {
    loading = true;
    try {
      if (searchScope === 'live' || (query.trim().length > 0 && searchScope !== 'all')) {
        const res = await songsAPI.searchLive(query.trim() || 'Indian Top Hits', 25);
        results = res.songs || [];
      } else {
        // First search local PostgreSQL
        const res = await songsAPI.list({
          search: query.trim() || undefined,
          genre: selectedGenre || undefined,
          limit: 30
        }) as PaginatedSongs;
        
        // If local has 0 matches and user typed a query, automatically fetch from live Indian & World catalog
        if ((!res.songs || res.songs.length === 0) && query.trim().length > 2) {
          const liveRes = await songsAPI.searchLive(query.trim(), 20);
          results = liveRes.songs || [];
        } else {
          results = res.songs || [];
        }
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      loading = false;
    }
  }

  function setScope(scope: 'all' | 'live') {
    searchScope = scope;
    isAntiMode = false;
    executeSearch();
  }

  function applyQuickPill(q: string) {
    query = q;
    selectedGenre = '';
    searchScope = 'live';
    isAntiMode = false;
    executeSearch();
  }

  async function selectGenre(g: string) {
    selectedGenre = selectedGenre === g ? '' : g;
    searchScope = 'all';
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
    searchScope = 'all';
    executeSearch();
  }
</script>

<svelte:head>
  <title>Search & Discover - DIVERGE</title>
  <meta name="description" content="Search Indian and World songs, filter by sonic attributes, or explore live open-source music." />
</svelte:head>

<div class="search-page">
  <!-- Top search scope switch -->
  <div class="scope-tabs">
    <button
      class="scope-btn"
      class:active={searchScope === 'all' && !isAntiMode}
      on:click={() => setScope('all')}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <span>Library Catalog</span>
    </button>
    <button
      class="scope-btn"
      class:active={searchScope === 'live' && !isAntiMode}
      on:click={() => setScope('live')}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      <span>Live Network (Indian & World)</span>
    </button>
  </div>

  <!-- Search input bar -->
  <div class="search-bar-wrap">
    <div class="search-input-box">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="search"
        class="search-input"
        placeholder={searchScope === 'live' ? "Search any song, artist (e.g. Arijit Singh, Anirudh, Diljit, The Weeknd)..." : "Search local library catalog..."}
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
      <span>{isAntiMode ? 'Exit Anti-Algorithm' : 'Anti-Algorithm Route'}</span>
    </button>
  </div>

  {#if isAntiMode}
    <div class="anti-notice">
      <div class="anti-badge">Anti-Algorithm Active</div>
      <p class="anti-text">{antiReason}</p>
    </div>
  {/if}

  <!-- Quick discovery pills for Indian & World catalog -->
  <div class="quick-pills-row" role="region" aria-label="Quick Indian and world music filters">
    <span class="pills-label text-faint">Trending:</span>
    {#each quickPills as pill}
      <button
        class="pill-chip"
        class:active={query === pill.q && searchScope === 'live'}
        on:click={() => applyQuickPill(pill.q)}
      >
        {pill.label}
      </button>
    {/each}
  </div>

  <!-- Genre filters (when in library mode) -->
  {#if genres.length > 0 && searchScope === 'all'}
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
  {/if}

  <!-- Results Count -->
  <div class="results-header">
    <span class="results-count text-muted">
      {#if loading}
        Searching catalog...
      {:else if isAntiMode}
        Showing {results.length} uncommon divergence tracks
      {:else if searchScope === 'live'}
        Showing {results.length} live streamable tracks across Indian & World music
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
    <div class="empty-state card">
      <h3>No tracks found</h3>
      <p class="text-muted">Try searching in the Live Network for any Indian or World artist.</p>
      <button class="btn btn-primary" on:click={() => setScope('live')}>
        Search Live Network
      </button>
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

  .scope-tabs {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    border-bottom: 1px solid var(--color-border-subtle);
    padding-bottom: 0.75rem;
  }

  .scope-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--t-fast) ease;
  }

  .scope-btn:hover {
    color: var(--color-text);
    background: var(--color-surface);
  }

  .scope-btn.active {
    color: var(--color-text);
    background: var(--color-surface-raised);
    border-color: var(--color-border);
    font-weight: 600;
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
    min-width: 280px;
    padding: 0.65rem 1rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    transition: border-color var(--t-fast) ease, box-shadow var(--t-fast) ease;
  }

  .search-input-box:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-dim);
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
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  .search-input::placeholder {
    color: var(--color-text-faint);
  }

  .clear-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.25rem;
    transition: color var(--t-fast) ease;
  }
  .clear-btn:hover {
    color: var(--color-text);
  }

  .anti-btn {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    padding: 0.75rem 1.1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--text-sm);
    border-radius: var(--radius-md);
    white-space: nowrap;
    transition: all var(--t-fast) ease;
  }
  .anti-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
  .anti-btn.active {
    background: var(--color-primary);
    color: #FFFFFF;
    border-color: var(--color-primary);
    font-weight: 600;
    box-shadow: var(--shadow-glow-primary);
  }

  .anti-notice {
    padding: 1.25rem;
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--color-primary);
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    border-right: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .anti-badge {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-primary);
  }
  .anti-text {
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  .quick-pills-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.4rem;
  }
  .pills-label {
    font-size: var(--text-xs);
    margin-right: 0.25rem;
    white-space: nowrap;
  }
  .pill-chip {
    padding: 0.35rem 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--t-fast) ease;
  }
  .pill-chip:hover {
    background: var(--color-surface-raised);
    color: var(--color-text);
    border-color: var(--color-border-hover);
  }
  .pill-chip.active {
    background: var(--color-primary-dim);
    color: #C4AEFF;
    font-weight: 600;
    border-color: var(--color-primary);
  }

  .genre-filter-row {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .genre-chip {
    padding: 0.4rem 0.85rem;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--t-fast) ease;
  }
  .genre-chip:hover {
    color: var(--color-text);
    background: var(--color-surface-raised);
  }
  .genre-chip.active {
    background: var(--color-surface-raised);
    color: var(--color-text);
    border-color: var(--color-primary);
    font-weight: 600;
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .results-count {
    font-size: var(--text-xs);
    letter-spacing: 0.02em;
  }

  .song-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }

  .empty-state {
    padding: 3.5rem 2rem;
    text-align: center;
    border-radius: var(--radius-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  .empty-state h3 {
    font-size: var(--text-xl);
    font-weight: 700;
  }
  .empty-state p {
    font-size: var(--text-sm);
    max-width: 400px;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 600px) {
    .song-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.85rem;
    }
  }
</style>
