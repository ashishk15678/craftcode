<script lang="ts">
  import { onMount } from 'svelte';
  
  export let lessonId: string;
  export let challengeSlug: string;
  export let testRunnerType: string;
  export let onTestComplete: (result: any) => void = () => {};

  let userCode = '';
  let isRunning = false;
  let testResult: any = null;
  let showOutput = false;

  // Set default code template based on test runner type
  onMount(() => {
    const templates: Record<string, string> = {
      NODE: `// Write your solution here
function solution() {
  // Your code here
  return "Hello, World!";
}

module.exports = solution;`,
      PYTHON: `# Write your solution here
def solution():
    # Your code here
    return "Hello, World!"`,
      BASH: `#!/bin/bash
# Write your solution here
echo "Hello, World!"`,
      IO_MATCHING: `// Write your solution here
// Read from stdin, write to stdout`,
      CUSTOM: '// Write your solution here'
    };
    
    userCode = templates[testRunnerType] || templates.CUSTOM;
  });

  async function runTests() {
    if (!userCode.trim()) {
      alert('Please write some code first!');
      return;
    }

    isRunning = true;
    testResult = null;
    showOutput = false;

    try {
      const response = await fetch(`/api/challenges/${challengeSlug}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonId,
          userCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        testResult = {
          success: false,
          error: data.error || 'Test execution failed',
          output: data.details || ''
        };
      } else {
        testResult = data;
        if (data.success && data.lessonComplete) {
          onTestComplete(data);
        }
      }

      showOutput = true;
    } catch (error) {
      testResult = {
        success: false,
        error: 'Network error',
        output: error instanceof Error ? error.message : 'Unknown error'
      };
      showOutput = true;
    } finally {
      isRunning = false;
    }
  }

  function clearOutput() {
    testResult = null;
    showOutput = false;
  }
</script>

<div class="test-runner">
  <div class="editor-section">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Your Solution</h3>
      <div class="flex gap-2">
        {#if showOutput}
          <button
            on:click={clearOutput}
            class="px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
          >
            Clear Output
          </button>
        {/if}
        <button
          on:click={runTests}
          disabled={isRunning}
          class="px-6 py-2 rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>
    </div>

    <textarea
      bind:value={userCode}
      disabled={isRunning}
      class="w-full h-96 p-4 rounded-lg bg-secondary/30 border border-secondary/50 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="Write your solution here..."
    />
  </div>

  {#if showOutput && testResult}
    <div class="output-section mt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Test Results</h3>
        {#if testResult.result?.duration}
          <span class="text-sm text-secondary">
            Completed in {testResult.result.duration}ms
          </span>
        {/if}
      </div>

      <div class="rounded-lg border-2 {testResult.success ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'} p-6">
        <div class="flex items-center gap-3 mb-4">
          {#if testResult.success}
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 class="text-xl font-bold text-green-500">All Tests Passed! ✓</h4>
              {#if testResult.lessonComplete}
                <p class="text-sm text-green-400 mt-1">Lesson completed! Progress saved.</p>
              {/if}
            </div>
          {:else}
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 class="text-xl font-bold text-red-500">Tests Failed ✗</h4>
              <p class="text-sm text-red-400 mt-1">Review the output below and try again.</p>
            </div>
          {/if}
        </div>

        {#if testResult.result?.output || testResult.result?.error || testResult.error}
          <div class="mt-4">
            <h5 class="text-sm font-semibold mb-2 text-secondary">Output:</h5>
            <pre class="bg-black/30 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">{testResult.result?.output || testResult.result?.error || testResult.error || 'No output'}</pre>
          </div>
        {/if}

        {#if testResult.success && testResult.progress}
          <div class="mt-4 pt-4 border-t border-secondary/30">
            <div class="flex items-center justify-between text-sm">
              <span class="text-secondary">Challenge Progress:</span>
              <span class="font-semibold">{testResult.progress.completed}/{testResult.progress.total} lessons ({testResult.progress.percentage}%)</span>
            </div>
            <div class="w-full bg-secondary/30 rounded-full h-2 mt-2">
              <div 
                class="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-500"
                style="width: {testResult.progress.percentage}%"
              />
            </div>
          </div>
        {/if}

        {#if testResult.challengeComplete}
          <div class="mt-4 p-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg border border-primary/30">
            <p class="text-center text-lg font-bold">
              🎉 Congratulations! You've completed the entire challenge! 🎉
            </p>
          </div>
        {:else if testResult.nextLesson}
          <div class="mt-4 p-4 bg-secondary/20 rounded-lg">
            <p class="text-sm text-secondary mb-1">Next Lesson:</p>
            <p class="font-semibold">Lesson {testResult.nextLesson.order}: {testResult.nextLesson.title}</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .test-runner {
    @apply w-full;
  }
</style>
