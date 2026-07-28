<script lang="ts">
  import Header from '../Components/Header.svelte';
  import DataTable from '../Components/DataTable.svelte';
  import type { TeacherConfirmation } from '../types';

  let { records = [] }: { records?: TeacherConfirmation[] } = $props();

  const columns = [
    { key: 'teacher_user_id', label: 'Teacher' },
    { key: 'schedule_id', label: 'Schedule' },
    { key: 'distance_meters', label: 'Distance (m)' },
    { key: 'is_inside_school', label: 'Inside' },
    { key: 'confirmed_at', label: 'Confirmed' },
  ];
</script>

<Header group="teacher" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <h1 class="font-heading font-semibold tracking-tight text-2xl mb-8">Teacher Confirmations</h1>
  <DataTable {columns} rows={records} />
</div>
