<script lang="ts">
    import { onMount } from 'svelte';
    
    interface Testimonial {
        author: string;
        handle: string;
        text: string;
        avatar: string;
    }

    interface Feature {
        title: string;
        description: string;
        icon: string;
    }

    const features: Feature[] = [
        {
            title: "CLI-First Learning",
            description: "Practice with real development workflows. Use our CLI to run tests, verify solutions, and get instant feedback.",
            icon: "⌨️"
        },
        {
            title: "Build Real Systems",
            description: "Don't just learn syntax. Build production-grade implementations of Redis, Git, Docker, and more.",
            icon: "🏗️"
        },
        {
            title: "Progressive Challenges",
            description: "Start from fundamentals and progress to advanced concepts. Each stage unlocks new capabilities.",
            icon: "📈"
        },
        {
            title: "Instant Feedback",
            description: "Automated test suite validates your implementation in real-time. Know exactly what works.",
            icon: "⚡"
        },
        {
            title: "Community Driven",
            description: "Learn from thousands of developers solving the same challenges. Share solutions and get feedback.",
            icon: "👥"
        },
        {
            title: "Open Source",
            description: "All challenges are open source. Contribute, customize, and build your own challenges.",
            icon: "🔓"
        }
    ];

    const testimonials: Testimonial[] = [
        {
            author: "Alex Chen",
            handle: "@alexchen",
            text: "CraftCode made me understand how Git actually works. Building it from scratch was eye-opening.",
            avatar: "🧑"
        },
        {
            author: "Jordan Park",
            handle: "@jordanpark",
            text: "The CLI approach is brilliant. Feels like real development. Much more engaging than typical tutorials.",
            avatar: "👩"
        },
        {
            author: "Sam Davis",
            handle: "@samdavis",
            text: "Completed the Redis challenge. Now I understand distributed systems so much better.",
            avatar: "🧑"
        }
    ];

    const companies = [
        "Stripe", "Figma", "GitHub", "Vercel", "Notion", 
        "Linear", "Raycast", "Supabase", "OpenAI", "Anthropic"
    ];

    let scrollPosition = 0;

    onMount(() => {
        const handleScroll = () => {
            scrollPosition = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });
</script>

<svelte:head>
    <title>CraftCode - Master Programming by Building Systems</title>
    <meta
        name="description"
        content="Learn programming by building real-world systems from scratch. Build Redis, Git, Docker and more with hands-on CLI challenges."
    />
</svelte:head>

<div class="relative overflow-hidden">
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl pointer-events-none">
                <div class="absolute inset-0 opacity-20" style="background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);"></div>
            </div>
        </div>

        <div class="relative z-10 max-w-3xl mx-auto text-center">
            <div class="mb-8 inline-block">
                <span class="text-sm font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    Learn by Building →
                </span>
            </div>

            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight text-balance">
                Master Programming by <span class="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Building Real Systems</span>
            </h1>

            <p class="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Build Redis, Git, Docker, and more from scratch. Learn through hands-on challenges with instant feedback and a supportive community of developers.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <a
                    href="/auth/register"
                    class="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                    Start Learning Free
                </a>
                <a
                    href="/challenges"
                    class="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors duration-200"
                >
                    Browse Challenges
                </a>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-gray-800">
                <div class="text-center">
                    <div class="text-3xl font-bold text-white mb-1">10+</div>
                    <div class="text-sm text-gray-500">Challenges</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-white mb-1">5K+</div>
                    <div class="text-sm text-gray-500">Learners</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-white mb-1">100+</div>
                    <div class="text-sm text-gray-500">Stages</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Trusted By Section -->
    <section class="relative px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-800">
        <div class="max-w-4xl mx-auto">
            <p class="text-center text-gray-500 text-sm mb-8">TRUSTED BY DEVELOPERS AT</p>
            <div class="flex flex-wrap justify-center items-center gap-12">
                {#each companies as company}
                    <div class="text-gray-600 font-semibold opacity-70 hover:opacity-100 transition-opacity">
                        {company}
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="relative px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-800">
        <div class="max-w-5xl mx-auto">
            <div class="mb-16">
                <h2 class="text-4xl sm:text-5xl font-bold text-white mb-4">
                    How CraftCode Works
                </h2>
                <p class="text-lg text-gray-400">
                    A complete platform designed for learning through building real systems
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each features as feature}
                    <div class="group p-6 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-800/50 transition-all duration-200">
                        <div class="text-4xl mb-4">{feature.icon}</div>
                        <h3 class="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                        <p class="text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Code Example Section -->
    <section class="relative px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-800">
        <div class="max-w-5xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 class="text-4xl font-bold text-white mb-4">
                        Hands-on CLI Challenges
                    </h2>
                    <p class="text-lg text-gray-400 mb-6">
                        Write code in your editor. Test with our CLI. Get instant feedback.
                    </p>
                    <ul class="space-y-4">
                        <li class="flex items-center gap-3 text-gray-300">
                            <span class="text-green-400">✓</span>
                            <span>Work in your favorite editor</span>
                        </li>
                        <li class="flex items-center gap-3 text-gray-300">
                            <span class="text-green-400">✓</span>
                            <span>Real-time test execution</span>
                        </li>
                        <li class="flex items-center gap-3 text-gray-300">
                            <span class="text-green-400">✓</span>
                            <span>Progressive difficulty levels</span>
                        </li>
                        <li class="flex items-center gap-3 text-gray-300">
                            <span class="text-green-400">✓</span>
                            <span>Learn from solution walkthroughs</span>
                        </li>
                    </ul>
                </div>

                <div class="relative">
                    <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm">
                        <div class="text-gray-500 mb-4">$ craftcode test redis:set</div>
                        <div class="space-y-2">
                            <div><span class="text-green-400">✓</span> <span class="text-gray-300">Basic SET command</span></div>
                            <div><span class="text-green-400">✓</span> <span class="text-gray-300">GET returns stored value</span></div>
                            <div><span class="text-green-400">✓</span> <span class="text-gray-300">TTL expiration works</span></div>
                            <div><span class="text-green-400">✓</span> <span class="text-gray-300">Memory efficiency check</span></div>
                            <div class="text-gray-600 mt-4">All tests passed in 234ms</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section class="relative px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-800">
        <div class="max-w-5xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-white mb-4">
                    Loved by Developers
                </h2>
                <p class="text-lg text-gray-400">
                    See what developers are saying about CraftCode
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                {#each testimonials as testimonial}
                    <div class="p-6 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-800/50 transition-all">
                        <p class="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                        <div class="flex items-center gap-3">
                            <div class="text-3xl">{testimonial.avatar}</div>
                            <div>
                                <div class="font-semibold text-white">{testimonial.author}</div>
                                <div class="text-sm text-gray-500">{testimonial.handle}</div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="relative px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-800">
        <div class="max-w-3xl mx-auto">
            <div class="text-center">
                <h2 class="text-4xl sm:text-5xl font-bold text-white mb-4">
                    Ready to Start Building?
                </h2>
                <p class="text-lg text-gray-400 mb-8">
                    Join thousands of developers mastering programming by building real systems.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/auth/register"
                        class="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        Get Started for Free
                    </a>
                    <a
                        href="/challenges"
                        class="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors duration-200"
                    >
                        View Challenges
                    </a>
                </div>
            </div>
        </div>
    </section>
</div>
