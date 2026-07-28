<script lang="ts">
  import { fly } from 'svelte/transition';
  import { page as inertiaPage, inertia } from '@inertiajs/svelte';
  import Header from '../Components/Header.svelte';
  import StatCard from '../Components/StatCard.svelte';
  import BentoCard from '../Components/BentoCard.svelte';
  import { Users, GraduationCap, BookOpen, MapPin, ArrowRight, ArrowUpRight } from '@lucide/svelte';
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
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  function hasPermission(slug: string): boolean {
    if (!currentUser) return false;
    if (currentUser.roles?.includes('admin')) return true;
    return currentUser.permissions?.includes(slug) ?? false;
  }
</script>

<Header group="dashboard" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary">
  <section class="px-6 sm:px-10 lg:px-16 pt-28 pb-16">
    <div in:fly={{ y: 20, duration: 800 }}>
      <p class="font-heading text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">{greeting}</p>
      <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2.5rem,6vw,4.5rem)] text-foreground">
        {currentUser?.name?.split(' ')[0] || 'there'}.
      </h1>
      <p class="mt-5 text-lg text-muted-foreground leading-relaxed max-w-[52ch]">
        {#if activeYear}
          Academic year {activeYear.name}. Choose a quick action below.
        {:else}
          Welcome. Set up the active academic year and location to begin.
        {/if}
      </p>
    </div>
  </section>

  <section class="px-6 sm:px-10 lg:px-16 pb-16">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" in:fly={{ y: 20, duration: 800, delay: 150 }}>
      <StatCard label="Students" value={stats?.totalStudents ?? 0} />
      <StatCard label="Teachers" value={stats?.totalTeachers ?? 0} />
      <StatCard label="Classes" value={stats?.totalClasses ?? 0} />
      <StatCard label="Subjects" value={stats?.totalSubjects ?? 0} />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 auto-rows-[minmax(180px,auto)]">
      {#if hasPermission('students.view')}
        <BentoCard title="Students" description="View and manage student records." class="lg:col-span-1">
          <a href="/students" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Manage students <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('teachers.view')}
        <BentoCard title="Teachers" description="Assign subjects and view confirmations." class="lg:col-span-1">
          <a href="/teachers" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Manage teachers <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('schedules.view')}
        <BentoCard title="Today's schedule" description="See what classes are happening now." class="lg:col-span-1">
          <a href="/teacher/schedule" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            View schedule <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('journals.view')}
        <BentoCard title="Journals" description="Digital records of every session." class="lg:col-span-1">
          <a href="/journals" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Open journals <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('grades.view')}
        <BentoCard title="Grades" description="Record and review academic scores." class="lg:col-span-1">
          <a href="/grades" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Manage grades <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}

      {#if hasPermission('school_locations.view')}
        <BentoCard title="School location" description="Set the active location for verification." class="lg:col-span-1">
          <a href="/school-locations" use:inertia class="mt-auto inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
            Manage locations <ArrowRight class="w-4 h-4" />
          </a>
        </BentoCard>
      {/if}
    </div>
  </section>
</div>
