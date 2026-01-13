<script lang="ts">
  import GridBackground from '$lib/components/ui/GridBackground.svelte';
  import GlowCard from '$lib/components/ui/GlowCard.svelte';
</script>

<svelte:head>
  <title>CraftCode - Learn by Building Complex Systems</title>
  <meta name="description" content="Master programming by building real-world systems from scratch. Redis, Git, Docker and more." />
</svelte:head>

<div class="relative">
  <GridBackground fadeEdges={true} />

  <!-- Hero Section -->
  <section class="relative px-4 sm:px-6 lg:px-8 pt-20 pb-32">
    <div class="mx-auto max-w-7xl">
      <div class="text-center max-w-4xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span class="text-sm text-primary font-medium">New: Build Your Own Redis Challenge</span>
        </div>

        <!-- Heading -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          <span class="text-foreground">Learn by </span>
          <span class="text-gradient">Building</span>
          <br />
          <span class="text-foreground">Complex Systems</span>
        </h1>

        <p class="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Master programming fundamentals by recreating real-world tools from scratch.
          Build Redis, Git, Docker, and more with hands-on, CLI-driven challenges.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/auth/register" class="btn-primary text-base px-8 py-4">
            Start Learning Free
          </a>
          <a href="/challenges" class="btn-secondary text-base px-8 py-4">
            Browse Challenges
          </a>
        </div>

        <!-- Stats -->
        <div class="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-foreground">10+</div>
            <div class="text-sm text-muted-foreground">Challenges</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-foreground">5K+</div>
            <div class="text-sm text-muted-foreground">Learners</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-foreground">100+</div>
            <div class="text-sm text-muted-foreground">Stages</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="relative px-4 sm:px-6 lg:px-8 py-20">
    <div class="mx-auto max-w-7xl">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          How It Works
        </h2>
        <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
          A unique learning experience that combines theory with practice
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlowCard>
          <div class="p-8 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">Choose a Challenge</h3>
            <p class="text-muted-foreground">
              Pick from challenges like "Build Your Own Redis" or "Build Your Own Git" based on your interests.
            </p>
          </div>
        </GlowCard>

        <GlowCard>
          <div class="p-8 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">Code & Test</h3>
            <p class="text-muted-foreground">
              Write code in your favorite editor and use our CLI to run automated tests against your implementation.
            </p>
          </div>
        </GlowCard>

        <GlowCard>
          <div class="p-8 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">Level Up</h3>
            <p class="text-muted-foreground">
              Progress through stages, unlock new challenges, and build a portfolio of impressive projects.
            </p>
          </div>
        </GlowCard>
      </div>
    </div>
  </section>

  <!-- Featured Challenges -->
  <section class="relative px-4 sm:px-6 lg:px-8 py-20 bg-card/50">
    <div class="mx-auto max-w-7xl">
      <div class="flex items-center justify-between mb-12">
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Featured Challenges
          </h2>
          <p class="text-muted-foreground">
            Start your journey with these popular challenges
          </p>
        </div>
        <a href="/challenges" class="btn-secondary hidden sm:inline-flex">
          View All
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each featuredChallenges as challenge}
          <GlowCard>
            <div class="p-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                  <span class="text-2xl">{challenge.icon}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-foreground">{challenge.title}</h3>
                  <span class="text-sm text-{challenge.difficultyColor}-400">{challenge.difficulty}</span>
                </div>
              </div>
              <p class="text-muted-foreground text-sm mb-4">{challenge.description}</p>
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">{challenge.stages} stages</span>
                <a href="/challenges/{challenge.slug}" class="text-primary text-sm font-medium hover:underline">
                  Start →
                </a>
              </div>
            </div>
          </GlowCard>
        {/each}
      </div>

      <div class="mt-8 text-center sm:hidden">
        <a href="/challenges" class="btn-secondary">View All Challenges</a>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="relative px-4 sm:px-6 lg:px-8 py-20">
    <div class="mx-auto max-w-4xl">
      <GlowCard className="overflow-hidden">
        <div class="relative p-8 sm:p-12 text-center">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5" />
          <div class="relative">
            <h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Start Building?
            </h2>
            <p class="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Join thousands of developers who are mastering programming by building real systems.
            </p>
            <a href="/auth/register" class="btn-primary text-base px-8 py-4">
              Get Started Free
            </a>
          </div>
        </div>
      </GlowCard>
    </div>
  </section>
</div>

<script context="module" lang="ts">
  const featuredChallenges = [
    {
      title: 'Build Your Own Redis',
      slug: 'redis',
      description: 'Implement a Redis server from scratch, supporting PING, GET, SET, and more commands.',
      icon: '🔴',
      difficulty: 'Intermediate',
      difficultyColor: 'amber',
      stages: 12
    },
    {
      title: 'Build Your Own Git',
      slug: 'git',
      description: 'Create a Git implementation supporting init, add, commit, and branching.',
      icon: '📦',
      difficulty: 'Advanced',
      difficultyColor: 'rose',
      stages: 15
    },
    {
      title: 'Build Your Own HTTP Server',
      slug: 'http-server',
      description: 'Build an HTTP/1.1 server that handles requests, routing, and file serving.',
      icon: '🌐',
      difficulty: 'Beginner',
      difficultyColor: 'emerald',
      stages: 8
    }
  ];
</script>
