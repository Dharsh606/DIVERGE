<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Off-Route — DIVERGE</title>
</svelte:head>

<div class="error-container">
  <div class="error-card">
    <div class="brand-topline"></div>
    <div class="error-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>Off-Route Destination</span>
    </div>

    <h1 class="error-code">{$page.status || 404}</h1>
    <h2 class="error-title">Sonic Drift Detected</h2>
    <p class="error-desc">
      {$page.error?.message && $page.error.message !== 'Internal Error' && !$page.error.message.includes('\n')
        ? $page.error.message
        : 'The frequency you are tuned into could not be resolved. Let us guide you back to the main discovery flow.'}
    </p>

    <div class="error-actions">
      <a href="/" class="btn btn-primary">Return to Home</a>
      <a href="/search" class="btn btn-ghost">Explore Music</a>
    </div>
  </div>
</div>

<style>
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem 1rem;
  }

  .error-card {
    position: relative;
    width: 100%;
    max-width: 480px;
    background: var(--color-surface, #12101B);
    border: 1px solid var(--color-border, #231F35);
    border-radius: var(--radius-xl, 18px);
    padding: 2.5rem 2rem;
    text-align: center;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }

  .brand-topline {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #784BFF, #FF5C58);
  }

  .error-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    background: rgba(255, 92, 88, 0.12);
    color: #FFA39E;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
  }

  .error-code {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #784BFF 0%, #FF5C58 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .error-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: #F7F6FB;
    margin-bottom: 0.75rem;
  }

  .error-desc {
    font-size: 0.92rem;
    color: #9D96B2;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .error-actions {
    display: flex;
    gap: 0.85rem;
    justify-content: center;
  }
</style>
