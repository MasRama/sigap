<script lang="ts">
  import { fly } from 'svelte/transition';
  import { page as inertiaPage, inertia } from '@inertiajs/svelte';
  import Sidebar from '../Components/Sidebar.svelte';
  import StatCard from '../Components/StatCard.svelte';
  import BentoCard from '../Components/BentoCard.svelte';
  import { ArrowRight } from '@lucide/svelte';
  import type { User, DashboardStats } from '../types';

  interface Props {
    stats?: DashboardStats;
    years?: { id: string; name: string }[];
    activeYear?: { id: string; name: string } | null;
    classes?: { id: string; name: string }[];
    subjects?: { id: string; name: string }[];
  }

  let {
    stats,
    years = [],
    activeYear,
    classes = [],
    subjects = [],
  }: Props = $props();

  const currentUser = $derived(inertiaPage.props.user as User | undefined);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 18 ? 'Selamat sore' : 'Selamat malam';

  function hasPermission(slug: string): boolean {
    if (!currentUser) return false;
    if (currentUser.roles?.includes('admin')) return true;
    return currentUser.permissions?.includes(slug) ?? false;
  }
</script>

<Sidebar group="dashboard" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary lg:pl-64">
  <section class="px-6 sm:px-10 lg:px-8 pt-20 lg:pt-8 pb-12">
    <div in:fly={{ y: 20, duration: 800 }}>
      <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">{greeting}</p>
      <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground">
        {currentUser?.name?.split(' ')[0] || 'Pengguna'}.
      </h1>
      <p class="mt-4 text-base text-muted-foreground leading-relaxed max-w-[52ch]">
        {#if activeYear}
          Tahun ajaran {activeYear.name}. Pilih aksi cepat di bawah.
        {:else}
          Selamat datang. Atur tahun ajaran aktif dan lokasi sekolah untuk memulai.
        {/if}
      </p>
    </div>
  </section>

  <section class="px-6 sm:px-10 lg:px-8 pb-16">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" in:fly={{ y: 20, duration: 800, delay: 150 }}>
      <StatCard label="Siswa" value={stats?.totalStudents ?? 0} />
      <StatCard label="Guru" value={stats?.totalTeachers ?? 0} />
      <StatCard label="Kelas" value={stats?.totalClasses ?? 0} />
      <StatCard label="Mapel" value={stats?.totalSubjects ?? 0} />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 auto-rows-[minmax(160px,auto)]">
      {#if hasPermission('classes.view') && hasPermission('students.view')}
        <BentoCard title="Kelas & Siswa" description="Kelola kelas lalu buka daftar siswa per kelas.">
          <a href="/classes" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Kelola kelas & siswa <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('teachers.view')}
        <BentoCard title="Guru" description="Tugaskan mapel dan lihat konfirmasi.">
          <a href="/teachers" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Kelola guru <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}
      {#if currentUser?.roles?.includes('admin')}
        <BentoCard title="Penugasan Guru" description="Atur kelas yang diampu dan wali kelas.">
          <a href="/teacher-assignments" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Atur penugasan <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('schedules.view')}
        <BentoCard title="Jadwal Hari Ini" description="Lihat kelas yang sedang berlangsung.">
          <a href="/teacher/schedule" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Lihat jadwal <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('journals.view')}
        <BentoCard title="Jurnal" description="Catatan digital setiap sesi mengajar.">
          <a href="/journals" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Buka jurnal <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('grades.view')}
        <BentoCard title="Nilai" description="Catat dan tinjau nilai siswa.">
          <a href="/grades" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Kelola nilai <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('school_locations.view')}
        <BentoCard title="Lokasi Sekolah" description="Atur lokasi aktif untuk verifikasi.">
          <a href="/school-locations" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Kelola lokasi <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}
    </div>
  </section>
</div>
