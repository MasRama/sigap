<script lang="ts">
  import { cn } from '$lib/utils.js';

  let {
    label,
    value,
    change,
    class: className,
  }: {
    label: string;
    value: string | number;
    change?: { value: string; positive?: boolean };
    class?: string;
  } = $props();
</script>

<div
  data-slot="stat-card"
  class={cn(
    "bg-card border border-border rounded-lg overflow-hidden",
    className
  )}
>
  <div class="px-4 py-2.5 bg-secondary/60 border-b border-border">
    <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
  </div>
  <div class="px-4 py-4 flex items-end justify-between">
    <span class="font-heading text-2xl font-semibold tracking-tight text-foreground">{value}</span>
    {#if change}
      <span class={cn(
        "text-xs font-mono-accent font-medium",
        change.positive ? "text-primary" : "text-destructive"
      )}>
        {change.value}
      </span>
    {/if}
  </div>
</div>
