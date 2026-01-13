<script lang="ts">
    import GridBackground from "$lib/components/ui/GridBackground.svelte";
    import GlowCard from "$lib/components/ui/GlowCard.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { PageData } from "./$types";

    let { data } = $props<{ data: PageData }>();

    let showNewChallengeModal = $state(false);
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
                <div>
                    <h1
                        class="text-3xl sm:text-4xl font-bold text-foreground mb-2"
                    >
                        Creator Studio
                    </h1>
                    <p class="text-muted-foreground">
                        Create and manage your coding challenges
                    </p>
                </div>

                <div class="flex items-center gap-4">
                    {#if !data.isCreator}
                        <a href="/studio/subscribe" class="btn-primary">
                            Upgrade to Creator
                        </a>
                    {:else}
                        <button
                            onclick={() => (showNewChallengeModal = true)}
                            class="btn-primary"
                        >
                            <svg
                                class="w-5 h-5 mr-2 inline"
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
                <GlowCard className="mb-8">
                    <div class="p-8 text-center">
                        <div
                            class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6"
                        >
                            <svg
                                class="w-8 h-8 text-primary"
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
                        <h2 class="text-2xl font-bold text-foreground mb-3">
                            Become a Creator
                        </h2>
                        <p class="text-muted-foreground max-w-md mx-auto mb-6">
                            Subscribe for just $2/month to create and publish
                            your own coding challenges. Share your knowledge
                            with developers worldwide.
                        </p>
                        <a href="/studio/subscribe" class="btn-primary">
                            Subscribe Now - $2/month
                        </a>
                    </div>
                </GlowCard>
            {/if}

            <!-- Challenges Grid -->
            {#if data.challenges.length > 0}
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {#each data.challenges as challenge (challenge.id)}
                        <a
                            href="/studio/challenge/{challenge.id}"
                            class="block group"
                        >
                            <GlowCard className="h-full">
                                <div class="p-6">
                                    <div
                                        class="flex items-start justify-between mb-4"
                                    >
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
                                        class="flex items-center justify-between text-sm text-muted-foreground"
                                    >
                                        <span
                                            >{challenge.stageCount} stages</span
                                        >
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
                <GlowCard>
                    <div class="p-12 text-center">
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
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-foreground mb-2">
                            Create your first challenge
                        </h3>
                        <p class="text-muted-foreground mb-6">
                            Get started by creating a new coding challenge
                        </p>
                        <button
                            onclick={() => (showNewChallengeModal = true)}
                            class="btn-primary"
                        >
                            Create Challenge
                        </button>
                    </div>
                </GlowCard>
            {/if}
        </div>
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
        <div
            class="relative bg-card border border-border rounded-xl p-6 w-full max-w-md"
        >
            <h2 class="text-xl font-semibold text-foreground mb-4">
                Create New Challenge
            </h2>

            <form
                action="/studio/challenge/new"
                method="POST"
                class="space-y-4"
            >
                <div>
                    <label
                        for="title"
                        class="block text-sm font-medium text-foreground mb-2"
                        >Title</label
                    >
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        class="input-field"
                        placeholder="Build Your Own Redis"
                    />
                </div>

                <div>
                    <label
                        for="description"
                        class="block text-sm font-medium text-foreground mb-2"
                        >Description</label
                    >
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows="3"
                        class="input-field resize-none"
                        placeholder="A brief description of the challenge..."
                    ></textarea>
                </div>

                <div>
                    <label
                        for="difficulty"
                        class="block text-sm font-medium text-foreground mb-2"
                        >Difficulty</label
                    >
                    <select
                        id="difficulty"
                        name="difficulty"
                        required
                        class="input-field"
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                <div class="flex gap-3 pt-4">
                    <button
                        type="button"
                        onclick={() => (showNewChallengeModal = false)}
                        class="flex-1 btn-secondary"
                    >
                        Cancel
                    </button>
                    <button type="submit" class="flex-1 btn-primary">
                        Create
                    </button>
                </div>
            </form>
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
