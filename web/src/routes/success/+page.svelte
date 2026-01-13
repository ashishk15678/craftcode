<script lang="ts">
    import { page } from "$app/stores";

    // This will automatically update if the URL changes
    $: checkoutId = $page.url.searchParams.get("checkout_id");
</script>

<div class="w-full flex items-center justify-center h-full">
    <div
        class="max-w-xs w-full border-4 border-dashed border-green-500 rounded-3xl py-16 px-8 mt-20 flex flex-col justify-center"
    >
        <div class="w-full flex flex-col justify-center items-center">
            <div
                class="rounded-full w-18 h-18 text-green-500 border border-green-500 border-4 p-6 text-5xl flex items-center justify-center"
            >
                ✓
            </div>
        </div>
        <div class="w-full flex flex-col justify-center items-center mt-4">
            <p class="text-xl font-bold text-green-500">Checkout Successful.</p>
            <p class="inline">
                {#if checkoutId}
                    <p class="font-bold">Checkout ID:</p>
                    {checkoutId}
                {:else}
                    <p class="text-sm text-red-400 mt-2">No ID found</p>
                {/if}
            </p>
            <a href="/studio" class="w-full">
                <button
                    class="w-full py-1 rounded-xl bg-linear-to-b from-primary/80 via-primary/80 to-primary text-secondary mt-8"
                    >Back to Creator studio</button
                >
            </a>
        </div>
    </div>
</div>
