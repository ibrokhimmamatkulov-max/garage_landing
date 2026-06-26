<script setup lang="ts">
defineOptions({
  name: 'AppBadge',
});

defineProps<{
  dismissible?: boolean;
}>();

defineEmits<{
  dismiss: [];
}>();
</script>

<template>
  <span
    class="inline-flex items-center gap-xs px-3 py-[0.375rem] text-sm text-text-primary bg-white/90 rounded-radius-sm backdrop-blur-[4px]"
  >
    <button
      v-if="dismissible"
      class="text-[0.875rem] leading-none text-text-secondary cursor-pointer"
      aria-label="Закрыть"
      @click="$emit('dismiss')"
    >
      ×
    </button>
    <slot />
  </span>
</template>
