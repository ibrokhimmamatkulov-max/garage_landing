<script setup lang="ts">
defineOptions({
  name: 'FormField',
});

/**
 * Подпись сверху, поле снизу — в отличие от макета-референса, где подписи
 * стояли слева узкой колонкой. Причина: на телефоне левые подписи либо
 * обрезаются, либо съедают половину ширины поля, а мобильный тут в приоритете.
 */
defineProps<{
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  for?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="$props.for" class="flex items-center gap-1 text-small font-semibold text-ink">
      {{ label }}
      <span v-if="required" class="text-state-error" aria-hidden="true">*</span>
    </label>

    <slot />

    <p v-if="error" class="text-caption text-state-error">{{ error }}</p>
    <p v-else-if="hint" class="text-caption text-ink-soft">{{ hint }}</p>
  </div>
</template>
