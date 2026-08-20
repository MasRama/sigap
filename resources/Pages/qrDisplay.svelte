<script lang="ts">
  import axios from 'axios';
  import { api } from '$lib/api';
  import { fly } from 'svelte/transition';

  let { qrRefreshInterval = 5, schoolName = 'Sekolah' }: { qrRefreshInterval?: number; schoolName?: string } = $props();

  interface QrData {
    payload: string;
    dataUrl: string;
    expiresAt: number;
    intervalMinutes: number;
    generatedAt: number;
  }

  let qrData = $state<QrData | null>(null);
  let isLoading = $state(false);
  let now = $state(Date.now());
  let countdown = $state(0);

  async function fetchQr(): Promise<void> {
    isLoading = true;
    const result = await api(() => axios.get('/qr-settings/qr-data'), { showSuccessToast: false });
    isLoading = false;
    if (result.success && result.data) qrData = result.data as QrData;
  }

  // Initial fetch + polling based on expiry
  $effect(() => {
    fetchQr();
    const tickInterval = setInterval(() => {
      now = Date.now();
      if (qrData && now >= qrData.expiresAt) {
        fetchQr();
      }
    }, 1000);
    return () => clearInterval(tickInterval);
  });

  const secondsLeft = $derived(qrData ? Math.max(0, Math.ceil((qrData.expiresAt - now) / 1000)) : 0);
  const progressPct = $derived(qrData ? Math.max(0, Math.min(100, (secondsLeft / (qrData.intervalMinutes * 60)) * 100)) : 0);
  const currentTime = $derived(new Date(now).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
</script>

<svelte:head>
  <title>Layar QR Absen — {schoolName}</title>
</svelte:head>

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased flex flex-col items-center justify-center px-6 py-10">
  <div class="w-full max-w-3xl flex flex-col items-center" in:fly={{ y: 20, duration: 700 }}>
    <!-- Header -->
    <div class="text-center mb-8">
      <p class="font-mono-accent text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">Absensi Guru Harian</p>
      <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,6vw,4rem)] text-foreground">{schoolName}</h1>
      <p class="font-mono-accent text-sm text-muted-foreground mt-3">{currentTime}</p>
    </div>

    <!-- QR card -->
    <div class="bg-card border border-border rounded-2xl p-8 shadow-sm w-full flex flex-col items-center" in:fly={{ y: 20, duration: 700, delay: 100 }}>
      {#if isLoading && !qrData}
        <div class="w-[320px] h-[320px] flex items-center justify-center text-muted-foreground text-sm">Memuat QR code...</div>
      {:else if qrData}
        <img src={qrData.dataUrl} alt="QR Absen" class="w-[320px] h-[320px] rounded-lg" />
        <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-5">Scan untuk konfirmasi kehadiran</p>
      {:else}
        <div class="w-[320px] h-[320px] flex items-center justify-center text-muted-foreground text-sm">Gagal memuat QR code</div>
      {/if}

      <!-- Countdown -->
      {#if qrData}
        <div class="w-full mt-6">
          <div class="flex justify-between items-baseline mb-2">
            <span class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground">QR berputar dalam</span>
            <span class="font-mono-accent text-sm text-foreground tabular-nums">{secondsLeft}s</span>
          </div>
          <div class="h-1 bg-secondary rounded-full overflow-hidden">
            <div class="h-full bg-primary transition-[width] duration-1000 ease-linear" style="width: {progressPct}%"></div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 mt-8">
      Interval {qrRefreshInterval} menit · Refresh otomatis
    </p>
  </div>
</div>
