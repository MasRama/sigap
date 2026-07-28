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
  import Pagination from '../Components/Pagination.svelte';
  import type { Teacher, TeacherForm, User, PaginationMeta } from '../types';
  import { createEmptyTeacherForm, teacherToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';

  let { permissions, teachers = [], users = [], meta }: { permissions: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }; teachers?: Teacher[]; users?: User[]; meta?: PaginationMeta } = $props();

  let isOpen = $state(false);
  let isDeleteOpen = $state(false);
  let form: TeacherForm = $state(createEmptyTeacherForm());
  let selected: Teacher | null = $state(null);

  function openCreate(): void { form = createEmptyTeacherForm(); selected = null; isOpen = true; }
  function openEdit(item: Teacher): void { selected = item; form = teacherToForm(item); isOpen = true; }
  function confirmDelete(item: Teacher): void { selected = item; isDeleteOpen = true; }

  async function submit(): Promise<void> {
    const result = selected
      ? await api(() => axios.put(`/teachers/${selected!.id}`, form))
      : await api(() => axios.post('/teachers', form));
    if (result.success) { isOpen = false; router.visit('/teachers', { preserveScroll: true }); }
  }
  async function remove(): Promise<void> {
    if (!selected) return;
    const result = await api(() => axios.delete(`/teachers/${selected!.id}`));
    if (result.success) { isDeleteOpen = false; router.visit('/teachers', { preserveScroll: true }); }
  }

  const columns = [{ key: 'employee_id', label: 'NIP' }, { key: 'user_id', label: 'Pengguna' }, { key: 'phone', label: 'Telepon' }];
</script>

{#snippet rowActions(item: Teacher)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Sidebar group="teachers" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div class="flex items-center justify-between mb-8">
    <h1 class="font-heading font-semibold tracking-tight text-2xl">Guru</h1>
    {#if permissions.canCreate}<Button onclick={openCreate}>Tambah Guru</Button>{/if}
  </div>
  <DataTable {columns} rows={teachers} rowAction={rowActions} />
  {#if meta}<Pagination {meta} />{/if}
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Guru' : 'Tambah Guru'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="user">Pengguna</Label>
      <select id="user" bind:value={form.user_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each users as u}<option value={u.id}>{u.name}</option>{/each}
      </select>
    </div>
    <div><Label for="employee_id">NIP</Label><Input id="employee_id" bind:value={form.employee_id} /></div>
    <div><Label for="phone">Telepon</Label><Input id="phone" bind:value={form.phone} /></div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Batal</Button>
      <Button type="submit">{selected ? 'Perbarui' : 'Buat'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Hapus Guru" onConfirm={remove} destructive />
