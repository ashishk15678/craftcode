<script lang="ts">
    import SplitPane from "$lib/components/SplitPane.svelte";
    import MarkdownRenderer from "$lib/components/MarkdownRenderer.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { PageData, ActionData } from "./$types";
    import { enhance } from "$app/forms";
    import { marked } from "marked";

    let { data, form } = $props<{ data: PageData; form: ActionData }>();

    let selectedStageId = $state<string | null>(data.stages[0]?.id || null);
    let editorContent = $state("");
    let saving = $state(false);

    const selectedStage = $derived(
        data.stages.find((s: any) => s.id === selectedStageId),
    );

    const renderedMarkdown = $derived(
        editorContent ? marked.parse(editorContent) : "",
    );

    // Initialize editor content when stage changes
    $effect(() => {
        if (selectedStage) {
            editorContent = selectedStage.instructionsMd;
        }
    });
</script>

<svelte:head>
    <title>Edit: {data.challenge.title} - CraftCode</title>
</svelte:head>

<div class="h-screen flex flex-col bg-background">
    <!-- Header -->
    <header
        class="border-b border-border bg-card px-4 py-3 flex items-center justify-between flex-shrink-0"
    >
        <div class="flex items-center gap-4">
            <a
                href="/studio"
                class="text-muted-foreground hover:text-foreground transition-colors"
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    ></path>
                </svg>
            </a>
            <div>
                <h1 class="font-semibold text-foreground">
                    {data.challenge.title}
                </h1>
                <div class="flex items-center gap-2 mt-0.5">
                    <Badge
                        variant={data.challenge.isPublished
                            ? "default"
                            : "intermediate"}
                        size="sm"
                    >
                        {data.challenge.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <span class="text-xs text-muted-foreground capitalize"
                        >{data.challenge.difficulty}</span
                    >
                </div>
            </div>
        </div>

        <div class="flex items-center gap-3">
            {#if data.challenge.isPublished}
                <form method="POST" action="?/unpublish" use:enhance>
                    <button type="submit" class="btn-secondary text-sm">
                        Unpublish
                    </button>
                </form>
            {:else}
                <form method="POST" action="?/publish" use:enhance>
                    <button
                        type="submit"
                        disabled={true || data.isCreator}
                        class="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title={true || data.isCreator
                            ? "Creator subscription required"
                            : ""}
                    >
                        {#if !data.isCreator}
                            🔒
                        {/if}
                        Publish
                    </button>
                </form>
            {/if}
        </div>
    </header>

    <!-- Main content -->
    <div class="flex-1 flex overflow-hidden">
        <!-- Stage sidebar -->
        <aside
            class="w-64 border-r border-border bg-card flex flex-col flex-shrink-0"
        >
            <div class="p-4 border-b border-border">
                <h2 class="font-medium text-foreground mb-2">Stages</h2>
                <form method="POST" action="?/addStage" use:enhance>
                    <button
                        type="submit"
                        class="w-full btn-secondary text-sm py-2"
                    >
                        + Add Stage
                    </button>
                </form>
            </div>

            <div class="flex-1 overflow-auto p-2">
                {#each data.stages as stage (stage.id)}
                    <button
                        class="w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors
              {selectedStageId === stage.id
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}"
                        onclick={() => (selectedStageId = stage.id)}
                    >
                        <span class="text-xs font-medium opacity-50"
                            >Stage {stage.order}</span
                        >
                        <div class="font-medium truncate">{stage.title}</div>
                    </button>
                {/each}
            </div>
        </aside>

        <!-- Editor area -->
        {#if selectedStage}
            <div class="flex-1 flex flex-col overflow-hidden">
                <!-- Stage header -->
                <div
                    class="px-4 py-3 border-b border-border bg-card flex items-center justify-between flex-shrink-0"
                >
                    <form
                        method="POST"
                        action="?/updateStage"
                        use:enhance
                        class="flex-1 mr-4"
                    >
                        <input
                            type="hidden"
                            name="stageId"
                            value={selectedStage.id}
                        />
                        <input
                            type="text"
                            name="title"
                            value={selectedStage.title}
                            class="input-field text-lg font-medium py-1"
                            placeholder="Stage title"
                        />
                    </form>

                    <form method="POST" action="?/deleteStage" use:enhance>
                        <input
                            type="hidden"
                            name="stageId"
                            value={selectedStage.id}
                        />
                        <button
                            type="submit"
                            class="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                            onclick={(e) => {
                                if (!confirm("Delete this stage?")) {
                                    e.preventDefault();
                                }
                            }}
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </form>
                </div>

                <!-- Split pane editor -->
                <div class="flex-1 overflow-hidden">
                    <SplitPane>
                        {#snippet left()}
                            <div class="h-full flex flex-col">
                                <div
                                    class="p-4 pb-2 text-sm font-medium text-muted-foreground flex items-center justify-between"
                                >
                                    <span>Markdown</span>
                                    <form
                                        method="POST"
                                        action="?/updateStage"
                                        use:enhance={() => {
                                            saving = true;
                                            return async ({ update }) => {
                                                saving = false;
                                                await update();
                                            };
                                        }}
                                    >
                                        <input
                                            type="hidden"
                                            name="stageId"
                                            value={selectedStage.id}
                                        />
                                        <input
                                            type="hidden"
                                            name="instructionsMd"
                                            value={editorContent}
                                        />
                                        <button
                                            type="submit"
                                            class="text-xs btn-secondary py-1 px-3"
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                    </form>
                                </div>
                                <textarea
                                    bind:value={editorContent}
                                    class="flex-1 w-full bg-background text-foreground font-mono text-sm p-4 resize-none focus:outline-none"
                                    placeholder="Write your stage instructions in Markdown..."
                                ></textarea>
                            </div>
                        {/snippet}

                        {#snippet right()}
                            <div class="h-full flex flex-col">
                                <div
                                    class="p-4 pb-2 text-sm font-medium text-muted-foreground"
                                >
                                    Preview
                                </div>
                                <div class="flex-1 overflow-auto p-4 pt-2">
                                    <MarkdownRenderer
                                        content={renderedMarkdown as string}
                                    />
                                </div>
                            </div>
                        {/snippet}
                    </SplitPane>
                </div>

                <!-- Test script section -->
                <div class="border-t border-border bg-card p-4 flex-shrink-0">
                    <details>
                        <summary
                            class="cursor-pointer font-medium text-foreground mb-2"
                        >
                            Test Script
                        </summary>
                        <form method="POST" action="?/updateStage" use:enhance>
                            <input
                                type="hidden"
                                name="stageId"
                                value={selectedStage.id}
                            />
                            <textarea
                                name="testScript"
                                rows="6"
                                class="w-full input-field font-mono text-sm resize-none"
                                placeholder="#!/bin/bash&#10;# Test script for this stage..."
                                >{selectedStage.testScript || ""}</textarea
                            >
                            <div class="mt-2 flex justify-end">
                                <button
                                    type="submit"
                                    class="btn-secondary text-sm"
                                >
                                    Save Test Script
                                </button>
                            </div>
                        </form>
                    </details>
                </div>
            </div>
        {:else}
            <div
                class="flex-1 flex items-center justify-center text-muted-foreground"
            >
                <div class="text-center">
                    <p class="mb-4">No stages yet</p>
                    <form method="POST" action="?/addStage" use:enhance>
                        <button type="submit" class="btn-primary">
                            Create First Stage
                        </button>
                    </form>
                </div>
            </div>
        {/if}
    </div>
</div>
