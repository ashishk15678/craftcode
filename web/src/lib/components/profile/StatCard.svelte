<script lang="ts">
    import { CourseIcon } from "@hugeicons/core-free-icons";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    export let label: string;
    export let value: string | number;
    export let icon: any = CourseIcon;
    export let trend: "up" | "down" | "neutral" = "neutral";
    export let className: string = "";
</script>

<div class="group relative px-4 py-2 border border-border overflow-hidden">
    <div class={"flex items-start font-thin gap-4 " + className}>
        <div class="">
            <HugeiconsIcon {icon} class="" />
        </div>
        <div class="text-md line-clamp-1 font-thin">{label}</div>
    </div>

    <div
        class="mt-4 w-full flex justify-end items-center text-2xl font-mono font-bold"
        class:trend-up={trend === "up"}
        class:trend-down={trend === "down"}
    >
        {value}
    </div>

    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>
</div>

<style>
    /* Position the corners absolutely relative to the container */
    .corner {
        position: absolute;
        width: 12px;
        height: 12px;
        opacity: 0;
        transition: all 0.3s ease;
        border: 2px solid currentColor; /* Follows text color or set specific color */
        pointer-events: none;
    }

    /* Initial Offsets for the "springing in" effect */
    .tl {
        top: 0;
        left: 0;
        border-right: 0;
        border-bottom: 0;
        transform: translate(-5px, -5px);
    }
    .tr {
        top: 0;
        right: 0;
        border-left: 0;
        border-bottom: 0;
        transform: translate(5px, -5px);
    }
    .bl {
        bottom: 0;
        left: 0;
        border-right: 0;
        border-top: 0;
        transform: translate(-5px, 5px);
    }
    .br {
        bottom: 0;
        right: 0;
        border-left: 0;
        border-top: 0;
        transform: translate(5px, 5px);
    }

    /* Reveal and snap to corners on hover */
    .group:hover .corner {
        opacity: 1;
        transform: translate(0, 0);
    }

    /* Optional: subtle dimming of the border on hover to emphasize corners */
    .group:hover {
        cursor: crosshair;
    }
</style>
