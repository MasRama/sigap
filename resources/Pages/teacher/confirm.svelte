<script lang="ts">
  import { router } from '@inertiajs/svelte';
  import axios from 'axios';
  import { api } from '$lib/api';
  import Header from '../../Components/Header.svelte';
  import CameraCapture from '../../Components/CameraCapture.svelte';
  import GeoButton from '../../Components/GeoButton.svelte';
  import Button from '../../Components/Button.svelte';

  let { scheduleId: initialScheduleId = null }: { scheduleId?: string | null } = $props();
  let scheduleId = $state('');

  $effect(() => {
    if (initialScheduleId && scheduleId !== initialScheduleId) {
      scheduleId = initialScheduleId;
    }
  });
  let photo = $state<string | null>(null);
  let coords = $state<{ latitude: number; longitude: number } | null>(null);
  let geoError = $state<string | null>(null);
  let isLoading = $state(false);

  async function submit(): Promise<void> {
    if (!photo) { geoError = 'Please capture a photo first'; return; }
    if (!coords) { geoError = 'Please share your location'; return; }
    if (!scheduleId) { geoError = 'Schedule ID missing'; return; }
    isLoading = true;
    const result = await api(() => axios.post('/teacher/confirmations', {
      schedule_id: scheduleId,
      photo_url: photo,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
    isLoading = false;
    if (result.success) router.visit('/teacher/schedule', { preserveScroll: true });
  }
</script>

<Header group="teacher" />
<div class="min-h-[100dvh] bg-background text-foreground font-body antialiased pt-28 px-6 sm:px-10 lg:px-16 pb-16">
  <h1 class="font-heading font-semibold tracking-tight text-2xl mb-2">Confirm Attendance</h1>
  <p class="text-sm text-muted-foreground mb-8">Capture a selfie and share your location to verify presence.</p>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <CameraCapture onCapture={(data) => photo = data} />

    <div class="flex flex-col gap-6">
      <div class="rounded-sm border border-border bg-card p-5">
        <p class="font-heading font-medium text-foreground">Location</p>
        {#if coords}
          <p class="text-xs text-muted-foreground mt-1">Lat: {coords.latitude.toFixed(6)}, Lng: {coords.longitude.toFixed(6)}</p>
        {:else}
          <p class="text-xs text-muted-foreground mt-1">Not acquired</p>
        {/if}
        <GeoButton class="mt-4" onLocation={(c) => { coords = c; geoError = null; }} onError={(m) => geoError = m} />
      </div>

      {#if photo}
        <div class="rounded-sm border border-border bg-card p-5">
          <p class="font-heading font-medium text-foreground mb-2">Preview</p>
          <img src={photo} alt="Captured selfie" class="w-full max-w-xs rounded-sm" />
        </div>
      {/if}

      {#if geoError}
        <p class="text-sm text-destructive">{geoError}</p>
      {/if}

      <Button onclick={submit} disabled={isLoading} class="self-start">
        {isLoading ? 'Submitting...' : 'Submit Confirmation'}
      </Button>
    </div>
  </div>
</div>
