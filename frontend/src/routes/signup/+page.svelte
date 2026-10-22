<script lang="ts">
  import AuthAndIntroExperience from '$lib/components/auth/AuthAndIntroExperience.svelte';
</script>

<svelte:head>
  <title>Create Account — DIVERGE</title>
  <meta name="description" content="Register for a new DIVERGE music streaming account." />
</svelte:head>

<AuthAndIntroExperience initialTab="signup" skipSplash={true} />
