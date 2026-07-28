<script lang="ts">
  import { inertia, page } from '@inertiajs/svelte';
  import { fly, fade } from 'svelte/transition';
  import DarkModeToggle from '../Components/DarkModeToggle.svelte';
  import Button from '../Components/Button.svelte';
  import { ArrowRight, Shield, BookOpen, GraduationCap, Users, MapPin } from '@lucide/svelte';

  interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
  }

  let user = page.props.user as User | undefined;
  let scrollY = $state(0);
  let scrolled = $derived(scrollY > 40);
</script>

<svelte:window bind:scrollY />

<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden">
  <nav
    class="fixed top-0 inset-x-0 z-50 flex items-center justify-between h-16 px-6 sm:px-10 lg:px-16 transition-all duration-500 {scrolled
      ? 'bg-background/85 backdrop-blur-md border-b border-border'
      : 'bg-transparent border-b border-transparent'}"
  >
    <a href="/" use:inertia class="flex items-center gap-2 group">
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-125"></span>
      <span class="font-heading font-semibold tracking-tight text-lg">SIGAP</span>
    </a>

    <div class="flex items-center gap-5 text-sm">
      {#if user}
        <a href="/dashboard" use:inertia class="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
      {:else}
        <a href="/login" use:inertia class="text-muted-foreground hover:text-foreground transition-colors">Sign in</a>
      {/if}
      <span class="w-px h-4 bg-border"></span>
      <DarkModeToggle />
    </div>
  </nav>

  <header class="relative min-h-[100dvh] flex items-end pt-24 pb-12 px-6 sm:px-10 lg:px-16 overflow-hidden">
    <div class="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px] text-foreground"></div>

    <div class="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-end">
      <div class="lg:col-span-7 flex flex-col gap-8">
        <p in:fade={{ duration: 700 }} class="font-heading text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Trust-first school management
        </p>

        <h1
          in:fly={{ y: 24, duration: 900, delay: 120 }}
          class="font-heading font-semibold tracking-[-0.03em] leading-[0.98] text-[clamp(2.75rem,8vw,6.5rem)] text-foreground"
        >
          Calm, clear,<br />
          <span class="italic font-medium text-primary leading-[1.05] pb-1">accountable</span><br />
          classrooms.
        </h1>

        <p in:fly={{ y: 20, duration: 900, delay: 260 }} class="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-[52ch]">
          SIGAP helps schools manage attendance, teacher journals, and academic grades with camera and location verification — so every record is trustworthy.
        </p>

        <div in:fly={{ y: 18, duration: 900, delay: 400 }} class="flex flex-wrap items-center gap-5 pt-2">
          {#if user}
            <a href="/dashboard" use:inertia>
              <Button size="lg" class="rounded-full px-7 h-12 text-sm normal-case tracking-normal font-heading font-medium">
                Go to dashboard
                <ArrowRight class="w-4 h-4" />
              </Button>
            </a>
          {:else}
            <a href="/login" use:inertia>
              <Button size="lg" class="rounded-full px-7 h-12 text-sm normal-case tracking-normal font-heading font-medium">
                Sign in
                <ArrowRight class="w-4 h-4" />
              </Button>
            </a>
          {/if}
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div in:fly={{ y: 30, duration: 1100, delay: 300 }} class="relative aspect-[4/3] w-full max-w-md ml-auto overflow-hidden rounded-sm bg-muted">
          <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
            <Shield class="w-24 h-24 text-primary/40" />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          <p class="absolute bottom-4 left-4 right-4 font-heading text-[11px] uppercase tracking-[0.2em] text-white/80">
            Verified by camera + location
          </p>
        </div>
      </div>
    </div>
  </header>

  <section class="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 border-t border-border">
    <div class="max-w-[1400px] mx-auto">
      <div class="mb-14 max-w-[60ch]">
        <h2 class="font-heading font-semibold tracking-[-0.02em] leading-[1.05] text-[clamp(2rem,4vw,3rem)] text-foreground">
          Built for the real rhythm of a school.
        </h2>
        <p class="mt-4 text-muted-foreground leading-relaxed">Four flows that keep administration honest and effortless.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <article class="flex flex-col justify-between p-7 rounded-sm border border-border bg-card">
          <MapPin class="w-7 h-7 text-primary" />
          <div class="mt-6">
            <h3 class="font-heading font-semibold text-lg tracking-tight">Anti-fraud check-in</h3>
            <p class="mt-2 text-sm text-muted-foreground leading-relaxed">Teachers confirm presence with a selfie and live geolocation before class.</p>
          </div>
        </article>

        <article class="flex flex-col justify-between p-7 rounded-sm border border-border bg-card">
          <BookOpen class="w-7 h-7 text-primary" />
          <div class="mt-6">
            <h3 class="font-heading font-semibold text-lg tracking-tight">Digital journals</h3>
            <p class="mt-2 text-sm text-muted-foreground leading-relaxed">Record material, attendance, and notes for every session in one place.</p>
          </div>
        </article>

        <article class="flex flex-col justify-between p-7 rounded-sm border border-border bg-card">
          <GraduationCap class="w-7 h-7 text-primary" />
          <div class="mt-6">
            <h3 class="font-heading font-semibold text-lg tracking-tight">Academic grades</h3>
            <p class="mt-2 text-sm text-muted-foreground leading-relaxed">Track assignments, quizzes, exams, and reports by class and subject.</p>
          </div>
        </article>

        <article class="flex flex-col justify-between p-7 rounded-sm border border-border bg-card">
          <Users class="w-7 h-7 text-primary" />
          <div class="mt-6">
            <h3 class="font-heading font-semibold text-lg tracking-tight">Parent insight</h3>
            <p class="mt-2 text-sm text-muted-foreground leading-relaxed">Parents see their children's attendance and grades in real time.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <footer class="border-t border-border">
    <div class="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div class="flex items-center gap-2">
        <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
        <span class="font-heading font-semibold tracking-tight">SIGAP</span>
        <span class="text-xs text-muted-foreground ml-3">Trust-first school management</span>
      </div>
      <div class="text-xs text-muted-foreground">&copy; {new Date().getFullYear()}</div>
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  @media (prefers-reduced-motion: reduce) {
    :global(html) {
      scroll-behavior: auto;
    }
  }
</style>
