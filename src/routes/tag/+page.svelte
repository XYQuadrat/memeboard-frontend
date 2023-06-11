<script lang="ts">
	import { onMount } from 'svelte';
	import { shortcut } from '../../shortcut';
	import { ChevronRight, ChevronUp, Link } from 'lucide-svelte';
	import Select from 'svelte-select';

	interface Meme {
		id: number;
		filename: string;
		author_id: number;
		author_name: string;
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
			body: JSON.stringify({ data: event.detail })
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
			<div class="mb-4 drop-shadow-md rounded-xl overflow-hidden">
				{#if isVideo}
					<!-- svelte-ignore a11y-media-has-caption -->
					<video controls src="https://xyquadrat.ch/artarindo/media/{meme.filename}" />
				{:else}
					<img
						src="https://xyquadrat.ch/artarindo/media/{meme.filename}"
						alt="Meme"
						class="w-full object-cover"
					/>
				{/if}
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
					<div class="text-black py-2">
						<Select
							--border-focused="1px solid #0EA5E9"
							--background="#3f3f46"
							items={tags}
							multiple
							value={meme.tags}
							itemId="id"
							label="name"
							justValue
							clearable={false}
							placeholder="Enter relevant tags…"
							on:change={handleNewTag}
						/>
					</div>
				</div>
			</div>
		{/if}
		<div class="mx-5 my-auto">
			<button use:shortcut={{ code: 'ArrowRight' }} on:click={next}>
				<ChevronRight color="white" />
			</button>
		</div>
	</div>
</main>
