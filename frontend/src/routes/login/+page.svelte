<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMsg = '';
  let submitting = false;

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMsg = '';
    submitting = true;

    try {
      await authStore.login(email.trim(), password);
      goto('/');
    } catch (err: any) {
      errorMsg = err.message || 'Login failed. Please check your credentials.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Log In - DIVERGE</title>
  <meta name="description" content="Log in to your DIVERGE music account." />
</svelte:head>

<div class="auth-wrap">
  <!-- Atmospheric background glowing orbs -->
  <div class="auth-orb auth-orb-1" aria-hidden="true"></div>
  <div class="auth-orb auth-orb-2" aria-hidden="true"></div>

  <!-- Centered Glassmorphic Card -->
  <div class="auth-card glass">
    <div class="auth-header">
      <a href="/" class="brand-link" aria-label="DIVERGE home">
        <div class="logo-wrapper">
          <svg viewBox="0 0 40 40" width="44" height="44" fill="none">
            <path d="M8 6 L8 34 L22 34 Q36 34 36 20 Q36 6 22 6 Z" fill="url(#login-grad)" />
            <path d="M15 13 L15 27 L28 20 Z" fill="#111019" />
            <defs>
              <linearGradient id="login-grad" x1="8" y1="6" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#B19AFF"/>
                <stop offset="100%" stop-color="#FF796C"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="brand-text">DIVERGE</span>
      </a>
      <h2>Welcome back</h2>
      <p class="text-muted">Enter your account credentials to resume your journey.</p>
    </div>

    {#if errorMsg}
      <div class="alert-error" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="error-icon">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{errorMsg}</span>
      </div>
    {/if}

    <form on:submit={handleSubmit} class="auth-form">
      <div class="form-group">
        <label for="login-email">Email</label>
        <div class="input-wrap">
          <input
            id="login-email"
            type="email"
            required
            class="input auth-input"
            placeholder="your.email@example.com"
            bind:value={email}
          />
        </div>
      </div>

      <div class="form-group">
        <label for="login-password">Password</label>
        <div class="input-wrap">
          <input
            id="login-password"
            type="password"
            required
            class="input auth-input"
            placeholder="••••••••"
            bind:value={password}
          />
        </div>
      </div>

      <button type="submit" class="btn btn-primary submit-btn" disabled={submitting}>
        {#if submitting}
          <span class="btn-spinner" aria-hidden="true"></span>
          <span>Authenticating...</span>
        {:else}
          <span>Log In</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        {/if}
      </button>
    </form>

    <div class="auth-footer text-muted">
      <span>Don't have an account?</span>
      <a href="/register" class="auth-link">Create one</a>
    </div>

    <div class="legal-links text-faint">
      <a href="/privacy">Privacy Policy</a>
      <span>&bull;</span>
      <a href="/terms">Terms & Conditions</a>
    </div>
  </div>
</div>

<style>
  .auth-wrap {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: var(--color-bg);
    position: relative;
    overflow: hidden;
  }

  /* Atmospheric glowing orbs */
  .auth-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  .auth-orb-1 {
    width: 440px;
    height: 440px;
    top: 15%;
    left: 20%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(177, 154, 255, 0.15) 0%, transparent 70%);
    filter: blur(60px);
    animation: orb-drift-1 14s ease-in-out infinite alternate;
  }

  .auth-orb-2 {
    width: 380px;
    height: 380px;
    bottom: 15%;
    right: 20%;
    transform: translate(50%, 50%);
    background: radial-gradient(circle, rgba(255, 121, 108, 0.11) 0%, transparent 70%);
    filter: blur(60px);
    animation: orb-drift-2 16s ease-in-out infinite alternate;
  }

  @keyframes orb-drift-1 {
    0%   { transform: translate(-50%, -50%) scale(0.95); }
    100% { transform: translate(-42%, -42%) scale(1.1); }
  }

  @keyframes orb-drift-2 {
    0%   { transform: translate(50%, 50%) scale(1.05); }
    100% { transform: translate(40%, 40%) scale(0.9); }
  }

  /* Centered Glassmorphic Card */
  .auth-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    padding: 2.75rem 2.25rem;
    border-radius: var(--radius-xl);
    background: rgba(27, 24, 39, 0.65);
    backdrop-filter: blur(36px) saturate(190%);
    -webkit-backdrop-filter: blur(36px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.09);
    box-shadow:
      0 28px 70px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 0 28px rgba(177, 154, 255, 0.03);
    animation: card-entrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes card-entrance {
    from {
      opacity: 0;
      transform: translateY(18px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .brand-link {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    text-decoration: none;
    transition: transform var(--t-fast) ease;
  }
  .brand-link:hover {
    transform: scale(1.04);
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 4px 12px rgba(177, 154, 255, 0.3));
  }

  .brand-text {
    font-size: var(--text-base);
    font-weight: 700;
    letter-spacing: 0.22em;
    color: var(--color-text);
  }

  .auth-header h2 {
    font-size: var(--text-2xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 0.4rem;
    color: var(--color-text);
  }

  .alert-error {
    background: var(--color-accent-dim);
    color: var(--color-accent);
    border: 1px solid rgba(255, 121, 108, 0.25);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    animation: shake 0.35s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }

  .error-icon {
    flex-shrink: 0;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .form-group label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }

  .input-wrap {
    position: relative;
    width: 100%;
  }

  .auth-input {
    background: rgba(17, 16, 25, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition:
      border-color var(--t-fast) ease,
      box-shadow var(--t-fast) ease,
      background var(--t-fast) ease;
  }

  .auth-input:focus {
    background: rgba(17, 16, 25, 0.85);
    border-color: var(--color-primary);
    box-shadow:
      0 0 0 3px rgba(177, 154, 255, 0.18),
      0 0 16px rgba(177, 154, 255, 0.12);
  }

  .submit-btn {
    margin-top: 0.5rem;
    padding: 0.8rem 1.25rem;
    width: 100%;
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 18px rgba(177, 154, 255, 0.25);
    transition:
      transform var(--t-fast) ease,
      box-shadow var(--t-fast) ease,
      opacity var(--t-fast) ease;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 26px rgba(177, 154, 255, 0.4);
    opacity: 0.95;
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(17, 16, 25, 0.3);
    border-top-color: #111019;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.4rem;
    margin-top: 1.75rem;
    font-size: var(--text-sm);
  }

  .auth-link {
    color: var(--color-primary);
    font-weight: 500;
    text-decoration: none;
    transition: color var(--t-fast) ease, text-decoration var(--t-fast) ease;
  }
  .auth-link:hover {
    text-decoration: underline;
    opacity: 0.9;
  }

  .legal-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
    font-size: var(--text-xs);
    border-top: 1px solid var(--color-border-subtle);
    padding-top: 1rem;
  }
  .legal-links a {
    color: var(--color-text-faint);
    transition: color var(--t-fast) ease;
  }
  .legal-links a:hover {
    color: var(--color-text-muted);
  }
</style>
