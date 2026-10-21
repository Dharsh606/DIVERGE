<script lang="ts">
  import AuthAndIntroExperience from '$lib/components/auth/AuthAndIntroExperience.svelte';
</script>

<svelte:head>
  <title>Sign In — DIVERGE</title>
  <meta name="description" content="Sign in to your DIVERGE music account." />
</svelte:head>

<AuthAndIntroExperience initialTab="login" skipSplash={true} />
