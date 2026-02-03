<script lang="ts">
    import { authClient } from "$lib/auth-client";
    import Button from "$lib/components/ui/Button.svelte";
    import GridBackground from "$lib/components/ui/GridBackground.svelte";
    let loading = $state(false);
    async function handleSubscribe() {
        loading = true;
        await authClient.checkout({
            slug: "pro",
        });
        loading = false;
    }
</script>

<svelte:head>
    <title>Subscribe - Creator Studio</title>
</svelte:head>

<div class="relative min-h-screen">
    <GridBackground fadeEdges={false} />

    <div class="relative px-4 sm:px-6 lg:px-8 py-20">
        <div class="mx-auto max-w-sm">
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
                <div
                    class="relative group shadow-xl shadow-black w-full max-w-sm bg-secondary p-2 rounded-2xl border border-border"
                >
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
                                    class="relative w-6 h-6 flex items-center justify-center shrink-0 mt-0.5"
                                >
                                    <svg
                                        class="absolute inset-0 w-full h-full text-green-500 fill-current"
                                        viewBox="0 0 100 100"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="
                                        M 50,2
                                        C 65,2 75,10 85,20
                                        C 95,30 98,45 98,55
                                        C 98,70 90,85 75,92
                                        C 60,100 40,100 25,92
                                        C 10,85 2,70 2,55
                                        C 2,40 10,25 20,15
                                        C 30,5 40,2 50,2
                                        Z"
                                            stroke="green"
                                            stroke-width="3"
                                        />
                                    </svg>

                                    <svg
                                        class="relative w-4 h-4 text-white z-10"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="3"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span
                                    class="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-green-600 font-bold"
                                    >Unlimited public challenges</span
                                >
                            </li>
                            <li class="flex items-start gap-3">
                                <div
                                    class="relative w-6 h-6 flex items-center justify-center shrink-0 mt-0.5"
                                >
                                    <svg
                                        class="absolute inset-0 w-full h-full text-green-500 fill-current"
                                        viewBox="0 0 100 100"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="
                                        M 50,2
                                        C 65,2 75,10 85,20
                                        C 95,30 98,45 98,55
                                        C 98,70 90,85 75,92
                                        C 60,100 40,100 25,92
                                        C 10,85 2,70 2,55
                                        C 2,40 10,25 20,15
                                        C 30,5 40,2 50,2
                                        Z"
                                            stroke="green"
                                            stroke-width="3"
                                        />
                                    </svg>

                                    <svg
                                        class="relative w-4 h-4 text-white z-10"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="3"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span
                                    class="text-transparent bg-clip-text bg-linear-to-r from-green-500 to-green-600 font-bold"
                                    >Access to Creator Dashboard</span
                                >
                            </li>
                            <li class="flex items-start gap-3">
                                <div
                                    class="relative w-6 h-6 flex items-center justify-center shrink-0 mt-0.5"
                                >
                                    <svg
                                        class="absolute inset-0 w-full h-full text-green-500 fill-current"
                                        viewBox="0 0 100 100"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="
                                        M 50,2
                                        C 65,2 75,10 85,20
                                        C 95,30 98,45 98,55
                                        C 98,70 90,85 75,92
                                        C 60,100 40,100 25,92
                                        C 10,85 2,70 2,55
                                        C 2,40 10,25 20,15
                                        C 30,5 40,2 50,2
                                        Z"
                                            stroke="green"
                                            stroke-width="3"
                                        />
                                    </svg>

                                    <svg
                                        class="relative w-4 h-4 text-white z-10"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="3"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span class="text-foreground"
                                    >Community Support</span
                                >
                            </li>
                            <li class="flex items-start gap-3">
                                <div
                                    class="relative w-6 h-6 flex items-center justify-center shrink-0 mt-0.5"
                                >
                                    <svg
                                        class="absolute inset-0 w-full h-full text-green-500 fill-current"
                                        viewBox="0 0 100 100"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="
                                        M 50,2
                                        C 65,2 75,10 85,20
                                        C 95,30 98,45 98,55
                                        C 98,70 90,85 75,92
                                        C 60,100 40,100 25,92
                                        C 10,85 2,70 2,55
                                        C 2,40 10,25 20,15
                                        C 30,5 40,2 50,2
                                        Z"
                                            stroke="green"
                                            stroke-width="3"
                                        />
                                    </svg>

                                    <svg
                                        class="relative w-4 h-4 text-white z-10"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="3"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span class="text-foreground">Easy access</span>
                            </li>
                        </ul>

                        <button
                            onclick={handleSubscribe}
                            disabled={loading}
                            class=" w-full py-1 rounded-xl bg-linear-to-b hover:from-primary/70 from-primary/50 hover:via-primary/70 via-primary/90 transition-colors duration-300 to-primary text-secondary"
                        >
                            Subscribe Now - $2/month <div
                                class="absolute w-16 h-16 border-tr border-border"
                            ></div>
                        </button>
                        <p
                            class="text-xs text-center text-muted-foreground mt-1"
                        >
                            Secured by Polar. Cancel anytime.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
