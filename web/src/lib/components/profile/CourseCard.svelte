<script lang="ts">
  export let course: {
    id: string;
    title: string;
    description: string;
    type: string;
    difficulty: string;
    iconUrl?: string;
    coverUrl?: string;
  };
</script>

<a href="/courses/{course.id}" class="course-card">
  <div class="course-cover">
    {#if course.coverUrl}
      <img src={course.coverUrl} alt={course.title} />
    {:else}
      <div class="default-cover" style="background: linear-gradient(135deg, hsl({Math.random() * 360}, 70%, 60%), hsl({Math.random() * 360}, 70%, 50%));">
        <span class="course-icon">{course.iconUrl || "📚"}</span>
      </div>
    {/if}
  </div>
  <div class="course-info">
    <div class="course-header">
      <h3 class="course-title">{course.title}</h3>
      <span class="course-type" class:challenge={course.type === "CHALLENGE"} class:tutorial={course.type === "TUTORIAL"} class:competitive={course.type === "COMPETITIVE"}>
        {course.type.toLowerCase()}
      </span>
    </div>
    <p class="course-description">{course.description}</p>
    <div class="course-meta">
      <span class="difficulty" class:beginner={course.difficulty === "beginner"} class:intermediate={course.difficulty === "intermediate"} class:advanced={course.difficulty === "advanced"}>
        {course.difficulty}
      </span>
      <span class="completion-badge">✓ Completed</span>
    </div>
  </div>
</a>

<style>
  .course-card {
    display: block;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    overflow: hidden;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
  }

  .course-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--color-primary);
  }

  .course-cover {
    width: 100%;
    height: 12rem;
    overflow: hidden;
    background: var(--color-background);
  }

  .course-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .default-cover {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .course-icon {
    font-size: 4rem;
  }

  .course-info {
    padding: 1.25rem;
  }

  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .course-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  .course-type {
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .course-type.challenge {
    background: hsl(220, 90%, 95%);
    color: hsl(220, 90%, 40%);
  }

  .course-type.tutorial {
    background: hsl(150, 90%, 95%);
    color: hsl(150, 90%, 35%);
  }

  .course-type.competitive {
    background: hsl(30, 90%, 95%);
    color: hsl(30, 90%, 40%);
  }

  .course-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0 0 1rem 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .course-meta {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .difficulty {
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .difficulty.beginner {
    background: hsl(120, 60%, 95%);
    color: hsl(120, 60%, 35%);
  }

  .difficulty.intermediate {
    background: hsl(45, 90%, 95%);
    color: hsl(45, 90%, 35%);
  }

  .difficulty.advanced {
    background: hsl(0, 70%, 95%);
    color: hsl(0, 70%, 40%);
  }

  .completion-badge {
    font-size: 0.75rem;
    color: var(--color-success);
    font-weight: 600;
  }
</style>
