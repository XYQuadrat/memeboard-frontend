<script lang="ts">
	import { onMount } from 'svelte';
	import Tags from 'svelte-tags-input';
	import { shortcut } from '../shortcut';

	interface Meme {
		id: number;
		filename: string;
		author: string;
		score: number;
		message_url: string;
		created_at: Date;
		tags: Tag[];
	}

	interface Tag {
		id: number;
		name: string;
	}

	let meme: Meme;
	let isVideo: boolean;

	let tags: Tag[] = [];

	function handleNewTag(event: CustomEvent) {
		const options = {
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ Data: event.detail.tags })
		};
		fetch(`https://xyquadrat.ch/api/media/${meme.id}/tags/`, options);
	}

	async function loadData() {
		meme = await fetch(`https://xyquadrat.ch/api/tag-queue/`).then((r) => r.json());
		isVideo = meme.filename.endsWith('.mp4') || meme.filename.endsWith('.mov');
		tags = await fetch(`https://xyquadrat.ch/api/tags/`).then((r) => r.json());
	}

	async function next() {
		meme = await fetch(`https://xyquadrat.ch/api/tag-queue/`).then((r) => r.json());
		isVideo = meme.filename.endsWith('.mp4') || meme.filename.endsWith('.mov');
	}

	onMount(() => {
		loadData();
	});
</script>

<svelte:head>
	<title>Memeboard Tag Queue</title>
</svelte:head>

<main class="p-5">
	<div class="grid lg:grid-cols-3 mx-auto justify-center">
		<div />
		{#if meme}
			<div class="mx-auto">
				<div class="mb-5">
					{#if isVideo}
						<!-- svelte-ignore a11y-media-has-caption -->
						<video
							class=""
							controls
							src="https://xyquadrat.ch/artarindo/media/{meme.filename}"
							alt="Meme"
						/>
					{:else}
						<img class="" src="https://xyquadrat.ch/artarindo/media/{meme.filename}" alt="Meme" />
					{/if}
				</div>
				<div class="flex p-4">
					<p>{meme.author}</p>
					<span class="ml-auto text-lg font-semibold text-red-500">
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
				<div class="text-black">
					<Tags
						on:tags={handleNewTag}
						tags={meme.tags}
						autoComplete={tags}
						autoCompleteKey={'Name'}
						onlyAutocomplete={true}
						onlyUnique={true}
					/>
				</div>
			</div>
		{/if}
		<div class="mx-5 my-auto">
			<button use:shortcut={{ code: 'ArrowRight' }} on:click={next}>
				<img src="arrow-right.svg" alt="Next" />
			</button>
		</div>
	</div>
</main>
