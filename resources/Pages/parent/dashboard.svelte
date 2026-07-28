<script lang="ts">
  import { inertia } from '@inertiajs/svelte';
  import Sidebar from '../../Components/Sidebar.svelte';
  import { fly } from 'svelte/transition';
  import { ArrowRight } from '@lucide/svelte';
  import type { Student } from '../../types';

  let { children = [] }: { children?: (Student & { grades?: { score: number }[]; attendance?: { status: string }[] })[] } = $props();
</script>

<Sidebar group="parent" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div in:fly={{ y: 20, duration: 700 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Orang Tua</p>
    <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground mb-8">Anak Saya</h1>
  </div>

  {#if children.length === 0}
    <div class="bg-card border border-border rounded-lg px-6 py-12 text-center">
      <p class="text-sm text-muted-foreground">Belum ada data anak terdaftar.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" in:fly={{ y: 20, duration: 700, delay: 100 }}>
      {#each children as child}
        <article class="bg-card border border-border rounded-lg overflow-hidden">
          <header class="px-5 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
            <span class="font-heading text-sm font-semibold text-foreground truncate">{child.name}</span>
            <span class="font-mono-accent text-[10px] text-muted-foreground shrink-0">NIS {child.nis}</span>
          </header>
          <div class="px-5 py-4">
            <div class="flex flex-col gap-2.5 text-sm">
              <div class="flex justify-between border-b border-border/60 pb-2">
                <span class="text-muted-foreground">Nilai</span>
                <span class="text-foreground font-medium">{child.grades?.length ?? 0}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Kehadiran</span>
                <span class="text-foreground font-medium">{child.attendance?.length ?? 0}</span>
              </div>
            </div>
          </div>
          <footer class="px-5 py-3 border-t border-border bg-secondary/30 flex gap-4">
            <a href="/parent/child/{child.id}/attendance" use:inertia class="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              Kehadiran <ArrowRight class="w-3.5 h-3.5" />
            </a>
            <a href="/parent/child/{child.id}/grades" use:inertia class="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              Nilai <ArrowRight class="w-3.5 h-3.5" />
            </a>
          </footer>
        </article>
      {/each}
    </div>
  {/if}
</div>
