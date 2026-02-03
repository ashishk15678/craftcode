<script lang="ts">
    import { page } from "$app/stores";
    import ThemeSwitcher from "./ThemeSwitcher.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    interface Props {
        user?: {
            name?: string | null;
            email: string;
            isCreator: boolean;
        } | null;
    }

    let { user = null }: Props = $props();

    let mobileMenuOpen = $state(false);
    let userMenuOpen = $state(false);

    const navLinks = [
        { href: "/challenges", label: "Challenges" },
        { href: "/studio", label: "Creator Studio", requiresAuth: true },
    ];

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }

    function toggleUserMenu() {
        userMenuOpen = !userMenuOpen;
    }

    function closeUserMenu() {
        userMenuOpen = false;
    }
</script>

<header
    class="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
>
    <nav class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2 group">
                <div class="relative w-8 h-8">
                    <img
                        src={"/assets/favicon.png"}
                        alt="Logo"
                        width={40}
                        height={40}
                        class="rounded-full"
                    />
                </div>
                <span class="font-bold text-lg text-foreground hidden sm:block">
                    CraftCode
                </span>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center gap-6">
                {#each navLinks as link}
                    {#if !link.requiresAuth || user}
                        <a
                            href={link.href}
                            class="text-sm font-medium transition-colors
                {$page.url.pathname.startsWith(link.href)
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'}"
                        >
                            {link.label}
                        </a>
                    {/if}
                {/each}
            </div>

            <!-- Right side -->
            <div class="flex items-center gap-4">
                <ThemeSwitcher />
                {#if user}
                    <!-- User menu -->
                    <div class="relative">
                        <button
                            onclick={toggleUserMenu}
                            class="flex items-center gap-2 rounded-full bg-secondary p-1 pr-3 hover:bg-secondary/80 transition-colors h-7"
                        >
                            <div
                                class="w-5 h-5 rounded-full bg-linear-to-br from-primary to-blue-500 text-secondary flex items-center justify-center"
                            >
                                <span class="text-primary text-sm font-medium">
                                    {(user.name || user.email)[0].toUpperCase()}
                                </span>
                            </div>
                            <span
                                class="text-sm text-foreground hidden sm:block"
                            >
                                {user.name || user.email.split("@")[0]}
                            </span>
                            <svg
                                class="w-4 h-4 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {#if userMenuOpen}
                            <button
                                class="fixed inset-0 z-40"
                                onclick={closeUserMenu}
                                aria-label="Close menu"
                            ></button>
                            <div
                                class="absolute right-0 mt-1 w-48 rounded-lg border border-border bg-card shadow-xl z-50"
                            >
                                <div class=" bg-secondary flex flex-col">
                                    <a
                                        href="/profile"
                                        class="block px-3 py-1 rounded-md text-sm text-foreground hover:bg-secondary transition-colors"
                                        onclick={closeUserMenu}
                                    >
                                        Profile
                                    </a>
                                    {#if user.isCreator}
                                        <a
                                            href="/studio"
                                            class="block px-3 py-1 rounded-md text-sm text-foreground hover:bg-secondary transition-colors"
                                            onclick={closeUserMenu}
                                        >
                                            Creator Studio
                                        </a>
                                    {/if}
                                    <hr class="my-0.5 border-border" />
                                    <button
                                        type="button"
                                        onclick={async () => {
                                            const { authClient } =
                                                await import("$lib/auth-client");
                                            await authClient.signOut();
                                            window.location.href = "/";
                                        }}
                                        class="w-full text-left px-3 py-1 rounded-md text-sm text-destructive hover:bg-secondary transition-colors"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <Button
                        href="/auth/login"
                        variant="ghost"
                        size="sm"
                        class="text-pretty text-primary"
                    >
                        Sign in
                    </Button>
                    <Button href="/auth/register" variant="default" size="sm">
                        Get Started
                    </Button>
                {/if}

                <!-- Mobile menu button -->
                <button
                    class="md:hidden p-2 text-muted-foreground hover:text-foreground"
                    onclick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {#if mobileMenuOpen}
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        {:else}
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        {/if}
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile menu -->
        {#if mobileMenuOpen}
            <div class="md:hidden border-t border-border py-4">
                {#each navLinks as link}
                    {#if !link.requiresAuth || user}
                        <a
                            href={link.href}
                            class="block py-2 text-sm font-medium
                {$page.url.pathname.startsWith(link.href)
                                ? 'text-primary'
                                : 'text-muted-foreground'}"
                            onclick={() => (mobileMenuOpen = false)}
                        >
                            {link.label}
                        </a>
                    {/if}
                {/each}
            </div>
        {/if}
    </nav>
</header>
