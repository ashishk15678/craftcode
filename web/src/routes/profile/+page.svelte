<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import type { PageData } from "./$types";
    import StatCard from "$lib/components/profile/StatCard.svelte";
    import AchievementBadge from "$lib/components/profile/AchievementBadge.svelte";
    import CourseCard from "$lib/components/profile/CourseCard.svelte";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        UserStoryIcon,
        TickDouble01Icon,
        CourseIcon,
        StudentsIcon,
        FireIcon,
        ChartRingIcon,
        MoneyIcon,
        Trophy,
        StarIcon,
        Chart01Icon,
    } from "@hugeicons/core-free-icons";

    export let data: PageData;

    const { user, statistics, completedCourses, achievements, creatorStats } =
        data;
</script>

<div class="profile-container text-primary">
    <!-- Profile Header -->
    <div class="flex w-full justify-between items-center">
        <div class=" flex">
            {#if user.image}
                <img
                    src={user.image}
                    class="w-18 h-18 rounded-full"
                    alt={user.name || "User"}
                />
            {:else}
                <div
                    class="w-15 h-15 rounded-full bg-secondary flex items-center justify-center font-bold"
                >
                    <HugeiconsIcon
                        icon={UserStoryIcon}
                        class="h-10 w-10 text-muted-foreground"
                    />
                </div>
            {/if}
            <div class="flex flex-col ml-4">
                <div class="flex">
                    <h1 class="text-xl font-bold">
                        {user.name || "Anonymous"}
                    </h1>

                    {#if user.isCreator}
                        <div class="group">
                            <HugeiconsIcon
                                icon={TickDouble01Icon}
                                class="w-6 h-6 text-green-600 cursor-help"
                            />
                            <div
                                class="hidden group-hover:flex bg-secondary absolute text-muted-foreground px-2 line-clamp-1 rounded-full"
                            >
                                User is a creator
                            </div>
                        </div>
                    {/if}
                </div>
                <p class="text-muted-foreground">{user.email}</p>
            </div>
        </div>
        <a href="/profile/tokens" class="">
            <button
                class="bg-gradient-to-b from-primary/50 via-primary to-primary text-secondary px-4 py-2 rounded-3xl"
                >Manage CLI Tokens</button
            >
        </a>
    </div>

    <!-- Statistics Grid -->
    <section class="stats-section mt-18 group" in:fade={{ delay: 100 }}>
        <h2 class="section-title">Your Statistics</h2>
        <div class="grid grid-cols-4">
            <StatCard
                label="Total Courses Completed"
                value={statistics.totalCoursesCompleted}
                icon={CourseIcon}
            />
            <StatCard
                label="Current Streak"
                value={`${statistics.currentStreak} days`}
                icon={FireIcon}
                trend={statistics.currentStreak > 0 ? "up" : "neutral"}
            />
            <StatCard
                label="Challenges Completed"
                value={statistics.challengesCompleted}
                icon={Chart01Icon}
            />
            <StatCard
                label="Tutorials Completed"
                value={statistics.tutorialsCompleted}
                icon={MoneyIcon}
            />
            <StatCard
                label="Competitive Problems"
                value={statistics.competitiveCompleted}
                icon={Trophy}
            />
            <StatCard
                label="Longest Streak"
                value={`${statistics.longestStreak} days`}
                icon={StarIcon}
            />
        </div>
    </section>

    <!-- Achievements Section -->
    {#if achievements && achievements.length > 0}
        <section class="achievements-section" in:fade={{ delay: 200 }}>
            <h2 class="section-title">Achievements ({achievements.length})</h2>
            <div class="achievements-grid">
                {#each achievements as achievement}
                    <AchievementBadge {achievement} />
                {/each}
            </div>
        </section>
    {/if}

    <!-- Completed Courses Section -->
    {#if completedCourses && completedCourses.length > 0}
        <section class="courses-section" in:fade={{ delay: 300 }}>
            <h2 class="section-title">
                Completed Courses ({completedCourses.length})
            </h2>
            <div class="courses-grid">
                {#each completedCourses as course}
                    <CourseCard {course} />
                {/each}
            </div>
        </section>
    {:else}
        <section class="empty-state" in:fade={{ delay: 300 }}>
            <div class="empty-icon">📚</div>
            <h3>No completed courses yet</h3>
            <p>Start learning to see your progress here!</p>
            <a href="/challenges" class="">
                <button
                    class="bg-secondary text-primary border border-border px-4 py-2 rounded-3xl w-[300px]"
                    >Browse courses</button
                >
            </a>
        </section>
    {/if}

    <!-- Creator Stats Section -->
    {#if user.isCreator && creatorStats}
        <section class="creator-section" in:fade={{ delay: 400 }}>
            <h2 class="section-title">Creator Statistics</h2>
            <div class="flex w-full flex-row p-4">
                <StatCard
                    label="Published Courses"
                    value={creatorStats.publishedCourses}
                    icon={CourseIcon}
                    className="px-8 py-2 w-full"
                />
                <StatCard
                    label="Total Enrollments"
                    value={creatorStats.totalEnrollments}
                    icon={StudentsIcon}
                    className="w-full px-8 py-2"
                />
            </div>
            <a href="/creator/studio" class="">
                <button
                    class="bg-gradient-to-b from-primary/50 via-primary to-primary text-secondary px-4 py-2 rounded-3xl"
                    >Go to creator studio</button
                >
            </a>
        </section>
    {/if}
</div>

<style>
    .profile-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .profile-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 2rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 1.5rem;
        margin-bottom: 2rem;
    }

    .user-avatar {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid var(--color-primary);
    }

    .user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            135deg,
            var(--color-primary),
            var(--color-secondary)
        );
        color: white;
        font-size: 2rem;
        font-weight: 700;
    }

    .user-info {
        flex: 1;
    }

    .user-name {
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 0.25rem 0;
        color: var(--color-text-primary);
    }

    .user-email {
        font-size: 1rem;
        color: var(--color-text-secondary);
        margin: 0 0 0.5rem 0;
    }

    .creator-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: linear-gradient(
            135deg,
            hsl(280, 80%, 60%),
            hsl(320, 80%, 60%)
        );
        color: white;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
    }

    .manage-tokens-btn {
        padding: 0.75rem 1.5rem;
        background: var(--color-primary);
        color: white;
        border-radius: 0.75rem;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .manage-tokens-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 1.5rem 0;
        color: var(--color-text-primary);
    }

    .stats-section,
    .achievements-section,
    .courses-section,
    .creator-section {
        margin-bottom: 3rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    .courses-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--color-surface);
        border: 2px dashed var(--color-border);
        border-radius: 1.5rem;
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .empty-state h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
        color: var(--color-text-primary);
    }

    .empty-state p {
        font-size: 1rem;
        color: var(--color-text-secondary);
        margin: 0 0 1.5rem 0;
    }

    .cta-button {
        display: inline-block;
        padding: 0.75rem 2rem;
        background: var(--color-primary);
        color: white;
        border-radius: 0.75rem;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .creator-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .creator-studio-btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(
            135deg,
            var(--color-primary),
            var(--color-secondary)
        );
        color: white;
        border-radius: 0.75rem;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .creator-studio-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        .profile-container {
            padding: 1rem;
        }

        .profile-header {
            flex-direction: column;
            text-align: center;
        }

        .stats-grid,
        .courses-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
