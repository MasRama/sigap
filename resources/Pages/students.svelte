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
  import Pagination from '../Components/Pagination.svelte';
  import type { Student, StudentForm, Class, User } from '../types';
  import { createEmptyStudentForm, studentToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';

  let {
    permissions,
    students = [],
    classes = [],
    parents = [],
    meta,
  }: {
    permissions: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean };
    students?: Student[];
    classes?: Class[];
    parents?: User[];
    meta?: import('../types').PaginationMeta;
  } = $props();

  let isOpen = $state(false);
  let isDeleteOpen = $state(false);
  let form: StudentForm = $state(createEmptyStudentForm());
  let selected: Student | null = $state(null);

  function openCreate(): void { form = createEmptyStudentForm(); selected = null; isOpen = true; }
  function openEdit(item: Student): void { selected = item; form = studentToForm(item); isOpen = true; }
  function confirmDelete(item: Student): void { selected = item; isDeleteOpen = true; }

  async function submit(): Promise<void> {
    const payload = { ...form, parent_user_id: form.parent_user_id || null };
    const result = selected
      ? await api(() => axios.put(`/students/${selected!.id}`, payload))
      : await api(() => axios.post('/students', payload));
    if (result.success) { isOpen = false; router.visit('/students', { preserveScroll: true }); }
  }
  async function remove(): Promise<void> {
    if (!selected) return;
    const result = await api(() => axios.delete(`/students/${selected!.id}`));
    if (result.success) { isDeleteOpen = false; router.visit('/students', { preserveScroll: true }); }
  }

  const columns = [{ key: 'nis', label: 'NIS' }, { key: 'name', label: 'Name' }, { key: 'class_id', label: 'Class' }, { key: 'parent_user_id', label: 'Parent' }];
</script>

{#snippet rowActions(item: Student)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Header group="students" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <div class="flex items-center justify-between mb-8">
    <h1 class="font-heading font-semibold tracking-tight text-2xl">Students</h1>
    {#if permissions.canCreate}<Button onclick={openCreate}>Add Student</Button>{/if}
  </div>
  <DataTable {columns} rows={students} rowAction={rowActions} />
  {#if meta}<Pagination {meta} />{/if}
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Student' : 'Add Student'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="nis">NIS</Label><Input id="nis" bind:value={form.nis} required /></div>
    <div><Label for="name">Name</Label><Input id="name" bind:value={form.name} required /></div>
    <div><Label for="class">Class</Label>
      <select id="class" bind:value={form.class_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each classes as c}<option value={c.id}>{c.name}</option>{/each}
      </select>
    </div>
    <div><Label for="parent">Parent</Label>
      <select id="parent" bind:value={form.parent_user_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        <option value={null}>None</option>
        {#each parents as p}<option value={p.id}>{p.name}</option>{/each}
      </select>
    </div>
    <div><Label for="phone">Phone</Label><Input id="phone" bind:value={form.phone} /></div>
    <div><Label for="address">Address</Label><Input id="address" bind:value={form.address} /></div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Cancel</Button>
      <Button type="submit">{selected ? 'Update' : 'Create'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Delete Student" onConfirm={remove} destructive />
