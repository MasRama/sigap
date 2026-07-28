<script lang="ts">
  import Header from '../Components/Header.svelte';
  import DataTable from '../Components/DataTable.svelte';
  import type { StudentAttendance } from '../types';

  let { records = [] }: { records?: StudentAttendance[] } = $props();

  const columns = [
    { key: 'student_id', label: 'Student' },
    { key: 'journal_id', label: 'Journal' },
    { key: 'status', label: 'Status' },
    { key: 'note', label: 'Note' },
  ];
</script>

<Header group="attendance" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <h1 class="font-heading font-semibold tracking-tight text-2xl mb-8">Attendance</h1>
  <DataTable {columns} rows={records} />
</div>
