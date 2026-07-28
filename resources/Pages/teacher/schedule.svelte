<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte';
  import axios from 'axios';
  import { api } from '$lib/api';
  import Sidebar from '../../Components/Sidebar.svelte';
  import Button from '../../Components/Button.svelte';
  import { fly } from 'svelte/transition';
  import type { Schedule } from '../../types';

  let { schedules = [] }: { schedules?: (Schedule & { confirmed?: boolean })[] } = $props();

  function nowInRange(start: number, end: number): boolean {
    const now = Date.now();
    return now >= start && now <= end;
  }

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
</script>

<Sidebar group="teacher" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div in:fly={{ y: 20, duration: 700 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Jadwal Hari Ini</p>
    <h1 class="font-heading font-semibold tracking-[-0.02em] text-2xl text-foreground mb-8">Jadwal Mengajar</h1>
  </div>

  {#if schedules.length === 0}
    <div class="bg-card border border-border rounded-lg px-6 py-12 text-center">
      <p class="text-sm text-muted-foreground">Tidak ada jadwal hari ini.</p>
    </div>
  {:else}
    <div class="bg-card border border-border rounded-lg overflow-hidden" in:fly={{ y: 20, duration: 700, delay: 100 }}>
      <div class="px-5 py-3 bg-secondary/60 border-b border-border flex items-center justify-between">
        <span class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Kelas · Mapel</span>
        <span class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Status</span>
      </div>

      <div class="divide-y divide-border">
        {#each schedules as schedule}
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
            <div class="flex items-center gap-4">
              <span class="w-2 h-2 rounded-full shrink-0 {schedule.confirmed ? 'bg-primary' : nowInRange(schedule.start_time, schedule.end_time) ? 'bg-amber-500' : 'bg-muted-foreground/30'}"></span>
              <div>
                <p class="font-heading font-medium text-foreground">{schedule.class_id} · {schedule.subject_id}</p>
                <p class="font-mono-accent text-xs text-muted-foreground mt-0.5">{formatTime(schedule.start_time)} – {formatTime(schedule.end_time)}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              {#if schedule.confirmed}
                <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-primary font-medium">Terverifikasi</span>
              {:else if nowInRange(schedule.start_time, schedule.end_time)}
                <a href="/teacher/confirm?schedule_id={schedule.id}" use:inertia>
                  <Button size="sm">Konfirmasi</Button>
                </a>
              {:else}
                <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Akan datang</span>
              {/if}
              <a href="/journals?schedule_id={schedule.id}" use:inertia>
                <Button variant="outline" size="sm">Jurnal</Button>
              </a>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
