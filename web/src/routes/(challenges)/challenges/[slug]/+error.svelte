<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    if (page.status == 401) {
        console.log("not logged in");
        goto("/auth/login");
    }
    export const ssr = false;
</script>

<h1 class="text-primary">{JSON.stringify(page.status)}{page.error.message}</h1>

<p class="text-2xl font-bold">
    This is an error from our side , please raise an issue
</p>
