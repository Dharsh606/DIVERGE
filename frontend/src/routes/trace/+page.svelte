<script lang="ts">
  import { onMount } from 'svelte';
  import { history } from '$lib/services/api';
  import type { TraceNode, Song } from '$lib/types';
  import { player } from '$lib/stores/player';
  import { isLoggedIn } from '$lib/stores/auth';

  let traceNodes: TraceNode[] = [];
  let loading = true;

  onMount(async () => {
    if (!$isLoggedIn) {
      loading = false;
      return;
    }

    try {
      const res: any = await history.trace();
      const rawNodes = Array.isArray(res) ? res : (Array.isArray(res?.nodes) ? res.nodes : []);
      traceNodes = rawNodes.map((n: any, idx: number) => ({
        ...n,
        id: n.id ?? n.song_id ?? idx + 1,
        depth: n.depth ?? (idx % 4),
        is_branch: n.is_branch ?? (idx % 3 === 0)
      }));
    } catch (err) {
      console.error('Failed to load Trace tree', err);
      traceNodes = [];
    } finally {
      loading = false;
    }
  });

  function resumeFromNode(node: TraceNode) {
    const song: any = {
      id: node.song_id,
      title: node.title,
      artist: { name: node.artist_name },
      album: { cover_url: node.cover_url },
      genre: node.genre
    };
    player.playSong(song);
  }
</script>

<svelte:head>
  <title>Trace - Listening Journey - DIVERGE</title>
  <meta name="description" content="Explore your branching listening history tree and divergent music paths." />
</svelte:head>

<div class="trace-page">
  <div class="trace-header">
    <div>
      <h1>Trace</h1>
      <p class="text-muted">A branching visual tree of your musical wanderings and discoveries.</p>
    </div>
  </div>

  {#if !$isLoggedIn}
    <div class="cta-card card">
      <h2>Sign in to view your Trace</h2>
      <p class="text-muted">Trace maps out every branch of your music journey as you listen.</p>
      <div class="cta-actions">
        <a href="/login" class="btn btn-primary">Log in</a>
        <a href="/register" class="btn btn-ghost">Create account</a>
      </div>
    </div>
  {:else if loading}
    <div class="skeleton-tree">
      {#each Array(6) as _}
        <div class="skeleton" style="height: 64px; border-radius: var(--radius-md); margin-bottom: 0.75rem;"></div>
      {/each}
    </div>
  {:else if traceNodes.length === 0}
    <div class="empty-state card">
      <h3>No Trace nodes recorded yet</h3>
      <p class="text-muted">Start listening to songs across genres to watch your listening tree grow branches.</p>
      <a href="/search" class="btn btn-ghost">Explore music</a>
    </div>
  {:else}
    <!-- Visual Branching Tree -->
    <div class="tree-container">
      <div class="tree-line-connector"></div>

      <div class="nodes-list" role="list">
        {#each traceNodes as node (node.id)}
          <div
            class="tree-node card"
            class:branch-node={node.is_branch}
            style="margin-left: {Math.min(node.depth * 28, 140)}px;"
            role="listitem"
          >
            <!-- Branch badge -->
            {#if node.is_branch}
              <div class="diverge-indicator" title="Divergent branch point">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>
                </svg>
              </div>
            {/if}

            <div class="node-art">
              {#if node.cover_url}
                <img src={node.cover_url} alt="" />
              {:else}
                <div class="art-empty"></div>
              {/if}
            </div>

            <div class="node-info">
              <span class="node-title text-ellipsis">{node.title}</span>
              <span class="node-artist text-ellipsis text-muted">{node.artist_name}</span>
            </div>

            <div class="node-meta">
              {#if node.genre}
                <span class="badge badge-primary">{node.genre}</span>
              {/if}
              {#if node.context_tags && node.context_tags.length}
                {#each node.context_tags as tag}
                  <span class="badge badge-accent">#{tag}</span>
                {/each}
              {/if}
            </div>

            <button
              class="btn btn-icon resume-btn"
              on:click={() => resumeFromNode(node)}
              aria-label="Resume listening from {node.title}"
              title="Resume path from here"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .trace-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 2rem;
  }

  .trace-header {
    margin-bottom: 0.5rem;
  }

  .cta-card {
    padding: 3rem 2rem;
    border-radius: var(--radius-lg);
    text-align: center;
    max-width: 500px;
    margin: 2rem auto;
  }

  .cta-card h2 {
    font-size: var(--text-2xl);
    margin-bottom: 0.5rem;
  }

  .cta-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .empty-state {
    padding: 3rem 2rem;
    border-radius: var(--radius-lg);
    text-align: center;
    max-width: 520px;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .tree-container {
    position: relative;
    padding: 1rem 0;
  }

  .nodes-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
    z-index: 2;
  }

  .tree-node {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    position: relative;
    transition: all var(--t-fast) ease;
  }

  .tree-node:hover {
    background: var(--color-surface-raised);
    border-color: var(--color-primary);
  }

  .branch-node {
    border-left: 3px solid var(--color-accent);
  }

  .diverge-indicator {
    color: var(--color-accent);
    display: flex;
    align-items: center;
  }

  .node-art {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    flex-shrink: 0;
    background: var(--color-surface-raised);
  }

  .node-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .art-empty {
    width: 100%;
    height: 100%;
  }

  .node-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .node-title {
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .node-artist {
    font-size: var(--text-xs);
  }

  .node-meta {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .resume-btn {
    color: var(--color-primary);
  }

  .resume-btn:hover {
    background: var(--color-primary-dim);
  }
</style>
