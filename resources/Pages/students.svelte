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
  import type { Student, StudentForm, Class, User } from '../types';
  import { createEmptyStudentForm, studentToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';
  import { fly } from 'svelte/transition';

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

  const columns = [{ key: 'nis', label: 'NIS' }, { key: 'name', label: 'Nama' }, { key: 'class_id', label: 'Kelas' }, { key: 'parent_user_id', label: 'Orang Tua' }];
</script>

{#snippet rowActions(item: Student)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Sidebar group="students" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12" in:fly={{ y: 20, duration: 800 }}>
    <div>
      <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Manajemen Siswa</p>
      <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground">
        Siswa.
      </h1>
      <p class="mt-4 text-base text-muted-foreground leading-relaxed max-w-[52ch]">
        Daftar siswa terdaftar. Tambah, edit, atau hapus data siswa.
      </p>
    </div>
    {#if permissions.canCreate}<Button onclick={openCreate} size="lg">Tambah Siswa</Button>{/if}
  </div>
  <DataTable {columns} rows={students} rowAction={rowActions} />
  {#if meta}<Pagination {meta} />{/if}
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Siswa' : 'Tambah Siswa'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="nis">NIS</Label><Input id="nis" bind:value={form.nis} required /></div>
    <div><Label for="name">Nama</Label><Input id="name" bind:value={form.name} required /></div>
    <div><Label for="class">Kelas</Label>
      <select id="class" bind:value={form.class_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each classes as c}<option value={c.id}>{c.name}</option>{/each}
      </select>
    </div>
    <div><Label for="parent">Orang Tua</Label>
      <select id="parent" bind:value={form.parent_user_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        <option value={null}>Tidak ada</option>
        {#each parents as p}<option value={p.id}>{p.name}</option>{/each}
      </select>
    </div>
    <div><Label for="phone">Telepon</Label><Input id="phone" bind:value={form.phone} /></div>
    <div><Label for="address">Alamat</Label><Input id="address" bind:value={form.address} /></div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Batal</Button>
      <Button type="submit">{selected ? 'Perbarui' : 'Buat'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Hapus Siswa" onConfirm={remove} destructive />
