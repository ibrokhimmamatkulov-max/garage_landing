<script setup lang="ts">
defineOptions({
  name: 'NativeSelect',
});

/**
 * Родной <select>, а не кастомная выпадашка.
 *
 * В форме создания объявления полтора десятка списков подряд. На телефоне
 * родной селект открывает системное колесо выбора — оно быстрее и привычнее
 * любой самописной панели, и не ломается на слабых устройствах.
 */
defineProps<{
  modelValue: string | number | null;
  options: Array<{ id: string | number; name: string }>;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="relative">
    <select
      :id="id"
      :value="modelValue ?? ''"
      :disabled="disabled"
      class="w-full appearance-none rounded-radius-md border bg-surface-paper py-2.5 pl-3.5 pr-10 text-body text-ink transition-colors duration-fast focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
      :class="
        invalid
          ? 'border-state-error'
          : 'border-hairline focus:border-brand-ink focus:shadow-focus-brand'
      "
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>{{ placeholder ?? 'Выберите из списка' }}</option>
      <option v-for="opt in options" :key="opt.id" :value="opt.id">{{ opt.name }}</option>
    </select>

    <svg
      class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>
