<script lang="ts">
	import { onMount } from 'svelte';
	import { Lightbox } from 'svelte-lightbox';
	import Tags from 'svelte-tags-input';
	import InfiniteLoading, {
		type InfiniteEvent,
		type InfiniteLoadingProps
	} from 'svelte-infinite-loading';
	import Svelecte from 'svelecte/src/Svelecte.svelte';

	interface Meme {
		id: number;
		filename: string;
		author_name: string;
		score: number;
		message_url: string;
		created_date: Date;
		tags: Tag[];
	}

	interface Tag {
		id: number;
		name: string;
	}

	let memes: Meme[] = [];
	let skip = 0;
	let limit = 10;

	let tags: Tag[] = [];
	let filterTagId: number | null = null;
	let loaderId: InfiniteLoadingProps['identifier'] = new Date();

	async function loadTags() {
		tags = await fetch(`https://xyquadrat.ch/api/tags/`).then((r) => r.json());
	}

	function filterByTag() {
		memes = [];
		skip = 0;

		// triggers the scrollHandler again
		loaderId = new Date();
	}

	function correctFilename(filename: string) {
		filename = filename.replace(/mp4|mov|gif/, 'jpg');
		return filename;
	}

	function isVideo(filename: string) {
		return filename.endsWith('.mp4') || filename.endsWith('.mov');
	}

	function scrollHandler(event: InfiniteEvent) {
		let url = `https://xyquadrat.ch/api/media/top/?skip=${skip}&limit=${limit}`;
		if (filterTagId) {
			url += `&tag_id=${filterTagId}`;
		}

		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					memes = [...memes, ...data];
					skip += limit;
					event.detail.loaded();
				} else {
					event.detail.complete();
				}
			});
	}

	function handleNewTag(tags: Tag[], id: number) {
		const options = {
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ data: tags })
		};

		fetch(`https://xyquadrat.ch/api/media/${id}/tags/`, options);
	}

	onMount(loadTags);
</script>

<svelte:head>
	<base href="/memeboard" />
	<title>D-INFK Memeboard</title>
</svelte:head>

<main id="content" class="dark:bg-zinc-800 dark:text-gray-100 px-4">
	<h1 class="text-center text-4xl py-6 font-bold">D-INFK Discord Memeboard</h1>
	<div class="flex flex-wrap gap-2 max-w-md mx-auto pb-5" id="tagFilter">
		<Svelecte
			valueField="id"
			labelField="name"
			options={tags}
			bind:value={filterTagId}
			on:change={() => filterByTag()}
			placeholder="Filter by tag..."
			clearable="true"
			class="tagFilter svelecte-control"
		/>
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 max-w-7xl gap-x-5 mx-auto">
		{#each memes as meme}
			<div class="my-3 transition-all opacity-1 drop-shadow-md">
				<Lightbox transitionDuration={100}>
					<img
						slot="thumbnail"
						class="rounded-t-sm !h-60 w-full object-cover"
						src="https://xyquadrat.ch/artarindo/media/thumb/{correctFilename(meme.filename)}"
						alt="Meme Thumbnail"
					/>
					{#if isVideo(meme.filename)}
						<!-- svelte-ignore a11y-media-has-caption -->
						<video controls src="https://xyquadrat.ch/artarindo/media/{meme.filename}" alt="Meme" />
					{:else}
						<img
							src="https://xyquadrat.ch/artarindo/media/{correctFilename(meme.filename)}"
							alt="Meme"
						/>
					{/if}
				</Lightbox>
				<div class="rounded-b-sm dark:bg-slate-700 px-4 pt-2 h-14 flex items-center">
					<a href={meme.message_url} target="_blank" rel="noreferrer">
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
				<div class="text-black">
					<Tags
						on:tags={() => handleNewTag(meme.tags, meme.id)}
						tags={meme.tags}
						autoComplete={tags}
						autoCompleteKey={'name'}
						onlyAutocomplete={true}
						onlyUnique={true}
					/>
				</div>
			</div>
		{/each}
		<InfiniteLoading identifier={loaderId} on:infinite={scrollHandler}>
			<span slot="noResults">No memes with that tag have been found.</span>
			<span slot="noMore" />
			<span slot="spinner" />
		</InfiniteLoading>
	</div>
</main>

<style>
	#tagFilter :global(.tagFilter) {
		--sv-bg: rgb(39, 39, 42);
		--sv-item-color: rgb(243, 244, 246);
		--sv-item-active-color: rgb(51, 65, 85);
		--sv-dropdown-shadow: 0 6px 12px rgba(243, 244, 246, 0.175);
		--sv-highlight-bg: transparent;
		--sv-highlight-color: rgb(51, 65, 85);
	}
</style>
