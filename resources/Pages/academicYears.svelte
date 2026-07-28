<script lang="ts">
  import { page as inertiaPage, inertia, router } from '@inertiajs/svelte';
  import axios from 'axios';
  import { api } from '$lib/api';
  import Header from '../Components/Header.svelte';
  import DataTable from '../Components/DataTable.svelte';
  import Button from '../Components/Button.svelte';
  import Input from '../Components/Input.svelte';
  import Label from '../Components/Label.svelte';
  import Switch from '../Components/Switch.svelte';
  import Modal from '../Components/Modal.svelte';
  import ConfirmDialog from '../Components/ConfirmDialog.svelte';
  import type { AcademicYear, AcademicYearForm, User } from '../types';
  import { createEmptyAcademicYearForm, academicYearToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';

  let { permissions, years = [] }: { permissions: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }; years?: AcademicYear[] } = $props();

  const currentUser = $derived(inertiaPage.props.user as User | undefined);

  let isOpen = $state(false);
  let isDeleteOpen = $state(false);
  let form: AcademicYearForm = $state(createEmptyAcademicYearForm());
  let selected: AcademicYear | null = $state(null);

  function openCreate(): void {
    form = createEmptyAcademicYearForm();
    selected = null;
    isOpen = true;
  }

  function openEdit(year: AcademicYear): void {
    selected = year;
    form = academicYearToForm(year);
    isOpen = true;
  }

  function confirmDelete(year: AcademicYear): void {
    selected = year;
    isDeleteOpen = true;
  }

  async function submit(): Promise<void> {
    const payload = { ...form, is_active: form.is_active ? 1 : 0, start_at: Number(form.start_at), end_at: Number(form.end_at) };
    const result = selected
      ? await api(() => axios.put(`/academic-years/${selected!.id}`, payload))
      : await api(() => axios.post('/academic-years', payload));
    if (result.success) {
      isOpen = false;
      router.visit('/academic-years', { preserveScroll: true });
    }
  }

  async function remove(): Promise<void> {
    if (!selected) return;
    const result = await api(() => axios.delete(`/academic-years/${selected!.id}`));
    if (result.success) {
      isDeleteOpen = false;
      router.visit('/academic-years', { preserveScroll: true });
    }
  }

  function setActive(id: string): void {
    api(() => axios.post(`/academic-years/${id}/activate`)).then(() => router.visit('/academic-years', { preserveScroll: true }));
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'start_at', label: 'Start' },
    { key: 'end_at', label: 'End' },
    { key: 'is_active', label: 'Active' },
  ];
</script>

{#snippet rowActions(year: AcademicYear)}
  {#if permissions.canEdit}
    <Button variant="ghost" size="icon" onclick={() => openEdit(year)}><Pencil class="w-4 h-4" /></Button>
    <Button variant="ghost" onclick={() => setActive(year.id)}>Set active</Button>
  {/if}
  {#if permissions.canDelete}
    <Button variant="ghost" size="icon" onclick={() => confirmDelete(year)}><Trash2 class="w-4 h-4 text-destructive" /></Button>
  {/if}
{/snippet}

<Header group="academic-years" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <div class="flex items-center justify-between mb-8">
    <h1 class="font-heading font-semibold tracking-tight text-2xl">Academic Years</h1>
    {#if permissions.canCreate}
      <Button onclick={openCreate}>Add Year</Button>
    {/if}
  </div>

  <DataTable {columns} rows={years} rowAction={rowActions} />
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Academic Year' : 'Add Academic Year'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="name">Name</Label><Input id="name" bind:value={form.name} required /></div>
    <div><Label for="start_at">Start (timestamp)</Label><Input id="start_at" type="number" bind:value={form.start_at} required /></div>
    <div><Label for="end_at">End (timestamp)</Label><Input id="end_at" type="number" bind:value={form.end_at} required /></div>
    <div class="flex items-center gap-2"><Switch bind:checked={form.is_active} /><Label>Active</Label></div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Cancel</Button>
      <Button type="submit">{selected ? 'Update' : 'Create'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Delete Academic Year" onConfirm={remove} destructive />
