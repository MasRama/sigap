<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils.js';

  let {
    title,
    description,
    class: className,
    children,
  }: {
    title?: string;
    description?: string;
    class?: string;
    children?: Snippet;
  } = $props();
</script>

<div
  data-slot="bento-card"
  class={cn(
    "group relative overflow-hidden rounded-lg border border-border bg-card transition-colors duration-200 hover:border-primary/40",
    className
  )}
>
  <div class="relative z-10 flex h-full flex-col">
    {#if title}
      <div class="px-5 py-3 border-b border-border bg-secondary/40">
        <h3 class="font-heading text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
    {/if}
    {#if description}
      <p class="px-5 pt-4 text-xs text-muted-foreground font-body leading-relaxed">{description}</p>
    {/if}
    <div class={cn("flex-1 px-5 py-4", !description && "pt-4")}>
      {@render children?.()}
    </div>
  </div>
</div>
