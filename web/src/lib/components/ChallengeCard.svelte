<script lang="ts">
    import GlowCard from "./ui/GlowCard.svelte";
    import Badge from "./ui/Badge.svelte";

    interface Props {
        title: string;
        description: string;
        slug: string;
        difficulty: "beginner" | "intermediate" | "advanced";
        iconUrl?: string | null;
        stageCount?: number;
        completedStages?: number;
        authorName?: string;
    }

    let {
        title,
        description,
        slug,
        difficulty,
        iconUrl,
        stageCount = 0,
        completedStages = 0,
        authorName,
    }: Props = $props();

    const difficultyLabels = {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
    };

    const progressPercent =
        stageCount > 0 ? (completedStages / stageCount) * 100 : 0;
</script>

<a href="/challenges/{slug}" class="block group">
    <GlowCard className="h-full">
        <div class="p-2 bg-secondary flex flex-col h-full">
            <div class="bg-card p-4 rounded-2xl">
                <!-- Header -->
                <div class="flex items-center gap-2 mb-2">
                    {#if iconUrl}
                        <div
                            class="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0"
                        >
                            <img
                                src={iconUrl}
                                alt={title}
                                class="w-8 h-8 object-contain"
                            />
                        </div>
                    {:else}
                        <div
                            class="w-10 h-10 rounded-3xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center flex-shrink-0"
                        >
                            <span class="text-xl">🛠️</span>
                        </div>
                    {/if}

                    <div class="flex-1 min-w-0">
                        <h3
                            class="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate"
                        >
                            {title}
                        </h3>
                    </div>
                </div>

                <!-- Description -->
                <p
                    class="text-muted-foreground text-sm flex-1 line-clamp-2 mb-2"
                >
                    {description}
                </p>

                <!-- Footer -->
                <div
                    class="flex items-center justify-between mt-auto pt-4 border-t border-border"
                >
                    <Badge variant={difficulty}>
                        {difficultyLabels[difficulty]}
                    </Badge>

                    <div class="flex items-center gap-3">
                        {#if stageCount > 0}
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-20 h-1.5 bg-secondary rounded-full overflow-hidden"
                                >
                                    <div
                                        class="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
                                        style="width: {progressPercent}%"
                                    />
                                </div>
                                <span class="text-xs text-muted-foreground">
                                    {completedStages}/{stageCount}
                                </span>
                            </div>
                        {/if}
                        {#if authorName}
                            <p class="text-sm text-muted-foreground">
                                by {authorName}
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </GlowCard>
</a>

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
