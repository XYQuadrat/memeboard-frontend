<script lang="ts">
	import { onMount } from 'svelte';
	import { Lightbox } from 'svelte-lightbox';
	import InfiniteLoading, {
		type InfiniteEvent,
		type InfiniteLoadingProps
	} from 'svelte-infinite-loading';
	import { Link, ChevronUp } from 'lucide-svelte';
	import Select from 'svelte-select';

	interface Meme {
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

	function filter() {
		memes = [];
		skip = 0;

		// triggers the scrollHandler again
		loaderId = new Date();
	}

	function filterByTag(e: CustomEvent) {
		filterTagId = e.detail.id;
		filter();
	}

	function clearFilterByTag(e: CustomEvent) {
		filterTagId = null;
		filter();
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

	onMount(loadTags);
</script>

<svelte:head>
	<base href="/memeboard" />
	<title>D-INFK Memeboard</title>
</svelte:head>

<main id="content" class="px-4">
	<h1 class="text-center text-4xl py-6 font-bold">D-INFK Discord Memeboard</h1>
	<div class="max-w-md mx-auto pb-5 text-black" id="tagFilter">
		<Select
			--border-focused="1px solid #0EA5E9"
			--clear-icon-color="#f9fafb"
			--chevron-color="#f9fafb"
			--selected-item-color="#f9fafb"
			--item-color="#f9fafb"
			--list-background="#3f3f46"
			--background="#3f3f46"
			items={tags}
			itemId="id"
			label="name"
			placeholder="Filter by tag…"
			clearable
			showChevron
			justValue
			on:change={filterByTag}
			on:clear={clearFilterByTag}
		/>
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 max-w-7xl gap-x-5 mx-auto">
		{#each memes as meme}
			<div class="mb-4 transition-all drop-shadow-md rounded-xl overflow-hidden">
				<Lightbox transitionDuration={100}>
					<img
						slot="thumbnail"
						class="!h-60 w-full object-cover"
						src="https://xyquadrat.ch/artarindo/media/thumb/{correctFilename(meme.filename)}"
						alt="Meme Thumbnail"
					/>
					{#if isVideo(meme.filename)}
						<!-- svelte-ignore a11y-media-has-caption -->
						<video controls src="https://xyquadrat.ch/artarindo/media/{meme.filename}" />
					{:else}
						<img src="https://xyquadrat.ch/artarindo/media/{meme.filename}" alt="Meme" />
					{/if}
				</Lightbox>
				<div class="rounded-b-xl bg-slate-700 px-4 py-2 flex flex-col">
					<div class="flex">
						<a
							href={meme.message_url}
							target="_blank"
							rel="noreferrer"
							class="flex items-center font-semibold"
						>
							<Link class="h-4 w-4 mr-2" />
							{meme.author_name}
						</a>
						<span class="ml-auto text-lg font-semibold text-sky-500 flex items-center">
							<ChevronUp />
							{meme.score}
						</span>
					</div>
					{#if meme.tags.length > 0}
						<div class="pt-3 flex flex-wrap gap-1.5">
							{#each meme.tags as tag}
								<span class="p-1 px-2 rounded-full text-gray-400 bg-gray-800 text-sm">
									{tag.name}
								</span>
							{/each}
						</div>
					{/if}
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
