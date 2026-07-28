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
  import type { Grade, GradeForm, Student, Subject, Class, AcademicYear, PaginationMeta } from '../types';
  import { createEmptyGradeForm, gradeToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';

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

  const columns = [{ key: 'student_id', label: 'Student' }, { key: 'subject_id', label: 'Subject' }, { key: 'class_id', label: 'Class' }, { key: 'type', label: 'Type' }, { key: 'score', label: 'Score' }];
</script>

{#snippet rowActions(item: Grade)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Header group="grades" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <div class="flex items-center justify-between mb-8">
    <h1 class="font-heading font-semibold tracking-tight text-2xl">Grades</h1>
    {#if permissions.canCreate}<Button onclick={openCreate}>Add Grade</Button>{/if}
  </div>
  <DataTable {columns} rows={grades} rowAction={rowActions} />
  {#if meta}<Pagination {meta} />{/if}
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Grade' : 'Add Grade'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="student">Student</Label>
      <select id="student" bind:value={form.student_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each students as s}<option value={s.id}>{s.name}</option>{/each}
      </select>
    </div>
    <div><Label for="subject">Subject</Label>
      <select id="subject" bind:value={form.subject_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each subjects as s}<option value={s.id}>{s.name}</option>{/each}
      </select>
    </div>
    <div><Label for="class">Class</Label>
      <select id="class" bind:value={form.class_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each classes as c}<option value={c.id}>{c.name}</option>{/each}
      </select>
    </div>
    <div><Label for="year">Academic Year</Label>
      <select id="year" bind:value={form.academic_year_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each years as y}<option value={y.id}>{y.name}</option>{/each}
      </select>
    </div>
    <div><Label for="type">Type</Label><Input id="type" bind:value={form.type} required /></div>
    <div><Label for="score">Score</Label><Input id="score" type="number" bind:value={form.score} required /></div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Cancel</Button>
      <Button type="submit">{selected ? 'Update' : 'Create'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Delete Grade" onConfirm={remove} destructive />
