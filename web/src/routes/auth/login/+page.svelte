<script lang="ts">
    import GridBackground from "$lib/components/ui/GridBackground.svelte";
    import Card from "$lib/components/Card/Card.svelte";
    import { authClient } from "$lib/auth-client";
    import { goto } from "$app/navigation";

    let loading = $state(false);
    let error = $state("");
    let email = $state("");
    let password = $state("");

    async function handleSignIn(e: Event) {
        e.preventDefault();
        loading = true;
        error = "";

        await authClient.signIn.email(
            {
                email,
                password,
            },
            {
                onRequest: () => {
                    loading = true;
                },
                onSuccess: () => {
                    goto("/challenges", {
                        invalidateAll: true,
                    });
                },

                onError: (ctx) => {
                    error = ctx.error.message;
                    loading = false;
                },
            },
        );
    }
</script>

<svelte:head>
    <title>Sign In - CraftCode</title>
</svelte:head>

<div class="relative min-h-screen flex items-center justify-center px-4">
    <GridBackground fadeEdges={true} />

    <div class="relative w-full max-w-xs md:max-w-sm">
        <div class="bg-background shadow-xl">
            <Card>
                <div class="text-center mb-8">
                    <div class="w-8 h-8 mx-auto mb-2">
                        <img
                            src={"/assets/favicon.png"}
                            alt="Logo"
                            width={30}
                            height={30}
                            class="rounded-full"
                        />
                    </div>
                    <h1 class="text-lg font-bold text-foreground">
                        Welcome back
                    </h1>
                    <p class="text-muted-foreground justify-start">
                        Sign in to continue your journey
                    </p>
                </div>

                {#if error}
                    <div
                        class="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                    >
                        {error}
                    </div>
                {/if}

                <form onsubmit={handleSignIn} class="flex flex-col gap-y-6">
                    <div class="flex flex-col text-sm">
                        <label
                            for="email"
                            class="text-sm font-medium text-primary mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            class="input-field"
                            placeholder="you@example.com"
                            bind:value={email}
                        />
                    </div>

                    <div class="flex flex-col text-sm">
                        <label
                            for="password"
                            class="block text-sm font-medium text-foreground mb-1"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            required
                            class="input-field"
                            placeholder="••••••••"
                            bind:value={password}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        class="w-full bg-linear-to-b from-primary/80 to-primary text-muted text-md rounded-xl py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p class="mt-6 text-center text-sm text-muted-foreground">
                    Don't have an account?
                    <a
                        href="/auth/register"
                        class="text-muted-foreground hover:underline font-medium"
                        >Create one</a
                    >
                </p>
            </Card>
        </div>
    </div>
</div>
