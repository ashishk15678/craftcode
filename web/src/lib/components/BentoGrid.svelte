<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    className?: string;
    cols?: number;
    gap?: number;
  }

  let { children, className = '', cols = 4, gap = 4 }: Props = $props();
</script>

<div
  class="grid auto-rows-auto {className}"
  style="
    grid-template-columns: repeat({cols}, minmax(0, 1fr));
    gap: {gap * 0.25}rem;
  "
>
  {@render children()}
</div>
