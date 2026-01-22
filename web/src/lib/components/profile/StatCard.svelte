<script lang="ts">
  export let label: string;
  export let value: string | number;
  export let icon: string = "📊";
  export let trend: "up" | "down" | "neutral" = "neutral";
</script>

<div class="stat-card">
  <div class="stat-icon">{icon}</div>
  <div class="stat-content">
    <div class="stat-label">{label}</div>
    <div class="stat-value" class:trend-up={trend === "up"} class:trend-down={trend === "down"}>
      {value}
    </div>
  </div>
</div>

<style>
  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary);
  }

  .stat-icon {
    font-size: 2rem;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-alpha-10);
    border-radius: 0.75rem;
  }

  .stat-content {
    flex: 1;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .trend-up {
    color: var(--color-success);
  }

  .trend-down {
    color: var(--color-error);
  }
</style>
