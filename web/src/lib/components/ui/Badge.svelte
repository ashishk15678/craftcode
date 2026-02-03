<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
        variant?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "default"
            | "secondary"
            | "outline";
        size?: "sm" | "md" | "lg";
        className?: string;
    }

    let {
        children,
        variant = "default",
        size = "sm",
        className = "",
    }: Props = $props();

    const variantClasses: Record<string, string> = {
        default: "bg-secondary text-primary border-transparent",
        secondary: "bg-secondary text-secondary-foreground border-transparent",
        outline: "text-foreground border-border bg-transparent",
        beginner: "bg-background text-emerald-800 border-emerald-800/50",
        intermediate: "bg-amber-950/50 text-amber-400 border-amber-800/50",
        advanced: "bg-rose-950/50 text-rose-400 border-rose-800/50",
    };

    const sizeClasses: Record<string, string> = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-xs",
    };
</script>

<span
    class="inline-flex items-center rounded-full border font-thin {variantClasses[
        variant
    ]} {sizeClasses[size]} {className}"
>
    {@render children()}
</span>
