<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import type { PageData } from "./$types";
    import StatCard from "$lib/components/profile/StatCard.svelte";
    import AchievementBadge from "$lib/components/profile/AchievementBadge.svelte";
    import CourseCard from "$lib/components/profile/CourseCard.svelte";

    export let data: PageData;

    const { user, statistics, completedCourses, achievements, creatorStats } = data;
</script>

<div class="profile-container">
    <!-- Profile Header -->
    <div class="profile-header">
        <div class="user-avatar">
            {#if user.image}
                <img src={user.image} alt={user.name || "User"} />
            {:else}
                <div class="avatar-placeholder">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </div>
            {/if}
        </div>
        <div class="user-info">
            <h1 class="user-name">{user.name || "Anonymous"}</h1>
            <p class="user-email">{user.email}</p>
            {#if user.isCreator}
                <span class="creator-badge">✨ Creator</span>
            {/if}
        </div>
        <a href="/profile/tokens" class="manage-tokens-btn">
            Manage CLI Tokens
        </a>
    </div>

    <!-- Statistics Grid -->
    <section class="stats-section" in:fade={{ delay: 100 }}>
        <h2 class="section-title">Your Statistics</h2>
        <div class="stats-grid">
            <StatCard 
                label="Total Courses Completed" 
                value={statistics.totalCoursesCompleted} 
                icon="🎓"
            />
            <StatCard 
                label="Current Streak" 
                value={`${statistics.currentStreak} days`} 
                icon="🔥"
                trend={statistics.currentStreak > 0 ? "up" : "neutral"}
            />
            <StatCard 
                label="Challenges Completed" 
                value={statistics.challengesCompleted} 
                icon="⚡"
            />
            <StatCard 
                label="Tutorials Completed" 
                value={statistics.tutorialsCompleted} 
                icon="📚"
            />
            <StatCard 
                label="Competitive Problems" 
                value={statistics.competitiveCompleted} 
                icon="🏆"
            />
            <StatCard 
                label="Longest Streak" 
                value={`${statistics.longestStreak} days`} 
                icon="🌟"
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
            <h2 class="section-title">Completed Courses ({completedCourses.length})</h2>
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
            <a href="/courses" class="cta-button">Browse Courses</a>
        </section>
    {/if}

    <!-- Creator Stats Section -->
    {#if user.isCreator && creatorStats}
        <section class="creator-section" in:fade={{ delay: 400 }}>
            <h2 class="section-title">Creator Statistics</h2>
            <div class="creator-stats">
                <StatCard 
                    label="Published Courses" 
                    value={creatorStats.publishedCourses} 
                    icon="📝"
                />
                <StatCard 
                    label="Total Enrollments" 
                    value={creatorStats.totalEnrollments} 
                    icon="👥"
                />
            </div>
            <a href="/creator/studio" class="creator-studio-btn">
                Go to Creator Studio →
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
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
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
        background: linear-gradient(135deg, hsl(280, 80%, 60%), hsl(320, 80%, 60%));
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
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
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
