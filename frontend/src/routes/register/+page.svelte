<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let username = '';
  let email = '';
  let password = '';
  let errorMsg = '';
  let submitting = false;

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMsg = '';

    if (password.length < 6) {
      errorMsg = 'Password must be at least 6 characters long.';
      return;
    }

    submitting = true;

    try {
      await authStore.register(username.trim(), email.trim(), password);
      goto('/');
    } catch (err: any) {
      errorMsg = err.message || 'Registration failed. Please try again.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Create Account - DIVERGE</title>
  <meta name="description" content="Register for a new DIVERGE music streaming account." />
</svelte:head>

<div class="auth-wrap">
  <div class="auth-card card glass">
    <div class="auth-header">
      <a href="/" class="brand-link" aria-label="DIVERGE home">
        <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
          <path d="M8 6 L8 34 L22 34 Q36 34 36 20 Q36 6 22 6 Z" fill="url(#reg-grad)" />
          <path d="M15 13 L15 27 L28 20 Z" fill="#111019" />
          <defs>
            <linearGradient id="reg-grad" x1="8" y1="6" x2="36" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#B19AFF"/>
              <stop offset="100%" stop-color="#FF796C"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="brand-text">DIVERGE</span>
      </a>
      <h2>Take the uncommon route</h2>
      <p class="text-muted">Create an account to explore music beyond the algorithmic mainstream.</p>
    </div>

    {#if errorMsg}
      <div class="alert-error" role="alert">
        {errorMsg}
      </div>
    {/if}

    <form on:submit={handleSubmit} class="auth-form">
      <div class="form-group">
        <label for="reg-username">Username</label>
        <input
          id="reg-username"
          type="text"
          required
          class="input"
          placeholder="your_handle"
          bind:value={username}
        />
      </div>

      <div class="form-group">
        <label for="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          required
          class="input"
          placeholder="your.email@example.com"
          bind:value={email}
        />
      </div>

      <div class="form-group">
        <label for="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          required
          minlength="6"
          class="input"
          placeholder="••••••••"
          bind:value={password}
        />
      </div>

      <button type="submit" class="btn btn-primary submit-btn" disabled={submitting}>
        {submitting ? 'Creating account...' : 'Create Account'}
      </button>
    </form>

    <div class="auth-footer text-muted">
      <span>Already have an account?</span>
      <a href="/login">Log in</a>
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
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    padding: 2.25rem;
    border-radius: var(--radius-xl);
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
  }

  .brand-text {
    font-size: var(--text-base);
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--color-text);
  }

  .auth-header h2 {
    font-size: var(--text-2xl);
    font-weight: 700;
    margin-bottom: 0.35rem;
  }

  .alert-error {
    background: var(--color-accent-dim);
    color: var(--color-accent);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    margin-bottom: 1.25rem;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .form-group label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-muted);
  }

  .submit-btn {
    margin-top: 0.5rem;
    padding: 0.75rem;
    width: 100%;
  }

  .auth-footer {
    display: flex;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 1.75rem;
    font-size: var(--text-sm);
  }

  .legal-links {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    font-size: var(--text-xs);
  }
  .legal-links a {
    color: var(--color-text-faint);
  }
  .legal-links a:hover {
    color: var(--color-text-muted);
  }
</style>
