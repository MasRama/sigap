<script lang="ts">
  import { cn } from '$lib/utils.js';

  let {
    onLocation,
    onError,
    class: className,
    label = 'Use current location',
    loadingLabel = 'Locating...',
  }: {
    onLocation: (coords: { latitude: number; longitude: number }) => void;
    onError?: (message: string) => void;
    class?: string;
    label?: string;
    loadingLabel?: string;
  } = $props();

  let isLoading = $state(false);
  let hasLocation = $state(false);

  function getLocation(): void {
    if (!navigator.geolocation) {
      onError?.('Geolocation is not supported by this browser');
      return;
    }

    isLoading = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        isLoading = false;
        hasLocation = true;
        onLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        isLoading = false;
        onError?.(err.message || 'Unable to retrieve location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }
</script>

<button
  type="button"
  onclick={getLocation}
  disabled={isLoading}
  class={cn(
    "inline-flex items-center justify-center gap-2 h-10 rounded-sm border border-border bg-background px-5 text-sm font-heading font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 cursor-pointer",
    className
  )}
>
  {#if hasLocation}
    <span class="size-2 rounded-full bg-success-500"></span>
    Location acquired
  {:else if isLoading}
    <span class="size-2 animate-pulse rounded-full bg-primary"></span>
    {loadingLabel}
  {:else}
    <span class="size-2 rounded-full bg-muted-foreground"></span>
    {label}
  {/if}
</button>
