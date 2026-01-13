<script lang="ts">
  import type { Snippet } from 'svelte';
  import GlowCard from './ui/GlowCard.svelte';

  interface Props {
    children: Snippet;
    className?: string;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2 | 3;
  }

  let { children, className = '', colSpan = 1, rowSpan = 1 }: Props = $props();

  const colSpanClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4'
  };

  const rowSpanClasses: Record<number, string> = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3'
  };
</script>

<GlowCard className="{colSpanClasses[colSpan]} {rowSpanClasses[rowSpan]} {className}">
  <div class="h-full p-6">
    {@render children()}
  </div>
</GlowCard>
