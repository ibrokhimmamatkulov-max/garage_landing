<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'AppButton',
});

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
);

const buttonClasses = computed(() => {
  return [
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-fast whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
    props.variant === 'primary'
      ? 'bg-primary text-white border-2 border-primary hover:enabled:bg-primary-hover hover:enabled:border-primary-hover'
      : 'bg-transparent text-text-primary border-2 border-border hover:enabled:border-text-secondary',
    props.size === 'sm'
      ? 'px-4 py-1.5 text-sm'
      : props.size === 'md'
        ? 'px-6 py-2.5 text-base'
        : 'px-8 py-3.5 text-md w-full',
  ];
});
</script>

<template>
  <button :class="buttonClasses" :disabled="disabled">
    <slot />
  </button>
</template>
