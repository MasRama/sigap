<script lang="ts">
  import Sidebar from '../../Components/Sidebar.svelte';
  import DataTable from '../../Components/DataTable.svelte';
  import { fly } from 'svelte/transition';
  import type { TeacherConfirmation } from '../../types';

  let { outside = [] }: { outside?: TeacherConfirmation[] } = $props();

  const columns = [
    { key: 'teacher_user_id', label: 'Guru' },
    { key: 'distance_meters', label: 'Jarak (m)', align: 'right' as const },
    { key: 'confirmed_at', label: 'Konfirmasi' },
    { key: 'is_inside_school', label: 'Di Dalam', align: 'center' as const },
  ];
</script>

<Sidebar group="headmaster" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div in:fly={{ y: 20, duration: 700 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Laporan Pengawasan</p>
    <h1 class="font-heading font-semibold tracking-[-0.02em] text-2xl text-foreground mb-8">Konfirmasi di Luar Radius</h1>
  </div>

  <div in:fly={{ y: 20, duration: 700, delay: 100 }}>
    <DataTable {columns} rows={outside} emptyMessage="Tidak ada konfirmasi di luar radius." />
  </div>
</div>
