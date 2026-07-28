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
  import type { Schedule, ScheduleForm, Class, Subject, AcademicYear, User } from '../types';
  import { createEmptyScheduleForm, scheduleToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';

  let { permissions, schedules = [], classes = [], subjects = [], teachers = [], years = [] }: { permissions: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }; schedules?: Schedule[]; classes?: Class[]; subjects?: Subject[]; teachers?: User[]; years?: AcademicYear[] } = $props();

  let isOpen = $state(false);
  let isDeleteOpen = $state(false);
  let form: ScheduleForm = $state(createEmptyScheduleForm());
  let selected: Schedule | null = $state(null);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  function openCreate(): void { form = createEmptyScheduleForm(); selected = null; isOpen = true; }
  function openEdit(item: Schedule): void { selected = item; form = scheduleToForm(item); isOpen = true; }
  function confirmDelete(item: Schedule): void { selected = item; isDeleteOpen = true; }

  async function submit(): Promise<void> {
    const result = selected
      ? await api(() => axios.put(`/schedules/${selected!.id}`, form))
      : await api(() => axios.post('/schedules', form));
    if (result.success) { isOpen = false; router.visit('/schedules', { preserveScroll: true }); }
  }
  async function remove(): Promise<void> {
    if (!selected) return;
    const result = await api(() => axios.delete(`/schedules/${selected!.id}`));
    if (result.success) { isDeleteOpen = false; router.visit('/schedules', { preserveScroll: true }); }
  }

  const columns = [{ key: 'day_of_week', label: 'Hari' }, { key: 'start_time', label: 'Mulai' }, { key: 'end_time', label: 'Selesai' }, { key: 'class_id', label: 'Kelas' }, { key: 'subject_id', label: 'Mapel' }, { key: 'teacher_user_id', label: 'Guru' }];
</script>

{#snippet rowActions(item: Schedule)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Sidebar group="schedules" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div class="flex items-center justify-between mb-8">
    <h1 class="font-heading font-semibold tracking-tight text-2xl">Jadwal</h1>
    {#if permissions.canCreate}<Button onclick={openCreate}>Tambah Jadwal</Button>{/if}
  </div>
  <DataTable {columns} rows={schedules} rowAction={rowActions} />
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Jadwal' : 'Tambah Jadwal'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="day">Hari</Label>
      <select id="day" bind:value={form.day_of_week} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each days as day, i}<option value={i}>{day}</option>{/each}
      </select>
    </div>
    <div><Label for="start">Mulai (timestamp)</Label><Input id="start" type="number" bind:value={form.start_time} required /></div>
    <div><Label for="end">Selesai (timestamp)</Label><Input id="end" type="number" bind:value={form.end_time} required /></div>
    <div><Label for="class">Kelas</Label>
      <select id="class" bind:value={form.class_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each classes as c}<option value={c.id}>{c.name}</option>{/each}
      </select>
    </div>
    <div><Label for="subject">Mapel</Label>
      <select id="subject" bind:value={form.subject_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each subjects as s}<option value={s.id}>{s.name}</option>{/each}
      </select>
    </div>
    <div><Label for="teacher">Guru</Label>
      <select id="teacher" bind:value={form.teacher_user_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each teachers as t}<option value={t.id}>{t.name}</option>{/each}
      </select>
    </div>
    <div><Label for="year">Tahun Ajaran</Label>
      <select id="year" bind:value={form.academic_year_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each years as y}<option value={y.id}>{y.name}</option>{/each}
      </select>
    </div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Batal</Button>
      <Button type="submit">{selected ? 'Perbarui' : 'Buat'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Hapus Jadwal" onConfirm={remove} destructive />
