<script lang="ts">
  export let lessons: Array<{
    id: string;
    order: number;
    title: string;
  }>;
  export let completedLessonIds: Set<string>;
  export let currentLessonId: string | null;
  export let onLessonSelect: (lessonId: string) => void;

  function getLessonStatus(lessonId: string): 'completed' | 'current' | 'locked' {
    if (completedLessonIds.has(lessonId)) return 'completed';
    if (lessonId === currentLessonId) return 'current';
    return 'locked';
  }

  function isLessonClickable(lessonId: string): boolean {
    const status = getLessonStatus(lessonId);
    return status === 'completed' || status === 'current';
  }
</script>

<div class="lesson-navigation">
  <h3 class="text-lg font-semibold mb-4">Lessons</h3>
  
  <div class="space-y-2">
    {#each lessons as lesson (lesson.id)}
      {@const status = getLessonStatus(lesson.id)}
      {@const clickable = isLessonClickable(lesson.id)}
      
      <button
        on:click={() => clickable && onLessonSelect(lesson.id)}
        disabled={!clickable}
        class="w-full text-left p-4 rounded-lg border-2 transition-all duration-200
          {status === 'completed' 
            ? 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20' 
            : status === 'current'
            ? 'border-primary bg-primary/10 hover:bg-primary/20'
            : 'border-secondary/30 bg-secondary/10 opacity-50 cursor-not-allowed'}"
      >
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            {status === 'completed'
              ? 'bg-green-500 text-white'
              : status === 'current'
              ? 'bg-primary text-white'
              : 'bg-secondary/30 text-secondary'}">
            {#if status === 'completed'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {:else if status === 'locked'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            {:else}
              <span class="font-bold">{lesson.order}</span>
            {/if}
          </div>
          
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold">Lesson {lesson.order}</span>
              {#if status === 'current'}
                <span class="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
                  Current
                </span>
              {/if}
            </div>
            <p class="text-sm text-secondary mt-1">{lesson.title}</p>
          </div>

          {#if clickable}
            <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          {/if}
        </div>
      </button>
    {/each}
  </div>

  <!-- Progress Bar -->
  <div class="mt-6 p-4 bg-secondary/10 rounded-lg">
    <div class="flex items-center justify-between text-sm mb-2">
      <span class="text-secondary">Overall Progress</span>
      <span class="font-semibold">
        {completedLessonIds.size}/{lessons.length} 
        ({Math.round((completedLessonIds.size / lessons.length) * 100)}%)
      </span>
    </div>
    <div class="w-full bg-secondary/30 rounded-full h-2">
      <div 
        class="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-500"
        style="width: {(completedLessonIds.size / lessons.length) * 100}%"
      />
    </div>
  </div>
</div>

<style>
  .lesson-navigation {
    @apply w-full;
  }
</style>
