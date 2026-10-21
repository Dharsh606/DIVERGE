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
  <title>Log In — DIVERGE</title>
  <meta name="description" content="Log in to your DIVERGE music account." />
</svelte:head>

<div class="auth-viewport">
  <div class="auth-card">
    <div class="card-accent-bar" aria-hidden="true"></div>

    <div class="auth-header">
      <a href="/" class="brand-link" aria-label="DIVERGE home">
        <img src="/logo-mark.png" alt="DIVERGE" class="brand-logo" />
        <span class="brand-name">DIVERGE</span>
      </a>
      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-subtitle">Enter your account credentials to resume your journey.</p>
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
        <input
          id="login-email"
          type="email"
          required
          autocomplete="email"
          class="input"
          placeholder="your.email@example.com"
          bind:value={email}
        />
      </div>

      <div class="form-group">
        <div class="label-row">
          <label for="login-password">Password</label>
        </div>
        <input
          id="login-password"
          type="password"
          required
          autocomplete="current-password"
          class="input"
          placeholder="••••••••"
          bind:value={password}
        />
      </div>

      <button type="submit" class="btn btn-primary submit-btn" disabled={submitting}>
        {#if submitting}
          <span class="btn-spinner" aria-hidden="true"></span>
          <span>Signing in...</span>
        {:else}
          <span>Log In</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        {/if}
      </button>
    </form>

    <div class="auth-footer">
      <span>Don't have an account?</span>
      <a href="/register" class="auth-link">Create one</a>
    </div>

    <div class="legal-links">
      <a href="/privacy">Privacy Policy</a>
      <span class="dot">&bull;</span>
      <a href="/terms">Terms & Conditions</a>
    </div>
  </div>
</div>

<style>
  .auth-viewport {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    background: var(--color-bg);
  }

  .auth-card {
    position: relative;
    width: 100%;
    max-width: 420px;
    padding: 2.5rem 2.25rem 2rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  /* Grounded accent line echoing the logo gradient */
  .card-accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-brand-gradient);
  }

  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .brand-link {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 1.25rem;
    text-decoration: none;
    transition: opacity var(--t-fast) ease;
  }
  .brand-link:hover {
    opacity: 0.9;
  }

  .brand-logo {
    width: 38px;
    height: 38px;
    object-fit: contain;
  }

  .brand-name {
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--color-text);
  }

  .auth-title {
    font-size: var(--text-2xl);
    font-weight: 700;
    letter-spacing: -0.025em;
    margin-bottom: 0.4rem;
    color: var(--color-text);
  }

  .auth-subtitle {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  .alert-error {
    background: var(--color-accent-dim);
    color: #FFA39E;
    border: 1px solid rgba(255, 92, 88, 0.3);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .error-icon {
    flex-shrink: 0;
    color: var(--color-accent);
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

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .form-group label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }

  .submit-btn {
    margin-top: 0.5rem;
    padding: 0.75rem 1.25rem;
    width: 100%;
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .btn-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
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
    color: var(--color-text-muted);
  }

  .auth-link {
    color: var(--color-primary);
    font-weight: 600;
    text-decoration: none;
  }
  .auth-link:hover {
    text-decoration: underline;
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
    color: var(--color-text-faint);
  }

  .legal-links a {
    color: var(--color-text-faint);
    transition: color var(--t-fast) ease;
  }
  .legal-links a:hover {
    color: var(--color-text-muted);
  }

  .dot {
    opacity: 0.4;
  }
</style>
