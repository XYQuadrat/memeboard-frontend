<script lang="ts">
	import { onMount } from 'svelte';
	import { Lightbox } from 'svelte-lightbox';
	import InfiniteLoading from 'svelte-infinite-loading';

	interface Meme {
		filename: string;
		author: string;
		score: number;
		message_url: string;
		created_date: Date;
	}

	let memes: Meme[] = [];
	let newMemes: Meme[] = [];
	let skip = 0;
	let limit = 10;

	async function loadMemes() {
		console.log('Loading memes with offset ' + skip);
	}

	function correctFilename(filename: string) {
		if (filename.endsWith('.mp4') || filename.endsWith('.mov')) {
			filename = filename.replace(/mp4|mov/, 'jpg');
		}

		return filename;
	}

	function scrollHandler({ detail: { loaded, complete } }) {
		fetch(`https://xyquadrat.ch/api/media/top/?skip=${skip}&limit=${limit}`)
			.then((r) => r.json())
			.then((data) => {
				if (data.length) {
					skip += limit;
					newMemes = data;
					loaded();
				} else {
					complete();
				}
			});
	}

	onMount(loadMemes);

	$: memes = [...memes, ...newMemes];
</script>

<svelte:head>
	<base href="/memeboard" />
	<title>D-INFK Memeboard</title>
</svelte:head>

<main id="content" class="dark:bg-slate-800 dark:text-gray-100 px-4">
	<h1 class="text-center text-4xl py-6">D-INFK Discord Memeboard</h1>
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 max-w-7xl mx-auto">
		{#each memes as meme}
			<div class="my-3">
				<Lightbox transitionDuration={100}>
					<img
						slot="thumbnail"
						class="rounded-t-sm max-h-60 w-full object-cover"
						src="https://xyquadrat.ch/artarindo/media/thumb/{correctFilename(meme.filename)}"
						alt="Meme Thumbnail"
					/>
					<img
						src="https://xyquadrat.ch/artarindo/media/{correctFilename(meme.filename)}"
						alt="Meme"
					/>
				</Lightbox>
				<div class="rounded-b-sm dark:bg-slate-700 p-4 h-16 flex items-center">
					{meme.author}
					<span class="ml-auto text-lg font-semibold text-red-500 flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="inline"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							fill="none"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path stroke="none" d="M0 0h24v24H0z" fill="none" />
							<polyline points="6 15 12 9 18 15" />
						</svg>
						{meme.score}</span
					>
				</div>
			</div>
		{/each}
		<InfiniteLoading on:infinite={scrollHandler} />
	</div>
</main>
