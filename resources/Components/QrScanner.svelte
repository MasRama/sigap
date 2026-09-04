<script lang="ts">
  import Button from './Button.svelte';
  import { cn } from '$lib/utils.js';
  import { Camera, CameraOff, ImageUp, QrCode, RotateCcw } from '@lucide/svelte';

  interface NativeBarcode {
    rawValue: string;
  }

  interface NativeDetector {
    detect(source: CanvasImageSource): Promise<NativeBarcode[]>;
  }

  interface NativeDetectorCtor {
    new (options?: { formats: string[] }): NativeDetector;
  }

  type JsQrDecode = typeof import('jsqr')['default'];

  let {
    onDetected,
    onError,
    autoStart = true,
    class: className,
  }: {
    onDetected: (rawText: string) => void;
    onError?: (message: string) => void;
    autoStart?: boolean;
    class?: string;
  } = $props();

  let videoEl: HTMLVideoElement | null = $state(null);
  let canvasEl: HTMLCanvasElement | null = $state(null);
  let fileEl: HTMLInputElement | null = $state(null);

  let stream: MediaStream | null = $state(null);
  let scannerActive = $state(false);
  let cameraStarting = $state(false);
  let scanLocked = $state(false);
  let scannerError = $state<string | null>(null);

  let scanTimer: ReturnType<typeof setTimeout> | null = null;
  let nativeDetector: NativeDetector | null = null;
  let cachedDecoder: JsQrDecode | null = null;

  function reportScannerFailure(message: string): void {
    scannerError = message;
    onError?.(message);
  }

  function cameraErrorMessage(err: unknown): string {
    if (typeof DOMException !== 'undefined' && err instanceof DOMException) {
      if (err.name === 'NotAllowedError') return 'Izin kamera ditolak. Aktifkan izin kamera di browser lalu coba lagi.';
      if (err.name === 'NotFoundError') return 'Kamera tidak ditemukan di perangkat ini.';
      if (err.name === 'NotReadableError') return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.';
      if (err.name === 'OverconstrainedError') return 'Kamera tidak mendukung mode yang diminta.';
    }
    if (err instanceof Error && err.message) return `Kamera tidak dapat diakses: ${err.message}`;
    return 'Kamera tidak dapat diakses di perangkat ini.';
  }

  async function loadJsQrDecoder(): Promise<JsQrDecode> {
    if (!cachedDecoder) {
      const mod = await import('jsqr');
      cachedDecoder = mod.default;
    }
    return cachedDecoder;
  }

  async function detectWithNativeBarcode(source: CanvasImageSource): Promise<string | null> {
    const ctor = (window as unknown as { BarcodeDetector?: NativeDetectorCtor }).BarcodeDetector;
    if (typeof ctor !== 'function') return null;
    try {
      if (!nativeDetector) nativeDetector = new ctor({ formats: ['qr_code'] });
      const codes = await nativeDetector.detect(source);
      const raw = codes?.[0]?.rawValue;
      return typeof raw === 'string' && raw.length > 0 ? raw : null;
    } catch {
      return null;
    }
  }

  async function detectWithJsQr(source: CanvasImageSource, sourceWidth: number, sourceHeight: number): Promise<string | null> {
    const canvas = canvasEl;
    if (!canvas || sourceWidth === 0 || sourceHeight === 0) return null;
    const scale = Math.min(1, 640 / sourceWidth);
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch {
      return null;
    }
    try {
      const decodeQr = await loadJsQrDecoder();
      return decodeQr(imageData.data, imageData.width, imageData.height)?.data ?? null;
    } catch {
      return null;
    }
  }

  function lockOnScanResult(rawText: string): void {
    if (scanLocked) return;
    scanLocked = true;
    stopScanner();
    onDetected(rawText);
  }

  async function scanVideoFrame(): Promise<void> {
    if (!scannerActive || scanLocked) return;
    const video = videoEl;
    if (video && video.readyState >= 2 && video.videoWidth > 0) {
      const nativeText = await detectWithNativeBarcode(video);
      if (nativeText) {
        lockOnScanResult(nativeText);
        return;
      }
      const fallbackText = await detectWithJsQr(video, video.videoWidth, video.videoHeight);
      if (fallbackText) {
        lockOnScanResult(fallbackText);
        return;
      }
    }
    if (!scannerActive || scanLocked) return;
    scanTimer = setTimeout(() => {
      void scanVideoFrame();
    }, 350);
  }

  function stopScannerTracks(): void {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  function stopScanner(): void {
    if (scanTimer !== null) {
      clearTimeout(scanTimer);
      scanTimer = null;
    }
    stopScannerTracks();
    scannerActive = false;
  }

  async function startScanner(): Promise<void> {
    if (scannerActive || cameraStarting || scanLocked) return;
    scannerError = null;
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      reportScannerFailure('Kamera membutuhkan koneksi aman (HTTPS atau localhost). Akses lewat alamat IP tidak diizinkan browser — unggah foto QR sebagai gantinya.');
      return;
    }
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      reportScannerFailure('Perangkat tidak mendukung akses kamera. Buka halaman ini lewat HTTPS atau unggah foto QR.');
      return;
    }
    cameraStarting = true;
    try {
      stream = await mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    } catch (err: unknown) {
      cameraStarting = false;
      reportScannerFailure(cameraErrorMessage(err));
      return;
    }
    if (videoEl) {
      videoEl.srcObject = stream;
      try {
        await videoEl.play();
      } catch (err: unknown) {
        stopScannerTracks();
        cameraStarting = false;
        reportScannerFailure(cameraErrorMessage(err));
        return;
      }
    }
    cameraStarting = false;
    scannerActive = true;
    void scanVideoFrame();
  }

  function rescanQrCode(): void {
    scanLocked = false;
    scannerError = null;
    if (fileEl) fileEl.value = '';
    void startScanner();
  }

  async function fileToBitmap(file: File): Promise<ImageBitmap | null> {
    try {
      return await createImageBitmap(file);
    } catch {
      return await fileToBitmapViaImage(file);
    }
  }

  function fileToBitmapViaImage(file: File): Promise<ImageBitmap | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        createImageBitmap(img).then(
          (bitmap) => {
            URL.revokeObjectURL(url);
            resolve(bitmap);
          },
          () => {
            URL.revokeObjectURL(url);
            resolve(null);
          },
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  async function decodeUploadedImage(file: File): Promise<void> {
    scannerError = null;
    const bitmap = await fileToBitmap(file);
    if (!bitmap) {
      reportScannerFailure('Gambar tidak dapat dibaca. Coba file lain.');
      return;
    }
    const nativeText = await detectWithNativeBarcode(bitmap);
    if (nativeText) {
      bitmap.close();
      lockOnScanResult(nativeText);
      return;
    }
    const fallbackText = await detectWithJsQr(bitmap, bitmap.width, bitmap.height);
    bitmap.close();
    if (fallbackText) {
      lockOnScanResult(fallbackText);
      return;
    }
    reportScannerFailure('QR tidak terbaca dari gambar. Pastikan gambar jelas lalu coba lagi.');
  }

  $effect(() => {
    if (autoStart) void startScanner();
    return () => stopScanner();
  });
</script>

<div data-slot="qr-scanner" class={cn('flex flex-col gap-3', className)}>
  <div class="relative aspect-square w-full overflow-hidden rounded-sm border border-border bg-muted">
    <video bind:this={videoEl} autoplay playsinline muted class="h-full w-full object-cover"></video>

    {#if scannerActive}
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div class="relative h-3/5 w-3/5">
          <span class="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-primary"></span>
          <span class="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-primary"></span>
          <span class="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary"></span>
          <span class="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary"></span>
        </div>
      </div>
      <p class="absolute inset-x-0 bottom-3 text-center font-mono-accent text-[10px] uppercase tracking-[0.2em] text-white drop-shadow-md">Arahkan kamera ke QR absen</p>
    {:else if cameraStarting}
      <div class="absolute inset-0 flex items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
        Menyalakan kamera...
      </div>
    {:else if !scanLocked}
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted px-6 text-center">
        <QrCode class="h-8 w-8 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">Pemindai siap. Nyalakan kamera untuk scan QR absen.</p>
      </div>
    {/if}
  </div>

  <canvas bind:this={canvasEl} class="hidden" aria-hidden="true"></canvas>
  <input
    bind:this={fileEl}
    type="file"
    accept="image/*"
    class="hidden"
    aria-label="Unggah foto QR"
    onchange={(event) => {
      const file = event.currentTarget.files?.[0];
      if (file) void decodeUploadedImage(file);
    }}
  />

  <div class="flex flex-wrap items-center gap-2">
    {#if scannerActive}
      <Button variant="outline" onclick={stopScanner}>
        <CameraOff />
        Matikan kamera
      </Button>
    {:else if !scanLocked}
      <Button onclick={() => void startScanner()} disabled={cameraStarting}>
        <Camera />
        Nyalakan kamera
      </Button>
    {:else}
      <Button variant="outline" onclick={rescanQrCode}>
        <RotateCcw />
        Pindai ulang
      </Button>
    {/if}
    {#if !scanLocked}
      <Button variant="outline" onclick={() => fileEl?.click()}>
        <ImageUp />
        Unggah foto QR
      </Button>
    {/if}
  </div>

  {#if scannerError}
    <p class="text-sm text-destructive leading-relaxed">{scannerError}</p>
  {/if}
</div>
