<script lang="ts">
  import Sidebar from '../Components/Sidebar.svelte';
  import DataTable from '../Components/DataTable.svelte';
  import type { TeacherConfirmation } from '../types';
  import { fly } from 'svelte/transition';

  let { records = [] }: { records?: TeacherConfirmation[] } = $props();

  const columns = [
    { key: 'teacher_user_id', label: 'Guru' },
    { key: 'schedule_id', label: 'Jadwal' },
    { key: 'distance_meters', label: 'Jarak (m)' },
    { key: 'is_inside_school', label: 'Di Dalam' },
    { key: 'confirmed_at', label: 'Konfirmasi' },
  ];
</script>

<Sidebar group="teacher" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div class="mb-12" in:fly={{ y: 20, duration: 800 }}>
    <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Konfirmasi Guru</p>
    <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground">
      Konfirmasi Kehadiran.
    </h1>
    <p class="mt-4 text-base text-muted-foreground leading-relaxed max-w-[52ch]">
      Riwayat konfirmasi kehadiran guru beserta jarak dan status lokasi.
    </p>
  </div>
  <DataTable {columns} rows={records} />
</div>
