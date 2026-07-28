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
    "group relative overflow-hidden rounded-sm border border-border bg-card p-6 text-card-foreground shadow-soft transition-all duration-300 hover:border-primary/20 hover:shadow-md",
    className
  )}
>
  <div class="relative z-10 flex h-full flex-col">
    {#if title}
      <h3 class="font-heading text-base font-semibold tracking-tight">{title}</h3>
    {/if}
    {#if description}
      <p class="mt-1 text-xs text-muted-foreground font-body leading-relaxed">{description}</p>
    {/if}
    <div class={cn("flex-1", (title || description) && "mt-4")}>
      {@render children?.()}
    </div>
  </div>
</div>
