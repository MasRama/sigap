<script lang="ts">
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';

  let {
    open = $bindable(false),
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
  }: {
    open?: boolean;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  } = $props();

  function handleConfirm(): void {
    open = false;
    onConfirm();
  }

  function handleCancel(): void {
    open = false;
    onCancel?.();
  }
</script>

<Modal bind:open {title} {description} class="max-w-sm">
  <div class="flex justify-end gap-2">
    <Button variant="outline" onclick={handleCancel}>{cancelLabel}</Button>
    <Button variant={destructive ? 'destructive' : 'default'} onclick={handleConfirm}>{confirmLabel}</Button>
  </div>
</Modal>
