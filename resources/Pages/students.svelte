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
  import Select from '../Components/Select.svelte';
  import Pagination from '../Components/Pagination.svelte';
  import type { Student, StudentForm, Class, User } from '../types';
  import { createEmptyStudentForm, studentToForm } from '../types';
  import { Pencil, Trash2, Upload } from '@lucide/svelte';
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
  let isImportOpen = $state(false);
  let importFile = $state<File | null>(null);
  let importResult = $state<{ inserted: number; errors: { line: number; message: string }[] } | null>(null);
  let isImporting = $state(false);
  let form: StudentForm = $state(createEmptyStudentForm());
  let selected: Student | null = $state(null);

  function openImport(): void {
    importFile = null;
    importResult = null;
    isImportOpen = true;
  }

  async function submitImport(): Promise<void> {
    if (!importFile) return;
    isImporting = true;
    const formData = new FormData();
    formData.append('file', importFile);
    const result = await api(() => axios.post('/students/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
    if (result.success && result.data) {
      importResult = result.data as { inserted: number; errors: { line: number; message: string }[] };
      importFile = null;
    }
    isImporting = false;
  }

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

  const classById = $derived(new Map(classes.map(c => [c.id, c.name])));

  const displayRows = $derived(students.map(s => ({
    id: s.id,
    nis: s.nis,
    name: s.name,
    class_name: classById.get(s.class_id) ?? s.class_id,
    parent: '-',
  })));

  const columns = [{ key: 'nis', label: 'NIS' }, { key: 'name', label: 'Nama' }, { key: 'class_name', label: 'Kelas' }, { key: 'parent', label: 'Orang Tua' }];
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
    {#if permissions.canCreate}
      <div class="flex gap-2">
        <Button variant="outline" onclick={openImport}><Upload class="w-4 h-4 mr-1" /> Import CSV</Button>
        <Button onclick={openCreate} size="lg">Tambah Siswa</Button>
      </div>
    {/if}
  </div>
  <DataTable {columns} rows={displayRows} rowAction={rowActions} />
  {#if meta}<Pagination {meta} />{/if}
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Siswa' : 'Tambah Siswa'} description="Tambah atau ubah data siswa. Isi NIS, nama, kelas, dan orang tua.">
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div class="flex flex-col gap-0"><Label for="nis" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">NIS</Label><Input id="nis" bind:value={form.nis} required /></div>
    <div class="flex flex-col gap-0"><Label for="name" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Nama</Label><Input id="name" bind:value={form.name} required /></div>
    <div class="flex flex-col gap-0"><Label for="class" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Kelas</Label>
      <Select id="class" bind:value={form.class_id} placeholder="Pilih kelas">
        {#each classes as c}<option value={c.id}>{c.name}</option>{/each}
      </Select>
    </div>
    <div class="flex flex-col gap-0"><Label for="parent" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Orang Tua</Label>
      <Select id="parent" bind:value={form.parent_user_id} placeholder="Pilih orang tua">
        <option value={null}>Tidak ada</option>
        {#each parents as p}<option value={p.id}>{p.name}</option>{/each}
      </Select>
    </div>
    <div class="flex flex-col gap-0"><Label for="phone" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Telepon</Label><Input id="phone" bind:value={form.phone} /></div>
    <div class="flex flex-col gap-0"><Label for="address" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Alamat</Label><Input id="address" bind:value={form.address} /></div>
    <div class="flex justify-end gap-2 pt-4 border-t border-border mt-2">
      <Button variant="outline" onclick={() => isOpen = false}>Batal</Button>
      <Button type="submit">{selected ? 'Perbarui' : 'Buat'}</Button>
    </div>
  </form>
</Modal>

<Modal bind:open={isImportOpen} title="Import Siswa (CSV)" description="Upload file CSV dengan kolom: nis,name,class,phone,address. Baris pertama opsional sebagai header. Kelas harus sesuai nama kelas yang sudah ada.">
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submitImport(); }}>
    <input
      type="file"
      accept=".csv,text/csv"
      class="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary/60 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-secondary"
      onchange={(e) => { importFile = (e.currentTarget as HTMLInputElement).files?.[0] ?? null; importResult = null; }}
    />
    <pre class="bg-secondary/40 rounded-md px-3 py-2 text-xs text-muted-foreground overflow-x-auto">10011,Andi Saputra,10A,08123456780,Jl. Melati No. 6
10012,Budi Hartono,10B,,</pre>
    {#if importResult}
      <div class="bg-card border border-border rounded-md px-4 py-3 text-sm">
        <p class="font-medium text-foreground">{importResult.inserted} siswa berhasil diimpor.</p>
        {#if importResult.errors.length > 0}
          <ul class="mt-2 flex flex-col gap-1 text-xs text-destructive max-h-40 overflow-y-auto">
            {#each importResult.errors as err}
              <li>Baris {err.line}: {err.message}</li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
    <div class="flex justify-end gap-2 pt-4 border-t border-border mt-2">
      <Button variant="outline" onclick={() => isImportOpen = false} type="button">Tutup</Button>
      <Button type="submit" disabled={!importFile || isImporting}>{isImporting ? 'Mengimpor...' : 'Import'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Hapus Siswa" onConfirm={remove} destructive />
