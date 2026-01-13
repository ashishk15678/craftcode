<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        window.location.href = "/";
    });
</script>

<div class="flex flex-1 items-center justify-center w-full h-full gap-x-2">
    You will be redirected soon <div
        class="rounded-full border-t-2 border-1 animate-spin h-4 w-4"
    />
</div>
