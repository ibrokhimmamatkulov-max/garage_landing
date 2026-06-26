<script setup lang="ts">
import AppIcon from '../AppIcon/index.vue';

defineOptions({
  name: 'AppSelect',
});

export interface SelectOption {
  label: string;
  value: string;
}

const props = defineProps<{
  options: SelectOption[];
  label?: string;
}>();

const model = defineModel<string>({ default: '' });

defineExpose({ props });
</script>

<template>
  <div class="flex flex-col gap-sm">
    <label v-if="label" class="text-[14px] font-semibold text-text-primary">{{ label }}</label>
    <div class="relative">
      <select
        v-model="model"
        class="appearance-none w-full py-3 pl-4 pr-10 text-[14px] text-text-primary bg-bg-card border border-border rounded-radius-sm cursor-pointer transition-colors duration-fast focus:outline-none focus:border-primary"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <span
        class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary"
      >
        <AppIcon name="chevron-down" :size="20" />
      </span>
    </div>
  </div>
</template>
