<script lang="ts">
    import { goto } from "$app/navigation";
    import { authClient } from "$lib/auth-client";
    async function checkAuthStatus() {
        let data = await authClient.getSession();
        let user = data.data?.user;
        if (data.data?.session) {
            goto("/challenges");
        }
    }
</script>

{#await checkAuthStatus()}
    <p>Checking auth status...</p>
{:then}
    <slot />
{/await}
