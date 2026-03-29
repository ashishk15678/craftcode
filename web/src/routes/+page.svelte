<script context="module" lang="ts">
    const featuredChallenges = [
        {
            title: "Build Your Own Redis",
            slug: "redis",
            description:
                "Implement a Redis server from scratch, supporting PING, GET, SET, and more commands.",
            icon: "🔴",
            difficulty: "Intermediate",
            difficultyColor: "amber",
            stages: 12,
        },
        {
            title: "Build Your Own Git",
            slug: "git",
            description:
                "Create a Git implementation supporting init, add, commit, and branching.",
            icon: "📦",
            difficulty: "Advanced",
            difficultyColor: "rose",
            stages: 15,
        },
        {
            title: "Build Your Own HTTP Server",
            slug: "http-server",
            description:
                "Build an HTTP/1.1 server that handles requests, routing, and file serving.",
            icon: "🌐",
            difficulty: "Beginner",
            difficultyColor: "emerald",
            stages: 8,
        },
    ];
</script>

<script lang="ts">
    import GridBackground from "$lib/components/ui/GridBackground.svelte";
</script>

<div
    class="relative min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden"
>
    <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="absolute inset-0 opacity-40">
            <!-- <GridBackground fadeEdges={true} /> -->
        </div>

        <div class="absolute inset-0 flex justify-center">
            <div
                class="w-full max-w-6xl border-x border-border/20 h-full relative"
            >
                <div
                    class="absolute left-[10%] top-0 w-px h-full bg-border/10"
                ></div>
                <div
                    class="absolute right-[10%] top-0 w-px h-full bg-border/10"
                ></div>
            </div>
        </div>
    </div>

    <div class="absolute inset-0 z-10 pointer-events-none">
        <div class="max-w-7xl mx-auto h-full relative">
            <div class="absolute top-0 left-[5%] -translate-y-1/2">
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-3 h-[1px] bg-orange-500/40"></div>
                    <div class="absolute h-3 w-[1px] bg-orange-500/40"></div>
                </div>
            </div>
            <div class="absolute top-0 right-[5%] -translate-y-1/2">
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-3 h-[1px] bg-orange-500/40"></div>
                    <div class="absolute h-3 w-[1px] bg-orange-500/40"></div>
                </div>
            </div>

            <div class="absolute top-[10%] left-[2%] opacity-15">
                <div class="grid grid-cols-2 gap-2">
                    {#each Array(4) as _}
                        <div class="w-1.5 h-1.5 bg-foreground"></div>
                    {/each}
                </div>
            </div>
            <div class="absolute top-[60%] right-[2%] opacity-15">
                <div class="grid grid-cols-3 gap-2">
                    {#each Array(6) as _}
                        <div class="w-1 h-1 bg-foreground"></div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <main class="relative z-20">
        <section
            class="max-w-6xl mx-auto px-4 pt-32 pb-24 border-b border-border/40"
        >
            <div class="text-center max-w-3xl mx-auto">
                <div
                    class="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-secondary/50 backdrop-blur-md border border-border/50 mb-8"
                >
                    <span
                        class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"
                    ></span>
                    New: Build Your Own Redis Challenge
                </div>

                <h1
                    class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
                >
                    <span
                        class="bg-primary text-transparent to-primary bg-clip-text"
                    >
                        Learn by <span class="rubik-storm-regular text-6xl"
                            >Building</span
                        >
                        <br /> Complex Systems
                    </span>
                </h1>

                <p
                    class="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    Master programming fundamentals by recreating real-world
                    tools from scratch. Build Redis, Git, Docker, and more with
                    hands-on, CLI-driven challenges.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/auth/register"
                        class="bg-gradient-to-b from-foreground/50 via-foreground to-foreground text-background px-8 py-1 rounded-lg font-semibold transition-all"
                    >
                        Start Learning Free
                    </a>
                    <a
                        href="/challenges"
                        class="bg-secondary/80 backdrop-blur-sm border border-border px-8 py-1 rounded-lg font-semibold hover:bg-secondary transition-all"
                    >
                        Browse Challenges
                    </a>
                </div>
            </div>
        </section>

        <div
            class="max-w-6xl mx-auto grid divide-border grid-cols-3 border-b border-border/40 bg-background/30"
        >
            {#each [["10+", "Challenges"], ["5K+", "Learners"], ["100+", "Stages"]] as [val, label]}
                <div
                    class="py-12 text-center border-r last:border-r-0 border-border/40"
                >
                    <div class="text-3xl font-bold tracking-tighter">{val}</div>
                    <div
                        class="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium"
                    >
                        {label}
                    </div>
                </div>
            {/each}
        </div>

        <section class="max-w-6xl mx-auto py-24 px-8">
            <div class="flex justify-between items-end mb-12">
                <h2 class="text-2xl font-bold tracking-tight">
                    Featured Challenges
                </h2>
                <a
                    href="/challenges"
                    class="text-orange-500 text-sm font-bold hover:translate-x-1 transition-transform"
                    >View All →</a
                >
            </div>

            <div
                class="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/20 border border-border/20 overflow-hidden rounded-xl"
            >
                {#each featuredChallenges as challenge}
                    <div
                        class="bg-background p-8 group hover:bg-secondary/30 transition-colors"
                    >
                        <div
                            class="text-3xl mb-6 grayscale group-hover:grayscale-0 transition-all"
                        >
                            {challenge.icon}
                        </div>
                        <h3 class="font-bold mb-1">{challenge.title}</h3>
                        <p
                            class="text-[10px] font-mono uppercase text-orange-500/80 mb-4"
                        >
                            {challenge.difficulty}
                        </p>
                        <p
                            class="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed"
                        >
                            {challenge.description}
                        </p>
                        <a
                            href="/challenges/{challenge.slug}"
                            class="text-sm font-bold flex items-center gap-1 group-hover:text-orange-500 transition-colors"
                        >
                            Start Challenge <span
                                class="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                                >→</span
                            >
                        </a>
                    </div>
                {/each}
            </div>
        </section>
        <section
            class="max-w-6xl mx-auto py-32 px-8 border-b border-border/40 relative"
        >
            <div
                class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-4 h-[1px] bg-orange-500/50"></div>
                    <div class="absolute h-4 w-[1px] bg-orange-500/50"></div>
                </div>
            </div>

            <div class="text-center max-w-2xl mx-auto mb-16">
                <h2 class="text-3xl font-bold tracking-tight mb-4">
                    Simple, Transparent Pricing
                </h2>
                <p class="text-muted-foreground">
                    Everything you need to master systems programming.
                </p>
            </div>

            <div
                class="grid md:grid-cols-2 divide-border gap-px bg-border/20 border border-border/20 rounded-2xl overflow-hidden max-w-4xl mx-auto"
            >
                <div class="bg-background p-10 flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-xl mb-2">
                            Local Development
                        </h3>
                        <div class="flex items-baseline gap-1 mb-6">
                            <span class="text-4xl font-bold">$0</span>
                            <span class="text-muted-foreground">/forever</span>
                        </div>
                        <ul class="space-y-4 text-sm text-muted-foreground">
                            <li class="flex items-center gap-2 text-foreground">
                                <span class="text-orange-500">✓</span> Full access
                                to all challenges
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="text-orange-500">✓</span> Unlimited local
                                CLI testing
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="text-orange-500">✓</span> Community Support
                            </li>
                        </ul>
                    </div>
                    <button
                        class="mt-10 w-full py-3 border border-border rounded-lg font-semibold hover:bg-secondary transition-colors"
                    >
                        Get Started
                    </button>
                </div>

                <div
                    class="bg-secondary/30 backdrop-blur-sm p-10 flex flex-col justify-between relative overflow-hidden"
                >
                    <div class="absolute top-0 right-0 p-4">
                        <span
                            class="text-[10px] font-mono uppercase bg-orange-500/20 text-orange-500 px-2 py-1 rounded"
                            >Convenience</span
                        >
                    </div>

                    <div>
                        <h3 class="font-bold text-xl mb-2">Cloud Sandbox</h3>
                        <div class="flex items-baseline gap-1 mb-6">
                            <span class="text-4xl font-bold">$5</span>
                            <span class="text-muted-foreground">/month</span>
                        </div>
                        <p class="text-sm text-muted-foreground mb-6 italic">
                            Perfect if you want to skip the local environment
                            setup.
                        </p>
                        <ul class="space-y-4 text-sm text-muted-foreground">
                            <li class="flex items-center gap-2 text-foreground">
                                <span class="text-orange-500">✓</span> Run & test
                                code in the browser
                            </li>
                            <li class="flex items-center gap-2 text-foreground">
                                <span class="text-orange-500">✓</span> Zero local
                                setup required
                            </li>
                            <li class="flex items-center gap-2 text-foreground">
                                <span class="text-orange-500">✓</span> Cloud-persistent
                                workspaces
                            </li>
                        </ul>
                    </div>
                    <button
                        class="mt-10 w-full py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-all"
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>

            <div class="absolute bottom-8 right-8 opacity-10">
                <div class=" grid grid-cols-2 gap-2">
                    {#each Array(4) as _}
                        <div class="w-1.5 h-1.5 bg-foreground"></div>
                    {/each}
                </div>
            </div>
        </section>
        <!-- CTA Section -->
        <section class=" px-4 sm:px-6 lg:px-8 py-20">
            <div class="mx-auto max-w-4xl">
                <div
                    class="grain-container p-8 sm:p-12 text-center bg-linear-to-b from-background to-secondary shadow-xl shadow-black rounded-2xl border border-border"
                >
                    <div>
                        <h2
                            class="text-3xl sm:text-4xl font-bold text-foreground mb-4"
                        >
                            Ready to Start Building?
                        </h2>
                        <p
                            class="text-muted-foreground text-lg mb-8 max-w-lg mx-auto"
                        >
                            Join thousands of developers who are mastering
                            programming by building real systems.
                        </p>
                        <a
                            href="/auth/register"
                            class="bg-background/60 border-2 border-border backdrop-blur-xl
                                text-primary rounded-2xl px-12 md:px-28 py-4 shadow-primary"
                        >
                            Get Started for Free
                        </a>
                    </div>
                    <div class="bg-amber-800 -bottom-10 p-4 blur-2xl"></div>
                </div>
            </div>
        </section>
    </main>
</div>

<style>
    :global(body) {
        background-color: #0a0a0a;
    }
</style>
