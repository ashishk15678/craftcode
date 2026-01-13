<script lang="ts">
  import GridBackground from '$lib/components/ui/GridBackground.svelte';
  import GlowCard from '$lib/components/ui/GlowCard.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import type { PageData } from './$types';
  import { marked } from 'marked';

  let { data } = $props<{ data: PageData }>();

  let selectedStageId = $state<string | null>(data.stages[0]?.id || null);

  const selectedStage = $derived(
    data.stages.find(s => s.id === selectedStageId)
  );

  const renderedInstructions = $derived(
    selectedStage ? marked.parse(selectedStage.instructionsMd) : ''
  );

  const completedCount = $derived(
    data.stages.filter(s => s.isCompleted).length
  );

  const difficultyLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  };
</script>

<svelte:head>
  <title>{data.challenge.title} - CraftCode</title>
  <meta name="description" content={data.challenge.description} />
</svelte:head>

<div class="relative min-h-screen">
  <GridBackground fadeEdges={true} animated={false} />

  <div class="relative">
    <!-- Hero -->
    <section class="px-4 sm:px-6 lg:px-8 py-12 border-b border-border">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col lg:flex-row gap-8 items-start">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-4">
              <Badge variant={data.challenge.difficulty as 'beginner' | 'intermediate' | 'advanced'}>
                {difficultyLabels[data.challenge.difficulty]}
              </Badge>
              {#if data.challenge.authorName}
                <span class="text-sm text-muted-foreground">by {data.challenge.authorName}</span>
              {/if}
            </div>

            <h1 class="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {data.challenge.title}
            </h1>

            <p class="text-lg text-muted-foreground mb-8">
              {data.challenge.description}
            </p>

            <div class="flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{data.stages.length} stages</span>
              </div>

              <div class="flex items-center gap-2">
                <div class="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-primary to-blue-500 transition-all"
                    style="width: {data.stages.length > 0 ? (completedCount / data.stages.length) * 100 : 0}%"
                  />
                </div>
                <span class="text-sm text-muted-foreground">{completedCount}/{data.stages.length}</span>
              </div>

              {#if data.challenge.isOwner}
                <a href="/studio/challenge/{data.challenge.id}" class="btn-secondary text-sm">
                  Edit Challenge
                </a>
              {/if}
            </div>
          </div>

          <!-- CLI Install Card -->
          <GlowCard className="w-full lg:w-80 flex-shrink-0">
            <div class="p-6">
              <h3 class="font-semibold text-foreground mb-4">Get Started</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Install the CLI and run tests locally:
              </p>
              <div class="bg-background rounded-lg p-4 font-mono text-sm">
                <div class="text-muted-foreground mb-2"># Install CLI</div>
                <div class="text-foreground mb-4">npm i -g craftcode-cli</div>
                <div class="text-muted-foreground mb-2"># Run tests</div>
                <div class="text-foreground">craftcode test</div>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Stage sidebar -->
          <aside class="w-full lg:w-72 flex-shrink-0">
            <div class="sticky top-20">
              <h2 class="font-semibold text-foreground mb-4">Stages</h2>
              <div class="space-y-2">
                {#each data.stages as stage (stage.id)}
                  <button
                    class="w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3
                      {selectedStageId === stage.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-card border border-border hover:border-primary/30'}"
                    onclick={() => selectedStageId = stage.id}
                  >
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                        {stage.isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-secondary text-muted-foreground'}"
                    >
                      {#if stage.isCompleted}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      {:else}
                        <span class="text-xs font-medium">{stage.order}</span>
                      {/if}
                    </div>
                    <span class="font-medium text-foreground truncate">{stage.title}</span>
                  </button>
                {/each}
              </div>
            </div>
          </aside>

          <!-- Instructions -->
          <main class="flex-1 min-w-0">
            {#if selectedStage}
              <GlowCard>
                <div class="p-6 sm:p-8">
                  <div class="flex items-center gap-3 mb-6">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center
                        {selectedStage.isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-primary text-primary-foreground'}"
                    >
                      {#if selectedStage.isCompleted}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      {:else}
                        <span class="font-medium">{selectedStage.order}</span>
                      {/if}
                    </div>
                    <h2 class="text-2xl font-bold text-foreground">{selectedStage.title}</h2>
                  </div>

                  <MarkdownRenderer content={renderedInstructions as string} />
                </div>
              </GlowCard>
            {:else}
              <div class="text-center py-20 text-muted-foreground">
                Select a stage to view instructions
              </div>
            {/if}
          </main>
        </div>
      </div>
    </section>
  </div>
</div>
