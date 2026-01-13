<script lang="ts">
    import GridBackground from "$lib/components/ui/GridBackground.svelte";
    import Card from "$lib/components/Card/Card.svelte";
    import { authClient } from "$lib/auth-client";
    import { goto } from "$app/navigation";

    let loading = $state(false);
    let error = $state("");
    let name = $state("");
    let email = $state("");
    let password = $state("");

    const passwordStrength = $derived(() => {
        if (password.length === 0) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    });

    const strengthColors = [
        "bg-destructive",
        "bg-amber-500",
        "bg-amber-400",
        "bg-emerald-500",
    ];
    const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

    async function handleRegister(e: Event) {
        e.preventDefault();
        loading = true;
        error = "";

        await authClient.signUp.email(
            {
                email,
                password,
                name,
                image: undefined, // Optional
            },
            {
                onRequest: () => {
                    loading = true;
                },
                onSuccess: () => {
                    goto("/challenges");
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
    <title>Create Account - CraftCode</title>
</svelte:head>

<div class="relative min-h-screen flex items-center justify-center px-4">
    <GridBackground fadeEdges={true} />

    <div class="relative w-full max-w-xs md:max-w-sm">
        <Card>
            <div class="text-center mb-4">
                <div
                    class="w-8 h-8 rounded-xl bg-linear-to-br from-primary to-blue-500 flex items-center justify-center mx-auto mb-4"
                >
                    <span class="text-white font-bold text-sm">CC</span>
                </div>
                <h1 class="text-lg font-bold text-foreground">
                    Create your account
                </h1>
                <p class="text-muted-foreground mt-2">
                    Start your coding journey today
                </p>
            </div>

            {#if error}
                <div
                    class="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                    {error}
                </div>
            {/if}

            <form onsubmit={handleRegister} class="space-y-4">
                <div class="flex flex-col text-sm">
                    <label
                        for="name"
                        class="block text-sm font-medium text-foreground mb-2"
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        class="input-field"
                        placeholder="John Doe"
                        bind:value={name}
                    />
                </div>

                <div class="flex flex-col text-sm">
                    <label
                        for="email"
                        class="block text-sm font-medium text-foreground mb-2"
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
                        class="block text-sm font-medium text-foreground mb-2"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        required
                        minlength="8"
                        class="input-field"
                        placeholder="••••••••"
                        bind:value={password}
                    />

                    {#if password.length > 0}
                        <div class="mt-2">
                            <div class="flex gap-1 mb-1">
                                {#each Array(4) as _, i}
                                    <div
                                        class="h-1 flex-1 rounded-full transition-colors {i <
                                        passwordStrength()
                                            ? strengthColors[
                                                  passwordStrength() - 1
                                              ]
                                            : 'bg-secondary'}"
                                    ></div>
                                {/each}
                            </div>
                            <p class="text-xs text-muted-foreground">
                                Password strength: <span class="font-medium"
                                    >{strengthLabels[passwordStrength() - 1] ||
                                        "Too weak"}</span
                                >
                            </p>
                        </div>
                    {/if}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    class="w-full bg-primary text-secondary rounded-xl py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>

            <p class="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?
                <a
                    href="/auth/login"
                    class="text-primary hover:underline font-medium">Sign in</a
                >
            </p>
        </Card>
    </div>
</div>
