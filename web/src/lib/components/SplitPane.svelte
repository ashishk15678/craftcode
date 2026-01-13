<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    left: Snippet;
    right: Snippet;
    initialWidth?: number;
    minWidth?: number;
    maxWidth?: number;
  }

  let { left, right, initialWidth = 50, minWidth = 20, maxWidth = 80 }: Props = $props();
  
  let currentWidth = $state(initialWidth);
  let containerRef: HTMLDivElement;
  let isDragging = $state(false);

  // Load from localStorage on mount
  $effect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('splitPane.leftWidth');
      if (saved) {
        currentWidth = parseFloat(saved);
      }
    }
  });

  function startDrag(e: MouseEvent) {
    e.preventDefault();
    isDragging = true;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  }

  function onDrag(e: MouseEvent) {
    if (!isDragging || !containerRef) return;
    
    const rect = containerRef.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    
    currentWidth = Math.max(minWidth, Math.min(maxWidth, percent));
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('splitPane.leftWidth', currentWidth.toString());
    }
  }
</script>

<div
  bind:this={containerRef}
  class="flex h-full w-full overflow-hidden"
  class:select-none={isDragging}
>
  <!-- Left pane -->
  <div
    class="h-full overflow-auto"
    style="width: {currentWidth}%"
  >
    {@render left()}
  </div>

  <!-- Drag handle -->
  <div
    class="w-1 h-full cursor-col-resize bg-border hover:bg-primary/50 transition-colors relative group flex-shrink-0"
    onmousedown={startDrag}
    role="separator"
    aria-orientation="vertical"
    tabindex="0"
  >
    <div class="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/20"></div>
  </div>

  <!-- Right pane -->
  <div
    class="h-full overflow-auto flex-1"
    style="width: {100 - currentWidth}%"
  >
    {@render right()}
  </div>
</div>
