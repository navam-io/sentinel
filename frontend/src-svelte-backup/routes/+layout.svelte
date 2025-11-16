<script lang="ts">
	import '$lib/../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Sentinel - AI Agent Testing Platform</title>
</svelte:head>

{@render children()}
