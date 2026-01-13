<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    children: Snippet;
    variant?: 'beginner' | 'intermediate' | 'advanced' | 'default';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  }

  let { children, variant = 'default', size = 'md', className = '' }: Props = $props();

  const variantClasses: Record<string, string> = {
    default: 'bg-secondary text-secondary-foreground border-border',
    beginner: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50',
    intermediate: 'bg-amber-950/50 text-amber-400 border-amber-800/50',
    advanced: 'bg-rose-950/50 text-rose-400 border-rose-800/50'
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
</script>

<span class="inline-flex items-center rounded-full border font-medium {variantClasses[variant]} {sizeClasses[size]} {className}">
  {@render children()}
</span>
