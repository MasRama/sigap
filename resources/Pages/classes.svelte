<script lang="ts">
  import { router } from '@inertiajs/svelte';
  import axios from 'axios';
  import { api } from '$lib/api';
  import Sidebar from '../Components/Sidebar.svelte';
  import DataTable from '../Components/DataTable.svelte';
  import Button from '../Components/Button.svelte';
  import Input from '../Components/Input.svelte';
  import Label from '../Components/Label.svelte';
  import Modal from '../Components/Modal.svelte';
  import ConfirmDialog from '../Components/ConfirmDialog.svelte';
  import type { Class, ClassForm, AcademicYear } from '../types';
  import { createEmptyClassForm, classToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';

  let { permissions, classes = [], years = [] }: { permissions: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }; classes?: Class[]; years?: AcademicYear[] } = $props();

  let isOpen = $state(false);
  let isDeleteOpen = $state(false);
  let form: ClassForm = $state(createEmptyClassForm());
  let selected: Class | null = $state(null);

  function openCreate(): void { form = createEmptyClassForm(); selected = null; isOpen = true; }
  function openEdit(item: Class): void { selected = item; form = classToForm(item); isOpen = true; }
  function confirmDelete(item: Class): void { selected = item; isDeleteOpen = true; }

  async function submit(): Promise<void> {
    const result = selected
      ? await api(() => axios.put(`/classes/${selected!.id}`, form))
      : await api(() => axios.post('/classes', form));
    if (result.success) { isOpen = false; router.visit('/classes', { preserveScroll: true }); }
  }
  async function remove(): Promise<void> {
    if (!selected) return;
    const result = await api(() => axios.delete(`/classes/${selected!.id}`));
    if (result.success) { isDeleteOpen = false; router.visit('/classes', { preserveScroll: true }); }
  }

  const columns = [{ key: 'name', label: 'Nama' }, { key: 'grade', label: 'Tingkat' }, { key: 'academic_year_id', label: 'Tahun Ajaran' }];
</script>

{#snippet rowActions(item: Class)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Sidebar group="classes" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-64 px-6 sm:px-10 lg:px-16 pb-16">
  <div class="flex items-center justify-between mb-8">
    <h1 class="font-heading font-semibold tracking-tight text-2xl">Kelas</h1>
    {#if permissions.canCreate}<Button onclick={openCreate}>Tambah Kelas</Button>{/if}
  </div>
  <DataTable {columns} rows={classes} rowAction={rowActions} />
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Kelas' : 'Tambah Kelas'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="name">Nama</Label><Input id="name" bind:value={form.name} required /></div>
    <div><Label for="grade">Tingkat</Label><Input id="grade" bind:value={form.grade} required /></div>
    <div><Label for="year">Tahun Ajaran</Label>
      <select id="year" bind:value={form.academic_year_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each years as year}<option value={year.id}>{year.name}</option>{/each}
      </select>
    </div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Batal</Button>
      <Button type="submit">{selected ? 'Perbarui' : 'Buat'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Hapus Kelas" onConfirm={remove} destructive />
