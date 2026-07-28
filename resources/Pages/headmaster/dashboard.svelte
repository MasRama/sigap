<script lang="ts">
  import Header from '../../Components/Header.svelte';
  import StatCard from '../../Components/StatCard.svelte';
  import BentoCard from '../../Components/BentoCard.svelte';
  import { inertia } from '@inertiajs/svelte';
  import { ArrowRight } from '@lucide/svelte';
  import type { DashboardStats } from '../../types';

  let { stats }: { stats?: DashboardStats } = $props();
</script>

<Header group="headmaster" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <h1 class="font-heading font-semibold tracking-tight text-2xl mb-8">Headmaster Dashboard</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
    <StatCard label="Students" value={stats?.totalStudents ?? 0} />
    <StatCard label="Teachers" value={stats?.totalTeachers ?? 0} />
    <StatCard label="Classes" value={stats?.totalClasses ?? 0} />
    <StatCard label="Subjects" value={stats?.totalSubjects ?? 0} />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <BentoCard title="Outside confirmations" description="Teachers who confirmed outside the school radius.">
      <a href="/headmaster/reports" use:inertia class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-4"><ArrowRight class="w-4 h-4" /> View reports</a>
    </BentoCard>
    <BentoCard title="Class reports" description="Compare grades and attendance by class and subject.">
      <a href="/reports/class-subject" use:inertia class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-4"><ArrowRight class="w-4 h-4" /> Open reports</a>
    </BentoCard>
  </div>
</div>
