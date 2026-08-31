<script lang="ts">
  import { inertia, page } from '@inertiajs/svelte';
  import { fly, fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import DarkModeToggle from '../Components/DarkModeToggle.svelte';

  interface User {
    id: string;
    name: string;
    username: string;
    roles: string[];
    permissions: string[];
  }

  let user = page.props.user as User | undefined;
  let scrollY = $state(0);
  let scrolled = $derived(scrollY > 40);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const serial = `SK/${new Date().getFullYear()}/${String(Math.floor(1000 + Math.random() * 9000))}`;

  // Live attendance simulation
  type Status = 'hadir' | 'terlambat' | 'absen';
  interface Student {
    nis: string;
    name: string;
    status: Status;
  }

  const students: Student[] = [
    { nis: '2025001', name: 'Ahmad Rizki Pratama', status: 'hadir' },
    { nis: '2025002', name: 'Siti Nurhaliza', status: 'hadir' },
    { nis: '2025003', name: 'Budi Hartono', status: 'hadir' },
    { nis: '2025004', name: 'Dewi Lestari', status: 'terlambat' },
    { nis: '2025005', name: 'Fajar Nugroho', status: 'hadir' },
    { nis: '2025006', name: 'Joko Susilo', status: 'absen' },
  ];

  let revealedCount = $state(0);

  $effect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= students.length) {
        clearInterval(interval);
        return;
      }
      revealedCount = i + 1;
      i++;
    }, 180);
    return () => clearInterval(interval);
  });

  const stats = $derived({
    hadir: students.filter((s) => s.status === 'hadir').length,
    terlambat: students.filter((s) => s.status === 'terlambat').length,
    absen: students.filter((s) => s.status === 'absen').length,
    total: students.length,
  });

  const statusConfig = {
    hadir: { label: 'Hadir', dot: 'bg-primary', text: 'text-primary', bg: 'bg-primary/8' },
    terlambat: { label: 'Terlambat', dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-500/8' },
    absen: { label: 'Absen', dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/8' },
  };
</script>

<svelte:window bind:scrollY />

<!--
  THESIS: Landing page SIMPATIK adalah daftar hadir yang sedang diisi live, bukan
  hero yang dijelaskan. Menolak template LMS landing (gradient hero, feature card,
  "trusted by", pricing table). Mekanisme dibuktikan dengan produk bekerja.

  OWN-WORLD: Ledger absensi digital. Hijau = hadir/terverifikasi, merah = absen/
  di luar radius, kuning = terlambat. Grid nama + NIS + status dot. Header kelas.
  Stats bar. Bersih, operasional, hidup.

  STORY: Pengunjung melihat daftar hadir live — nama muncul satu per satu dengan
  status. Lalu memahami mekanisme 4 langkah. Lalu melihat tiga tampilan untuk tiga
  peran. Lalu tahu cara mendapatkan akses: hubungi admin sekolah.

  FIRST VIEWPORT: Split 5/7. Kiri = headline + CTA di atas panel hijau pekat.
  Kanan = daftar hadir live di atas kertas putih, nama muncul staggered dengan
  status dot. Stats bar di bawah grid. Mobile: grid di bawah headline.

  FORM: Daftar Hadir Live. Staging: staggered reveal sebagai momen tunggal.
  Seed key: 877c7ab7 (re-derived from certificate to ledger world).

  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md
-->

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden">

  <!-- Nav -->
  <nav
    class="fixed top-0 inset-x-0 z-50 flex items-center justify-between h-16 px-6 sm:px-10 lg:px-16 bg-background border-b border-border"
  >
    <a href="/" use:inertia class="flex items-center gap-3 group">
      <span class="inline-flex items-center justify-center w-7 h-7 bg-primary rounded-md">
        <span class="w-2.5 h-2.5 bg-primary-foreground rounded-[2px] transition-transform duration-300 group-hover:scale-110"></span>
      </span>
      <span class="font-heading font-semibold tracking-tight text-lg">SIMPATIK</span>
      <span class="hidden sm:inline text-xs text-muted-foreground font-mono-accent tracking-wide border-l border-border pl-3">Sistem Monitoring Perkembangan dan Aktivitas Akademik</span>
    </a>

    <div class="flex items-center gap-5 text-sm">
      {#if user}
        <a href="/dashboard" use:inertia class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Dashboard</a>
      {:else}
        <a href="/login" use:inertia class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Masuk</a>
      {/if}
      <span class="w-px h-4 bg-border"></span>
      <DarkModeToggle />
    </div>
  </nav>

  <!-- First viewport: live attendance ledger -->
  <section class="relative min-h-[100dvh] flex flex-col lg:flex-row pt-16">
    <!-- Left: headline on deep green panel -->
    <div class="relative lg:flex-1 lg:flex lg:flex-col lg:justify-center bg-accent text-accent-foreground px-6 sm:px-10 lg:px-16 py-12 lg:py-16 overflow-hidden">
      <div class="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:28px_28px]"></div>

      <div class="relative z-10 max-w-xl mx-auto lg:mx-0">
        <p in:fade={{ duration: 600 }} class="font-mono-accent text-[11px] uppercase tracking-[0.25em] text-accent-foreground/50 mb-6">
          {serial} · Verifikasi Kehadiran Real-Time
        </p>

        <h1
          in:fly={{ y: 24, duration: 900, delay: 100 }}
          class="font-heading text-[clamp(2.25rem,6vw,4rem)] font-semibold tracking-[-0.03em] leading-[1.0] text-accent-foreground"
        >
          Bukan klaim.<br />
          Bukan absen manual.<br />
          <span class="italic font-medium text-primary">Bukti.</span>
        </h1>

        <p in:fly={{ y: 20, duration: 900, delay: 280 }} class="mt-7 text-base sm:text-lg text-accent-foreground/75 leading-relaxed max-w-[48ch]">
          SIMPATIK memverifikasi kehadiran guru dengan geolokasi sebelum jam mulai mengajar. Setiap jurnal terikat ke guru nyata, di tempat nyata.
        </p>

        <div in:fly={{ y: 16, duration: 900, delay: 440 }} class="mt-9 flex flex-col gap-3">
          {#if user}
            <a
              href="/dashboard"
              use:inertia
              class="inline-flex items-center gap-2 bg-primary text-primary-foreground font-heading text-sm font-medium px-6 h-11 rounded-md hover:bg-primary/90 transition-colors cursor-pointer w-fit"
            >
              Buka dashboard
              <span aria-hidden="true">&rarr;</span>
            </a>
          {:else}
            <a
              href="/login"
              use:inertia
              class="inline-flex items-center gap-2 bg-primary text-primary-foreground font-heading text-sm font-medium px-6 h-11 rounded-md hover:bg-primary/90 transition-colors cursor-pointer w-fit"
            >
              Masuk
              <span aria-hidden="true">&rarr;</span>
            </a>
            <p class="text-sm text-accent-foreground/55">Untuk mendapatkan akses, hubungi admin sekolah Anda.</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Right: live attendance grid -->
    <div class="lg:flex-1 flex flex-col bg-background px-6 sm:px-10 lg:px-12 py-12 lg:py-16">
      <!-- Class header -->
      <div in:fade={{ duration: 500 }} class="flex items-center justify-between mb-6">
        <div>
          <p class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Kelas 10A · Matematika</p>
          <p class="font-heading text-lg font-semibold text-foreground">{today}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-primary">Live</span>
        </div>
      </div>

      <!-- Attendance grid -->
      <div class="flex-1 border border-border rounded-lg overflow-hidden bg-card">
        <!-- Grid header -->
        <div class="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] gap-4 px-4 sm:px-5 py-3 bg-secondary/60 border-b border-border">
          <span class="hidden sm:block font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground w-16">NIS</span>
          <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Nama Siswa</span>
          <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right w-20">Status</span>
          <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right w-8 hidden sm:block">·</span>
        </div>

        <!-- Grid rows -->
        <div class="divide-y divide-border">
          {#each students as student, i}
            {#if i < revealedCount}
              <div
                in:fly={{ x: 20, duration: 300, easing: cubicOut }}
                class="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] gap-4 px-4 sm:px-5 py-3 items-center hover:bg-secondary/30 transition-colors {statusConfig[student.status].bg}"
              >
                <span class="hidden sm:block font-mono-accent text-xs text-muted-foreground w-16">{student.nis}</span>
                <span class="text-sm font-medium text-foreground truncate">{student.name}</span>
                <span class="flex items-center gap-2 justify-end w-20">
                  <span class="w-2 h-2 rounded-full {statusConfig[student.status].dot} shrink-0"></span>
                  <span class="text-xs font-medium {statusConfig[student.status].text} hidden sm:inline">{statusConfig[student.status].label}</span>
                </span>
                <span class="hidden sm:flex items-center justify-end w-8">
                  {#if student.status === 'hadir'}
                    <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {:else if student.status === 'terlambat'}
                    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {:else}
                    <svg class="w-4 h-4 text-destructive" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  {/if}
                </span>
              </div>
            {:else}
              <div class="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] gap-4 px-4 sm:px-5 py-3 items-center">
                <span class="hidden sm:block w-16 h-3 bg-muted rounded-sm"></span>
                <span class="h-3 bg-muted rounded-sm w-40 max-w-full"></span>
                <span class="w-2 h-2 rounded-full bg-muted justify-self-end"></span>
                <span class="hidden sm:block w-4 h-4"></span>
              </div>
            {/if}
          {/each}
        </div>

        <!-- Stats bar -->
        <div class="grid grid-cols-3 border-t border-border">
          <div class="px-4 py-5 h-full flex flex-col items-center justify-center border-r border-border">
            <p class="font-heading text-xl font-bold text-primary">{stats.hadir}</p>
            <p class="font-mono-accent text-[9px] uppercase tracking-[0.15em] text-muted-foreground mt-1">Hadir</p>
          </div>
          <div class="px-4 py-5 h-full flex flex-col items-center justify-center border-r border-border">
            <p class="font-heading text-xl font-bold text-amber-600">{stats.terlambat}</p>
            <p class="font-mono-accent text-[9px] uppercase tracking-[0.15em] text-muted-foreground mt-1">Terlambat</p>
          </div>
          <div class="px-4 py-5 h-full flex flex-col items-center justify-center">
            <p class="font-heading text-xl font-bold text-destructive">{stats.absen}</p>
            <p class="font-mono-accent text-[9px] uppercase tracking-[0.15em] text-muted-foreground mt-1">Absen</p>
          </div>
        </div>
      </div>

      <p class="mt-4 text-xs text-muted-foreground text-center lg:text-left">Data ilustratif. Daftar hadir terisi otomatis setelah guru terverifikasi.</p>
    </div>
  </section>

  <!-- Mechanism: verification log -->
  <section class="py-24 sm:py-32 px-6 sm:px-10 bg-secondary/30">
    <div class="max-w-3xl mx-auto">
      <div class="mb-12 max-w-[60ch]">
        <h2 class="font-heading text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] leading-[1.1] text-foreground mb-3">
          Empat langkah, satu bukti.
        </h2>
        <p class="text-muted-foreground leading-relaxed">
          Setiap konfirmasi guru melewati proses ini sebelum jurnal bisa dibuat. Tidak ada langkah yang bisa dilewati.
        </p>
      </div>

      <!-- Verification log -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <!-- Log header -->
        <div class="flex items-center justify-between px-5 py-3 bg-secondary/60 border-b border-border">
          <span class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Log Verifikasi</span>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-primary">Selesai</span>
          </div>
        </div>

        <!-- Log entries -->
        <div class="relative">
          {#each [
            { time: '07:15:02', label: 'Geolokasi', desc: 'Browser mengirim koordinat GPS guru. Akurasi meteran, bukan kota.', data: 'lat -6.2088° · lon 106.8456°', status: 'done' },
            { time: '07:15:03', label: 'Cek Jarak Haversine', desc: 'Sistem menghitung jarak guru ke lokasi sekolah aktif. Rumus Haversine, bukan estimasi.', data: '47,3 m dari Main Campus', status: 'done' },
            { time: '07:15:03', label: 'Verifikasi Radius', desc: 'Jika di dalam radius: Terverifikasi. Jika di luar: ditandai, dilaporkan ke kepala sekolah.', data: '200 m radius · TERVERIFIKASI', status: 'verified' },
            { time: '07:15:04', label: 'Daftar Hadir Live', desc: 'Setelah guru terverifikasi, daftar hadir siswa aktif. Setiap absensi terikat ke jurnal terverifikasi.', data: '5 hadir · 1 terlambat · 1 absen', status: 'verified' },
          ] as step, i}
            <div class="relative flex gap-4 px-5 py-5 {i < 3 ? 'border-b border-border' : ''}">
              <!-- Timeline column -->
              <div class="flex flex-col items-center shrink-0">
                <!-- Status dot -->
                <span class="w-3 h-3 rounded-full {step.status === 'verified' ? 'bg-primary' : 'bg-muted-foreground/40'} ring-4 ring-card"></span>
                <!-- Connector line -->
                {#if i < 3}
                  <span class="w-px flex-1 {step.status === 'verified' ? 'bg-primary/30' : 'bg-border'} mt-1"></span>
                {/if}
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0 pb-1">
                <div class="flex items-baseline justify-between gap-3 mb-1">
                  <h3 class="font-heading text-base font-semibold text-foreground">{step.label}</h3>
                  <span class="font-mono-accent text-[10px] text-muted-foreground shrink-0">{step.time}</span>
                </div>
                <p class="text-sm text-muted-foreground leading-relaxed mb-2">{step.desc}</p>
                <div class="flex items-center gap-2">
                  <span class="font-mono-accent text-[11px] text-foreground/70">{step.data}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Log footer -->
        <div class="px-5 py-3 border-t border-border bg-secondary/30 flex items-center justify-between">
          <span class="font-mono-accent text-[10px] text-muted-foreground">Budi Santoso, S.Pd. · Matematika 10A</span>
          <span class="font-mono-accent text-[10px] text-primary font-medium">TERVERIFIKASI</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Three audiences: role-based views -->
  <section class="py-24 sm:py-32 px-6 sm:px-10 border-t border-border">
    <div class="max-w-5xl mx-auto">
      <div class="mb-12 max-w-[60ch]">
        <h2 class="font-heading text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] leading-[1.1] text-foreground mb-3">
          Data yang sama, tiga cara lihat.
        </h2>
        <p class="text-muted-foreground leading-relaxed">
          Guru, admin, dan orang tua — masing-masing melihat SIMPATIK dari sudut yang berbeda. Data verifikasi yang sama, tampilan yang berbeda.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Guru: jurnal view -->
        <article class="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <header class="px-5 py-3 border-b border-border flex items-center justify-between bg-secondary/40">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary"></span>
              <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Guru</span>
            </div>
            <span class="font-mono-accent text-[10px] text-muted-foreground">Jurnal</span>
          </header>
          <div class="px-5 py-5 flex-1 flex flex-col">
            <div class="flex items-baseline justify-between mb-4">
              <h3 class="font-heading text-base font-semibold text-foreground">Jurnal Mengajar</h3>
              <span class="font-mono-accent text-[10px] text-muted-foreground">{today}</span>
            </div>
            <div class="space-y-2.5 mb-4">
              <div class="flex justify-between text-sm border-b border-border/60 pb-2">
                <span class="text-muted-foreground">Kelas</span>
                <span class="text-foreground font-medium">10A</span>
              </div>
              <div class="flex justify-between text-sm border-b border-border/60 pb-2">
                <span class="text-muted-foreground">Mapel</span>
                <span class="text-foreground font-medium">Matematika</span>
              </div>
              <div class="flex justify-between text-sm border-b border-border/60 pb-2">
                <span class="text-muted-foreground">Hadir</span>
                <span class="text-primary font-medium">5/6</span>
              </div>
            </div>
            <div class="mt-auto pt-4 border-t border-border/60">
              <span class="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Materi</span>
              <p class="mt-1 text-sm text-foreground leading-relaxed">SPLTV — eliminasi & substitusi.</p>
            </div>
          </div>
          <footer class="px-5 py-3 border-t border-border bg-primary/5 flex items-center justify-between">
            <span class="font-mono-accent text-[10px] text-muted-foreground">Status</span>
            <span class="font-heading text-xs font-semibold text-primary">Terverifikasi</span>
          </footer>
        </article>

        <!-- Admin: oversight view -->
        <article class="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <header class="px-5 py-3 border-b border-border flex items-center justify-between bg-secondary/40">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-destructive"></span>
              <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Admin</span>
            </div>
            <span class="font-mono-accent text-[10px] text-muted-foreground">Pengawasan</span>
          </header>
          <div class="px-5 py-5 flex-1 flex flex-col">
            <div class="flex items-baseline justify-between mb-4">
              <h3 class="font-heading text-base font-semibold text-foreground">Di Luar Radius</h3>
              <span class="font-mono-accent text-[10px] text-muted-foreground">Minggu ini</span>
            </div>
            <div class="space-y-2 flex-1">
              {#each [
                { guru: 'Siti Rahmawati', jarak: '340 m' },
                { guru: 'Ahmad Fauzi', jarak: '1,2 km' },
              ] as row}
                <div class="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
                  <div class="flex flex-col min-w-0">
                    <span class="text-sm font-medium text-foreground truncate">{row.guru}</span>
                    <span class="font-mono-accent text-[10px] text-muted-foreground">{row.jarak}</span>
                  </div>
                  <span class="text-xs text-destructive font-medium shrink-0">Di luar</span>
                </div>
              {/each}
            </div>
          </div>
          <footer class="px-5 py-3 border-t border-border bg-destructive/5 flex items-center justify-between">
            <span class="font-mono-accent text-[10px] text-muted-foreground">Total</span>
            <span class="font-heading text-xs font-semibold text-destructive">2 alert</span>
          </footer>
        </article>

        <!-- Parent: rapor view -->
        <article class="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <header class="px-5 py-3 border-b border-border flex items-center justify-between bg-secondary/40">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary"></span>
              <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Orang Tua</span>
            </div>
            <span class="font-mono-accent text-[10px] text-muted-foreground">Rapor</span>
          </header>
          <div class="px-5 py-5 flex-1 flex flex-col">
            <div class="flex items-baseline justify-between mb-4">
              <h3 class="font-heading text-base font-semibold text-foreground">Rapor Anak</h3>
              <span class="font-mono-accent text-[10px] text-muted-foreground">Ganjil</span>
            </div>
            <div class="space-y-2.5 flex-1">
              {#each [
                { mapel: 'Matematika', hadir: '28/30', nilai: '85' },
                { mapel: 'Biologi', hadir: '29/30', nilai: '90' },
                { mapel: 'B. Inggris', hadir: '30/30', nilai: '88' },
              ] as row}
                <div class="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
                  <span class="text-sm font-medium text-foreground">{row.mapel}</span>
                  <div class="flex items-center gap-3 shrink-0">
                    <span class="font-mono-accent text-[10px] text-muted-foreground">{row.hadir}</span>
                    <span class="font-heading text-sm font-semibold text-primary w-6 text-right">{row.nilai}</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          <footer class="px-5 py-3 border-t border-border bg-primary/5 flex items-center justify-between">
            <span class="font-mono-accent text-[10px] text-muted-foreground">Rata-rata</span>
            <span class="font-heading text-xs font-semibold text-primary">87,7</span>
          </footer>
        </article>
      </div>

      <p class="mt-6 text-xs text-muted-foreground text-center">Data ilustratif. Setiap peran melihat data yang relevan dengan tugasnya, dari verifikasi yang sama.</p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-border">
    <div class="max-w-4xl mx-auto px-6 sm:px-10 py-12">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center justify-center w-7 h-7 bg-primary rounded-md">
            <span class="w-2.5 h-2.5 bg-primary-foreground rounded-[2px]"></span>
          </span>
          <div class="flex flex-col">
            <span class="font-heading font-semibold tracking-tight">SIMPATIK</span>
            <span class="text-xs text-muted-foreground">Sistem Monitoring Perkembangan dan Aktivitas Akademik</span>
          </div>
        </div>
        <div class="flex flex-col sm:items-end gap-1">
          <p class="text-sm text-muted-foreground">Untuk mendapatkan akses, hubungi admin sekolah Anda.</p>
          <p class="font-mono-accent text-[10px] text-muted-foreground">&copy; {new Date().getFullYear()} SIMPATIK · MIT License</p>
          <p class="font-mono-accent text-[10px] text-muted-foreground">Built with <a href="https://github.com/MasRama/nara" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 transition-colors">Nara</a></p>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }
  }
</style>
