<script lang="ts">
    import GridBackground from "$lib/components/ui/GridBackground.svelte";
    import ChallengeCard from "$lib/components/ChallengeCard.svelte";
    let { data } = $props<{ data }>();

    let searchQuery = $state("");
    let selectedDifficulty = $state<string | null>(null);

    const difficulties = ["beginner", "intermediate", "advanced"] as const;

    const filteredChallenges = $derived(
        data.challenges.filter((challenge: any) => {
            const matchesSearch =
                searchQuery === "" ||
                challenge.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                challenge.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesDifficulty =
                selectedDifficulty === null ||
                challenge.difficulty === selectedDifficulty;

            return matchesSearch && matchesDifficulty;
        }),
    );
</script>

<svelte:head>
    <title>Challenges - CraftCode</title>
    <meta
        name="description"
        content="Browse programming challenges. Build Redis, Git, Docker and more from scratch."
    />
</svelte:head>

<div class="relative min-h-screen max-w-4xl mx-auto">
    <GridBackground fadeEdges={true} animated={false} />

    <div class="relative px-4 sm:px-6 lg:px-8 py-12">
        <div class="mx-auto max-w-7xl">
            <!-- Header -->
            <div class=" mb-12">
                <h1 class="text-2 xl font-bold text-foreground mb-2">
                    Explore Challenges
                </h1>
                <p class="text-muted-foreground text-sm max-w-2xl">
                    Choose a project and start building. Each challenge guides
                    you through creating a real system from scratch.
                </p>
            </div>

            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-4 mb-8">
                <!-- Search -->
                <div class="relative flex-1">
                    <svg
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search challenges..."
                        bind:value={searchQuery}
                        class="input-field pl-12"
                    />
                </div>

                <!-- Difficulty Filter -->
                <div class="flex gap-2">
                    <button
                        class="px-4 py-1 rounded-xl text-sm font-medium transition-colors
              {selectedDifficulty === null
                            ? 'text-primary border border-border shadow-xl'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'}"
                        onclick={() => (selectedDifficulty = null)}
                    >
                        All
                    </button>
                    {#each difficulties as difficulty}
                        <button
                            class="px-4 py-1 rounded-xl text-sm font-medium capitalize transition-colors
                {selectedDifficulty === difficulty
                                ? ' text-primary border border-border shadow-xl'
                                : 'bg-secondary text-muted-foreground hover:text-foreground'}"
                            onclick={() => (selectedDifficulty = difficulty)}
                        >
                            {difficulty}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Challenge Grid -->
            {#if filteredChallenges.length > 0}
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                >
                    {#each filteredChallenges as challenge (challenge.id)}
                        <ChallengeCard
                            title={challenge.title}
                            description={challenge.description}
                            slug={challenge.slug}
                            difficulty={challenge.difficulty}
                            iconUrl={challenge.iconUrl}
                            stageCount={challenge.stageCount}
                            completedStages={challenge.completedStages}
                            authorName={challenge.authorName}
                        />
                    {/each}
                </div>
            {:else}
                <div
                    class="text-center py-20 border border-border rounded-2xl bg-linear-to-b from-background via-background to-secondary shadow-md"
                >
                    <div
                        class="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4"
                    >
                        <svg
                            class="w-8 h-8 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-foreground mb-2">
                        No challenges found
                    </h3>
                    <p class="text-muted-foreground">
                        Try adjusting your search or filters
                    </p>
                </div>
            {/if}
        </div>
    </div>
</div>
