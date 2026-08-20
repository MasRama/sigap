<script lang="ts">
  import Sidebar from '../../Components/Sidebar.svelte';
  import { fly } from 'svelte/transition';
  import { Lock } from '@lucide/svelte';
  import type { SubjectGradeSummary } from '../../types';

  let { studentName = '', gradesPublished = false, summaries = [] }: { studentName?: string; gradesPublished?: boolean; summaries?: SubjectGradeSummary[] } = $props();

  function typeLabel(type: string): string {
    switch (type) {
      case 'task': return 'Tugas';
      case 'daily_quiz': return 'Kuis Harian';
      case 'midterm': return 'UTS';
      case 'final': return 'UAS';
      default: return type;
    }
  }
</script>

<Sidebar group="parent" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary pt-20 lg:pt-8 lg:pl-72 px-6 sm:px-10 lg:pr-8 pb-16">
  <div in:fly={{ y: 20, duration: 700 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Rapor Anak</p>
    <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground mb-8">{studentName ? `Nilai ${studentName}` : 'Nilai Anak'}</h1>
  </div>

  {#if !gradesPublished}
    <div class="bg-card border border-border rounded-lg px-6 py-12 text-center" in:fly={{ y: 20, duration: 700, delay: 100 }}>
      <Lock class="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
      <p class="text-sm text-muted-foreground">Nilai belum dipublikasikan oleh sekolah. Silakan cek kembali nanti.</p>
    </div>
  {:else if summaries.length === 0}
    <div class="bg-card border border-border rounded-lg px-6 py-12 text-center" in:fly={{ y: 20, duration: 700, delay: 100 }}>
      <p class="text-sm text-muted-foreground">Belum ada nilai.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" in:fly={{ y: 20, duration: 700, delay: 100 }}>
      {#each summaries as summary}
        <article class="bg-card border border-border rounded-lg overflow-hidden">
          <header class="px-5 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
            <span class="font-heading text-sm font-semibold text-foreground truncate">{summary.subject_name}</span>
            <span class="font-mono-accent text-[10px] text-muted-foreground shrink-0">KKM {summary.kkm}</span>
          </header>
          <div class="px-5 py-4">
            <div class="flex flex-col gap-2 text-sm">
              {#each Object.entries(summary.scores) as [type, score]}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{typeLabel(type)}</span>
                  <span class="text-foreground font-medium">{score ?? '—'}</span>
                </div>
              {/each}
              <div class="flex justify-between border-t border-border/60 pt-2 mt-1">
                <span class="text-muted-foreground font-medium">Nilai Akhir</span>
                <span class="text-foreground font-semibold">{summary.final_score ?? '—'}</span>
              </div>
            </div>
          </div>
          <footer class="px-5 py-3 border-t border-border bg-secondary/30 flex items-center justify-between">
            <span class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Predikat {summary.predikat ?? '—'}</span>
            {#if summary.is_passed === null}
              <span class="text-xs text-muted-foreground">Belum lengkap</span>
            {:else if summary.is_passed}
              <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Tuntas</span>
            {:else}
              <span class="text-xs font-medium text-destructive">Belum Tuntas</span>
            {/if}
          </footer>
        </article>
      {/each}
    </div>
  {/if}
</div>

