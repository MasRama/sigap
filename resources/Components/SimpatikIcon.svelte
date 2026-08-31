<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    size?: number;
    showText?: boolean;
    textClass?: string;
    class?: string;
  }

  let { size = 28, showText = true, textClass = "font-heading font-semibold tracking-tight text-lg", class: className }: Props = $props();
</script>

<span class={cn("inline-flex items-center gap-2", className)}>
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SIMPATIK logo">
    <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
    <path
      d="M10 12.5C10 11.1193 11.1193 10 12.5 10H19.5C20.8807 10 22 11.1193 22 12.5V14.5C22 15.3284 21.3284 16 20.5 16H11.5C10.6716 16 10 15.3284 10 14.5V12.5Z"
      fill="white"
      fill-opacity="0.9"
    />
    <path
      d="M10 17.5C10 17.2239 10.2239 17 10.5 17H21.5C21.7761 17 22 17.2239 22 17.5V19.5C22 20.8807 20.8807 22 19.5 22H12.5C11.1193 22 10 20.8807 10 19.5V17.5Z"
      fill="white"
      fill-opacity="0.6"
    />
  </svg>
  {#if showText}
    <span class={textClass}>SIMPATIK</span>
  {/if}
</span>
