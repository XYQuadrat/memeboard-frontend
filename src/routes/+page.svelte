<script lang="ts">
	import { onMount } from 'svelte';
	import { Lightbox } from 'svelte-lightbox';
	import InfiniteLoading from 'svelte-infinite-loading';

	interface Meme {
		filename: string;
		author_name: string;
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

	function isVideo(filename: string) {
		return filename.endsWith('.mp4') || filename.endsWith('.mov');
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
	<h1 class="text-center text-4xl py-6 font-bold">D-INFK Discord Memeboard</h1>
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 max-w-7xl mx-auto">
		{#each memes as meme}
			<div class="my-3">
				{#if isVideo(meme.filename)}
					<Lightbox transitionDuration={100}>
						<img
							slot="thumbnail"
							class="rounded-t-sm max-h-60 w-full object-cover"
							src="https://xyquadrat.ch/artarindo/media/thumb/{correctFilename(meme.filename)}"
							alt="Meme Thumbnail"
						/>
						<!-- svelte-ignore a11y-media-has-caption -->
						<video
							class=""
							controls
							src="https://xyquadrat.ch/artarindo/media/{meme.filename}"
							alt="Meme"
						/>
					</Lightbox>
				{:else}
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
				{/if}
				<div class="rounded-b-sm dark:bg-slate-700 p-4 h-16 flex items-center">
					<a href={meme.message_url} target="_blank">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 mr-2"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
								clip-rule="evenodd"
							/>
						</svg>
					</a>
					{meme.author_name}
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
