<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
        className?: string;
        gradientSize?: number;
        gradientColor?: string;
    }

    let {
        children,
        className = "",
        gradientSize = 200,
        gradientColor = "rgba(139, 92, 246, 0.15)",
    }: Props = $props();

    let card: HTMLDivElement;
</script>

<div
    bind:this={card}
    class="relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 {className}"
    role="article"
>
    <div class="relative z-10">
        {@render children()}
    </div>
</div>
