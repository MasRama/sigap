<script lang="ts">
  import { page, router, inertia } from '@inertiajs/svelte';
  import axios from 'axios';
  import { api } from '$lib/api';
  import DarkModeToggle from './DarkModeToggle.svelte';
  import * as dialog from "@zag-js/dialog";
  import { useMachine, normalizeProps, portal } from "@zag-js/svelte";
  import {
    Menu, LogOut, LayoutDashboard, CalendarCheck, BookOpen, GraduationCap,
    Users, ChartColumn, Calendar, School, BookMarked, UserCheck, UserCog,
    CalendarClock, MapPin, Shield, User,
  } from '@lucide/svelte';

  interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
  }

  interface MenuLink {
    href: string;
    label: string;
    group: string;
    icon: typeof LayoutDashboard;
    show: boolean;
  }

  let { group }: { group: string } = $props();

  let user = $derived(page.props.user as User | undefined);
  let isMenuOpen = $state(false);

  const sheetService = useMachine(dialog.machine, {
    id: "mobile-sidebar",
    get open() { return isMenuOpen; },
    onOpenChange(details) { isMenuOpen = details.open; },
  });
  const sheetApi = $derived(dialog.connect(sheetService, normalizeProps));

  function hasPermission(slug: string): boolean {
    if (!user) return false;
    if (user.roles?.includes('admin')) return true;
    return user.permissions?.includes(slug) ?? false;
  }

  let menuLinks = $derived([
    { href: '/dashboard', label: 'Dashboard', group: 'dashboard', icon: LayoutDashboard, show: true },
    { href: '/teacher/schedule', label: 'Jadwal Mengajar', group: 'teacher', icon: CalendarCheck, show: hasPermission('schedules.view') },
    { href: '/journals', label: 'Jurnal', group: 'journals', icon: BookOpen, show: hasPermission('journals.view') },
    { href: '/grades', label: 'Nilai', group: 'grades', icon: GraduationCap, show: hasPermission('grades.view') },
    { href: '/parent/dashboard', label: 'Anak Saya', group: 'parent', icon: Users, show: hasPermission('students.view') && user?.roles?.includes('parent') },
    { href: '/headmaster/dashboard', label: 'Laporan', group: 'headmaster', icon: ChartColumn, show: hasPermission('headmaster.view') },
    { href: '/academic-years', label: 'Tahun Ajaran', group: 'academic-years', icon: Calendar, show: hasPermission('academic_years.view') },
    { href: '/classes', label: 'Kelas', group: 'classes', icon: School, show: hasPermission('classes.view') },
    { href: '/subjects', label: 'Mapel', group: 'subjects', icon: BookMarked, show: hasPermission('subjects.view') },
    { href: '/students', label: 'Siswa', group: 'students', icon: UserCheck, show: hasPermission('students.view') },
    { href: '/teachers', label: 'Guru', group: 'teachers', icon: UserCog, show: hasPermission('teachers.view') },
    { href: '/parents', label: 'Orang Tua', group: 'parents', icon: Users, show: hasPermission('parents.view') },
    { href: '/schedules', label: 'Jadwal Sekolah', group: 'schedules', icon: CalendarClock, show: hasPermission('schedules.view') },
    { href: '/school-locations', label: 'Lokasi', group: 'school-locations', icon: MapPin, show: hasPermission('school_locations.view') },
    { href: '/users', label: 'Pengguna', group: 'users', icon: Users, show: hasPermission('users.view') },
    { href: '/roles', label: 'Peran', group: 'roles', icon: Shield, show: hasPermission('roles.view') },
    { href: '/profile', label: 'Profil', group: 'profile', icon: User, show: !!user },
  ] as MenuLink[]);

  let visibleMenuLinks = $derived(menuLinks.filter((item) => item.show));

  async function handleLogout(): Promise<void> {
    const result = await api(() => axios.post('/logout'));
    if (result.success) router.visit('/login');
  }
</script>

<!-- ───────────── MOBILE TOP BAR ───────────── -->
<div class="lg:hidden fixed inset-x-0 top-0 z-40 h-16 bg-background border-b border-border flex items-center justify-between px-4">
  <button {...sheetApi.getTriggerProps()} aria-label="Buka menu" class="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
    <Menu class="h-5 w-5" />
  </button>
  <a href="/" use:inertia class="flex items-center gap-2">
    <span class="inline-flex items-center justify-center w-7 h-7 bg-primary rounded-md">
      <span class="w-2.5 h-2.5 bg-primary-foreground rounded-[2px]"></span>
    </span>
    <span class="font-heading font-semibold tracking-tight text-lg">SIGAP</span>
  </a>
  <DarkModeToggle />
</div>

<!-- ───────────── MOBILE DRAWER ───────────── -->
{#if sheetApi.open}
  <div use:portal>
    <div {...sheetApi.getBackdropProps()} class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"></div>
    <div {...sheetApi.getPositionerProps()}>
      <div {...sheetApi.getContentProps()} class="bg-background fixed inset-y-0 left-0 z-50 h-full w-[80%] max-w-[280px] border-r border-border flex flex-col transition ease-in-out duration-300 font-body">
        <!-- Drawer header -->
        <div class="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <a href="/" use:inertia onclick={() => isMenuOpen = false} class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-7 h-7 bg-primary rounded-md">
              <span class="w-2.5 h-2.5 bg-primary-foreground rounded-[2px]"></span>
            </span>
            <span class="font-heading font-semibold tracking-tight text-lg">SIGAP</span>
          </a>
          <button {...sheetApi.getCloseTriggerProps()} aria-label="Tutup menu" class="text-muted-foreground hover:text-foreground transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <!-- Drawer nav -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          {#each visibleMenuLinks as item}
            <a
              href={item.href}
              use:inertia
              onclick={() => isMenuOpen = false}
              class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
                {item.group === group
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}"
            >
              <item.icon class="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </a>
          {/each}
        </nav>
        <!-- Drawer footer -->
        <div class="shrink-0 border-t border-border p-4">
          {#if user}
            <div class="flex items-center gap-3 mb-3">
              <div class="flex w-9 h-9 shrink-0 rounded-full bg-muted border border-border items-center justify-center">
                <span class="text-xs font-heading font-medium text-foreground">{user.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-heading font-semibold tracking-tight truncate">{user.name}</p>
                <p class="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button onclick={handleLogout} class="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer">
              <LogOut class="h-4 w-4" />
              Keluar
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- ───────────── DESKTOP SIDEBAR ───────────── -->
<aside class="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 bg-background border-r border-border flex-col">

  <!-- Logo -->
  <div class="h-16 shrink-0 flex items-center gap-2 px-6 border-b border-border">
    <span class="inline-flex items-center justify-center w-7 h-7 bg-primary rounded-md">
      <span class="w-2.5 h-2.5 bg-primary-foreground rounded-[2px]"></span>
    </span>
    <span class="font-heading font-semibold tracking-tight text-lg">SIGAP</span>
  </div>

  <!-- Nav links -->
  <nav class="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
    {#each visibleMenuLinks as item}
      <a
        href={item.href}
        use:inertia
        class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
          {item.group === group
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}"
      >
        <item.icon class="w-4 h-4 shrink-0" />
        <span>{item.label}</span>
        {#if item.group === group}
          <span class="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Footer: user + dark mode + logout -->
  <div class="shrink-0 border-t border-border p-4">
    <div class="flex items-center gap-3 mb-3">
      <div class="flex w-9 h-9 shrink-0 rounded-full bg-muted border border-border items-center justify-center">
        <span class="text-xs font-heading font-medium text-foreground">{user?.name.slice(0, 2).toUpperCase() ?? ''}</span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-heading font-semibold tracking-tight truncate">{user?.name ?? ''}</p>
        <p class="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button onclick={handleLogout} class="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer">
        <LogOut class="h-3.5 w-3.5" />
        Keluar
      </button>
      <DarkModeToggle />
    </div>
  </div>
</aside>
