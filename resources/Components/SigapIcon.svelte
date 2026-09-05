<script lang="ts">
  import { cn } from "$lib/utils.js";
  import logoLight from "../assets/sigap-logo.png";
  import logoDark from "../assets/sigap-logo-dark.png";
  import markLight from "../assets/sigap-mark.png";
  import markDark from "../assets/sigap-mark-dark.png";

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
      alt="SIGAP"
      class="block h-auto w-auto select-none dark:hidden"
      style={`height: ${size}px`}
    />
    <img
      src={logoDark}
      alt="SIGAP"
      class="hidden h-auto w-auto select-none dark:block"
      style={`height: ${size}px`}
    />
  {:else}
    <img
      src={markLight}
      alt="SIGAP"
      class="block h-auto w-auto select-none dark:hidden"
      style={`height: ${size}px`}
    />
    <img
      src={markDark}
      alt="SIGAP"
      class="hidden h-auto w-auto select-none dark:block"
      style={`height: ${size}px`}
    />
  {/if}
</span>
