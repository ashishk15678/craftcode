<script lang="ts">
    let { className } = $props();
</script>

<div
    class="bg-secondary text-primary py-4 px-4 rounded-xl relative border border-border"
>
    <div
        class="absolute top-2 right-2 bg-primary text-secondary px-2 py-0.5 rounded-2xl"
    >
        Copy
    </div>
    <div class={className}>
        <slot />
    </div>
</div>
