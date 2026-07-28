<script lang="ts">
  import { router } from '@inertiajs/svelte';
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
  import type { SchoolLocation, SchoolLocationForm } from '../types';
  import { createEmptySchoolLocationForm, schoolLocationToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';

  let { permissions, locations = [] }: { permissions: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }; locations?: SchoolLocation[] } = $props();

  let isOpen = $state(false);
  let isDeleteOpen = $state(false);
  let form: SchoolLocationForm = $state(createEmptySchoolLocationForm());
  let selected: SchoolLocation | null = $state(null);

  function openCreate(): void { form = createEmptySchoolLocationForm(); selected = null; isOpen = true; }
  function openEdit(item: SchoolLocation): void { selected = item; form = schoolLocationToForm(item); isOpen = true; }
  function confirmDelete(item: SchoolLocation): void { selected = item; isDeleteOpen = true; }

  async function submit(): Promise<void> {
    const payload = { ...form, is_active: form.is_active ? 1 : 0 };
    const result = selected
      ? await api(() => axios.put(`/school-locations/${selected!.id}`, payload))
      : await api(() => axios.post('/school-locations', payload));
    if (result.success) { isOpen = false; router.visit('/school-locations', { preserveScroll: true }); }
  }
  async function remove(): Promise<void> {
    if (!selected) return;
    const result = await api(() => axios.delete(`/school-locations/${selected!.id}`));
    if (result.success) { isDeleteOpen = false; router.visit('/school-locations', { preserveScroll: true }); }
  }
  function setActive(id: string): void {
    api(() => axios.post(`/school-locations/${id}/activate`)).then(() => router.visit('/school-locations', { preserveScroll: true }));
  }

  const columns = [{ key: 'name', label: 'Nama' }, { key: 'address', label: 'Alamat' }, { key: 'radius_meters', label: 'Radius (m)' }, { key: 'is_active', label: 'Aktif' }];
</script>

{#snippet rowActions(item: SchoolLocation)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button><Button variant="ghost" onclick={() => setActive(item.id)}>Aktifkan</Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Sidebar group="school-locations" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div class="flex items-center justify-between mb-8">
    <h1 class="font-heading font-semibold tracking-tight text-2xl">Lokasi Sekolah</h1>
    {#if permissions.canCreate}<Button onclick={openCreate}>Tambah Lokasi</Button>{/if}
  </div>
  <DataTable {columns} rows={locations} rowAction={rowActions} />
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Lokasi' : 'Tambah Lokasi'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="name">Nama</Label><Input id="name" bind:value={form.name} required /></div>
    <div><Label for="address">Alamat</Label><Input id="address" bind:value={form.address} /></div>
    <div><Label for="lat">Latitude</Label><Input id="lat" type="number" step="any" bind:value={form.latitude} required /></div>
    <div><Label for="lng">Longitude</Label><Input id="lng" type="number" step="any" bind:value={form.longitude} required /></div>
    <div><Label for="radius">Radius (meter)</Label><Input id="radius" type="number" bind:value={form.radius_meters} required /></div>
    <div class="flex items-center gap-2"><Switch bind:checked={form.is_active} /><Label>Aktif</Label></div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Batal</Button>
      <Button type="submit">{selected ? 'Perbarui' : 'Buat'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Hapus Lokasi" onConfirm={remove} destructive />
