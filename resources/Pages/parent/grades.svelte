<script lang="ts">
  import Sidebar from '../../Components/Sidebar.svelte';
  import DataTable from '../../Components/DataTable.svelte';
  import { fly } from 'svelte/transition';
  import type { Grade } from '../../types';

  let { grades = [] }: { grades?: Grade[] } = $props();

  const columns = [
    { key: 'subject_id', label: 'Mapel' },
    { key: 'type', label: 'Jenis' },
    { key: 'score', label: 'Nilai', align: 'right' as const },
  ];
</script>

<Sidebar group="parent" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary pt-20 lg:pt-8 lg:pl-64 px-6 sm:px-10 lg:px-16 pb-16">
  <div in:fly={{ y: 20, duration: 700 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Rapor Anak</p>
    <h1 class="font-heading font-semibold tracking-[-0.02em] text-2xl text-foreground mb-8">Nilai Anak</h1>
  </div>

  <div in:fly={{ y: 20, duration: 700, delay: 100 }}>
    <DataTable {columns} rows={grades} emptyMessage="Belum ada nilai." />
  </div>
</div>
