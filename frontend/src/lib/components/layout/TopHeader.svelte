<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { browser } from '$app/environment';
  import { songs as songsAPI } from '$lib/services/api';
  import { player } from '$lib/stores/player';
  import { searchStore } from '$lib/stores/search';
  import { authStore, isLoggedIn, currentUser } from '$lib/stores/auth';
  import { guestStore } from '$lib/stores/guest';
  import { preferences, availableDevices } from '$lib/stores/preferences';
  import type { Song } from '$lib/types';

  // Search state
  let searchQuery = '';
  let searchFocused = false;
  let searchInputEl: HTMLInputElement;

  // Reactively bind to central searchStore
  $: searchResults = $searchStore.results.slice(0, 8);
  $: isSearching = $searchStore.loading;

  // Sync search input with ?q= parameter on /search page or direct external links
  $: currentUrlQ = page.url.searchParams.get('q');
  $: if (currentUrlQ !== null && page.url.pathname === '/search' && !searchFocused && searchQuery !== currentUrlQ) {
    searchQuery = currentUrlQ;
    searchStore.setQuery(currentUrlQ, true);
  }

  // Account dropdown state
  let accountMenuOpen = false;

  // Modals state
  let showAccountModal = false;
  let showPremiumModal = false;
  let showSupportModal = false;
  let showSettingsModal = false;
  let showRecentsModal = false;

  // Feedback form inside Support Modal
  let supportFeedback = '';
  let supportSent = false;

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
    { label: 'Country', q: 'Country Music' },
    { label: 'Lo-Fi Chill', q: 'Lo-Fi Chill' }
  ];

  // React to keyboard shortcuts: Ctrl+K / Cmd+K / / to focus search
  function handleGlobalKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInputEl?.focus();
    } else if (e.key === 'Escape') {
      if (searchFocused) {
        searchFocused = false;
        searchInputEl?.blur();
      }
      if (accountMenuOpen) {
        accountMenuOpen = false;
      }
      closeAllModals();
    }
  }

  function closeAllModals() {
    showAccountModal = false;
    showPremiumModal = false;
    showSupportModal = false;
    showSettingsModal = false;
    showRecentsModal = false;
  }

  function handleSearchInput() {
    searchStore.setQuery(searchQuery);
  }

  function selectPill(q: string) {
    searchQuery = q;
    searchStore.setQuery(q, true);
    searchInputEl?.focus();
    if (page.url.pathname !== '/search') {
      goto(`/search?q=${encodeURIComponent(q)}`);
    } else {
      window.history.replaceState(null, '', `/search?q=${encodeURIComponent(q)}`);
    }
  }

  function playSearchResult(s: Song) {
    player.playSong(s, $searchStore.results);
    searchFocused = false;
  }

  function submitSearch() {
    if (searchQuery.trim()) {
      searchStore.setQuery(searchQuery.trim(), true);
      searchFocused = false;
      if (page.url.pathname !== '/search') {
        goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        window.history.replaceState(null, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  }

  function clearSearch() {
    searchQuery = '';
    searchStore.clear();
    searchInputEl?.focus();
    if (page.url.pathname === '/search') {
      window.history.replaceState(null, '', '/search');
    }
  }

  function toggleAccountMenu() {
    accountMenuOpen = !accountMenuOpen;
    if (accountMenuOpen) {
      searchFocused = false;
    }
  }

  function handleLogout() {
    accountMenuOpen = false;
    authStore.logout();
    guestStore.disableGuest();
    goto('/');
  }

  // Click outside listener for dropdowns
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.account-dropdown-wrapper')) {
      accountMenuOpen = false;
    }
    if (!target.closest('.artistic-search-container')) {
      searchFocused = false;
    }
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleGlobalKeyDown);
      window.addEventListener('click', handleClickOutside);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<header class="top-header">
  <!-- Center: The New Art Piece of Search (React Bits inspired glowing beam) -->
  <div class="artistic-search-container" class:focused={searchFocused}>
    <div class="beam-border-wrapper">
      <div class="search-inner-box">
        <!-- Search Icon with subtle radar glow -->
        <div class="search-icon-box" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="search-svg">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {#if isSearching}
            <span class="search-pulse"></span>
          {/if}
        </div>

        <!-- Input Field -->
        <input
          bind:this={searchInputEl}
          type="text"
          class="artistic-search-input"
          placeholder="Search tracks, artists, moods or press Ctrl+K..."
          bind:value={searchQuery}
          on:input={handleSearchInput}
          on:focus={() => (searchFocused = true)}
          on:keydown={(e) => e.key === 'Enter' && submitSearch()}
          aria-label="Search DIVERGE audio catalog"
        />

        <!-- Right actions in search bar: Clear & Keyboard shortcut pill -->
        <div class="search-right-controls">
          {#if searchQuery}
            <button class="clear-btn" on:click={clearSearch} aria-label="Clear search query" title="Clear">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          {/if}
          <kbd class="shortcut-pill" title="Press Ctrl+K to search anywhere">Ctrl K</kbd>
        </div>
      </div>
    </div>

    <!-- Live Search Dropdown Panel (React Bits interactive preview hub) -->
    {#if searchFocused}
      <div class="search-dropdown-hub">
        <!-- Quick Vibe Pills -->
        <div class="quick-pills-row">
          <span class="pills-title">Trending:</span>
          {#each quickPills as pill}
            <button
              class="vibe-pill"
              class:pill-active={searchQuery.toLowerCase() === pill.q.toLowerCase()}
              on:click={() => selectPill(pill.q)}
            >
              #{pill.label}
            </button>
          {/each}
        </div>

        <!-- Instant Results List -->
        {#if searchQuery.trim().length > 0}
          <div class="results-preview-section">
            <div class="results-header">
              <span class="results-count">
                {isSearching ? 'Searching...' : `${searchResults.length} Results`}
              </span>
            </div>

            {#if isSearching}
              <div class="search-loading-skeletons">
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
              </div>
            {:else if searchResults.length > 0}
              <div class="instant-results-list" role="listbox">
                {#each searchResults as song}
                  <div
                    class="instant-song-item"
                    role="option"
                    aria-selected="false"
                    tabindex="0"
                    on:click={() => playSearchResult(song)}
                    on:keydown={(e) => e.key === 'Enter' && playSearchResult(song)}
                  >
                    <div class="instant-art">
                      {#if song.album?.cover_url}
                        <img src={song.album.cover_url} alt={song.title} />
                      {:else}
                        <div class="instant-art-fallback">♫</div>
                      {/if}
                      <button class="instant-play-overlay" aria-label="Play {song.title}">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </button>
                    </div>
                    <div class="instant-meta">
                      <span class="instant-title">{song.title}</span>
                      <span class="instant-artist">{song.artist?.name || 'Unknown Artist'}</span>
                    </div>
                    <div class="instant-tags">
                      {#if song.genre}
                        <span class="instant-badge">{song.genre}</span>
                      {/if}
                      <span class="instant-hi-fi">LOSSLESS</span>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="no-results-box">
                <p>No tracks found for "{searchQuery}".</p>
                <button class="btn btn-primary btn-sm" on:click={submitSearch}>
                  Search Full Catalog
                </button>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Right Section: Status Pills + Account Dropdown -->
  <div class="header-right-actions">
    <!-- Private Session Badge (if active) -->
    {#if $preferences.privateSession}
      <div class="private-badge" title="Private Session Active: History and Trace tracking are paused">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Private Session</span>
      </div>
    {/if}

    <!-- Lossless Hi-Fi Studio Pill -->
    <div class="hi-fi-pill" title="Audio Engine: 24-bit 96kHz Master FLAC Direct">
      <span class="hi-fi-dot"></span>
      <span>STUDIO HI-FI</span>
    </div>

    <!-- Account Button & Dropdown Menu Wrapper -->
    <div class="account-dropdown-wrapper">
      <button
        class="account-avatar-btn"
        on:click|stopPropagation={toggleAccountMenu}
        aria-label="Account menu"
        aria-expanded={accountMenuOpen}
        title={$currentUser ? $currentUser.username : 'Account menu'}
      >
        {#if $currentUser}
          <div class="avatar-circle">
            {$currentUser.username[0].toUpperCase()}
          </div>
        {:else}
          <div class="avatar-circle guest-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        {/if}
      </button>

      <!-- ═══════════════════════════════════════════════════════════════════
           ACCOUNT DROPDOWN MENU (MATCHING EXACT SCREENSHOT FROM USER)
           ═══════════════════════════════════════════════════════════════════ -->
      {#if accountMenuOpen}
        <div class="account-menu-popover" role="menu">
          <!-- 1. Account (external link icon) -->
          <button
            class="menu-item"
            role="menuitem"
            on:click={() => { accountMenuOpen = false; showAccountModal = true; }}
          >
            <span class="item-label">Account</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="item-ext-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>

          <!-- 2. Profile -->
          <button
            class="menu-item"
            role="menuitem"
            on:click={() => { accountMenuOpen = false; goto('/profile'); }}
          >
            <span class="item-label">Profile</span>
          </button>

          <!-- 3. Recents -->
          <button
            class="menu-item"
            role="menuitem"
            on:click={() => { accountMenuOpen = false; showRecentsModal = true; }}
          >
            <span class="item-label">Recents</span>
          </button>

          <!-- 4. Upgrade to Premium -->
          <button
            class="menu-item"
            role="menuitem"
            on:click={() => { accountMenuOpen = false; showPremiumModal = true; }}
          >
            <span class="item-label">Upgrade to Premium</span>
          </button>

          <!-- 5. Support (external link icon) -->
          <button
            class="menu-item"
            role="menuitem"
            on:click={() => { accountMenuOpen = false; showSupportModal = true; }}
          >
            <span class="item-label">Support</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="item-ext-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>

          <!-- 6. Private session (with toggle) -->
          <button
            class="menu-item menu-item-toggle"
            role="menuitem"
            on:click={() => preferences.togglePrivateSession()}
          >
            <span class="item-label">Private session</span>
            <div class="toggle-switch" class:toggle-on={$preferences.privateSession}>
              <div class="toggle-thumb"></div>
            </div>
          </button>

          <!-- 7. Settings -->
          <button
            class="menu-item"
            role="menuitem"
            on:click={() => { accountMenuOpen = false; showSettingsModal = true; }}
          >
            <span class="item-label">Settings</span>
          </button>

          <!-- 8. Log out -->
          <button
            class="menu-item"
            role="menuitem"
            on:click={handleLogout}
          >
            <span class="item-label">Log out</span>
          </button>

          <!-- Divider -->
          <div class="menu-divider"></div>

          <!-- Section: Your Updates -->
          <div class="updates-section">
            <h4 class="updates-heading">Your Updates</h4>
            <div class="updates-content">
              <!-- Checkmark icon matching user screenshot -->
              <div class="checkmark-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="22" height="22">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h5 class="caught-up-title">You're all caught up</h5>
              <p class="caught-up-desc">
                Watch this space for news on your followers, playlists, events and more.
              </p>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</header>

<!-- ═══════════════════════════════════════════════════════════════════════════
     MODALS FOR ACCOUNT DROPDOWN ACTIONS
     ═══════════════════════════════════════════════════════════════════════════ -->

<!-- 1. Account Overview Modal -->
{#if showAccountModal}
  <div class="modal-backdrop" on:click={closeAllModals} on:keydown={(e) => e.key === 'Escape' && closeAllModals()} role="presentation">
    <div class="modal-card" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <div class="modal-title-row">
          <div class="modal-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3>Account Overview</h3>
        </div>
        <button class="modal-close-btn" on:click={closeAllModals}>✕</button>
      </div>

      <div class="modal-body">
        <div class="account-card-hero">
          <div class="account-avatar-large">
            {$currentUser ? $currentUser.username[0].toUpperCase() : 'G'}
          </div>
          <div class="account-details">
            <div class="account-username">{$currentUser ? $currentUser.username : 'Guest Explorer'}</div>
            <div class="account-email text-muted">{$currentUser ? $currentUser.email : 'guest@diverge.stream'}</div>
            <div class="tier-badge-pill">DIVERGE Studio Member (Lossless Tier)</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-cell">
            <span class="info-label">Audio Stream Engine</span>
            <span class="info-val text-accent">FLAC 24-bit / 96kHz Lossless</span>
          </div>
          <div class="info-cell">
            <span class="info-label">Active Device</span>
            <span class="info-val">{$preferences.activeDevice.name}</span>
          </div>
          <div class="info-cell">
            <span class="info-label">Acoustic Trace</span>
            <span class="info-val">Autonomous DNA Engine Active</span>
          </div>
          <div class="info-cell">
            <span class="info-label">Private Session</span>
            <span class="info-val">{$preferences.privateSession ? 'Enabled (No History)' : 'Standard Logging'}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" on:click={closeAllModals}>Close</button>
        <button class="btn btn-primary" on:click={() => { closeAllModals(); goto('/profile'); }}>View Full Profile</button>
      </div>
    </div>
  </div>
{/if}

<!-- 2. Upgrade to Premium Modal -->
{#if showPremiumModal}
  <div class="modal-backdrop" on:click={closeAllModals} on:keydown={(e) => e.key === 'Escape' && closeAllModals()} role="presentation">
    <div class="modal-card modal-premium" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <div class="modal-title-row">
          <span class="premium-star-icon">★</span>
          <h3>DIVERGE Studio Lossless</h3>
        </div>
        <button class="modal-close-btn" on:click={closeAllModals}>✕</button>
      </div>

      <div class="modal-body">
        <p class="premium-tagline">
          Hear music exactly as the artists and mastering engineers intended in the studio.
        </p>

        <div class="premium-features-list">
          <div class="feat-item">
            <span class="feat-check">✓</span>
            <div>
              <strong>Studio Master Lossless (24-bit / 96kHz FLAC)</strong>
              <p class="text-faint">Direct bit-perfect streaming with zero compression artifacts.</p>
            </div>
          </div>
          <div class="feat-item">
            <span class="feat-check">✓</span>
            <div>
              <strong>Unlimited Offline Sound Cache</strong>
              <p class="text-faint">Save high-resolution albums locally for zero-latency playback.</p>
            </div>
          </div>
          <div class="feat-item">
            <span class="feat-check">✓</span>
            <div>
              <strong>Acoustic DNA & Anti-Algorithm Radar</strong>
              <p class="text-faint">Escape algorithmic filter bubbles and discover genuinely fresh soundscapes.</p>
            </div>
          </div>
          <div class="feat-item">
            <span class="feat-check">✓</span>
            <div>
              <strong>Pure Soundstage (Zero Ads)</strong>
              <p class="text-faint">Uninterrupted high-fidelity listening with synchronized multi-device cast.</p>
            </div>
          </div>
        </div>

        <div class="pricing-card">
          <div class="pricing-badge">Beta Privilege</div>
          <div class="pricing-amount">$0 <span class="pricing-term">/ forever for pioneer members</span></div>
          <div class="pricing-desc">All master studio features unlocked across your account.</div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" on:click={closeAllModals}>Keep Current Tier</button>
        <button class="btn btn-accent" on:click={closeAllModals}>Activate Studio Pass</button>
      </div>
    </div>
  </div>
{/if}

<!-- 3. Support & Help Modal -->
{#if showSupportModal}
  <div class="modal-backdrop" on:click={closeAllModals} on:keydown={(e) => e.key === 'Escape' && closeAllModals()} role="presentation">
    <div class="modal-card" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <div class="modal-title-row">
          <div class="modal-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h3>Help & Audio Support</h3>
        </div>
        <button class="modal-close-btn" on:click={closeAllModals}>✕</button>
      </div>

      <div class="modal-body">
        <div class="faq-item">
          <h5>How does DIVERGE stream Lossless Audio?</h5>
          <p class="text-muted">DIVERGE delivers bit-perfect audio through direct audio streams encoded in 320kbps AAC and studio 24-bit FLAC containers, ensuring no algorithmic dynamic range compression.</p>
        </div>

        <div class="faq-item">
          <h5>What is the "Anti-Algorithm"?</h5>
          <p class="text-muted">Unlike traditional recommendation models that trap you in echo chambers, DIVERGE calculates acoustic vector divergence to purposefully recommend tracks outside your usual bubble.</p>
        </div>

        <div class="faq-item">
          <h5>How do I manage my Private Session?</h5>
          <p class="text-muted">Toggle "Private Session" in the top-right account menu anytime. While active, songs you stream are not recorded in your Trace history.</p>
        </div>

        <div class="support-contact-box">
          <h5>Need direct engineering support?</h5>
          {#if supportSent}
            <div class="support-success-msg">✓ Your feedback has been received. Thank you!</div>
          {:else}
            <textarea
              class="support-textarea"
              placeholder="Describe your issue or audio experience..."
              bind:value={supportFeedback}
            ></textarea>
            <button
              class="btn btn-primary btn-sm"
              disabled={!supportFeedback.trim()}
              on:click={() => { supportSent = true; }}
            >
              Send Support Message
            </button>
          {/if}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" on:click={closeAllModals}>Done</button>
      </div>
    </div>
  </div>
{/if}

<!-- 4. Settings Modal -->
{#if showSettingsModal}
  <div class="modal-backdrop" on:click={closeAllModals} on:keydown={(e) => e.key === 'Escape' && closeAllModals()} role="presentation">
    <div class="modal-card" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <div class="modal-title-row">
          <div class="modal-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <h3>DIVERGE Settings</h3>
        </div>
        <button class="modal-close-btn" on:click={closeAllModals}>✕</button>
      </div>

      <div class="modal-body settings-body">
        <!-- Audio Quality -->
        <div class="setting-row">
          <div>
            <label class="setting-title" for="audio-quality-select">Audio Streaming Quality</label>
            <p class="setting-desc">Master lossless requires stable high-speed bandwidth.</p>
          </div>
          <select
            id="audio-quality-select"
            class="setting-select"
            value={$preferences.audioQuality}
            on:change={(e) => preferences.setAudioQuality(e.currentTarget.value)}
          >
            <option value="lossless_24bit">Lossless (24-bit / 96kHz Direct FLAC)</option>
            <option value="high_320kbps">Studio High (320 kbps AAC)</option>
            <option value="standard_160kbps">Standard Bandwidth (160 kbps)</option>
          </select>
        </div>

        <!-- Crossfade -->
        <div class="setting-row">
          <div>
            <span class="setting-title">Crossfade Duration: {$preferences.crossfade}s</span>
            <p class="setting-desc">Overlap between track endings and beginnings.</p>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            class="setting-slider"
            value={$preferences.crossfade}
            on:input={(e) => preferences.setCrossfade(Number(e.currentTarget.value))}
          />
        </div>

        <!-- Normalization -->
        <div class="setting-row">
          <div>
            <span class="setting-title">Volume Normalization</span>
            <p class="setting-desc">Sets consistent perceived loudness (-14 LUFS standard).</p>
          </div>
          <button
            class="toggle-switch"
            class:toggle-on={$preferences.normalizeVolume}
            on:click={() => preferences.setNormalize(!$preferences.normalizeVolume)}
          >
            <div class="toggle-thumb"></div>
          </button>
        </div>

        <!-- SlicedWaves Ambient Background -->
        <div class="setting-row">
          <div>
            <span class="setting-title">@react-bits/SlicedWaves Ambient Canvas</span>
            <p class="setting-desc">40% opacity reactive slatted wave background.</p>
          </div>
          <button
            class="toggle-switch"
            class:toggle-on={$preferences.slicedWavesEnabled}
            on:click={() => preferences.setSlicedWaves(!$preferences.slicedWavesEnabled)}
          >
            <div class="toggle-thumb"></div>
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary" on:click={closeAllModals}>Save & Apply</button>
      </div>
    </div>
  </div>
{/if}

<!-- 5. Recents Drawer / Modal -->
{#if showRecentsModal}
  <div class="modal-backdrop" on:click={closeAllModals} on:keydown={(e) => e.key === 'Escape' && closeAllModals()} role="presentation">
    <div class="modal-card" on:click|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <div class="modal-title-row">
          <div class="modal-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3>Recently Played Tracks</h3>
        </div>
        <button class="modal-close-btn" on:click={closeAllModals}>✕</button>
      </div>

      <div class="modal-body">
        {#if $player.queue.length > 0}
          <div class="recents-list">
            {#each $player.queue.slice(0, 10) as s}
              <button type="button" class="recent-song-row recent-song-btn" on:click={() => { player.playSong(s, $player.queue); closeAllModals(); }}>
                <div class="recent-art">
                  {#if s.album?.cover_url}
                    <img src={s.album.cover_url} alt={s.title} />
                  {:else}
                    <div class="fallback-disc">♫</div>
                  {/if}
                </div>
                <div class="recent-meta">
                  <span class="recent-title">{s.title}</span>
                  <span class="recent-artist text-muted">{s.artist?.name || 'Artist'}</span>
                </div>
                <div class="btn btn-icon btn-sm" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </button>
            {/each}
          </div>
        {:else}
          <div class="empty-recents">
            <p>No recent tracks yet. Stream any song to build your listening history.</p>
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" on:click={() => { closeAllModals(); goto('/trace'); }}>View Acoustic Trace</button>
        <button class="btn btn-primary" on:click={closeAllModals}>Done</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ─── Top Header Layout (10% scale reduction from baseline) ────────────────── */
  .top-header {
    height: 65px;
    padding: 0 1.6rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.35rem;
    background: rgba(18, 16, 27, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 60;
  }

  /* ─── The New Art Piece of Search (React Bits / Magic UI beam border) ───── */
  .artistic-search-container {
    position: relative;
    flex: 1;
    max-width: 580px;
  }

  .beam-border-wrapper {
    position: relative;
    border-radius: var(--radius-full);
    padding: 1.5px;
    background: linear-gradient(135deg, rgba(120, 75, 255, 0.4), rgba(255, 92, 88, 0.35), rgba(255, 174, 51, 0.25));
    transition: all 0.3s ease;
  }

  .artistic-search-container.focused .beam-border-wrapper {
    background: linear-gradient(90deg, #784BFF, #FF5C58, #FFAE33, #784BFF);
    background-size: 300% 300%;
    animation: beamGlow 4s linear infinite;
    box-shadow: 0 0 25px rgba(120, 75, 255, 0.35), 0 0 10px rgba(255, 92, 88, 0.25);
  }

  @keyframes beamGlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .search-inner-box {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    background: var(--color-bg);
    border-radius: var(--radius-full);
    padding: 0.45rem 0.95rem 0.45rem 0.85rem;
    height: 40px;
  }

  .search-icon-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
  }

  .search-svg {
    width: 16.5px;
    height: 16.5px;
    transition: color 0.2s ease;
  }

  .artistic-search-container.focused .search-svg {
    color: var(--color-primary);
  }

  .search-pulse {
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid var(--color-accent);
    animation: radarPing 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  @keyframes radarPing {
    0% { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(1.6); opacity: 0; }
  }

  .artistic-search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text);
    font-size: var(--text-sm);
    font-family: inherit;
    font-weight: 500;
  }

  .artistic-search-input::placeholder {
    color: var(--color-text-faint);
  }

  .search-right-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .clear-btn {
    background: transparent;
    border: none;
    color: var(--color-text-faint);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border-radius: 50%;
  }
  .clear-btn svg { width: 15px; height: 15px; }
  .clear-btn:hover { color: var(--color-text); }

  .shortcut-pill {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    color: var(--color-text-faint);
    padding: 0.15rem 0.45rem;
    border-radius: var(--radius-xs);
    font-size: 0.68rem;
    font-family: inherit;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  /* ─── Search Dropdown Hub ────────────────────────────────────────────────── */
  .search-dropdown-hub {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: #12101B;
    border: 1px solid var(--color-border-hover);
    border-radius: var(--radius-lg);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(120, 75, 255, 0.25);
    padding: 1rem;
    z-index: 1000;
    animation: fadeInSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeInSlide {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .quick-pills-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .pills-title {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-right: 0.25rem;
  }

  .vibe-pill {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 500;
    padding: 0.25rem 0.65rem;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .vibe-pill:hover, .vibe-pill.pill-active {
    background: rgba(120, 75, 255, 0.18);
    border-color: var(--color-primary);
    color: #FFFFFF;
    transform: translateY(-1px);
  }

  .results-preview-section {
    padding-top: 0.75rem;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: var(--text-xs);
  }

  .results-count {
    color: var(--color-text-faint);
    font-weight: 600;
  }

  .instant-results-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    max-height: 290px;
    overflow-y: auto;
  }

  .instant-song-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.65rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .instant-song-item:hover {
    background: var(--color-surface-raised);
  }

  .instant-art {
    position: relative;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    background: var(--color-surface-sunken);
    flex-shrink: 0;
  }
  .instant-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .instant-art-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--color-text-faint);
    font-size: 1.1rem;
  }

  .instant-play-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    opacity: 0;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .instant-song-item:hover .instant-play-overlay {
    opacity: 1;
  }

  .instant-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .instant-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .instant-artist {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .instant-tags {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .instant-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    border-radius: var(--radius-full);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
  }

  .instant-hi-fi {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--color-brand-gold);
    letter-spacing: 0.05em;
  }

  .search-loading-skeletons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }
  .skeleton-row {
    height: 38px;
    border-radius: var(--radius-sm);
    background: linear-gradient(90deg, var(--color-surface-raised) 25%, var(--color-border) 50%, var(--color-surface-raised) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .no-results-box {
    padding: 1.25rem;
    text-align: center;
    color: var(--color-text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  /* ─── Right Section ──────────────────────────────────────────────────────── */
  .header-right-actions {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .private-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-full);
    background: rgba(120, 75, 255, 0.16);
    border: 1px solid var(--color-primary);
    color: #D3C5FF;
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.02em;
    animation: fadeIn 0.2s ease;
  }

  .hi-fi-pill {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-full);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    color: var(--color-brand-gold);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .hi-fi-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-brand-gold);
    box-shadow: 0 0 6px var(--color-brand-gold);
  }

  /* ─── Account Button & Popover ───────────────────────────────────────────── */
  .account-dropdown-wrapper {
    position: relative;
  }

  .account-avatar-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    border-radius: 50%;
    transition: transform 0.15s ease;
  }
  .account-avatar-btn:hover {
    transform: scale(1.06);
  }

  .avatar-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #784BFF, #FF5C58);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-weight: 700;
    font-size: var(--text-sm);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    border: 2px solid var(--color-surface-raised);
  }

  .guest-avatar {
    background: var(--color-surface-raised);
    color: var(--color-text-muted);
    border: 2px solid var(--color-border);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     ACCOUNT DROPDOWN MENU — EXACT REPLICA OF USER SCREENSHOT
     ═══════════════════════════════════════════════════════════════════════════ */
  .account-menu-popover {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 275px;
    max-height: calc(100vh - 75px);
    overflow-y: auto;
    background: #181818; /* Dark charcoal card matching user screenshot */
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9px;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75), 0 2px 8px rgba(0, 0, 0, 0.5);
    padding: 0.4rem 0;
    z-index: 1000;
    font-family: inherit;
  }

  .menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1.15rem;
    background: transparent;
    border: none;
    color: #FFFFFF;
    font-size: 0.88rem;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s ease;
  }
  .menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .item-label {
    flex: 1;
  }

  .item-ext-icon {
    width: 15px;
    height: 15px;
    color: #A0A0A0;
    flex-shrink: 0;
  }

  .menu-item-toggle {
    cursor: pointer;
  }

  /* Custom toggle switch matching native feel */
  .toggle-switch {
    width: 34px;
    height: 19px;
    background: #333333;
    border-radius: 11px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s ease;
    border: none;
    padding: 0;
  }
  .toggle-switch.toggle-on {
    background: var(--color-primary);
  }
  .toggle-thumb {
    width: 15px;
    height: 15px;
    background: #FFFFFF;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s ease;
  }
  .toggle-switch.toggle-on .toggle-thumb {
    transform: translateX(15px);
  }

  .menu-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0.35rem 0 0.6rem;
  }

  /* ─── "Your Updates" Section (Exact replica of user screenshot) ───────────── */
  .updates-section {
    padding: 0 1.15rem 0.65rem;
  }

  .updates-heading {
    font-size: 0.9rem;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 0.85rem;
  }

  .updates-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0.4rem 0.25rem 0.4rem;
  }

  .checkmark-icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    margin-bottom: 0.75rem;
  }

  .caught-up-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 0.35rem;
  }

  .caught-up-desc {
    font-size: 0.78rem;
    line-height: 1.45;
    color: #B3B3B3;
  }

  /* ─── Generic Modal Architecture ─────────────────────────────────────────── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1.35rem;
  }

  .modal-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85);
    width: 100%;
    max-width: 490px;
    max-height: calc(100vh - 65px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes modalPop {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .modal-header {
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .modal-title-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }
  .modal-title-row h3 {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-text);
  }

  .modal-icon-badge {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: rgba(120, 75, 255, 0.15);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close-btn {
    background: none;
    border: none;
    color: var(--color-text-faint);
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem;
  }
  .modal-close-btn:hover { color: var(--color-text); }

  .modal-body {
    padding: 1.5rem;
    max-height: 70vh;
    overflow-y: auto;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    background: var(--color-surface-sunken);
    border-top: 1px solid var(--color-border-subtle);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  /* Account Overview Styles */
  .account-card-hero {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--color-border-subtle);
    margin-bottom: 1.25rem;
  }

  .account-avatar-large {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #784BFF, #FF5C58);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 1.75rem;
    font-weight: 800;
  }

  .account-username {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text);
  }

  .tier-badge-pill {
    display: inline-block;
    margin-top: 0.35rem;
    background: rgba(255, 174, 51, 0.15);
    border: 1px solid rgba(255, 174, 51, 0.4);
    color: var(--color-brand-gold);
    font-size: var(--text-xs);
    font-weight: 700;
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-full);
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .info-cell {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    padding: 0.85rem;
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-label {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-val {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  /* Premium Modal Styles */
  .modal-premium {
    max-width: 560px;
  }
  .premium-star-icon {
    color: var(--color-brand-gold);
    font-size: 1.5rem;
  }
  .premium-tagline {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    margin-bottom: 1.25rem;
  }

  .premium-features-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .feat-item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .feat-check {
    color: var(--color-success);
    font-weight: 800;
    font-size: 1.1rem;
  }

  .pricing-card {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-primary-dim);
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    text-align: center;
  }

  .pricing-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    background: var(--color-primary);
    color: #FFFFFF;
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-full);
    text-transform: uppercase;
    margin-bottom: 0.35rem;
  }

  .pricing-amount {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-text);
  }
  .pricing-term {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-weight: normal;
  }

  /* Support Modal Styles */
  .faq-item {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-border-subtle);
  }
  .faq-item h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.25rem;
  }
  .faq-item p {
    font-size: var(--text-xs);
    line-height: 1.5;
  }

  .support-contact-box {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .support-contact-box h5 {
    font-size: var(--text-sm);
    font-weight: 600;
  }
  .support-textarea {
    width: 100%;
    height: 70px;
    background: var(--color-surface-sunken);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 0.5rem;
    color: var(--color-text);
    font-family: inherit;
    font-size: var(--text-xs);
    resize: none;
  }
  .support-success-msg {
    color: var(--color-success);
    font-size: var(--text-sm);
    font-weight: 600;
  }

  /* Settings Modal Styles */
  .settings-body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .setting-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }
  .setting-desc {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
  }

  .setting-select {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-family: inherit;
  }

  .setting-slider {
    width: 140px;
    accent-color: var(--color-primary);
  }

  /* Recents Modal Styles */
  .recents-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .recent-song-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: var(--radius-sm);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .recent-song-btn {
    width: 100%;
    text-align: left;
    font-family: inherit;
    color: inherit;
  }
  .recent-song-row:hover {
    background: var(--color-surface-hover, rgba(255, 255, 255, 0.06));
  }

  .recent-art {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    background: #000;
    flex-shrink: 0;
  }
  .recent-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .fallback-disc {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-faint);
  }

  .recent-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .recent-title {
    font-size: var(--text-sm);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .recent-artist {
    font-size: var(--text-xs);
  }
  .empty-recents {
    text-align: center;
    color: var(--color-text-muted);
    padding: 2rem 1rem;
    font-size: var(--text-sm);
  }
</style>
