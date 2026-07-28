<script lang="ts">
  import Sidebar from '../../Components/Sidebar.svelte';
  import DataTable from '../../Components/DataTable.svelte';
  import { fly } from 'svelte/transition';
  import type { StudentAttendance } from '../../types';

  let { records = [] }: { records?: StudentAttendance[] } = $props();

  const columns = [
    { key: 'created_at', label: 'Tanggal' },
    { key: 'status', label: 'Status' },
    { key: 'note', label: 'Catatan' },
  ];
</script>

<Sidebar group="parent" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary pt-20 lg:pt-8 lg:pl-64 px-6 sm:px-10 lg:px-16 pb-16">
  <div in:fly={{ y: 20, duration: 700 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Riwayat Kehadiran</p>
    <h1 class="font-heading font-semibold tracking-[-0.02em] text-2xl text-foreground mb-8">Kehadiran Anak</h1>
  </div>

  <div in:fly={{ y: 20, duration: 700, delay: 100 }}>
    <DataTable {columns} rows={records} emptyMessage="Belum ada riwayat kehadiran." />
  </div>
</div>
