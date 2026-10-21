<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/');
  });
</script>

<div style="display:flex; justify-content:center; align-items:center; min-height:60vh;">
  <p class="text-muted">Redirecting...</p>
</div>
