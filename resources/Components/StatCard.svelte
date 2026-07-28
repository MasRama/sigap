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
    "flex flex-col justify-between rounded-sm border border-border bg-card p-5 text-card-foreground shadow-soft",
    className
  )}
>
  <span class="text-xs font-heading font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
  <div class="mt-3 flex items-end justify-between">
    <span class="font-heading text-3xl font-semibold tracking-tight text-foreground">{value}</span>
    {#if change}
      <span class={cn(
        "text-xs font-body font-medium",
        change.positive ? "text-success-600 dark:text-success-400" : "text-destructive"
      )}>
        {change.value}
      </span>
    {/if}
  </div>
</div>
