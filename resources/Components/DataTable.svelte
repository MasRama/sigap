<script lang="ts" generics="T extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils.js';

  type Column = {
    key: keyof T | string;
    label: string;
    class?: string;
    align?: 'left' | 'center' | 'right';
  };

  let {
    columns,
    rows,
    keyField = 'id' as keyof T,
    class: className,
    emptyMessage = 'Tidak ada data',
    rowAction,
  }: {
    columns: Column[];
    rows: T[];
    keyField?: keyof T;
    class?: string;
    emptyMessage?: string;
    rowAction?: Snippet<[T]>;
  } = $props();

  function cellValue(row: T, key: string | keyof T): unknown {
    return row[key as keyof T];
  }

  function alignClass(align?: 'left' | 'center' | 'right'): string {
    switch (align) {
      case 'right': return 'text-right';
      case 'center': return 'text-center';
      default: return 'text-left';
    }
  }
</script>

<div data-slot="data-table" class={cn("overflow-x-auto rounded-lg border border-border bg-card", className)}>
  <table class="w-full text-sm">
    <thead class="bg-secondary/60 border-b border-border">
      <tr>
        {#each columns as col}
          <th class={cn("px-4 py-3 text-left font-mono-accent text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground", alignClass(col.align), col.class)}>
            {col.label}
          </th>
        {/each}
        {#if rowAction}
          <th class="px-4 py-3 text-right font-mono-accent text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">Aksi</th>
        {/if}
      </tr>
    </thead>
    <tbody class="divide-y divide-border">
      {#if rows.length === 0}
        <tr>
          <td colspan={columns.length + (rowAction ? 1 : 0)} class="px-4 py-8 text-center text-sm text-muted-foreground font-body">
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each rows as row (row[keyField])}
          <tr class="hover:bg-secondary/30 transition-colors">
            {#each columns as col}
              <td class={cn("px-4 py-3 text-foreground font-body whitespace-nowrap", alignClass(col.align), col.class)}>
                {String(cellValue(row, col.key) ?? '-')}
              </td>
            {/each}
            {#if rowAction}
              <td class="px-4 py-3 text-right">
                {@render rowAction(row)}
              </td>
            {/if}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
