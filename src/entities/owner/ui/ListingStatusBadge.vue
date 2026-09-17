<script setup lang="ts">
import { computed } from 'vue';
import type { ListingStatus } from '../model/types';

defineOptions({
  name: 'ListingStatusBadge',
});

const props = defineProps<{
  status: ListingStatus;
  size?: 'sm' | 'md';
}>();

/** Цвет несёт смысл: зелёное — работает, жёлтое — ждёт, красное — требует действия */
const MAP: Record<ListingStatus, { label: string; classes: string }> = {
  published: { label: 'Опубликовано', classes: 'bg-brand-tint text-brand-ink' },
  pending: { label: 'На проверке', classes: 'bg-state-warning-tint text-state-warning' },
  rejected: { label: 'Отклонено', classes: 'bg-state-error-tint text-state-error' },
  paused: { label: 'Снято с публикации', classes: 'bg-surface-sunken text-ink-muted' },
  archived: { label: 'В архиве', classes: 'bg-surface-sunken text-ink-soft' },
};

const view = computed(() => MAP[props.status] ?? MAP.archived);
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold"
    :class="[view.classes, size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-2.5 py-1 text-caption']"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
    {{ view.label }}
  </span>
</template>
