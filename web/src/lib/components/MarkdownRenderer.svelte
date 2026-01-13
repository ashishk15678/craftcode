<script lang="ts">
  interface Props {
    content: string;
  }

  let { content }: Props = $props();
</script>

<div class="prose prose-invert prose-lg max-w-none
  prose-headings:text-foreground prose-headings:font-semibold
  prose-p:text-muted-foreground
  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
  prose-strong:text-foreground
  prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
  prose-pre:bg-card prose-pre:border prose-pre:border-border
  prose-blockquote:border-primary prose-blockquote:text-muted-foreground
  prose-li:text-muted-foreground
  prose-hr:border-border
">
  {@html content}
</div>
