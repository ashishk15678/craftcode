<script lang="ts">
    import { theme, type Theme } from "$lib/stores/theme";
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import Button from "$lib/components/ui/Button.svelte";

    let isOpen = false;

    const themes: { value: Theme; label: string; color: string }[] = [
        { value: "light", label: "Light", color: "bg-white" },
        { value: "dark", label: "Dark", color: "bg-zinc-900" },
        {
            value: "catppuccin-mocha",
            label: "Catppuccin Mocha",
            color: "bg-[#1e1e2e]",
        },
        {
            value: "catppuccin-latte",
            label: "Catppuccin Latte",
            color: "bg-[#eff1f5]",
        },
        { value: "tokyo-night", label: "Tokyo Night", color: "bg-[#1a1b26]" },
        { value: "rose-pine", label: "Rose Pine", color: "bg-[#191724]" },
    ];

    function toggleMenu() {
        isOpen = !isOpen;
    }

    function selectTheme(t: Theme) {
        theme.set(t);
        isOpen = false;
    }

    // Close on click outside
    function handleClickOutside(event: MouseEvent) {
        if (
            isOpen &&
            !(event.target as HTMLElement).closest(".theme-switcher")
        ) {
            isOpen = false;
        }
    }

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    });
</script>

<div class="relative theme-switcher">
    <Button
        variant="outline"
        size="sm"
        onclick={toggleMenu}
        aria-label="Toggle theme"
        class="text-primary gap-1 ring ring-border flex items-center shadow-xl"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        <span class="hidden sm:inline text-md">Theme</span>
    </Button>

    {#if isOpen}
        <div
            transition:slide={{ duration: 200 }}
            class="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden"
        >
            <div class="p-1 grid gap-1">
                {#each themes as t}
                    <button
                        onclick={() => selectTheme(t.value)}
                        class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                        {$theme === t.value
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}"
                    >
                        <div
                            class="w-4 h-4 rounded-full border border-border {t.color}"
                        ></div>
                        {t.label}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
