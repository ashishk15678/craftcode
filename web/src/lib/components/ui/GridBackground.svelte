<script lang="ts">
    interface Props {
        className?: string;
        gridSize?: number;
        strokeColor?: string;
        animated?: boolean;
        fadeEdges?: boolean;
    }

    let {
        className = "",
        gridSize = 40,
        strokeColor = "rgba(139, 92, 246, 0.08)",
        animated = true,
        fadeEdges = true,
    }: Props = $props();
</script>

<div class="absolute inset-0 overflow-hidden {className}" style="z-index: 0;">
    <svg
        class="absolute inset-0 h-full w-full"
        class:animate-grid-fade={animated}
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <pattern
                id="grid-pattern"
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
            >
                <path
                    d="M {gridSize} 0 L 0 0 0 {gridSize}"
                    fill="none"
                    stroke={strokeColor}
                    stroke-width="2"
                />
            </pattern>

            {#if fadeEdges}
                <radialGradient
                    id="grid-fade"
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fx="50%"
                    fy="50%"
                >
                    <stop offset="0%" stop-color="white" stop-opacity="1" />
                    <stop offset="100%" stop-color="white" stop-opacity="0" />
                </radialGradient>
                <mask id="grid-mask">
                    <rect width="100%" height="100%" fill="url(#grid-fade)" />
                </mask>
            {/if}
        </defs>

        <rect
            width="100%"
            height="100%"
            fill="url(#grid-pattern)"
            mask={fadeEdges ? "url(#grid-mask)" : undefined}
        />
    </svg>

    <!-- Gradient orbs for extra depth -->
    <div class="absolute h-80 w-80"></div>
    <div class="absolute h-80 w-80">></div>
</div>
