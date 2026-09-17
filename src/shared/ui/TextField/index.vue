<script setup lang="ts">
defineOptions({
  name: 'TextField',
});

defineProps<{
  modelValue: string | number | null;
  id?: string;
  type?: string;
  placeholder?: string;
  /** Единица измерения справа в поле: КМ, с., л. */
  suffix?: string;
  inputmode?: 'text' | 'numeric' | 'decimal' | 'tel';
  invalid?: boolean;
  disabled?: boolean;
  maxlength?: number;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :inputmode="inputmode"
      :disabled="disabled"
      :maxlength="maxlength"
      class="w-full rounded-radius-md border bg-surface-paper py-2.5 pl-3.5 text-body text-ink transition-colors duration-fast placeholder:text-ink-ghost focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-sunken"
      :class="[
        invalid
          ? 'border-state-error'
          : 'border-hairline focus:border-brand-ink focus:shadow-focus-brand',
        suffix ? 'pr-14' : 'pr-3.5',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span
      v-if="suffix"
      class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-small font-medium text-ink-soft"
    >
      {{ suffix }}
    </span>
  </div>
</template>
