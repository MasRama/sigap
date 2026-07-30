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
  import type { Grade, GradeForm, Student, Subject, Class, AcademicYear, PaginationMeta } from '../types';
  import { createEmptyGradeForm, gradeToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';
  import { fly } from 'svelte/transition';

  let { permissions, grades = [], students = [], subjects = [], classes = [], years = [], meta }: { permissions: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }; grades?: Grade[]; students?: Student[]; subjects?: Subject[]; classes?: Class[]; years?: AcademicYear[]; meta?: PaginationMeta } = $props();

  let isOpen = $state(false);
  let isDeleteOpen = $state(false);
  let form: GradeForm = $state(createEmptyGradeForm());
  let selected: Grade | null = $state(null);

  function openCreate(): void { form = createEmptyGradeForm(); selected = null; isOpen = true; }
  function openEdit(item: Grade): void { selected = item; form = gradeToForm(item); isOpen = true; }
  function confirmDelete(item: Grade): void { selected = item; isDeleteOpen = true; }

  async function submit(): Promise<void> {
    const result = selected
      ? await api(() => axios.put(`/grades/${selected!.id}`, form))
      : await api(() => axios.post('/grades', form));
    if (result.success) { isOpen = false; router.visit('/grades', { preserveScroll: true }); }
  }
  async function remove(): Promise<void> {
    if (!selected) return;
    const result = await api(() => axios.delete(`/grades/${selected!.id}`));
    if (result.success) { isDeleteOpen = false; router.visit('/grades', { preserveScroll: true }); }
  }

  const columns = [{ key: 'student_id', label: 'Siswa' }, { key: 'subject_id', label: 'Mapel' }, { key: 'class_id', label: 'Kelas' }, { key: 'type', label: 'Jenis' }, { key: 'score', label: 'Nilai' }];
</script>

{#snippet rowActions(item: Grade)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Sidebar group="grades" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12" in:fly={{ y: 20, duration: 800 }}>
    <div>
      <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Penilaian</p>
      <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground">
        Nilai.
      </h1>
      <p class="mt-4 text-base text-muted-foreground leading-relaxed max-w-[52ch]">
        Kelola nilai siswa per mata pelajaran dan jenis penilaian.
      </p>
    </div>
    {#if permissions.canCreate}<Button onclick={openCreate} size="lg">Tambah Nilai</Button>{/if}
  </div>
  <DataTable {columns} rows={grades} rowAction={rowActions} />
  {#if meta}<Pagination {meta} />{/if}
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Nilai' : 'Tambah Nilai'} description="Tambah atau ubah nilai siswa. Pilih siswa, mapel, kelas, dan jenis penilaian.">
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div class="flex flex-col gap-0"><Label for="student" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Siswa</Label>
      <Select id="student" bind:value={form.student_id} placeholder="Pilih siswa">
        {#each students as s}<option value={s.id}>{s.name}</option>{/each}
      </Select>
    </div>
    <div class="flex flex-col gap-0"><Label for="subject" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Mapel</Label>
      <Select id="subject" bind:value={form.subject_id} placeholder="Pilih mapel">
        {#each subjects as s}<option value={s.id}>{s.name}</option>{/each}
      </Select>
    </div>
    <div class="flex flex-col gap-0"><Label for="class" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Kelas</Label>
      <Select id="class" bind:value={form.class_id} placeholder="Pilih kelas">
        {#each classes as c}<option value={c.id}>{c.name}</option>{/each}
      </Select>
    </div>
    <div class="flex flex-col gap-0"><Label for="year" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Tahun Ajaran</Label>
      <Select id="year" bind:value={form.academic_year_id} placeholder="Pilih tahun ajaran">
        {#each years as y}<option value={y.id}>{y.name}</option>{/each}
      </Select>
    </div>
    <div class="flex flex-col gap-0"><Label for="type" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Jenis</Label>
      <Select id="type" bind:value={form.type} placeholder="Pilih jenis nilai">
        <option value="task">Tugas</option>
        <option value="daily_quiz">Kuis Harian</option>
        <option value="midterm">UTS</option>
        <option value="final">UAS</option>
      </Select>
    </div>
    <div class="flex flex-col gap-0"><Label for="score" class="text-xs uppercase tracking-[0.2em] font-heading text-muted-foreground mb-1.5">Nilai</Label><Input id="score" type="number" bind:value={form.score} required /></div>
    <div class="flex justify-end gap-2 pt-4 border-t border-border mt-2">
      <Button variant="outline" onclick={() => isOpen = false}>Batal</Button>
      <Button type="submit">{selected ? 'Perbarui' : 'Buat'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Hapus Nilai" onConfirm={remove} destructive />
