<script lang="ts">
  export let achievement: {
    name: string;
    description: string;
    iconUrl?: string;
    category: string;
    unlockedAt?: Date;
  };
  export let locked: boolean = false;
</script>

<div class="achievement-badge" class:locked>
  <div class="badge-icon">
    {#if achievement.iconUrl}
      <img src={achievement.iconUrl} alt={achievement.name} />
    {:else}
      <span class="default-icon">🏆</span>
    {/if}
  </div>
  <div class="badge-content">
    <h4 class="badge-name">{achievement.name}</h4>
    <p class="badge-description">{achievement.description}</p>
    {#if achievement.unlockedAt && !locked}
      <p class="unlock-date">
        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
      </p>
    {/if}
  </div>
</div>

<style>
  .achievement-badge {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 0.75rem;
    transition: all 0.3s ease;
  }

  .achievement-badge:not(.locked):hover {
    transform: scale(1.02);
    border-color: var(--color-primary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .achievement-badge.locked {
    opacity: 0.5;
    filter: grayscale(1);
  }

  .badge-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    border-radius: 0.5rem;
    font-size: 1.5rem;
  }

  .badge-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .default-icon {
    font-size: 1.75rem;
  }

  .badge-content {
    flex: 1;
  }

  .badge-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: var(--color-text-primary);
  }

  .badge-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0 0 0.5rem 0;
  }

  .unlock-date {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin: 0;
  }
</style>
