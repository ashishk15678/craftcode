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
    import GlowCard from "$lib/components/ui/GlowCard.svelte";
    import { theme } from "$lib/stores/theme";
</script>

<svelte:head>
    <title>CraftCode - Learn by Building Complex Systems</title>
    <meta
        name="description"
        content="Master programming by building real-world systems from scratch. Redis, Git, Docker and more."
    />
</svelte:head>

<div class="relative">
    <GridBackground fadeEdges={true} />

    <!-- Hero Section -->
    <section
        class="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32"
    >
        <div class="mx-auto">
            <div class="text-center max-w-2xl mx-auto">
                <!-- Badge -->
                <div
                    class="inline-flex items-center gap-2 px-6 py-1 text-muted-foreground text-sm rounded-full bg-linear-120 from-secondary/20 to-primary/10
                    border border-border mb-8"
                >
                    New: Build Your Own Redis Challenge
                </div>

                <h1
                    class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
                >
                    <span
                        class="bg-primary text-transparent to-primary bg-clip-text"
                        >Learn by Building <br /> Complex Systems</span
                    >
                </h1>
                <p
                    class="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                    Master programming fundamentals by recreating real-world
                    tools from scratch. Build Redis, Git, Docker, and more with
                    hands-on, CLI-driven challenges.
                </p>

                <!-- CTA Buttons -->
                <div
                    class="flex flex-col sm:flex-row gap-4 justify-center mt-4"
                >
                    <a
                        href="/auth/register"
                        class="  bg-linear-90 from-primary/80 hover:to-primary/80 transition-colors duration-300 via-primary/80 to-primary text-secondary px-8 py-2 rounded-4xl"
                    >
                        Start Learning Free
                    </a>
                    <a
                        href="/challenges"
                        class="bg-secondary rounded-4xl text-base px-8 py-2 border border-border text-primary"
                    >
                        Browse Challenges
                    </a>
                </div>

                <!-- Stats -->
                <div class="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                    <div class="text-center">
                        <div
                            class="text-2xl sm:text-3xl font-bold text-foreground"
                        >
                            10+
                        </div>
                        <div class="text-sm text-muted-foreground">
                            Challenges
                        </div>
                    </div>
                    <div class="text-center">
                        <div
                            class="text-2xl sm:text-3xl font-bold text-foreground"
                        >
                            5K+
                        </div>
                        <div class="text-sm text-muted-foreground">
                            Learners
                        </div>
                    </div>
                    <div class="text-center">
                        <div
                            class="text-2xl sm:text-3xl font-bold text-foreground"
                        >
                            100+
                        </div>
                        <div class="text-sm text-muted-foreground">Stages</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="relative px-4 sm:px-6 lg:px-8 py-20 mx-3xl">
        <div class="mx-auto max-w-4xl">
            <div class=" mb-16">
                <h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                    How It Works
                </h2>
                <p class="text-muted-foreground text-lg mx-auto">
                    A unique learning experience that combines theory with
                    practice
                </p>
            </div>

            <div class="flex flex-row relative w-full">
                <div class="bg-secondary [perspective:1200px]">
                    <GlowCard
                        className="paper-lift-card rounded-none flex flex-col gap-y-3 items-start p-6 border-b
                                   sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0
                                   sm:[&:nth-child(n+5)]:border-b-0 lg:[&:nth-child(n+4)]:border-b-0"
                    >
                        <div class="p-4">
                            <h3
                                class="text-xl font-semibold text-foreground mb-3"
                            >
                                Choose a Challenge
                            </h3>
                            <p class="text-muted-foreground">
                                Pick from challenges like "Build Your Own Redis"
                                or "Build Your Own Git" based on your interests.
                            </p>
                        </div>
                    </GlowCard>
                </div>

                <div class="bg-secondary [perspective:1200px]">
                    <GlowCard
                        className="paper-lift-card rounded-none flex flex-col gap-y-3 items-start p-6 border-b
                                       sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0
                                       sm:[&:nth-child(n+5)]:border-b-0 lg:[&:nth-child(n+4)]:border-b-0"
                    >
                        <div class="p-4">
                            <h3
                                class="text-xl font-semibold text-foreground mb-3"
                            >
                                Level Up
                            </h3>
                            <p class="text-muted-foreground">
                                Progress through stages, unlock new challenges,
                                and build a portfolio of impressive projects.
                            </p>
                        </div>
                    </GlowCard>
                </div>

                <div class="bg-secondary [perspective:1200px]">
                    <GlowCard
                        className="paper-lift-card rounded-none flex flex-col gap-y-3 items-start p-6 border-b
                                           sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0
                                           sm:[&:nth-child(n+5)]:border-b-0 lg:[&:nth-child(n+4)]:border-b-0"
                    >
                        <div class="p-4">
                            <h3
                                class="text-xl font-semibold text-foreground mb-3"
                            >
                                Code & Test
                            </h3>
                            <p class="text-muted-foreground">
                                Write code in your favorite editor and use our
                                CLI to run automated tests against your
                                implementation.
                            </p>
                        </div>
                    </GlowCard>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Challenges -->
    <section class="relative px-4 sm:px-6 lg:px-8 py-20 bg-card/50">
        <div class="mx-auto max-w-4xl">
            <div class="flex items-center justify-between mb-12">
                <div>
                    <h2
                        class="text-3xl sm:text-4xl font-bold text-foreground mb-2"
                    >
                        Featured Challenges
                    </h2>
                    <p class="text-muted-foreground">
                        Start your journey with these popular challenges
                    </p>
                </div>
                <a
                    href="/challenges"
                    class="text-primary underline hidden sm:inline-flex"
                >
                    View All
                </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each featuredChallenges as challenge}
                    <GlowCard>
                        <div class="p-6">
                            <div class="flex items-center gap-4 mb-4">
                                <div
                                    class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center"
                                >
                                    <span class="text-2xl"
                                        >{challenge.icon}</span
                                    >
                                </div>
                                <div>
                                    <h3 class="font-semibold text-foreground">
                                        {challenge.title}
                                    </h3>
                                    <span
                                        class="text-sm text-{challenge.difficultyColor}-400"
                                        >{challenge.difficulty}</span
                                    >
                                </div>
                            </div>
                            <p class="text-muted-foreground text-sm mb-4">
                                {challenge.description}
                            </p>
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-muted-foreground"
                                    >{challenge.stages} stages</span
                                >
                                <a
                                    href="/challenges/{challenge.slug}"
                                    class="text-primary text-sm font-medium hover:underline"
                                >
                                    Start →
                                </a>
                            </div>
                        </div>
                    </GlowCard>
                {/each}
            </div>

            <div class="mt-8 text-center sm:hidden">
                <a href="/challenges" class="btn-secondary"
                    >View All Challenges</a
                >
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
</div>
