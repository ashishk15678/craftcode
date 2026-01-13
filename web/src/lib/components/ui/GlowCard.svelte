<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    className?: string;
    gradientSize?: number;
    gradientColor?: string;
  }

  let { children, className = '', gradientSize = 200, gradientColor = 'rgba(139, 92, 246, 0.15)' }: Props = $props();

  let card: HTMLDivElement;
  let mouseX = $state(0);
  let mouseY = $state(0);
  let isHovered = $state(false);

  function handleMouseMove(e: MouseEvent) {
    if (!card) return;
    const rect = card.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
  }
</script>

<div
  bind:this={card}
  class="relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 {className}"
  class:shadow-glow={isHovered}
  onmousemove={handleMouseMove}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  role="article"
>
  <!-- Glow effect following mouse -->
  {#if isHovered}
    <div
      class="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
      class:opacity-100={isHovered}
      style="
        background: radial-gradient(
          {gradientSize}px circle at {mouseX}px {mouseY}px,
          {gradientColor},
          transparent 40%
        );
      "
    ></div>
  {/if}

  <!-- Border glow -->
  <div
    class="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
    class:opacity-100={isHovered}
    style="
      background: radial-gradient(
        {gradientSize * 1.5}px circle at {mouseX}px {mouseY}px,
        rgba(139, 92, 246, 0.15),
        transparent 40%
      );
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      padding: 1px;
    "
  ></div>

  <!-- Content -->
  <div class="relative z-10">
    {@render children()}
  </div>
</div>
