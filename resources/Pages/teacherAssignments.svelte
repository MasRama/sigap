<script lang="ts">
  import { router } from '@inertiajs/svelte';
  import axios from 'axios';
  import { api } from '$lib/api';
  import Sidebar from '../Components/Sidebar.svelte';
  import Button from '../Components/Button.svelte';
  import Select from '../Components/Select.svelte';
  import Label from '../Components/Label.svelte';
  import type { AcademicYear, Class, Teacher, TeacherClassAssignment } from '../types';
  import { ArrowRight, Check, Save, UserRound } from '@lucide/svelte';
  import { fly } from 'svelte/transition';

  interface Props {
    permissions: { canEdit?: boolean };
    teachers?: Teacher[];
    classes?: Class[];
    years?: AcademicYear[];
    assignments?: TeacherClassAssignment[];
    selectedYearId?: string;
  }

  let {
    permissions,
    teachers = [],
    classes = [],
    years = [],
    assignments = [],
    selectedYearId = '',
  }: Props = $props();

  let currentYearId = $state(selectedYearId);
  let selectedTeacherId = $state(teachers[0]?.id ?? '');
  let assignedClassIds = $state<string[]>([]);
  let homeroomClassId = $state('');
  let isSaving = $state(false);

  const selectedTeacher = $derived(teachers.find(teacher => teacher.id === selectedTeacherId));
  const selectedAssignments = $derived(assignments.filter(assignment => assignment.teacher_id === selectedTeacherId));

  $effect(() => {
    assignedClassIds = selectedAssignments.map(assignment => assignment.class_id);
    homeroomClassId = selectedAssignments.find(assignment => assignment.is_homeroom === 1)?.class_id ?? '';
  });

  function teacherName(teacher: Teacher): string {
    return teacher.user_name || teacher.user_username || 'Guru tanpa nama';
  }

  function toggleClass(classId: string): void {
    if (assignedClassIds.includes(classId)) {
      assignedClassIds = assignedClassIds.filter(id => id !== classId);
      if (homeroomClassId === classId) homeroomClassId = '';
      return;
    }
    assignedClassIds = [...assignedClassIds, classId];
  }

  function setHomeroom(classId: string): void {
    if (assignedClassIds.includes(classId)) homeroomClassId = classId;
  }

  function changeYear(event: Event): void {
    const value = (event.currentTarget as HTMLSelectElement).value;
    if (!value || value === currentYearId) return;
    router.visit(`/teacher-assignments?academic_year_id=${encodeURIComponent(value)}`, { preserveScroll: true });
  }

  async function submit(): Promise<void> {
    if (!selectedTeacherId || !currentYearId || isSaving) return;
    isSaving = true;
    const result = await api(() => axios.post(`/teacher-assignments/${selectedTeacherId}`, {
      academic_year_id: currentYearId,
      assignments: assignedClassIds.map(classId => ({
        class_id: classId,
        is_homeroom: classId === homeroomClassId,
      })),
    }));
    isSaving = false;
    if (result.success) {
      router.visit(`/teacher-assignments?academic_year_id=${encodeURIComponent(currentYearId)}`, { preserveScroll: true });
    }
  }
</script>

<Sidebar group="teacher-assignments" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-20 lg:pt-8 lg:pl-80 px-6 sm:px-10 lg:pr-16 pb-16">
  <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10" in:fly={{ y: 20, duration: 800 }}>
    <div>
      <p class="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Data Master · Guru</p>
      <h1 class="font-heading font-semibold tracking-[-0.03em] leading-[1] text-[clamp(2rem,5vw,3.5rem)] text-foreground">
        Penugasan Guru.
      </h1>
      <p class="mt-4 text-base text-muted-foreground leading-relaxed max-w-[60ch]">
        Tentukan kelas yang diampu setiap guru. Satu guru dapat ditetapkan sebagai wali kelas untuk satu kelas pada setiap tahun ajaran.
      </p>
    </div>
    <div class="flex items-center gap-3 min-w-56">
      <Label for="academic-year" class="sr-only">Tahun ajaran</Label>
      <Select id="academic-year" bind:value={currentYearId} onchange={changeYear} placeholder="Pilih tahun ajaran">
        {#each years as year}<option value={year.id}>{year.name}</option>{/each}
      </Select>
    </div>
  </div>

  {#if !permissions.canEdit}
    <div class="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">Halaman ini hanya dapat diakses admin.</div>
  {:else if teachers.length === 0}
    <div class="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">Belum ada data guru. Tambahkan guru dari menu Guru terlebih dahulu.</div>
  {:else}
    <div class="grid grid-cols-1 xl:grid-cols-[minmax(15rem,22rem)_1fr] gap-6">
      <section class="rounded-lg border border-border bg-card overflow-hidden">
        <div class="px-5 py-4 border-b border-border">
          <p class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Daftar Guru</p>
          <p class="mt-1 text-sm text-muted-foreground">Pilih guru untuk mengatur kelas.</p>
        </div>
        <div class="divide-y divide-border">
          {#each teachers as teacher (teacher.id)}
            <button
              type="button"
              class={`w-full text-left px-5 py-4 transition-colors cursor-pointer ${selectedTeacherId === teacher.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/40'}`}
              aria-pressed={selectedTeacherId === teacher.id}
              onclick={() => selectedTeacherId = teacher.id}
            >
              <span class="flex items-center gap-3">
                <span class={`flex items-center justify-center h-8 w-8 rounded-full border ${selectedTeacherId === teacher.id ? 'border-primary/40 bg-primary/15' : 'border-border bg-secondary/50'}`}>
                  <UserRound class="h-4 w-4" />
                </span>
                <span class="min-w-0">
                  <span class="block truncate font-medium">{teacherName(teacher)}</span>
                  <span class="block truncate text-xs text-muted-foreground">{teacher.employee_id || teacher.user_username || 'NIP belum diisi'}</span>
                </span>
              </span>
              <span class="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{assignments.filter(assignment => assignment.teacher_id === teacher.id).length} kelas diampu</span>
                {#if assignments.some(assignment => assignment.teacher_id === teacher.id && assignment.is_homeroom === 1)}<span class="text-primary">Wali kelas</span>{/if}
              </span>
            </button>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border border-border bg-card p-5 sm:p-7">
        {#if selectedTeacher}
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
            <div>
              <p class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Pengaturan penugasan</p>
              <h2 class="font-heading text-2xl font-semibold tracking-[-0.02em]">{teacherName(selectedTeacher)}</h2>
              <p class="mt-1 text-sm text-muted-foreground">@{selectedTeacher.user_username || 'Username belum tersedia'}</p>
            </div>
            <Button onclick={submit} disabled={isSaving}>
              <Save class="h-4 w-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Penugasan'}
            </Button>
          </div>

          <div class="rounded-md border border-border bg-secondary/20 px-4 py-3 mb-6 text-sm text-muted-foreground">
            Pilih semua kelas yang diampu. Tandai satu kelas sebagai <strong class="text-foreground">wali kelas</strong> jika guru ini menjadi wali kelasnya.
          </div>

          {#if classes.length === 0}
            <div class="py-10 text-center text-muted-foreground">Belum ada kelas pada tahun ajaran ini.</div>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              {#each classes as classItem (classItem.id)}
                {@const assigned = assignedClassIds.includes(classItem.id)}
                <div class={`rounded-md border p-4 transition-colors ${assigned ? 'border-primary/50 bg-primary/5' : 'border-border bg-background'}`}>
                  <button type="button" class="w-full text-left cursor-pointer" onclick={() => toggleClass(classItem.id)} aria-pressed={assigned}>
                    <span class="flex items-start gap-3">
                      <span class={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${assigned ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                        {#if assigned}<Check class="h-3.5 w-3.5" />{/if}
                      </span>
                      <span>
                        <span class="block font-medium">{classItem.name}</span>
                        <span class="block text-xs text-muted-foreground">Tingkat {String(classItem.grade).replace(/\.0$/, '')}</span>
                      </span>
                    </span>
                  </button>
                  {#if assigned}
                    <button type="button" class={`mt-3 inline-flex items-center gap-1.5 text-xs cursor-pointer ${homeroomClassId === classItem.id ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`} onclick={() => setHomeroom(classItem.id)} aria-pressed={homeroomClassId === classItem.id}>
                      <span class={`h-3 w-3 rounded-full border ${homeroomClassId === classItem.id ? 'border-primary bg-primary ring-2 ring-primary/20' : 'border-border'}`}></span>
                      {homeroomClassId === classItem.id ? 'Wali kelas' : 'Jadikan wali kelas'}
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <div class="py-10 text-center text-muted-foreground">Pilih guru untuk mulai mengatur penugasan.</div>
        {/if}
      </section>
    </div>

    <div class="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
      <ArrowRight class="h-4 w-4 text-primary" />
      <span>Guru dapat mengelola nilai hanya pada kelas yang ditugaskan.</span>
    </div>
  {/if}
</div>
