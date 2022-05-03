<script lang="ts">
	import { onMount } from 'svelte';

	interface Meme {
		Filename: string;
		Author: string;
		Score: number;
	}

	let memes: Meme[] = [];

	async function loadMemes() {
		memes = await fetch(`http://127.0.0.1:8000/media/top/`).then((r) => r.json());
		console.log(memes);
	}

	onMount(loadMemes);
</script>

<main class="dark:bg-slate-800 dark:text-gray-100 px-5">
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
		{#each memes as meme}
			<div class="py-5">
				<div class="h-48 mb-5">
					<img
						class="rounded max-h-48"
						src="https://xyquadrat.ch/artarindo/media/{meme.Filename}"
						alt="Meme"
					/>
				</div>
				<div class="">
					<h1 class="text-lg font-semibold text-red-500">Score: {meme.Score}</h1>
					<p>{meme.Author}</p>
				</div>
			</div>
		{/each}
	</div>
</main>
