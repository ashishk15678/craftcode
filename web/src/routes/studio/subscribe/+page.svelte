<script lang="ts">
    import { authClient } from "$lib/auth-client";
    import Button from "$lib/components/ui/Button.svelte";
    import GridBackground from "$lib/components/ui/GridBackground.svelte";

    async function handleSubscribe() {
        await authClient.checkout({
            slug: "pro",
        });
    }
</script>

<svelte:head>
    <title>Subscribe - Creator Studio</title>
</svelte:head>

<div class="relative min-h-screen">
    <GridBackground fadeEdges={true} />

    <div class="relative px-4 sm:px-6 lg:px-8 py-20">
        <div class="mx-auto max-w-md">
            <div class=" justify-start mb-18">
                <h1 class="text-2xl font-bold text-foreground">
                    Become a Creator
                </h1>
                <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Share your knowledge, build challenges, and help developers
                    grow.
                </p>
            </div>

            <div class="flex justify-center">
                <div class="relative group shadow-xl w-full max-w-sm">
                    <div
                        class="relative bg-card border border-border rounded-xl p-8 h-full flex flex-col"
                    >
                        <div class="mb-8">
                            <h2 class="text-xl font-bold text-foreground mb-2">
                                Creator Plan
                            </h2>
                            <div class="flex items-baseline gap-1">
                                <span class="text-2xl font-bold text-foreground"
                                    >$2</span
                                >
                                <span class="text-muted-foreground">/month</span
                                >
                            </div>
                            <p class="text-sm text-muted-foreground mt-2">
                                Everything you need to publish challenges
                            </p>
                        </div>

                        <ul class="space-y-4 mb-8 flex-1">
                            <li class="flex items-start gap-3">
                                <div
                                    class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"
                                >
                                    <svg
                                        class="w-4 h-4 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span class="text-foreground"
                                    >Unlimited public challenges</span
                                >
                            </li>
                            <li class="flex items-start gap-3">
                                <div
                                    class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"
                                >
                                    <svg
                                        class="w-4 h-4 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span class="text-foreground"
                                    >Access to Creator Dashboard</span
                                >
                            </li>
                            <li class="flex items-start gap-3">
                                <div
                                    class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"
                                >
                                    <svg
                                        class="w-4 h-4 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span class="text-foreground"
                                    >Analytics & Insight</span
                                >
                            </li>
                            <li class="flex items-start gap-3">
                                <div
                                    class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"
                                >
                                    <svg
                                        class="w-4 h-4 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span class="text-foreground"
                                    >Community Support</span
                                >
                            </li>
                        </ul>

                        <Button
                            size="lg"
                            onclick={handleSubscribe}
                            class="w-full text-lg text-secondary bg-linear-to-b from-primary/50 via-primary/50 to-primary"
                        >
                            Subscribe Now
                        </Button>

                        <p
                            class="text-xs text-center text-muted-foreground mt-4"
                        >
                            Secured by Polar. Cancel anytime.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
