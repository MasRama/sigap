<script lang="ts">
  import { page as inertiaPage, inertia, router } from '@inertiajs/svelte';
  import axios from 'axios';
  import { api } from '$lib/api';
  import Sidebar from '../Components/Sidebar.svelte';
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
  import { fly } from 'svelte/transition';

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
    { key: 'name', label: 'Nama' },
    { key: 'start_at', label: 'Mulai' },
    { key: 'end_at', label: 'Selesai' },
    { key: 'is_active', label: 'Aktif' },
  ];
</script>

{#snippet rowActions(year: AcademicYear)}
  {#if permissions.canEdit}
    <Button variant="ghost" size="icon" onclick={() => openEdit(year)}><Pencil class="w-4 h-4" /></Button>
    <Button variant="ghost" onclick={() => setActive(year.id)}>Aktifkan</Button>
  {/if}
  {#if permissions.canDelete}
    <Button variant="ghost" size="icon" onclick={() => confirmDelete(year)}><Trash2 class="w-4 h-4 text-destructive" /></Button>
  {/if}
{/snippet}

<Sidebar group="academic-years" />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12" in:fly={{ y: 20, duration: 800 }}>
    <div>
      <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Manajemen Tahun Ajaran</p>
      <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground">
        Tahun Ajaran.
      </h1>
      <p class="mt-4 text-base text-muted-foreground leading-relaxed max-w-[52ch]">
        Atur periode tahun ajaran aktif untuk seluruh kegiatan sekolah.
      </p>
    </div>
    {#if permissions.canCreate}
      <Button onclick={openCreate} size="lg">Tambah Tahun</Button>
    {/if}
  </div>

  <DataTable {columns} rows={years} rowAction={rowActions} />
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="name">Nama</Label><Input id="name" bind:value={form.name} required /></div>
    <div><Label for="start_at">Mulai (timestamp)</Label><Input id="start_at" type="number" bind:value={form.start_at} required /></div>
    <div><Label for="end_at">Selesai (timestamp)</Label><Input id="end_at" type="number" bind:value={form.end_at} required /></div>
    <div class="flex items-center gap-2"><Switch bind:checked={form.is_active} /><Label>Aktif</Label></div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Batal</Button>
      <Button type="submit">{selected ? 'Perbarui' : 'Buat'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Hapus Tahun Ajaran" onConfirm={remove} destructive />
