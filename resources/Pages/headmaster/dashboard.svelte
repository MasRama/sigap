<script lang="ts">
  import Sidebar from '../../Components/Sidebar.svelte';
  import StatCard from '../../Components/StatCard.svelte';
  import BentoCard from '../../Components/BentoCard.svelte';
  import { inertia } from '@inertiajs/svelte';
  import { fly } from 'svelte/transition';
  import { ArrowRight } from '@lucide/svelte';
  import type { DashboardStats } from '../../types';

  let { stats }: { stats?: DashboardStats } = $props();
</script>

<Sidebar group="headmaster" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div in:fly={{ y: 20, duration: 700 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Dasbor Kepala Sekolah</p>
    <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground mb-8">Pengawasan Sekolah</h1>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4" in:fly={{ y: 20, duration: 700, delay: 100 }}>
    <StatCard label="Siswa" value={stats?.totalStudents ?? 0} />
    <StatCard label="Guru" value={stats?.totalTeachers ?? 0} />
    <StatCard label="Kelas" value={stats?.totalClasses ?? 0} />
    <StatCard label="Mapel" value={stats?.totalSubjects ?? 0} />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4" in:fly={{ y: 20, duration: 700, delay: 200 }}>
    <BentoCard title="Konfirmasi di Luar Radius" description="Guru yang konfirmasi di luar radius sekolah.">
      <a href="/headmaster/reports" use:inertia class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-auto">
        <ArrowRight class="w-4 h-4" /> Lihat laporan
      </a>
    </BentoCard>
    <BentoCard title="Laporan Kelas" description="Bandingkan nilai dan kehadiran per kelas dan mapel.">
      <a href="/reports/class-subject" use:inertia class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-auto">
        <ArrowRight class="w-4 h-4" /> Buka laporan
      </a>
    </BentoCard>
  </div>
</div>
