<script lang="ts">
  import axios from 'axios';
  import { api } from '$lib/api';
  import Sidebar from '../../Components/Sidebar.svelte';
  import StatCard from '../../Components/StatCard.svelte';
  import DataTable from '../../Components/DataTable.svelte';
  import { inertia } from '@inertiajs/svelte';
  import { fly } from 'svelte/transition';
  import { ArrowRight } from '@lucide/svelte';
  import type { DashboardStats, SessionStatusView, JournalCompletenessView, GradeProgressView, AnnouncementView } from '../../types';

  interface DashboardData {
    stats: DashboardStats;
    today: SessionStatusView[];
    confirmedToday: number;
    missed: SessionStatusView[];
    journals: JournalCompletenessView[];
    progress: GradeProgressView[];
  }

  let { canView = false }: { canView?: boolean } = $props();

  let data = $state<DashboardData | null>(null);
  let announcements = $state<AnnouncementView[]>([]);

  $effect(() => {
    api(() => axios.get('/headmaster/dashboard/data'), { showSuccessToast: false }).then(result => {
      if (result.success && result.data) data = result.data as DashboardData;
    });
    api(() => axios.get('/announcements/latest'), { showSuccessToast: false }).then(result => {
      if (result.success && result.data) announcements = result.data as AnnouncementView[];
    });
  });

  const missedRows = $derived((data?.missed ?? []).map(s => ({
    id: s.schedule_id + s.start_time,
    guru: s.teacher_name,
    kelas: s.class_name,
    mapel: s.subject_name,
    waktu: new Date(s.start_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    status: 'Tidak Konfirmasi',
  })));

  const progressRows = $derived((data?.progress ?? []).map(p => ({
    id: p.class_name + p.subject_name,
    kelas: p.class_name,
    mapel: p.subject_name,
    guru: p.teacher_name || '—',
    dinilai: `${p.graded_students}/${p.total_students}`,
    progres: p.total_students > 0 ? `${Math.round((p.graded_students / p.total_students) * 100)}%` : '0%',
  })));

  const journalRows = $derived((data?.journals ?? []).map(j => ({
    id: j.teacher_name,
    guru: j.teacher_name,
    sesi: j.expected,
    jurnal: j.filled,
    kelengkapan: j.expected > 0 ? `${Math.round((j.filled / j.expected) * 100)}%` : '0%',
  })));

  const missedColumns = [
    { key: 'guru', label: 'Guru' },
    { key: 'kelas', label: 'Kelas' },
    { key: 'mapel', label: 'Mapel' },
    { key: 'waktu', label: 'Waktu' },
    { key: 'status', label: 'Status', align: 'center' as const },
  ];

  const progressColumns = [
    { key: 'kelas', label: 'Kelas' },
    { key: 'mapel', label: 'Mapel' },
    { key: 'guru', label: 'Guru' },
    { key: 'dinilai', label: 'Dinilai', align: 'right' as const },
    { key: 'progres', label: 'Progres', align: 'right' as const },
  ];

  const journalColumns = [
    { key: 'guru', label: 'Guru' },
    { key: 'sesi', label: 'Sesi', align: 'right' as const },
    { key: 'jurnal', label: 'Jurnal', align: 'right' as const },
    { key: 'kelengkapan', label: 'Kelengkapan', align: 'right' as const },
  ];
</script>

<Sidebar group="headmaster" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div in:fly={{ y: 20, duration: 700 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Dasbor Kepala Sekolah</p>
    <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground mb-8">Pengawasan Sekolah</h1>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4" in:fly={{ y: 20, duration: 700, delay: 100 }}>
    <StatCard label="Siswa" value={data?.stats.totalStudents ?? 0} />
    <StatCard label="Guru" value={data?.stats.totalTeachers ?? 0} />
    <StatCard label="Kelas" value={data?.stats.totalClasses ?? 0} />
    <StatCard label="Mapel" value={data?.stats.totalSubjects ?? 0} />
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10" in:fly={{ y: 20, duration: 700, delay: 150 }}>
    <StatCard label="Jadwal Hari Ini" value={data?.today.length ?? 0} />
    <StatCard label="Konfirmasi" value={data?.confirmedToday ?? 0} />
    <StatCard label="Belum Konfirmasi" value={(data?.today.length ?? 0) - (data?.confirmedToday ?? 0)} />
    <StatCard label="Jurnal Hari Ini" value={data?.stats.todayJournals ?? 0} />
  </div>

  <div class="mb-10" in:fly={{ y: 20, duration: 700, delay: 200 }}>
    <div class="flex items-baseline justify-between mb-3">
      <h2 class="font-heading font-semibold tracking-[-0.02em]">Sesi Tanpa Konfirmasi (7 Hari Terakhir)</h2>
      <p class="text-xs text-muted-foreground font-mono-accent">Indikasi guru tidak masuk kelas</p>
    </div>
    <DataTable columns={missedColumns} rows={missedRows} emptyMessage="Semua sesi terkonfirmasi. Tidak ada indikasi guru tidak masuk." />
  </div>

  <div class="mb-10" in:fly={{ y: 20, duration: 700, delay: 250 }}>
    <div class="flex items-baseline justify-between mb-3">
      <h2 class="font-heading font-semibold tracking-[-0.02em]">Progres Pengisian Nilai</h2>
      <p class="text-xs text-muted-foreground font-mono-accent">Siswa dinilai per kelas dan mapel</p>
    </div>
    <DataTable columns={progressColumns} rows={progressRows} emptyMessage="Belum ada kelas dan mapel aktif." />
  </div>

  <div class="mb-10" in:fly={{ y: 20, duration: 700, delay: 300 }}>
    <div class="flex items-baseline justify-between mb-3">
      <h2 class="font-heading font-semibold tracking-[-0.02em]">Kelengkapan Jurnal Bulan Ini</h2>
      <p class="text-xs text-muted-foreground font-mono-accent">Jurnal terisi vs sesi yang seharusnya terjadi</p>
    </div>
    <DataTable columns={journalColumns} rows={journalRows} emptyMessage="Belum ada data jurnal bulan ini." />
  </div>

  <div class="flex flex-wrap gap-4" in:fly={{ y: 20, duration: 700, delay: 350 }}>
    <a href="/headmaster/reports" use:inertia class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
      Laporan konfirmasi luar radius <ArrowRight class="w-4 h-4" />
    </a>
    <a href="/grade-audit" use:inertia class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
      Audit nilai <ArrowRight class="w-4 h-4" />
    </a>
  </div>

  {#if announcements.length > 0}
    <div class="mt-10" in:fly={{ y: 20, duration: 700, delay: 400 }}>
      <h2 class="font-heading font-semibold tracking-[-0.02em] mb-3">Pengumuman</h2>
      <div class="flex flex-col gap-3">
        {#each announcements as announcement (announcement.id)}
          <article class="bg-card border border-border rounded-lg px-5 py-4">
            <div class="flex items-baseline justify-between gap-4">
              <h3 class="font-heading text-sm font-semibold text-foreground">{announcement.title}</h3>
              <span class="text-[10px] text-muted-foreground font-mono-accent shrink-0">{new Date(announcement.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
            </div>
            <p class="text-sm text-muted-foreground mt-1.5 whitespace-pre-line">{announcement.body}</p>
            <p class="text-[10px] text-muted-foreground/70 mt-2">— {announcement.author_name}</p>
          </article>
        {/each}
      </div>
    </div>
  {/if}
</div>
