<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { introStore } from '$lib/stores/intro';

  const dispatch = createEventDispatcher();

  let exiting = false;
  let progress = 0;
  let timer: any = null;

  onMount(() => {
    const duration = 3500; // 3.5 seconds cinematic intro
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      progress = Math.min((elapsed / duration) * 100, 100);

      if (elapsed >= duration) {
        clearInterval(interval);
        finish();
      }
    }, 30);

    timer = interval;

    return () => {
      if (timer) clearInterval(timer);
    };
  });

  function finish() {
    if (exiting) return;
    exiting = true;
    setTimeout(() => {
      introStore.dismiss();
      dispatch('finish');
    }, 550);
  }
</script>

<div
  class="intro-overlay"
  class:exiting
  role="dialog"
  aria-modal="true"
  aria-label="DIVERGE Intro Animation"
>
  <!-- Ambient Aurora Mesh Background -->
  <div class="aurora-mesh" aria-hidden="true"></div>

  <!-- Skip intro button -->
  <button class="skip-btn" on:click={finish} aria-label="Skip intro animation">
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
        <div class="progress-bar-fill" style="width: {progress}%;"></div>
      </div>
      <div class="frequency-bars" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  </div>
</div>

<style>
  .intro-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: #0A0912;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
    transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .intro-overlay.exiting {
    opacity: 0;
    transform: scale(1.05);
    pointer-events: none;
  }

  /* Aurora Mesh */
  .aurora-mesh {
    position: absolute;
    inset: -50%;
    width: 200%;
    height: 200%;
    background-image:
      radial-gradient(ellipse 45% 35% at 50% 20%, rgba(120, 75, 255, 0.18) 0%, transparent 65%),
      radial-gradient(ellipse 40% 30% at 75% 70%, rgba(255, 92, 88, 0.14) 0%, transparent 60%),
      radial-gradient(ellipse 35% 35% at 25% 75%, rgba(120, 75, 255, 0.12) 0%, transparent 65%);
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

  .skip-btn {
    position: absolute;
    top: 2rem;
    right: 2rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 9999px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 110;
  }
  .skip-btn:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.3);
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
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.65);
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
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(135deg, #784BFF 0%, #FF5C58 100%);
    border-radius: 9999px;
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
</style>
