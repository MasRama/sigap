<script lang="ts">
  import { inertia } from '@inertiajs/svelte';
  import Header from '../../Components/Header.svelte';
  import BentoCard from '../../Components/BentoCard.svelte';
  import type { Student } from '../../types';
  import { ArrowRight } from '@lucide/svelte';

  let { children = [] }: { children?: (Student & { grades?: { score: number }[]; attendance?: { status: string }[] })[] } = $props();
</script>

<Header group="parent" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <h1 class="font-heading font-semibold tracking-tight text-2xl mb-8">My Children</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each children as child}
      <BentoCard title={child.name} description="NIS {child.nis}">
        <div class="mt-4 space-y-2 text-sm">
          <p class="text-muted-foreground">Grades: {child.grades?.length ?? 0}</p>
          <p class="text-muted-foreground">Attendance records: {child.attendance?.length ?? 0}</p>
        </div>
        <div class="mt-4 flex gap-2">
          <a href="/parent/child/{child.id}/attendance" use:inertia class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"><ArrowRight class="w-4 h-4" /> Attendance</a>
          <a href="/parent/child/{child.id}/grades" use:inertia class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"><ArrowRight class="w-4 h-4" /> Grades</a>
        </div>
      </BentoCard>
    {/each}
  </div>
</div>
