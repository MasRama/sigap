<script lang="ts">
  import { cn } from "$lib/utils.js";
  import logoLight from "../assets/simpatik-logo.png";
  import logoDark from "../assets/simpatik-logo-dark.png";
  import markLight from "../assets/simpatik-mark.png";
  import markDark from "../assets/simpatik-mark-dark.png";

  interface Props {
    size?: number;
    showText?: boolean;
    class?: string;
  }

  let { size = 28, showText = true, class: className }: Props = $props();
</script>

<span class={cn("inline-flex items-center shrink-0", className)}>
  {#if showText}
    <img
      src={logoLight}
      alt="SIMPATIK"
      class="block h-auto w-auto select-none dark:hidden"
      style={`height: ${size}px`}
    />
    <img
      src={logoDark}
      alt="SIMPATIK"
      class="hidden h-auto w-auto select-none dark:block"
      style={`height: ${size}px`}
    />
  {:else}
    <img
      src={markLight}
      alt="SIMPATIK"
      class="block h-auto w-auto select-none dark:hidden"
      style={`height: ${size}px`}
    />
    <img
      src={markDark}
      alt="SIMPATIK"
      class="hidden h-auto w-auto select-none dark:block"
      style={`height: ${size}px`}
    />
  {/if}
</span>
