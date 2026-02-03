<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
        className?: string;
    }

    let { children, className = "" }: Props = $props();

    let card: HTMLDivElement;
</script>

<div
    bind:this={card}
    class="relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 {className}"
    role="article"
>
    <div class="relative z-10">
        {@render children()}
    </div>
</div>
