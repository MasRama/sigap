<script lang="ts">
  import Sidebar from '../Components/Sidebar.svelte';
  import DataTable from '../Components/DataTable.svelte';
  import type { TeacherConfirmation } from '../types';

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
  <h1 class="font-heading font-semibold tracking-tight text-2xl mb-8">Konfirmasi Guru</h1>
  <DataTable {columns} rows={records} />
</div>
