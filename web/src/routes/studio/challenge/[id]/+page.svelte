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
        class="border-b border-border bg-card px-4 py-2 flex items-center justify-between shrink-0"
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
                    <Badge variant={"default"} size="sm" className="text-xs">
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
                    <button
                        type="submit"
                        class="bg-secondary px-2 py-1 rounded-full text-muted-foreground text-xs border border-border hover:text-primary"
                    >
                        Unpublish
                    </button>
                </form>
            {:else}
                <form method="POST" action="?/publish" use:enhance>
                    <button
                        type="submit"
                        disabled={!data.isCreator}
                        class="btn-primary text-sm"
                        title={!data.isCreator
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
                <h3 class="font-medium text-foreground mb-4">Test Script (Bash)</h3>
                
                <div class="mb-4 flex gap-2 overflow-x-auto pb-2">
                    <button 
                        type="button" 
                        class="btn-secondary text-xs whitespace-nowrap"
                        onclick={() => {
                            const template = `#!/bin/bash
# Check if a file exists
if [ ! -f "main.c" ]; then
    echo "Error: main.c not found"
    exit 1
fi
echo "main.c found"`;
                            const textarea = document.querySelector('textarea[name="testScript"]') as HTMLTextAreaElement | null;
                            if (textarea) {
                                textarea.value = template;
                                textarea.dispatchEvent(new Event('input'));
                            }
                        }}
                    >
                        Template: File Exists
                    </button>
                    <button 
                        type="button" 
                        class="btn-secondary text-xs whitespace-nowrap"
                        onclick={() => {
                            const template = `#!/bin/bash
# Compile and run
gcc main.c -o main
if [ $? -ne 0 ]; then
    echo "Compilation failed"
    exit 1
fi

output=$(./main)
expected="Hello World"

if [ "$output" != "$expected" ]; then
    echo "Expected '$expected', got '$output'"
    exit 1
fi
echo "Test passed"`;
                            const textarea = document.querySelector('textarea[name="testScript"]') as HTMLTextAreaElement | null;
                            if (textarea) {
                                textarea.value = template;
                                textarea.dispatchEvent(new Event('input'));
                            }
                        }}
                    >
                        Template: Compile & Run
                    </button>
                    <button 
                        type="button" 
                        class="btn-secondary text-xs whitespace-nowrap"
                        onclick={() => {
                            const template = `#!/bin/bash
# Python Script Check
if ! python3 -c "import main" 2>/dev/null; then
   echo "Failed to import main.py"
   exit 1
fi
echo "Module valid"`;
                            const textarea = document.querySelector('textarea[name="testScript"]') as HTMLTextAreaElement | null;
                            if (textarea) {
                                textarea.value = template;
                                textarea.dispatchEvent(new Event('input'));
                            }
                        }}
                    >
                        Template: Python Check
                    </button>
                </div>

                <form method="POST" action="?/updateStage" use:enhance>
                    <input
                        type="hidden"
                        name="stageId"
                        value={selectedStage.id}
                    />
                    <textarea
                        name="testScript"
                        rows="12"
                        class="w-full input-field font-mono text-sm resize-none mb-2"
                        placeholder="#!/bin/bash&#10;# Test script for this stage..."
                        value={selectedStage.testScript || ""}
                        oninput={(e) => {
                           // Update the bound value manually if needed or rely on form
                        }}
                    ></textarea>
                    
                    <div class="flex justify-between items-center">
                        <p class="text-xs text-muted-foreground">
                            This script will run on the user's machine.
                        </p>
                        <button
                            type="submit"
                            class="btn-secondary text-sm"
                        >
                            Save Test Script
                        </button>
                    </div>
                </form>
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
