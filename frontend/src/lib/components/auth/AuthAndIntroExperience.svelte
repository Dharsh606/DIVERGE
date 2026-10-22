<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { authStore } from '$lib/stores/auth';
  import { guestStore } from '$lib/stores/guest';
  import { goto } from '$app/navigation';

  export let initialTab: 'login' | 'signup' = 'login';
  export let skipSplash = false;
  export let forceSplash = false;

  const dispatch = createEventDispatcher();

  // Splash animation state: only play on very first visit if never seen before, or if user explicitly requested replay
  const alreadySeenSplash = browser && (
    sessionStorage.getItem('diverge_splash_seen') === 'true' ||
    localStorage.getItem('diverge_splash_seen') === 'true'
  );
  let splashActive = forceSplash || (!skipSplash && !alreadySeenSplash);
  let splashExiting = false;
  let splashProgress = 0;
  let splashTimer: any = null;

  // Auth form state
  let activeTab: 'login' | 'signup' = initialTab;
  let email = '';
  let password = '';
  let username = '';
  let showPassword = false;
  let errorMsg = '';
  let submitting = false;

  // React Bits Spotlight Card cursor tracking
  let cardRef: HTMLDivElement;
  let mouseX = 0;
  let mouseY = 0;
  let isCardHovered = false;

  // Password strength score (0-4)
  $: passwordStrength = calculateStrength(password);

  function calculateStrength(pass: string): number {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 6) s += 1;
    if (pass.length >= 10) s += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) s += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) s += 1;
    return s;
  }

  onMount(() => {
    if (splashActive) {
      const startTime = Date.now();
      const duration = 3500; // 3.5 seconds cinematic intro

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        splashProgress = Math.min((elapsed / duration) * 100, 100);

        if (elapsed >= duration) {
          clearInterval(interval);
          finishSplash();
        }
      }, 30);

      splashTimer = interval;
    }

    return () => {
      if (splashTimer) clearInterval(splashTimer);
    };
  });

  function finishSplash() {
    if (browser) {
      sessionStorage.setItem('diverge_splash_seen', 'true');
      localStorage.setItem('diverge_splash_seen', 'true');
    }
    splashExiting = true;
    setTimeout(() => {
      splashActive = false;
      splashExiting = false;
    }, 550);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!cardRef) return;
    const rect = cardRef.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  async function handleAuthSubmit(e: Event) {
    e.preventDefault();
    errorMsg = '';

    if (activeTab === 'signup' && password.length < 6) {
      errorMsg = 'Password must be at least 6 characters.';
      return;
    }

    submitting = true;

    try {
      if (activeTab === 'login') {
        await authStore.login(email.trim(), password);
      } else {
        await authStore.register(username.trim(), email.trim(), password);
      }
      guestStore.disableGuest();
      if (browser) {
        localStorage.setItem('diverge_splash_seen', 'true');
        sessionStorage.setItem('diverge_splash_seen', 'true');
      }
      dispatch('success');
      goto('/');
    } catch (err: any) {
      errorMsg = err.message || (activeTab === 'login' ? 'Invalid email or password.' : 'Registration failed. Try a different username/email.');
    } finally {
      submitting = false;
    }
  }

  function continueAsGuest() {
    guestStore.enableGuest();
    if (browser) {
      localStorage.setItem('diverge_splash_seen', 'true');
      sessionStorage.setItem('diverge_splash_seen', 'true');
    }
    dispatch('success');
    goto('/');
  }

  function switchTab(tab: 'login' | 'signup') {
    activeTab = tab;
    errorMsg = '';
  }
</script>

<div class="auth-intro-container">
  <!-- Dynamic Ambient Aurora Mesh (Smooth CSS Motion) -->
  <div class="aurora-mesh" aria-hidden="true"></div>

  <!-- ═══════════════════════════════════════════════════════════════════════
       STAGE 1: CINEMATIC 3.5s DIVERGE LOGO SPLASH
       ═══════════════════════════════════════════════════════════════════════ -->
  {#if splashActive}
    <div class="splash-overlay" class:exiting={splashExiting}>
      <!-- Skip intro button -->
      <button class="skip-btn" on:click={finishSplash} aria-label="Skip splash intro">
        <span>Skip intro</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- Acoustic Harmonic Wave Pulses (Expanding Rings) -->
      <div class="harmonic-ring ring-1" aria-hidden="true"></div>
      <div class="harmonic-ring ring-2" aria-hidden="true"></div>
      <div class="harmonic-ring ring-3" aria-hidden="true"></div>

      <!-- Center Logo & Branding Stage -->
      <div class="splash-center">
        <!-- 3D Logo Mark with dynamic light reflection -->
        <div class="splash-logo-stage">
          <div class="logo-aura-glow" aria-hidden="true"></div>
          <img src="/logo-mark.png" alt="DIVERGE" class="splash-logo-img" />
          <div class="logo-light-sweep" aria-hidden="true"></div>
        </div>

        <!-- Typography Stagger Reveal -->
        <div class="splash-text-stage">
          <h1 class="splash-brand-title">DIVERGE</h1>
          <p class="splash-tagline">Take the uncommon route.</p>
        </div>

        <!-- Cinematic High-Precision Progress Scrubber -->
        <div class="splash-progress-stage">
          <div class="progress-track">
            <div class="progress-bar-fill" style="width: {splashProgress}%;"></div>
          </div>
          <div class="frequency-bars" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- ═══════════════════════════════════════════════════════════════════════
       STAGE 2: HIGH-END SPOTLIGHT & BORDER-BEAM AUTH CARD
       ═══════════════════════════════════════════════════════════════════════ -->
  <div class="auth-card-stage" class:revealed={!splashActive}>
    <div
      bind:this={cardRef}
      class="luxury-auth-card"
      on:mousemove={handleMouseMove}
      on:mouseenter={() => (isCardHovered = true)}
      on:mouseleave={() => (isCardHovered = false)}
      role="region"
      aria-label="Account Authentication"
    >
      <!-- Magic UI Inspired Border Beam (Rotating Conic Mask) -->
      <div class="border-beam-ring" aria-hidden="true"></div>

      <!-- React Bits Inspired Interactive Spotlight Cursor Tracker -->
      <div
        class="spotlight-radial-layer"
        style="opacity: {isCardHovered ? 1 : 0}; background: radial-gradient(550px circle at {mouseX}px {mouseY}px, rgba(120, 75, 255, 0.22), rgba(255, 92, 88, 0.10), transparent 60%);"
        aria-hidden="true"
      ></div>

      <!-- Card Top Accent -->
      <div class="card-brand-topline" aria-hidden="true"></div>

      <!-- Header with DIVERGE Emblem -->
      <div class="card-header">
        <a href="/" class="brand-badge-link" aria-label="DIVERGE">
          <img src="/logo-mark.png" alt="DIVERGE" class="header-logo-icon" />
          <span class="header-brand-text">DIVERGE</span>
        </a>
        <h2 class="card-title">
          {activeTab === 'login' ? 'Welcome back' : 'Join the Vanguard'}
        </h2>
        <p class="card-subtitle">
          {activeTab === 'login'
            ? 'Sign in to access your curated catalog, playlists, and acoustic trace.'
            : 'Explore music beyond algorithmic echo chambers and create shared sessions.'}
        </p>
      </div>

      <!-- Fluid Segmented Tab Switcher (Apple / Linear Style) -->
      <div class="tab-switcher" role="tablist" aria-label="Authentication mode">
        <div class="tab-slider" class:is-signup={activeTab === 'signup'} aria-hidden="true"></div>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'login'}
          class="tab-btn"
          class:active={activeTab === 'login'}
          on:click={() => switchTab('login')}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'signup'}
          class="tab-btn"
          class:active={activeTab === 'signup'}
          on:click={() => switchTab('signup')}
        >
          Create Account
        </button>
      </div>

      <!-- Error Notification -->
      {#if errorMsg}
        <div class="alert-box" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="alert-icon">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{errorMsg}</span>
        </div>
      {/if}

      <!-- Interactive Form -->
      <form on:submit={handleAuthSubmit} class="form-body">
        {#if activeTab === 'signup'}
          <div class="input-group">
            <label for="auth-username">Username</label>
            <div class="input-shell">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                id="auth-username"
                type="text"
                required
                autocomplete="username"
                placeholder="your_handle"
                bind:value={username}
                class="luxury-input"
              />
            </div>
          </div>
        {/if}

        <div class="input-group">
          <label for="auth-email">Email Address</label>
          <div class="input-shell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            <input
              id="auth-email"
              type="email"
              required
              autocomplete="email"
              placeholder="name@example.com"
              bind:value={email}
              class="luxury-input"
            />
          </div>
        </div>

        <div class="input-group">
          <div class="label-header">
            <label for="auth-password">Password</label>
            {#if activeTab === 'signup' && password}
              <span class="strength-tag" class:strong={passwordStrength >= 3}>
                {passwordStrength <= 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
              </span>
            {/if}
          </div>
          <div class="input-shell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              minlength="6"
              autocomplete={activeTab === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              bind:value={password}
              class="luxury-input"
            />
            <button
              type="button"
              class="pwd-toggle-btn"
              on:click={() => (showPassword = !showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {#if showPassword}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              {/if}
            </button>
          </div>

          <!-- Password strength visualizer for signup -->
          {#if activeTab === 'signup'}
            <div class="strength-track" aria-hidden="true">
              <div class="strength-step" class:active={passwordStrength >= 1} class:step-1={passwordStrength >= 1}></div>
              <div class="strength-step" class:active={passwordStrength >= 2} class:step-2={passwordStrength >= 2}></div>
              <div class="strength-step" class:active={passwordStrength >= 3} class:step-3={passwordStrength >= 3}></div>
              <div class="strength-step" class:active={passwordStrength >= 4} class:step-4={passwordStrength >= 4}></div>
            </div>
          {/if}
        </div>

        <!-- High-Impact Submit Button with Shimmer & Equalizer Loader -->
        <button type="submit" class="luxury-submit-btn" disabled={submitting}>
          <div class="btn-shimmer" aria-hidden="true"></div>
          {#if submitting}
            <div class="btn-equalizer-loader" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </div>
            <span>{activeTab === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
          {:else}
            <span>{activeTab === 'login' ? 'Sign In to DIVERGE' : 'Create My Account'}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16" class="btn-arrow">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          {/if}
        </button>
      </form>

      <!-- Guest / Catalog Exploration Route -->
      <div class="guest-route-divider">
        <span>or</span>
      </div>

      <button type="button" class="guest-explore-btn" on:click={continueAsGuest}>
        <span>Explore catalog without account</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- Legal Links -->
      <div class="card-footer-legal">
        <a href="/privacy">Privacy</a>
        <span>&bull;</span>
        <a href="/terms">Terms</a>
        <span>&bull;</span>
        <span>Lossless 320kbps Audio</span>
      </div>
    </div>
  </div>
</div>

<style>
  /* ─── Viewport Container ───────────────────────────────────────────────── */
  .auth-intro-container {
    min-height: 100dvh;
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.25rem;
    background: #0A0912;
    overflow: hidden;
  }

  /* ─── Dynamic Ambient Aurora Mesh ──────────────────────────────────────── */
  .aurora-mesh {
    position: absolute;
    inset: -50%;
    width: 200%;
    height: 200%;
    background-image:
      radial-gradient(ellipse 45% 35% at 50% 20%, rgba(120, 75, 255, 0.14) 0%, transparent 65%),
      radial-gradient(ellipse 40% 30% at 75% 70%, rgba(255, 92, 88, 0.10) 0%, transparent 60%),
      radial-gradient(ellipse 35% 35% at 25% 75%, rgba(120, 75, 255, 0.08) 0%, transparent 65%);
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
    animation: aurora-drift 18s ease-in-out infinite alternate;
  }

  @keyframes aurora-drift {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(-3%, 2%) scale(1.05); }
    100% { transform: translate(3%, -2%) scale(0.98); }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     STAGE 1: CINEMATIC SPLASH SCREEN
     ═══════════════════════════════════════════════════════════════════════ */
  .splash-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: #0A0912;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .splash-overlay.exiting {
    opacity: 0;
    transform: scale(1.05);
    pointer-events: none;
  }

  .skip-btn {
    position: absolute;
    top: 2rem;
    right: 2rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--t-fast) ease;
    z-index: 110;
  }
  .skip-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* Expanding Acoustic Harmonic Wave Rings */
  .harmonic-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    border: 1px solid rgba(120, 75, 255, 0.3);
    transform: translate(-50%, -50%) scale(0.2);
    pointer-events: none;
  }

  .ring-1 {
    width: 320px;
    height: 320px;
    animation: ring-pulse 3.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
  .ring-2 {
    width: 480px;
    height: 480px;
    border-color: rgba(255, 92, 88, 0.2);
    animation: ring-pulse 3.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s infinite;
  }
  .ring-3 {
    width: 640px;
    height: 640px;
    border-color: rgba(120, 75, 255, 0.12);
    animation: ring-pulse 3.5s cubic-bezier(0.16, 1, 0.3, 1) 1.2s infinite;
  }

  @keyframes ring-pulse {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.2);
    }
    30% {
      opacity: 0.8;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.6);
    }
  }

  .splash-center {
    position: relative;
    z-index: 105;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 440px;
  }

  /* 3D Logo Stage */
  .splash-logo-stage {
    position: relative;
    width: 96px;
    height: 96px;
    margin-bottom: 1.75rem;
    animation: logo-float-entrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .splash-logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 12px 30px rgba(120, 75, 255, 0.45));
  }

  .logo-aura-glow {
    position: absolute;
    inset: -14px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(120, 75, 255, 0.45) 0%, rgba(255, 92, 88, 0.2) 50%, transparent 70%);
    filter: blur(18px);
    z-index: 1;
    animation: aura-pulse 3s ease-in-out infinite alternate;
  }

  @keyframes logo-float-entrance {
    0% {
      opacity: 0;
      transform: translateY(28px) scale(0.7) rotate(-6deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1) rotate(0deg);
    }
  }

  @keyframes aura-pulse {
    0%   { opacity: 0.5; transform: scale(0.9); }
    100% { opacity: 1.0; transform: scale(1.2); }
  }

  /* Typography Stagger */
  .splash-text-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2.25rem;
  }

  .splash-brand-title {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: 0.3em;
    background: linear-gradient(135deg, #FFFFFF 0%, #C4AEFF 50%, #FFA39E 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: tracking-expand 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes tracking-expand {
    0% {
      opacity: 0;
      letter-spacing: 0.1em;
      transform: translateY(12px);
    }
    100% {
      opacity: 1;
      letter-spacing: 0.32em;
      transform: translateY(0);
    }
  }

  .splash-tagline {
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    opacity: 0;
    animation: fade-up 1s ease 0.5s forwards;
  }

  @keyframes fade-up {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Scrubber & Audio Frequency Indicator */
  .splash-progress-stage {
    width: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    opacity: 0;
    animation: fade-up 0.8s ease 0.8s forwards;
  }

  .progress-track {
    width: 100%;
    height: 3px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--color-brand-gradient);
    border-radius: var(--radius-full);
    transition: width 0.04s linear;
  }

  .frequency-bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 12px;
  }

  .frequency-bars span {
    width: 2.5px;
    height: 100%;
    background: #784BFF;
    border-radius: 2px;
    animation: freq-wave 0.8s ease-in-out infinite alternate;
  }
  .frequency-bars span:nth-child(1) { animation-delay: 0.1s; height: 40%; }
  .frequency-bars span:nth-child(2) { animation-delay: 0.3s; height: 90%; background: #9669FF; }
  .frequency-bars span:nth-child(3) { animation-delay: 0.15s; height: 60%; background: #FF5C58; }
  .frequency-bars span:nth-child(4) { animation-delay: 0.45s; height: 100%; background: #FF7869; }
  .frequency-bars span:nth-child(5) { animation-delay: 0.25s; height: 50%; background: #FFAE33; }

  @keyframes freq-wave {
    0%   { transform: scaleY(0.3); }
    100% { transform: scaleY(1.0); }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     STAGE 2: LUXURY SPOTLIGHT & BORDER BEAM AUTH CARD
     ═══════════════════════════════════════════════════════════════════════ */
  .auth-card-stage {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 410px;
    opacity: 0;
    transform: translateY(22px) scale(0.98);
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .auth-card-stage.revealed {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .luxury-auth-card {
    position: relative;
    width: 100%;
    padding: 2.1rem 2rem 1.7rem;
    border-radius: var(--radius-xl);
    background: #110F1A;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  /* Rotating Conic Border Beam (Magic UI Style) */
  .border-beam-ring {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    background: conic-gradient(from 0deg, transparent 0deg, #784BFF 60deg, #FF5C58 120deg, transparent 180deg);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    animation: rotate-beam 7s linear infinite;
    pointer-events: none;
    z-index: 3;
  }

  @keyframes rotate-beam {
    to { transform: rotate(360deg); }
  }

  /* Dynamic Cursor Spotlight Layer (React Bits Style) */
  .spotlight-radial-layer {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 2;
  }

  .card-brand-topline {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-brand-gradient);
    z-index: 4;
  }

  /* Header */
  .card-header {
    text-align: center;
    margin-bottom: 1.75rem;
    position: relative;
    z-index: 5;
  }

  .brand-badge-link {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 1rem;
    text-decoration: none;
    padding: 0.35rem 0.85rem;
    border-radius: var(--radius-full);
    background: rgba(120, 75, 255, 0.08);
    border: 1px solid rgba(120, 75, 255, 0.2);
    transition: transform var(--t-fast) ease, border-color var(--t-fast) ease;
  }
  .brand-badge-link:hover {
    transform: scale(1.03);
    border-color: rgba(120, 75, 255, 0.4);
  }

  .header-logo-icon {
    width: 26px;
    height: 26px;
    object-fit: contain;
  }

  .header-brand-text {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.22em;
    color: var(--color-text);
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: #FFFFFF;
    margin-bottom: 0.35rem;
  }

  .card-subtitle {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: 1.5;
    max-width: 330px;
    margin: 0 auto;
  }

  /* Fluid Segmented Tab Switcher (Linear / Apple Style) */
  .tab-switcher {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-sm);
    padding: 3px;
    margin-bottom: 1.25rem;
    z-index: 5;
  }

  .tab-slider {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc(50% - 3px);
    border-radius: calc(var(--radius-sm) - 2px);
    background: var(--color-surface-raised);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .tab-slider.is-signup {
    transform: translateX(100%);
  }

  .tab-btn {
    position: relative;
    z-index: 2;
    background: none;
    border: none;
    padding: 0.55rem 0;
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 600;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: color 0.2s ease;
  }
  .tab-btn.active {
    color: #FFFFFF;
  }

  /* Alert */
  .alert-box {
    position: relative;
    z-index: 5;
    background: rgba(255, 92, 88, 0.12);
    color: #FFA39E;
    border: 1px solid rgba(255, 92, 88, 0.3);
    padding: 0.65rem 0.95rem;
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    animation: shake 0.35s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%, 75% { transform: translateX(-4px); }
    50%      { transform: translateX(4px); }
  }

  .alert-icon {
    flex-shrink: 0;
    color: var(--color-accent);
  }

  /* Form Elements */
  .form-body {
    position: relative;
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .input-group label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }

  .label-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .strength-tag {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .strength-tag.strong {
    color: var(--color-success);
  }

  .input-shell {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(10, 9, 18, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    transition: border-color var(--t-fast) ease, box-shadow var(--t-fast) ease, background var(--t-fast) ease;
  }
  .input-shell:focus-within {
    border-color: var(--color-primary);
    background: rgba(10, 9, 18, 0.95);
    box-shadow: 0 0 0 3px rgba(120, 75, 255, 0.18), 0 0 12px rgba(120, 75, 255, 0.15);
  }

  .input-icon {
    width: 15px;
    height: 15px;
    margin-left: 0.75rem;
    color: var(--color-text-faint);
    flex-shrink: 0;
    transition: color var(--t-fast) ease;
  }
  .input-shell:focus-within .input-icon {
    color: var(--color-primary);
  }

  .luxury-input {
    width: 100%;
    background: transparent;
    border: none;
    color: #FFFFFF;
    font-size: var(--text-sm);
    padding: 0.65rem 0.85rem 0.65rem 0.6rem;
    outline: none;
  }
  .luxury-input::placeholder {
    color: var(--color-text-faint);
  }

  .pwd-toggle-btn {
    background: none;
    border: none;
    color: var(--color-text-faint);
    padding: 0 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color var(--t-fast) ease;
  }
  .pwd-toggle-btn:hover {
    color: var(--color-text);
  }

  /* Password strength meter steps */
  .strength-track {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    margin-top: 0.35rem;
  }

  .strength-step {
    height: 3px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.08);
    transition: background 0.3s ease;
  }
  .strength-step.active.step-1 { background: #FF5C58; }
  .strength-step.active.step-2 { background: #FFAE33; }
  .strength-step.active.step-3 { background: #784BFF; }
  .strength-step.active.step-4 { background: #22C55E; }

  /* High-Impact Submit Button */
  .luxury-submit-btn {
    position: relative;
    width: 100%;
    margin-top: 0.4rem;
    padding: 0.72rem 1.3rem;
    border-radius: var(--radius-sm);
    border: none;
    background: var(--color-brand-gradient);
    color: #FFFFFF;
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(120, 75, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: transform var(--t-fast) ease, box-shadow var(--t-fast) ease, opacity var(--t-fast) ease;
  }
  .luxury-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(120, 75, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  .luxury-submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  .luxury-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Shimmer beam passing through the button */
  .btn-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
    transform: skewX(-20deg);
    animation: btn-shimmer-sweep 4s infinite linear;
    pointer-events: none;
  }

  @keyframes btn-shimmer-sweep {
    0%   { left: -100%; }
    40%  { left: 160%; }
    100% { left: 160%; }
  }

  .btn-arrow {
    transition: transform var(--t-fast) ease;
  }
  .luxury-submit-btn:hover .btn-arrow {
    transform: translateX(3px);
  }

  /* Audio Equalizer loader inside button */
  .btn-equalizer-loader {
    display: inline-flex;
    align-items: center;
    gap: 2.5px;
    height: 14px;
  }
  .btn-equalizer-loader span {
    width: 2.5px;
    height: 100%;
    background: #FFFFFF;
    border-radius: 2px;
    animation: btn-eq 0.7s ease-in-out infinite alternate;
  }
  .btn-equalizer-loader span:nth-child(1) { animation-delay: 0.1s; }
  .btn-equalizer-loader span:nth-child(2) { animation-delay: 0.3s; }
  .btn-equalizer-loader span:nth-child(3) { animation-delay: 0.15s; }
  .btn-equalizer-loader span:nth-child(4) { animation-delay: 0.4s; }

  @keyframes btn-eq {
    0%   { height: 30%; }
    100% { height: 100%; }
  }

  /* Guest Route Divider */
  .guest-route-divider {
    position: relative;
    z-index: 5;
    text-align: center;
    margin: 1.05rem 0 0.75rem;
  }
  .guest-route-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }
  .guest-route-divider span {
    position: relative;
    background: #110F1A;
    padding: 0 0.75rem;
    font-size: 0.72rem;
    color: var(--color-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Explore as Guest Button */
  .guest-explore-btn {
    position: relative;
    z-index: 5;
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.58rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--t-fast) ease;
  }
  .guest-explore-btn:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.18);
  }
  .guest-explore-btn:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.18);
  }

  /* Legal Footer */
  .card-footer-legal {
    position: relative;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.7rem;
    color: var(--color-text-faint);
  }
  .card-footer-legal a {
    color: var(--color-text-faint);
    text-decoration: none;
    transition: color var(--t-fast) ease;
  }
  .card-footer-legal a:hover {
    color: var(--color-text-muted);
  }

  @media (max-width: 480px) {
    .luxury-auth-card {
      padding: 2rem 1.5rem;
    }
    .splash-brand-title {
      font-size: 2rem;
    }
  }
</style>
