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
  import type { Journal, JournalForm, Schedule, TeacherConfirmation } from '../types';
  import { createEmptyJournalForm, journalToForm } from '../types';
  import { Pencil, Trash2 } from '@lucide/svelte';

  let { permissions, journals = [], schedules = [], confirmations = [] }: { permissions: { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }; journals?: Journal[]; schedules?: Schedule[]; confirmations?: TeacherConfirmation[] } = $props();

  let isOpen = $state(false);
  let isDeleteOpen = $state(false);
  let form: JournalForm = $state(createEmptyJournalForm());
  let selected: Journal | null = $state(null);

  function openCreate(): void { form = createEmptyJournalForm(); selected = null; isOpen = true; }
  function openEdit(item: Journal): void { selected = item; form = journalToForm(item); isOpen = true; }
  function confirmDelete(item: Journal): void { selected = item; isDeleteOpen = true; }

  async function submit(): Promise<void> {
    const result = selected
      ? await api(() => axios.put(`/journals/${selected!.id}`, form))
      : await api(() => axios.post('/journals', form));
    if (result.success) { isOpen = false; router.visit('/journals', { preserveScroll: true }); }
  }
  async function remove(): Promise<void> {
    if (!selected) return;
    const result = await api(() => axios.delete(`/journals/${selected!.id}`));
    if (result.success) { isDeleteOpen = false; router.visit('/journals', { preserveScroll: true }); }
  }

  const columns = [{ key: 'schedule_id', label: 'Schedule' }, { key: 'date', label: 'Date' }, { key: 'material', label: 'Material' }];
</script>

{#snippet rowActions(item: Journal)}
  {#if permissions.canEdit}<Button variant="ghost" size="icon" onclick={() => openEdit(item)}><Pencil class="w-4 h-4" /></Button>{/if}
  {#if permissions.canDelete}<Button variant="ghost" size="icon" onclick={() => confirmDelete(item)}><Trash2 class="w-4 h-4 text-destructive" /></Button>{/if}
{/snippet}

<Header group="journals" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <div class="flex items-center justify-between mb-8">
    <h1 class="font-heading font-semibold tracking-tight text-2xl">Journals</h1>
    {#if permissions.canCreate}<Button onclick={openCreate}>Add Journal</Button>{/if}
  </div>
  <DataTable {columns} rows={journals} rowAction={rowActions} />
</div>

<Modal bind:open={isOpen} title={selected ? 'Edit Journal' : 'Add Journal'}>
  <form class="flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div><Label for="schedule">Schedule</Label>
      <select id="schedule" bind:value={form.schedule_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each schedules as s}<option value={s.id}>{s.class_id} · {s.subject_id}</option>{/each}
      </select>
    </div>
    <div><Label for="confirmation">Confirmation</Label>
      <select id="confirmation" bind:value={form.teacher_confirmation_id} class="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm">
        {#each confirmations as c}<option value={c.id}>{new Date(c.confirmed_at).toLocaleString()}</option>{/each}
      </select>
    </div>
    <div><Label for="date">Date</Label><Input id="date" type="number" bind:value={form.date} required /></div>
    <div><Label for="material">Material</Label><Input id="material" bind:value={form.material} required /></div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" onclick={() => isOpen = false}>Cancel</Button>
      <Button type="submit">{selected ? 'Update' : 'Create'}</Button>
    </div>
  </form>
</Modal>

<ConfirmDialog bind:open={isDeleteOpen} title="Delete Journal" onConfirm={remove} destructive />
