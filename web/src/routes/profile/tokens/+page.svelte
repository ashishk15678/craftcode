<script lang="ts">
    import { enhance } from "$app/forms";
    import { fade, slide } from "svelte/transition";
    import type { PageData, ActionData } from "./$types";
    import Badge from "$lib/components/ui/Badge.svelte";

    let { data, form } = $props<{ data: PageData; form: ActionData }>();

    let showNewToken = $state(false);
    let copied = $state(false);

    $effect(() => {
        if (form?.newToken) {
            showNewToken = true;
        }
    });

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        copied = true;
        setTimeout(() => (copied = false), 2000);
    }
</script>

<svelte:head>
    <title>CLI Tokens - CraftCode</title>
</svelte:head>

<div class="container max-w-3xl mx-auto py-12 px-4">
    <div class="flex items-center justify-between mb-8">
        <div>
            <h1 class="text-3xl font-bold text-foreground">CLI Tokens</h1>
            <p class="text-muted-foreground mt-2">
                Manage access tokens for the CraftCode CLI.
            </p>
        </div>
        <a href="/profile" class="text-sm text-primary hover:underline">
            ← Back to Profile
        </a>
    </div>

    <!-- New Token Display -->
    {#if showNewToken && form?.newToken}
        <div
            transition:slide
            class="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl"
        >
            <h3 class="font-semibold text-green-500 mb-2">
                Token Generated Successfully!
            </h3>
            <p class="text-sm text-green-600/80 mb-4">
                Make sure to copy your personal access token now. You won't be
                able to see it again!
            </p>

            <div class="flex items-center gap-2">
                <code
                    class="flex-1 bg-background border border-border px-4 py-3 rounded-lg font-mono text-sm break-all"
                >
                    {form.newToken}
                </code>
                <button
                    class="btn-secondary whitespace-nowrap"
                    onclick={() => copyToClipboard(form?.newToken || "")}
                >
                    {copied ? "Copied!" : "Copy Token"}
                </button>
            </div>
        </div>
    {/if}

    <!-- Generate Token Card -->
    <div class="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 class="text-lg font-semibold mb-4">Generate New Token</h2>
        <form
            method="POST"
            action="?/create"
            use:enhance={() => {
                return async ({ update }) => {
                    await update();
                    showNewToken = true;
                };
            }}
            class="flex gap-4 items-end"
        >
            <div class="flex-1">
                <label for="name" class="block text-sm font-medium mb-1">
                    Token Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g. MacBook Pro"
                    class="input-field w-full"
                    required
                />
            </div>
            <button type="submit" class="btn-primary"> Generate Token </button>
        </form>
    </div>

    <!-- Active Tokens List -->
    <div class="bg-card border border-border rounded-xl overflow-hidden">
        <div class="p-6 border-b border-border">
            <h2 class="text-lg font-semibold">Active Tokens</h2>
        </div>

        {#if data.tokens.length === 0}
            <div class="p-8 text-center text-muted-foreground">
                <p>No active tokens found.</p>
            </div>
        {:else}
            <div class="divide-y divide-border">
                {#each data.tokens as token}
                    <div class="p-4 flex items-center justify-between group">
                        <div>
                            <div class="flex items-center gap-3">
                                <span class="font-medium text-foreground">
                                    {token.name || "Untitled Token"}
                                </span>
                                {#if token.lastUsed}
                                    <Badge variant="secondary" size="sm">
                                        Last used: {new Date(
                                            token.lastUsed,
                                        ).toLocaleDateString()}
                                    </Badge>
                                {:else}
                                    <Badge variant="outline" size="sm">
                                        Never used
                                    </Badge>
                                {/if}
                            </div>
                            <div class="text-xs text-muted-foreground mt-1">
                                Created on {new Date(
                                    token.createdAt,
                                ).toLocaleDateString()}
                            </div>
                        </div>

                        <form method="POST" action="?/delete" use:enhance>
                            <input
                                type="hidden"
                                name="tokenId"
                                value={token.id}
                            />
                            <button
                                type="submit"
                                class="text-muted-foreground hover:text-destructive p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                onclick={(e) => {
                                    if (
                                        !confirm(
                                            "Are you sure you want to revoke this token?",
                                        )
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                aria-label="Revoke token"
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
                {/each}
            </div>
        {/if}
    </div>
</div>
