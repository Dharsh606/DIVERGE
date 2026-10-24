<script lang="ts">
  /**
   * TrackDNA — Deterministic generative glyph per song.
   * Same song always renders the same glyph.
   * Input: song metadata (bpm, energy_score, mood_score, genre, musical_key)
   * Output: unique deterministic SVG pattern based on acoustic properties.
   */
  import type { Song } from '$lib/types';

  export let song: Song;
  export let size = 40;

  // ─── Deterministic hash from song fields ────────────────────────────────
  function hash(str: string): number {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  // Seed from stable song properties
  $: seed = song ? `${song.id || 1}-${song.title || ''}-${song.bpm || 120}-${song.genre || ''}` : 'track-dna-default';
  $: h = hash(seed);

  // Derive glyph parameters deterministically
  $: energy  = song?.energy_score  ?? (((h >> 0)  & 0xFF) / 255);
  $: mood    = song?.mood_score    ?? (((h >> 8)  & 0xFF) / 255);
  $: bpmNorm = Math.min((song?.bpm || 120) / 200, 1) || (((h >> 16) & 0xFF) / 255);

  // Number of petals: 3–7 based on hash
  $: petals = 3 + ((h & 0x7) % 5);

  // Colors — interpolate between Electric Iris and Signal Coral by mood
  $: primaryColor  = `hsl(${255 - mood * 60}, 85%, ${55 + energy * 15}%)`;
  $: secondaryColor = `hsl(${10 + mood * 20}, 80%, ${55 + energy * 15}%)`;

  // Inner shape: energy drives spikiness
  $: innerRadius = size * 0.15 + energy * size * 0.1;
  $: outerRadius = size * 0.25 + energy * size * 0.12;

  // Generate star polygon points
  function starPoints(cx: number, cy: number, n: number, r1: number, r2: number, offset = 0): string {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const angle = (Math.PI / n) * i + offset;
      const r = i % 2 === 0 ? r1 : r2;
      pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return pts.join(' ');
  }

  $: cx = size / 2;
  $: cy = size / 2;
  $: rotOffset = ((h >> 24) & 0xFF) / 255 * Math.PI * 2;
  $: pts = starPoints(cx, cy, petals, outerRadius, innerRadius, rotOffset);

  // Orbit ring radius
  $: orbitR = size * 0.38 + mood * size * 0.04;

  // Small accent dots — positions driven by bpmNorm
  $: dot1Angle = bpmNorm * Math.PI * 2;
  $: dot1X = cx + orbitR * Math.cos(dot1Angle);
  $: dot1Y = cy + orbitR * Math.sin(dot1Angle);
  $: dot2Angle = dot1Angle + Math.PI;
  $: dot2X = cx + orbitR * Math.cos(dot2Angle);
  $: dot2Y = cy + orbitR * Math.sin(dot2Angle);
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  aria-label="Track DNA for {song.title}"
  role="img"
  class="track-dna"
>
  <defs>
    <linearGradient id="dna-grad-{song.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color={primaryColor} stop-opacity="0.9" />
      <stop offset="100%" stop-color={secondaryColor} stop-opacity="0.7" />
    </linearGradient>
  </defs>

  <!-- Orbit ring (mood) -->
  <circle
    cx={cx} cy={cy} r={orbitR}
    fill="none"
    stroke={primaryColor}
    stroke-width="0.75"
    stroke-opacity="0.3"
    stroke-dasharray="2 3"
  />

  <!-- Star glyph (core DNA shape) -->
  <polygon
    points={pts}
    fill="url(#dna-grad-{song.id})"
    opacity="0.85"
  />

  <!-- Accent dots (BPM / tempo markers) -->
  <circle cx={dot1X} cy={dot1Y} r="1.5" fill={secondaryColor} opacity="0.9" />
  <circle cx={dot2X} cy={dot2Y} r="1"   fill={primaryColor}   opacity="0.7" />

  <!-- Centre dot -->
  <circle cx={cx} cy={cy} r="2" fill={primaryColor} opacity="0.95" />
</svg>

<style>
  .track-dna {
    flex-shrink: 0;
    transition: transform var(--t-fast) ease, filter var(--t-fast) ease;
  }
  .track-dna:hover {
    transform: rotate(30deg) scale(1.1);
    filter: brightness(1.2);
  }
</style>
