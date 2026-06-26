<script setup lang="ts">
defineOptions({
  name: 'AppInput',
});

defineProps<{
  placeholder?: string;
  type?: string;
}>();

const model = defineModel<string>({ default: '' });
</script>

<template>
  <input
    v-model="model"
    class="w-full px-4 py-3 text-[14px] text-text-primary bg-bg-card border border-border rounded-radius-sm transition-colors duration-fast placeholder-text-secondary focus:outline-none focus:border-primary"
    :type="type ?? 'text'"
    :placeholder="placeholder"
  />
</template>
