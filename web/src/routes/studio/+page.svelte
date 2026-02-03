<script lang="ts">
    import GridBackground from "$lib/components/ui/GridBackground.svelte";
    import GlowCard from "$lib/components/ui/GlowCard.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { PageData } from "./$types";

    let { data } = $props<{ data: PageData }>();

    let showNewChallengeModal = $state(false);

    let searchQuery = $state("");
</script>

<svelte:head>
    <title>Creator Studio - CraftCode</title>
</svelte:head>

<div class="relative min-h-screen">
    <GridBackground fadeEdges={true} animated={false} />

    <div class="relative px-4 sm:px-6 lg:px-8 py-12">
        <div class="mx-auto max-w-7xl">
            <!-- Header -->
            <div
                class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
            >
                <div class=" mb-12">
                    <h1 class="text-2 xl font-bold text-foreground mb-2">
                        Create Challenges
                    </h1>
                    <p class="text-muted-foreground text-sm max-w-2xl">
                        Create a project and help others grow their coding
                        skills.
                    </p>
                </div>

                <div class="flex items-center gap-4">
                    {#if data.isCreator}
                        <button
                            onclick={() => (showNewChallengeModal = true)}
                            class="bg-linear-to-b from-primary/80 via-primary/80 to-primary text-primary-foreground px-6 py-1 rounded-full text-sm shadow-xl flex items-center justify-center outline-2 outline-offset-4 outline-border"
                        >
                            <svg
                                class="w-4 h-4 mr-2 inline"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            New Challenge
                        </button>
                    {/if}
                </div>
            </div>

            {#if !data.isCreator}
                <!-- Upgrade prompt -->
                <div class="bg-background p-2 border border-border rounded-2xl">
                    <GlowCard
                        className=" w-full flex items-center justify-center bg-secondary"
                    >
                        <div class="p-2 md:p-8 text-center max-w-sm">
                            <div
                                class="flex flex-row items-center justify-center w-full"
                            >
                                <div
                                    class="w-8 h-8 md:w-16 md:h-16 rounded-2xl flex items-center justify-center animate-shake"
                                >
                                    <svg
                                        class="w-4 h-4 md:w-8 md:h-8 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <h2 class="text-md md:text-3xl text-foreground">
                                    Become a Creator
                                </h2>
                            </div>
                            <p
                                class="text-muted-foreground max-w-md mx-auto mb-6"
                            >
                                Subscribe for just $5/month to create and
                                publish your own coding challenges. Share your
                                knowledge with developers worldwide.
                            </p>
                            <a href="/studio/subscribe" class="btn-primary">
                                <button
                                    class=" w-full py-1 text-sm md:text-lg rounded-xl md:rounded-2xl bg-linear-to-b hover:from-primary/70 from-primary/50 hover:via-primary/70 via-primary/90 duration-500 transition-colors to-primary text-secondary"
                                >
                                    Subscribe Now - $2/month
                                </button>
                            </a>
                        </div>
                    </GlowCard>
                </div>
            {/if}
            {#if data.isCreator}
                <div class="flex mb-8">
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
                </div>
            {/if}
        </div>

        <!-- Challenges Grid -->
        {#if data.challenges.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {#each data.challenges as challenge (challenge.id)}
                    <a
                        href="/studio/challenge/{challenge.id}"
                        class="block group bg-secondary rounded-4xl p-2 border border-border"
                    >
                        <GlowCard className="h-full bg-secondary">
                            <div class="px-6 py-4 bg-background">
                                <div class="flex items-start justify-between">
                                    <h3
                                        class="font-semibold text-lg text-foreground group-hover:text-primary transition-colors"
                                    >
                                        {challenge.title}
                                    </h3>
                                    <Badge
                                        variant={challenge.isPublished
                                            ? "default"
                                            : "intermediate"}
                                        size="sm"
                                    >
                                        {challenge.isPublished
                                            ? "Published"
                                            : "Draft"}
                                    </Badge>
                                </div>

                                <p
                                    class="text-muted-foreground text-sm line-clamp-2 mb-4"
                                >
                                    {challenge.description}
                                </p>
                                <div
                                    class="w-full h-0.5 my-2 bg-secondary"
                                ></div>
                                <div
                                    class="flex items-center justify-between text-sm text-muted-foreground px-2 py-1 rounded-xl"
                                >
                                    <span>{challenge.stageCount} stages</span>
                                    <span
                                        >Updated {new Date(
                                            challenge.updatedAt,
                                        ).toLocaleDateString()}</span
                                    >
                                </div>
                            </div>
                        </GlowCard>
                    </a>
                {/each}
            </div>
        {:else if data.isCreator}
            <GlowCard
                className="w-full flex items-center justify-center py-1 bg-secondary"
            >
                <div
                    class="p-12 max-w-md px-12 bg-card border border-border rounded-2xl"
                >
                    <div
                        class="w-11 h-11 border border-border rounded-full bg-secondary flex items-center justify-center mx-auto mb-4"
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-foreground">
                        Create your first challenge
                    </h3>
                    <p class="text-muted-foreground mb-6">
                        Get started by creating a new coding challenge. New
                        challenges with new levels.
                    </p>
                    <button
                        onclick={() => (showNewChallengeModal = true)}
                        class="bg-linear-to-b from-primary/80 w-full via-primary/80 hover:via-primary/80 transition-colors duration-200 to-primary text-secondary px-6 py-1 rounded-3xl"
                    >
                        Create Challenge
                    </button>
                </div>
            </GlowCard>
        {/if}
    </div>
</div>

<!-- New Challenge Modal would go here -->
{#if showNewChallengeModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onclick={() => (showNewChallengeModal = false)}
            aria-label="Close modal"
        />
        >
        <div class="p-2 bg-secondary rounded-xl relative border border-border">
            <div
                class="relative bg-card rounded-xl p-6 w-full max-w-sm border border-border"
            >
                <h2 class="text-lg font-semibold text-foreground">
                    Create New Challenge
                </h2>
                <p class="text-muted-foreground text-sm">
                    You can use this modal to create new challenges
                </p>

                <form
                    action="/studio/challenge/new"
                    method="POST"
                    class="space-y-4 mt-6"
                >
                    <div class="py-1">
                        <label
                            for="title"
                            class="block text-sm font-medium text-muted-foreground mb-1"
                            >Title</label
                        >
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            class="rounded-xl border border-border px-2 w-full py-1"
                            placeholder="Build Your Own Redis"
                        />
                    </div>

                    <div class="py-1">
                        <label
                            for="description"
                            class="block text-sm font-medium text-muted-foreground mb-1"
                            >Description</label
                        >
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows="3"
                            class="rounded-xl border border-border px-2 w-full resize-none"
                            placeholder="A brief description of the challenge..."
                        ></textarea>
                    </div>

                    <div>
                        <label
                            for="difficulty"
                            class="block text-sm font-medium text-muted-foreground mb-1"
                            >Difficulty</label
                        >
                        <select
                            id="difficulty"
                            name="difficulty"
                            required
                            class="input-field rounded-md placeholder:text-muted-foreground w-full text-center py-1"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label
                            for="type"
                            class="block text-sm font-medium text-muted-foreground mb-1"
                            >What type of Test ?</label
                        >

                        <select
                            id="type"
                            name="type"
                            required
                            class="input-field rounded-xl placeholder:text-muted-foreground w-full text-center py-1"
                        >
                            <option value="bash">Bash</option>
                            <option value="css">CSS</option>
                            <option value="node">Node.js</option>
                            <option value="python">Python3</option>
                            <option value="custom">Custom </option>
                        </select>
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            onclick={() => (showNewChallengeModal = false)}
                            class="flex-1 bg-secondary py-1 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="flex-1 bg-linear-to-b from-primary/70 via-primary/70 to-primary text-secondary rounded-xl"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
