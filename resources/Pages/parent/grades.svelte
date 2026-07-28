<script lang="ts">
  import Header from '../../Components/Header.svelte';
  import DataTable from '../../Components/DataTable.svelte';
  import type { Grade } from '../../types';

  let { grades = [] }: { grades?: Grade[] } = $props();

  const columns = [
    { key: 'subject_id', label: 'Subject' },
    { key: 'type', label: 'Type' },
    { key: 'score', label: 'Score' },
  ];
</script>

<Header group="parent" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <h1 class="font-heading font-semibold tracking-tight text-2xl mb-8">Grades</h1>
  <DataTable {columns} rows={grades} />
</div>
