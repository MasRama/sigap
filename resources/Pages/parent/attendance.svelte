<script lang="ts">
  import Header from '../../Components/Header.svelte';
  import DataTable from '../../Components/DataTable.svelte';
  import type { StudentAttendance } from '../../types';

  let { records = [] }: { records?: StudentAttendance[] } = $props();

  const columns = [
    { key: 'created_at', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'note', label: 'Note' },
  ];
</script>

<Header group="parent" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <h1 class="font-heading font-semibold tracking-tight text-2xl mb-8">Attendance History</h1>
  <DataTable {columns} rows={records} />
</div>
