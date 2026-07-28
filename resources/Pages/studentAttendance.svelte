<script lang="ts">
  import Sidebar from '../Components/Sidebar.svelte';
  import DataTable from '../Components/DataTable.svelte';
  import type { StudentAttendance } from '../types';
  import { fly } from 'svelte/transition';

  let { records = [] }: { records?: StudentAttendance[] } = $props();

  const columns = [
    { key: 'student_id', label: 'Siswa' },
    { key: 'journal_id', label: 'Jurnal' },
    { key: 'status', label: 'Status' },
    { key: 'note', label: 'Catatan' },
  ];
</script>

<Sidebar group="attendance" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div class="mb-12" in:fly={{ y: 20, duration: 800 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Kehadiran Siswa</p>
    <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground">
      Kehadiran.
    </h1>
    <p class="mt-4 text-base text-muted-foreground leading-relaxed max-w-[52ch]">
      Rekap kehadiran siswa per jadwal dan jurnal mengajar.
    </p>
  </div>
  <DataTable {columns} rows={records} />
</div>
