<script lang="ts">
  import { cn } from '$lib/utils.js';

  let {
    onCapture,
    class: className,
    facingMode = 'user',
  }: {
    onCapture: (dataUrl: string) => void;
    class?: string;
    facingMode?: 'user' | 'environment';
  } = $props();

  let videoEl: HTMLVideoElement | null = $state(null);
  let canvasEl: HTMLCanvasElement | null = $state(null);
  let stream: MediaStream | null = $state(null);
  let isReady = $state(false);
  let error = $state<string | null>(null);

  async function startCamera(): Promise<void> {
    error = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.onloadedmetadata = () => {
          isReady = true;
          videoEl?.play();
        };
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Could not access camera';
      isReady = false;
    }
  }

  function stopCamera(): void {
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
    isReady = false;
  }

  function capture(): void {
    if (!videoEl || !canvasEl || !isReady) return;
    canvasEl.width = videoEl.videoWidth || 640;
    canvasEl.height = videoEl.videoHeight || 480;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    const dataUrl = canvasEl.toDataURL('image/jpeg', 0.92);
    onCapture(dataUrl);
  }

  $effect(() => {
    startCamera();
    return () => stopCamera();
  });
</script>

<div data-slot="camera-capture" class={cn("flex flex-col gap-3", className)}>
  <div class="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-border bg-muted">
    <video bind:this={videoEl} autoplay playsinline muted class="h-full w-full -scale-x-100 object-cover" class:opacity-0={!isReady}></video>
    {#if error}
      <div class="absolute inset-0 flex items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
        {error}
      </div>
    {/if}
  </div>

  <canvas bind:this={canvasEl} class="hidden"></canvas>

  <button
    type="button"
    onclick={capture}
    disabled={!isReady}
    class="inline-flex items-center justify-center gap-2 h-10 rounded-sm bg-primary px-5 text-sm font-heading font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
  >
    <span class="size-2 rounded-full bg-current"></span>
    Capture
  </button>
</div>
