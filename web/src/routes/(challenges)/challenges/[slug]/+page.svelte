<script lang="ts">
    import GridBackground from "$lib/components/ui/GridBackground.svelte";
    import GlowCard from "$lib/components/ui/GlowCard.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import MarkdownRenderer from "$lib/components/MarkdownRenderer.svelte";
    import CSSBattleEditor from "$lib/components/challenge/CSSBattleEditor.svelte";
    import type { PageData } from "./$types";
    import { marked } from "marked";
    import CodeComp from "$lib/components/CodeComp.svelte";
    import CodeExecutor from "$lib/components/CodeExecutor.svelte";
    import ChallengeCodeEditor from "$lib/components/ChallengeCodeEditor.svelte";

    let { data } = $props<{ data: PageData }>();
    let selectedStageId = $state<string | null>(data.stages[0]?.id || null);

    const selectedStage = $derived(
        data.stages.find((s: any) => s.id === selectedStageId),
    );

    const renderedInstructions = $derived(
        selectedStage ? marked.parse(selectedStage.instructionsMd) : "",
    );

    const completedCount = $derived(
        data.stages.filter((s: any) => s.isCompleted).length,
    );

    const difficultyLabels: Record<string, string> = {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
    };

    const isCSSChallenge = $derived(data.challenge.testRunnerType === "CSS");

    function handleTestComplete(result: any) {
        // Refresh the page data or update UI after successful completion
        if (result.success && result.lessonComplete) {
            // Could navigate to next stage or show success message
            console.log("Stage completed!", result);
        }
    }
</script>

<svelte:head>
    <title>{data.challenge.title} - CraftCode</title>
    <meta name="description" content={data.challenge.description} />
</svelte:head>

<div class="relative min-h-screen w-full max-w-4xl mx-auto">
    <GridBackground fadeEdges={true} animated={false} />

    <div class="relative w-full">
        <!-- Hero -->
        <section class="px-4 sm:px-6 lg:px-8 py-12 border-b border-border">
            <div class="mx-auto max-w-7xl">
                <div class="flex flex-col lg:flex-row gap-8 items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-4">
                            <Badge
                                variant={data.challenge.difficulty as
                                    | "beginner"
                                    | "intermediate"
                                    | "advanced"}
                            >
                                {difficultyLabels[data.challenge.difficulty]}
                            </Badge>
                            {#if data.challenge.authorName}
                                <span class="text-sm text-muted-foreground"
                                    >by <span class="font-bold">
                                        {data.challenge.authorName}</span
                                    >
                                </span>
                            {/if}
                        </div>

                        <h1 class="text-2xl font-bold text-foreground">
                            {data.challenge.title}
                        </h1>

                        <p class="text-lg text-muted-foreground mb-8">
                            {data.challenge.description}
                        </p>

                        <div class="flex flex-wrap items-center gap-4">
                            <div
                                class="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                                <span>{data.stages.length} stages</span>
                            </div>

                            <div class="flex items-center gap-2">
                                <div
                                    class="w-32 h-2 bg-secondary rounded-full overflow-hidden"
                                >
                                    <div
                                        class="h-full bg-gradient-to-r from-primary to-blue-500 transition-all"
                                        style="width: {data.stages.length > 0
                                            ? (completedCount /
                                                  data.stages.length) *
                                              100
                                            : 0}%"
                                    />
                                </div>
                                <span class="text-sm text-muted-foreground"
                                    >{completedCount}/{data.stages.length}</span
                                >
                            </div>

                            {#if data.challenge.isOwner}
                                <a
                                    href="/studio/challenge/{data.challenge.id}"
                                    class="bg-secondary text-primary px-4 py-1 rounded-2xl border border-border text-sm"
                                >
                                    Edit Challenge
                                </a>
                            {/if}
                        </div>
                    </div>

                    {#if !isCSSChallenge}
                        <GlowCard
                            className="w-full lg:w-80  shadow-xl bg-gradient-to-b from-secondary/10 via-secondary/30 to-primary/5"
                        >
                            <div class="p-5">
                                <h3 class="font-semibold text-foreground">
                                    Get Started
                                </h3>
                                <p class="text-sm text-muted-foreground mb-4">
                                    Install the CLI and run tests locally or use
                                    our web sandbox.
                                </p>
                                <div class=" font-mono text-sm">
                                    <div class="">
                                        <div class="text-primary">
                                            # Install cli<br /> npm i -g craftcode
                                        </div>
                                        <div class="text-muted-foreground mt-2">
                                            # Run tests<br /> craftcode test
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlowCard>
                    {:else}
                        <GlowCard
                            className="w-full lg:w-80 shadow-xl bg-linear-to-b from-background via-background to-secondary"
                        >
                            <div class="p-5">
                                <h3 class="font-semibold text-foreground">
                                    CSS Battle
                                </h3>
                                <p class="text-sm text-muted-foreground mb-4">
                                    Recreate the target image using HTML/CSS or
                                    React+Tailwind. Match at least {selectedStage?.matchThreshold ||
                                        95}% to pass.
                                </p>
                                <div class="flex items-center gap-2 text-sm">
                                    <span class="text-muted-foreground"
                                        >Canvas:</span
                                    >
                                    <span class="font-mono text-primary"
                                        >{selectedStage?.canvasWidth ||
                                            400}×{selectedStage?.canvasHeight ||
                                            300}</span
                                    >
                                </div>
                            </div>
                        </GlowCard>
                    {/if}
                </div>
            </div>
        </section>

        <!-- Content -->
        <section class=" sm:px-6 py-8 w-full">
            <div class="mx-auto w-full">
                <div class="flex flex-col h-full gap-8 w-full">
                    <!-- Stage sidebar -->
                    <aside
                        class="w-full flex-shrink-0
                             [&::-webkit-scrollbar]:h-1
                             [&::-webkit-scrollbar-track]:bg-slate-100
                             [&::-webkit-scrollbar-thumb]:bg-slate-300
                             [&::-webkit-scrollbar-thumb]:rounded-full
                             hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"
                    >
                        <div class="sticky top-20 w-full">
                            <h2 class="font-semibold text-foreground mb-4">
                                Stages
                            </h2>
                            <div
                                class="space-y-2 flex gap-x-2 overflow-x-auto flex-1 w-full"
                            >
                                {#each data.stages as stage (stage.id)}
                                    <button
                                        class=" text-left px-2 py-1 rounded-xl transition-colors flex items-center gap-3 flex-1 max-w-32
                      {selectedStageId === stage.id
                                            ? 'bg-primary/10 border border-primary/20'
                                            : 'bg-card border border-border hover:border-primary/30'}"
                                        onclick={() =>
                                            (selectedStageId = stage.id)}
                                    >
                                        <div
                                            class="w-4 h-4 rounded-full flex items-center justify-center
                        {stage.isCompleted
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-secondary text-muted-foreground'}"
                                        >
                                            {#if stage.isCompleted}
                                                <svg
                                                    class="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            {:else}
                                                <span
                                                    class="text-xs font-medium"
                                                    >{stage.order}</span
                                                >
                                            {/if}
                                        </div>
                                        <span
                                            class="font-medium text-foreground truncate text-xs"
                                            >{stage.title}</span
                                        >
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </aside>

                    <!-- Main Content Area -->
                    <main class="flex-1 min-w-0">
                        {#if selectedStage}
                            {#if isCSSChallenge}
                                <!-- CSS Battle Editor -->
                                <div
                                    class="h-[calc(100vh-200px)] rounded-2xl overflow-hidden border border-border max-w-4xl"
                                >
                                    <CSSBattleEditor
                                        lessonId={selectedStage.id}
                                        challengeSlug={data.challenge.slug}
                                        targetImageUrl={selectedStage.targetImageUrl ||
                                            ""}
                                        targetCode={selectedStage.targetCode ||
                                            ""}
                                        canvasWidth={selectedStage.canvasWidth ||
                                            400}
                                        canvasHeight={selectedStage.canvasHeight ||
                                            300}
                                        matchThreshold={selectedStage.matchThreshold ||
                                            95}
                                        onTestComplete={handleTestComplete}
                                    />
                                </div>
                            {:else}
                                <!-- Standard Instructions -->
                                <!-- <GlowCard>
                                    <div class="p-6 sm:p-8">
                                        <div
                                            class="flex items-center gap-3 mb-6"
                                        >
                                            <div
                                                class="w-8 h-8 rounded-full flex items-center justify-center
                        {selectedStage.isCompleted
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-primary text-primary-foreground'}"
                                            >
                                                {#if selectedStage.isCompleted}
                                                    <svg
                                                        class="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                {:else}
                                                    <span class="font-medium"
                                                        >{selectedStage.order}</span
                                                    >
                                                {/if}
                                            </div>
                                            <h2
                                                class="text-2xl font-bold text-foreground"
                                            >
                                                {selectedStage.title}
                                            </h2>
                                        </div>
                                        <div class="text-primary">
                                            <MarkdownRenderer
                                                content={renderedInstructions as string}
                                            />
                                        </div>
                                    </div>
                                </GlowCard> -->
                            {/if}
                        {:else}
                            <div
                                class="text-center py-20 text-muted-foreground"
                            >
                                Select a stage to view instructions
                            </div>
                        {/if}
                        {#if !isCSSChallenge}
                            <div></div>
                            <CodeExecutor {data} />
                            <ChallengeCodeEditor stageId={data.stages.id} />
                        {/if}
                    </main>
                </div>
            </div>
        </section>
    </div>
</div>
