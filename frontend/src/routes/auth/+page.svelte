<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/login');
  });
</script>

<div style="display:flex; justify-content:center; align-items:center; min-height:80vh;">
  <p style="color:var(--color-muted);">Redirecting to login...</p>
</div>
