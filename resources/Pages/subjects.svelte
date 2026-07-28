<script lang="ts">
  import { router } from '@inertiajs/svelte';
  import axios from 'axios';
  import { api } from '$lib/api';
  import Header from '../Components/Header.svelte';
  import DataTable from '../Components/DataTable.svelte';
  import Button from '../Components/Button.svelte';
  import Input from '../Components/Input.svelte';
  import Label from '../Components/Label.svelte';
  import Modal from '../Components/Modal.svelte';
  import ConfirmDialog from '../Components/ConfirmDialog.svelte';
  import type { Subject, SubjectForm } from '../types';
  import { createEmptySubjectForm, subjectToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';

  let { permissions, subjects = [] }: { permissions: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }; subjects?: Subject[] } = $props();

  let isOpen = $state(false);
  let isDeleteOpen = $state(false);
  let form: SubjectForm = $state(createEmptySubjectForm());
  let selected: Subject | null = $state(null);

  function openCreate(): void { form = createEmptySubjectForm(); selected = null; isOpen = true; }
  function openEdit(item: Subject): void { selected = item; form = subjectToForm(item); isOpen = true; }
  function confirmDelete(item: Subject): void { selected = item; isDeleteOpen = true; }

  async function submit(): Promise<void> {
    const result = selected
      ? await api(() => axios.put(`/subjects/${selected!.id}`, form))
      : await api(() => axios.post('/subjects', form));
    if (result.success) { isOpen = false; router.visit('/subjects', { preserveScroll: true }); }
  }
  async function remove(): Promise<void> {
    if (!selected) return;
    const result = await api(() => axios.delete(`/subjects/${selected!.id}`));
    if (result.success) { isDeleteOpen = false; router.visit('/subjects', { preserveScroll: true }); }
  }

  const columns = [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }];
</script>

{#snippet rowActions(item: Subject)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Header group="subjects" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <div class="flex items-center justify-between mb-8">
    <h1 class="font-heading font-semibold tracking-tight text-2xl">Subjects</h1>
    {#if permissions.canCreate}<Button onclick={openCreate}>Add Subject</Button>{/if}
  </div>
  <DataTable {columns} rows={subjects} rowAction={rowActions} />
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Subject' : 'Add Subject'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="code">Code</Label><Input id="code" bind:value={form.code} required /></div>
    <div><Label for="name">Name</Label><Input id="name" bind:value={form.name} required /></div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Cancel</Button>
      <Button type="submit">{selected ? 'Update' : 'Create'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Delete Subject" onConfirm={remove} destructive />
