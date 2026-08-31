<script lang="ts">
  import { inertia, router } from '@inertiajs/svelte'
  import axios from 'axios'
  import { api } from '$lib/api'
  import { Toast } from '$lib/toast'
  import DarkModeToggle from '../../Components/DarkModeToggle.svelte'
  import { fly, fade } from 'svelte/transition'
  import { ArrowRight, Eye, EyeOff } from '@lucide/svelte'

  import Button from '../../Components/Button.svelte'
  import Input from '../../Components/Input.svelte'
  import Label from '../../Components/Label.svelte'

  interface LoginForm {
    username: string
    password: string
  }

  let form: LoginForm = $state({ username: '', password: '' })
  let showPassword = $state(false)
  let isLoading = $state(false)

  let { error }: { error?: string } = $props()

  $effect(() => {
    if (error) Toast(error, 'error')
  })

  async function submitForm(): Promise<void> {
    isLoading = true
    const result = await api(() => axios.post('/login', { username: form.username, password: form.password }))
    isLoading = false
    if (result.success) router.visit('/dashboard')
  }
</script>

<div class="min-h-[100dvh] bg-secondary/30 text-foreground font-body antialiased selection:bg-primary/20 selection:text-primary flex flex-col">

  <!-- Top bar -->
  <nav class="flex items-center justify-between h-16 px-6 sm:px-10 shrink-0">
    <a href="/" use:inertia class="flex items-center gap-3 group">
      <span class="inline-flex items-center justify-center w-7 h-7 bg-primary rounded-md">
        <span class="w-2.5 h-2.5 bg-primary-foreground rounded-[2px] transition-transform duration-300 group-hover:scale-110"></span>
      </span>
      <span class="font-heading font-semibold tracking-tight text-lg">SIMPATIK</span>
    </a>
    <div class="flex items-center gap-4">
      <a href="/" use:inertia class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        Beranda
      </a>
      <span class="w-px h-4 bg-border"></span>
      <DarkModeToggle />
    </div>
  </nav>

  <!-- Centered ledger card -->
  <div class="flex-1 flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-[440px]" in:fly={{ y: 20, duration: 700, delay: 100 }}>

      <article class="bg-card border border-border rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.06)]">

        <!-- Card header bar -->
        <header class="px-6 py-4 border-b border-border bg-secondary/60 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span class="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Masuk ke akun</span>
          </div>
          <span class="font-mono-accent text-[10px] text-muted-foreground">SIMPATIK</span>
        </header>

        <!-- Card body -->
        <div class="px-6 py-6">
          <h2 class="font-heading text-xl font-semibold tracking-[-0.02em] text-foreground mb-1">
            Selamat datang kembali.
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed mb-6">
            Masuk dengan akun yang dibuat admin sekolah Anda.
          </p>

          <!-- Error alert -->
          {#if error}
            <div in:fade={{ duration: 200 }} role="alert" class="mb-5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-start gap-3">
              <span class="w-2 h-2 rounded-full bg-destructive shrink-0 mt-1.5"></span>
              <span class="text-sm text-destructive leading-relaxed">{error}</span>
            </div>
          {/if}

          <!-- Form -->
          <form class="flex flex-col gap-5" onsubmit={(e) => { e.preventDefault(); submitForm() }}>

            <!-- Username -->
            <div class="flex flex-col gap-2">
              <Label for="username" class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Username
              </Label>
              <Input
                bind:value={form.username}
                required
                type="text"
                name="username"
                id="username"
                placeholder="username Anda"
                class="h-11 rounded-md text-sm"
              />
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-2">
              <Label for="password" class="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Kata Sandi
              </Label>
              <div class="relative">
                <Input
                  bind:value={form.password}
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  class="h-11 rounded-md text-sm pr-10"
                />
                <button
                  type="button"
                  onclick={() => (showPassword = !showPassword)}
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {#if showPassword}
                    <EyeOff class="w-4 h-4" />
                  {:else}
                    <Eye class="w-4 h-4" />
                  {/if}
                </button>
              </div>
            </div>

            <!-- Submit -->
            <div class="pt-1">
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                class="w-full h-11 rounded-md justify-center"
              >
                {#if isLoading}
                  Memproses...
                {:else}
                  Masuk
                  <ArrowRight class="w-4 h-4" />
                {/if}
              </Button>
            </div>
          </form>
        </div>

        <!-- Card footer bar -->
        <footer class="px-6 py-4 border-t border-border bg-secondary/30 flex items-center justify-between">
          <span class="text-xs text-muted-foreground">Belum punya akun?</span>
          <span class="text-xs text-foreground font-medium">Hubungi admin sekolah</span>
        </footer>
      </article>

      <!-- Below card note -->
      <p class="mt-5 text-center font-mono-accent text-[10px] text-muted-foreground">
        SIMPATIK tidak menyediakan pendaftaran publik &middot; MIT License
      </p>
    </div>
  </div>

  <!-- Bottom bar -->
  <footer class="shrink-0 px-6 sm:px-10 py-4 flex items-center justify-between">
    <span class="font-mono-accent text-[10px] text-muted-foreground">&copy; {new Date().getFullYear()} SIMPATIK</span>
    <span class="font-mono-accent text-[10px] text-muted-foreground">Trust-first school management</span>
  </footer>
</div>
