<script lang="ts">
    import CodePlayground from "$lib/components/CodePlayground.svelte";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    // import {} from // Code01Icon,
    // BookOpen01Icon,
    // Settings01Icon,
    // SparklesIcon,
    // "@hugeicons/core-free-icons";

    let recentExecutions: any[] = [];
    let totalExecutions = 0;

    function handleExecute(result: any) {
        totalExecutions++;
        recentExecutions = [
            {
                id: Date.now(),
                success: result.status?.id === 3,
                time: result.time,
                status: result.status?.description,
            },
            ...recentExecutions.slice(0, 4),
        ];
    }
</script>

<svelte:head>
    <title>Code Playground | CraftCode</title>
    <meta
        name="description"
        content="Write, run, and test code in multiple programming languages directly in your browser with our online code playground."
    />
</svelte:head>

<div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <div
        class="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background"
    >
        <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div class="relative max-w-7xl mx-auto px-6 py-12">
            <div class="flex items-center justify-between">
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <div
                            class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                        >
                            <!-- <HugeiconsIcon
                                icon={Code01Icon}
                                size={24}
                                class="text-primary-foreground"
                            /> -->
                        </div>
                        <div>
                            <h1
                                class="text-3xl font-bold text-primary tracking-tight"
                            >
                                Code Playground
                            </h1>
                            <p class="text-muted-foreground">
                                Write, execute, and experiment with code
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="flex items-center gap-6">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-primary">
                            {totalExecutions}
                        </p>
                        <p class="text-xs text-muted-foreground">Executions</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-green-400">
                            {recentExecutions.filter((e) => e.success).length}
                        </p>
                        <p class="text-xs text-muted-foreground">Successful</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <!-- Playground -->
            <div class="lg:col-span-3">
                <CodePlayground
                    height="calc(100vh - 280px)"
                    onExecute={handleExecute}
                />
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Quick Info -->
                <div
                    class="p-5 rounded-xl border border-border bg-secondary/30"
                >
                    <h3
                        class="text-sm font-semibold text-primary mb-4 flex items-center gap-2"
                    >
                        <!-- <HugeiconsIcon icon={SparklesIcon} size={16} /> -->
                        Features
                    </h3>
                    <ul class="space-y-3 text-sm text-muted-foreground">
                        <li class="flex items-start gap-2">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span>11+ programming languages</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span>Syntax highlighting & autocomplete</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span>Custom input support</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span>Execution time & memory stats</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span>Keyboard shortcuts</span>
                        </li>
                    </ul>
                </div>

                <!-- Keyboard Shortcuts -->
                <div
                    class="p-5 rounded-xl border border-border bg-secondary/30"
                >
                    <h3
                        class="text-sm font-semibold text-primary mb-4 flex items-center gap-2"
                    >
                        <!-- <HugeiconsIcon icon={Settings01Icon} size={16} /> -->
                        Shortcuts
                    </h3>
                    <div class="space-y-2 text-sm">
                        <div
                            class="flex items-center justify-between text-muted-foreground"
                        >
                            <span>Run code</span>
                            <div class="flex gap-1">
                                <kbd
                                    class="px-2 py-0.5 bg-background rounded text-xs border border-border"
                                    >Ctrl</kbd
                                >
                                <span>+</span>
                                <kbd
                                    class="px-2 py-0.5 bg-background rounded text-xs border border-border"
                                    >Enter</kbd
                                >
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-between text-muted-foreground"
                        >
                            <span>Save</span>
                            <div class="flex gap-1">
                                <kbd
                                    class="px-2 py-0.5 bg-background rounded text-xs border border-border"
                                    >Ctrl</kbd
                                >
                                <span>+</span>
                                <kbd
                                    class="px-2 py-0.5 bg-background rounded text-xs border border-border"
                                    >S</kbd
                                >
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-between text-muted-foreground"
                        >
                            <span>Fullscreen</span>
                            <kbd
                                class="px-2 py-0.5 bg-background rounded text-xs border border-border"
                                >F11</kbd
                            >
                        </div>
                    </div>
                </div>

                <!-- Recent Executions -->
                {#if recentExecutions.length > 0}
                    <div
                        class="p-5 rounded-xl border border-border bg-secondary/30"
                    >
                        <h3
                            class="text-sm font-semibold text-primary mb-4 flex items-center gap-2"
                        >
                            <!-- <HugeiconsIcon icon={BookOpen01Icosn} size={16} /> -->
                            Recent Runs
                        </h3>
                        <div class="space-y-2">
                            {#each recentExecutions as exec}
                                <div
                                    class="flex items-center justify-between p-2 rounded-lg bg-background/50 text-sm"
                                >
                                    <span
                                        class="{exec.success
                                            ? 'text-green-400'
                                            : 'text-red-400'} font-medium"
                                    >
                                        {exec.success ? "✓" : "✗"}
                                        {exec.status || "Unknown"}
                                    </span>
                                    {#if exec.time}
                                        <span
                                            class="text-xs text-muted-foreground font-mono"
                                            >{exec.time}s</span
                                        >
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Supported Languages -->
                <div
                    class="p-5 rounded-xl border border-border bg-secondary/30"
                >
                    <h3
                        class="text-sm font-semibold text-primary mb-4 flex items-center gap-2"
                    >
                        <!-- <HugeiconsIcon icon={Code01Icon} size={16} /> -->
                        Languages
                    </h3>
                    <div class="flex flex-wrap gap-2">
                        {#each ["JS", "TS", "Python", "Java", "C", "C++", "Go", "Rust", "Ruby", "PHP", "Bash"] as lang}
                            <span
                                class="px-2 py-1 text-xs font-medium rounded-md bg-background border border-border text-muted-foreground"
                            >
                                {lang}
                            </span>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .bg-grid-pattern {
        background-image: radial-gradient(
            circle,
            var(--color-border) 1px,
            transparent 1px
        );
        background-size: 24px 24px;
    }
</style>
