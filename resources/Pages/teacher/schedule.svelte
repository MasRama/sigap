<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte';
  import axios from 'axios';
  import { api } from '$lib/api';
  import Header from '../../Components/Header.svelte';
  import Button from '../../Components/Button.svelte';
  import Badge from '../../Components/Badge.svelte';
  import type { Schedule } from '../../types';

  let { schedules = [] }: { schedules?: (Schedule & { confirmed?: boolean })[] } = $props();

  function nowInRange(start: number, end: number): boolean {
    const now = Date.now();
    return now >= start && now <= end;
  }
</script>

<Header group="teacher" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <h1 class="font-heading font-semibold tracking-tight text-2xl mb-8">Today's Schedule</h1>

  <div class="grid gap-4">
    {#if schedules.length === 0}
      <p class="text-sm text-muted-foreground">No schedules today.</p>
    {/if}
    {#each schedules as schedule}
      <div class="rounded-sm border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p class="font-heading font-medium text-foreground">{schedule.class_id} · {schedule.subject_id}</p>
          <p class="text-xs text-muted-foreground mt-1">{new Date(schedule.start_time).toLocaleTimeString()} – {new Date(schedule.end_time).toLocaleTimeString()}</p>
        </div>
        <div class="flex items-center gap-3">
          {#if schedule.confirmed}
            <Badge variant="secondary">Confirmed</Badge>
          {:else if nowInRange(schedule.start_time, schedule.end_time)}
            <a href="/teacher/confirm?schedule_id={schedule.id}" use:inertia>
              <Button>Confirm</Button>
            </a>
          {:else}
            <Badge variant="outline">Upcoming</Badge>
          {/if}
          <a href="/journals?schedule_id={schedule.id}" use:inertia>
            <Button variant="outline">Journal</Button>
          </a>
        </div>
      </div>
    {/each}
  </div>
</div>
