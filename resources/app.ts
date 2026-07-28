import { createInertiaApp } from '@inertiajs/svelte'
import { mount, type Component } from 'svelte'
import axios from 'axios'
import { configureAxiosCSRF } from '$lib/csrf'
import { ModeWatcher } from 'mode-watcher'
import { Toaster } from 'svelte-sonner'

configureAxiosCSRF(axios)

createInertiaApp({
  resolve: (name: string) => {
    const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true }) as Record<string, { default: Component }>
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App, props }) {
    el!.classList.add('bg-background', 'text-foreground', 'min-h-screen', 'antialiased')
    mount(App, { target: el!, props })

    const portalEl = document.createElement('div')
    portalEl.id = 'inertia-portals'
    document.body.appendChild(portalEl)
    mount(ModeWatcher, { target: portalEl })
    mount(Toaster, { target: portalEl })
  },
})
