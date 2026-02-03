<script lang="ts">
  import GlowCard from "$lib/components/ui/GlowCard.svelte";
  import { HugeiconsIcon } from "@hugeicons/svelte";
  import {
    WavingHand02Icon,
    SpaceshipIcon,
    Book04Icon,
    SparklesIcon,
  } from "@hugeicons/core-free-icons";
  interface Props {
    user: {
      id: string;
      name?: string | null;
      email: string;
    };
    onComplete?: () => void;
  }

  let { user, onComplete }: Props = $props();

  let currentStep = $state(0);
  let loading = $state(false);
  let userName = $state(user.name || "");

  const steps = [
    { title: "Welcome", icon: "👋" },
    { title: "Profile", icon: "👤" },
    { title: "Get Started", icon: "🚀" },
  ];

  async function completeOnboarding() {
    loading = true;
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            name: userName || undefined,
          },
        }),
      });

      if (response.ok) {
        onComplete?.();
        // Reload to update user data
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      loading = false;
    }
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    } else {
      completeOnboarding();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
>
  <div class="w-full max-w-md text-primary">
    <div class="p-2 bg-secondary rounded-3xl border border-border">
      <GlowCard className="bg-background">
        <div class="p-6 md:p-8">
          <!-- Progress Dots -->
          <div class="flex justify-center gap-2 mb-8">
            {#each steps as step, i}
              <button
                onclick={() => (currentStep = i)}
                class="w-2 h-2 rounded-full transition-all {i === currentStep
                  ? 'w-8 bg-primary'
                  : i < currentStep
                    ? 'bg-primary/60'
                    : 'bg-border'}"
                aria-label="Go to step {i + 1}"
              />
            {/each}
          </div>

          <!-- Step Content -->
          <div class="min-h-[300px] flex flex-col">
            {#if currentStep === 0}
              <!-- Welcome Step -->
              <div class="text-center flex-1 flex flex-col justify-center">
                <div class="mx-auto animate-wave-once">
                  <HugeiconsIcon icon={WavingHand02Icon} size={60} />
                </div>
                <h2 class="text-2xl font-bold text-foreground my-2">
                  Welcome to CraftCode!
                </h2>
                <p class="text-muted-foreground max-w-sm mx-auto">
                  You're about to embark on a journey to master programming by
                  building real-world systems from scratch.
                </p>
              </div>
            {:else if currentStep === 1}
              <!-- Profile Step -->
              <div class="flex-1 flex flex-col justify-center">
                <div class="text-center mb-6">
                  <div class="text-5xl mb-4">👤</div>
                  <h2 class="text-xl font-bold text-foreground mb-2">
                    Set Up Your Profile
                  </h2>
                  <p class="text-muted-foreground text-sm">
                    How would you like to be called?
                  </p>
                </div>
                <div class="max-w-xs mx-auto w-full">
                  <label
                    for="onboarding-name"
                    class="block text-sm font-medium text-foreground mb-2"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="onboarding-name"
                    bind:value={userName}
                    placeholder="Enter your name"
                    class="input-field w-full"
                  />
                  <p class="text-xs text-muted-foreground mt-2">
                    This will be visible on your profile
                  </p>
                </div>
              </div>
            {:else if currentStep === 2}
              <!-- Get Started Step -->
              <div class="text-center flex-1 flex flex-col justify-center">
                <div class="text-6xl mb-6 mx-auto">
                  <HugeiconsIcon icon={SpaceshipIcon} size={60} />
                </div>
                <h2 class="text-2xl font-bold text-foreground mb-4">
                  You're All Set!
                </h2>
                <p class="text-muted-foreground max-w-sm mx-auto mb-6">
                  Start by exploring challenges or create your own in the
                  Creator Studio.
                </p>
                <div
                  class="flex flex-row items-stretch gap-x-4 max-w-sm mx-auto"
                >
                  <div
                    class="flex-1 p-4 rounded-xl bg-secondary border border-border flex flex-col items-center justify-center text-center"
                  >
                    <div class="text-blue-500 mb-2">
                      <HugeiconsIcon icon={Book04Icon} size={32} />
                    </div>
                    <p class="text-sm font-medium text-foreground">
                      Browse Challenges
                    </p>
                    <p class="text-xs text-muted-foreground">
                      Learn by building
                    </p>
                  </div>

                  <div
                    class="flex-1 p-4 rounded-xl bg-secondary border border-border flex flex-col items-center justify-center text-center"
                  >
                    <div class="text-yellow-500 mb-2">
                      <HugeiconsIcon icon={SparklesIcon} size={32} />
                    </div>
                    <p class="text-sm font-medium text-foreground">
                      Creator Studio
                    </p>
                    <p class="text-xs text-muted-foreground">
                      Create challenges
                    </p>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Navigation -->
          <div class="flex gap-3 mt-8">
            {#if currentStep > 0}
              <button
                onclick={prevStep}
                class="flex-1 py-2 px-4 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors"
              >
                Back
              </button>
            {/if}
            <button
              onclick={nextStep}
              disabled={loading}
              class="flex-1 py-2 px-4 rounded-xl bg-linear-to-b from-primary/20 to-secondary text-primary border border-border font-medium disabled:opacity-50 transition-opacity"
            >
              {#if loading}
                <span class="inline-flex items-center gap-2">
                  <svg
                    class="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Completing...
                </span>
              {:else if currentStep === steps.length - 1}
                Get Started
              {:else}
                Continue
              {/if}
            </button>
          </div>
        </div>
      </GlowCard>
    </div>
  </div>
</div>
