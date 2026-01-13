<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  interface Props {
    fromX?: number;
    fromY?: number;
    toX?: number;
    toY?: number;
    curvature?: number;
    duration?: number;
    delay?: number;
    strokeWidth?: number;
    gradientStartColor?: string;
    gradientEndColor?: string;
    reverse?: boolean;
  }

  let {
    fromX = 0,
    fromY = 0,
    toX = 100,
    toY = 100,
    curvature = 0,
    duration = 3000,
    delay = 0,
    strokeWidth = 2,
    gradientStartColor = '#8b5cf6',
    gradientEndColor = '#3b82f6',
    reverse = false
  }: Props = $props();

  let pathLength = $state(0);
  let pathElement: SVGPathElement;

  const dashOffset = tweened(1000, {
    duration,
    easing: cubicInOut
  });

  // Calculate control point for curved path
  const midX = $derived((fromX + toX) / 2);
  const midY = $derived((fromY + toY) / 2);
  const controlX = $derived(midX + curvature);
  const controlY = $derived(midY - Math.abs(curvature) / 2);

  const pathD = $derived(curvature === 0
    ? `M ${fromX} ${fromY} L ${toX} ${toY}`
    : `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`);

  const gradientId = `beam-gradient-${Math.random().toString(36).slice(2)}`;

  onMount(() => {
    if (pathElement) {
      pathLength = pathElement.getTotalLength();
    }

    const animate = async () => {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      while (true) {
        if (reverse) {
          dashOffset.set(0);
          await new Promise(resolve => setTimeout(resolve, duration));
          dashOffset.set(pathLength * 2);
          await new Promise(resolve => setTimeout(resolve, duration));
        } else {
          dashOffset.set(0);
          await new Promise(resolve => setTimeout(resolve, duration));
          dashOffset.set(-pathLength * 2);
          await new Promise(resolve => setTimeout(resolve, duration));
        }
      }
    };

    animate();
  });
</script>

<svg class="absolute inset-0 overflow-visible pointer-events-none" style="z-index: 0;">
  <defs>
    <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={fromX} y1={fromY} x2={toX} y2={toY}>
      <stop offset="0%" stop-color={gradientStartColor} stop-opacity="0" />
      <stop offset="25%" stop-color={gradientStartColor} stop-opacity="1" />
      <stop offset="75%" stop-color={gradientEndColor} stop-opacity="1" />
      <stop offset="100%" stop-color={gradientEndColor} stop-opacity="0" />
    </linearGradient>
  </defs>
  
  <!-- Background path (faint) -->
  <path
    d={pathD}
    fill="none"
    stroke="rgba(139, 92, 246, 0.1)"
    stroke-width={strokeWidth}
  />
  
  <!-- Animated beam -->
  <path
    bind:this={pathElement}
    d={pathD}
    fill="none"
    stroke="url(#{gradientId})"
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-dasharray={pathLength}
    stroke-dashoffset={$dashOffset}
  />
</svg>
