<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { preferences } from '$lib/stores/preferences';

  export let opacity: number = 0.4; // 40% opacity requested by user
  export let sliceCount: number = 42; // Number of vertical slats
  export let speed: number = 0.0016;

  let canvas: HTMLCanvasElement;
  let animId: number;
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let width = 0;
  let height = 0;
  let time = 0;

  $: enabled = $preferences.slicedWavesEnabled;

  function handleMouseMove(e: MouseEvent) {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }

  function handleResize() {
    if (!canvas || !browser) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  function draw() {
    if (!enabled || !canvas) {
      animId = requestAnimationFrame(draw);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Smooth cursor interpolation
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    time += speed;

    ctx.clearRect(0, 0, width, height);

    // Calculate slice geometry
    const actualSliceCount = Math.max(24, Math.min(sliceCount, Math.floor(width / 24)));
    const sliceWidth = width / actualSliceCount;
    const slatGap = 2; // subtle slatted separation giving the sliced shutter look

    for (let i = 0; i < actualSliceCount; i++) {
      const x = i * sliceWidth;
      const sliceCenterX = x + sliceWidth / 2;

      // Distance from mouse for depth of field / focus reactiveness
      const dx = sliceCenterX - mouseX;
      const distFromMouse = Math.abs(dx) / (width * 0.35);
      const mouseInfluence = Math.max(0, 1 - Math.min(1, distFromMouse));

      // Wave harmonics
      const normalizedX = i / actualSliceCount;
      const wave1 = Math.sin(normalizedX * 4 + time * 3.5) * (height * 0.16);
      const wave2 = Math.cos(normalizedX * 7 - time * 2.2) * (height * 0.09);
      const wave3 = Math.sin(normalizedX * 11 + time * 1.5) * (height * 0.05);

      const mouseYFactor = (mouseY / height - 0.5) * (height * 0.25) * mouseInfluence;
      const centerY = height * 0.52 + wave1 + wave2 + wave3 + mouseYFactor;

      // Slice height dynamic
      const baseHeight = height * (0.32 + 0.18 * Math.sin(normalizedX * 3.14 + time * 2));
      const sliceH = baseHeight * (1 + mouseInfluence * 0.35);

      const topY = centerY - sliceH / 2;

      // Gradient representing DIVERGE brand palette (#784BFF Iris -> #FF5C58 Coral -> #FFAE33 Gold)
      const grad = ctx.createLinearGradient(x, topY, x, topY + sliceH);
      
      const alphaPeak = 0.55 + mouseInfluence * 0.35;
      grad.addColorStop(0, `rgba(120, 75, 255, ${0.05 + mouseInfluence * 0.1})`);
      grad.addColorStop(0.35, `rgba(120, 75, 255, ${alphaPeak * 0.7})`);
      grad.addColorStop(0.65, `rgba(255, 92, 88, ${alphaPeak * 0.85})`);
      grad.addColorStop(0.9, `rgba(255, 174, 51, ${alphaPeak * 0.6})`);
      grad.addColorStop(1, 'rgba(10, 9, 18, 0)');

      ctx.fillStyle = grad;

      // Render the individual sliced slat
      const drawWidth = Math.max(1, sliceWidth - slatGap);
      ctx.fillRect(x, Math.max(0, topY), drawWidth, sliceH);

      // Sliced slat top glowing cap (React Bits focus highlight)
      if (mouseInfluence > 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${mouseInfluence * 0.45})`;
        ctx.fillRect(x, Math.max(0, topY), drawWidth, 2);
      }
    }

    animId = requestAnimationFrame(draw);
  }

  onMount(() => {
    if (!browser) return;
    targetMouseX = window.innerWidth / 2;
    targetMouseY = window.innerHeight / 2;
    mouseX = targetMouseX;
    mouseY = targetMouseY;

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    animId = requestAnimationFrame(draw);
  });

  onDestroy(() => {
    if (!browser) return;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
  });
</script>

<div
  class="sliced-waves-container"
  style="opacity: {opacity};"
  aria-hidden="true"
>
  <canvas bind:this={canvas} class="sliced-waves-canvas"></canvas>
</div>

<style>
  .sliced-waves-container {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
    transition: opacity 0.4s ease;
  }

  .sliced-waves-canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
