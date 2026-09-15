<script setup lang="ts">
import { computed } from 'vue';
import type { IconName } from './types';
import { ICON_COMPONENTS, CUSTOM_ICON_PATHS, FILL_BASED_ICONS } from './icons';

defineOptions({
  name: 'AppIcon',
});

const props = withDefaults(
  defineProps<{
    name: IconName;
    size?: number;
    color?: string;
  }>(),
  {
    size: 24,
    color: 'currentColor',
  },
);

const isLibraryComponent = computed(() => {
  return ICON_COMPONENTS[props.name] !== null && ICON_COMPONENTS[props.name] !== undefined;
});

const libraryComponent = computed(() => {
  return ICON_COMPONENTS[props.name];
});

const customSvgPath = computed(() => {
  return CUSTOM_ICON_PATHS[props.name];
});

const isFillBased = computed(() => {
  return FILL_BASED_ICONS.has(props.name);
});

const rotationClass = computed(() => {
  if (props.name === 'chevron-left') return 'rotate-180';
  if (props.name === 'chevron-down') return 'rotate-90';
  if (props.name === 'chevron-up') return '-rotate-90';
  return '';
});
</script>

<template>
  <div
    class="inline-flex items-center justify-center shrink-0 align-middle"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      color: color,
    }"
  >
    <component
      v-if="isLibraryComponent"
      :is="libraryComponent"
      class="w-full h-full text-current transition-transform duration-fast"
      :class="[rotationClass]"
      :fill="color"
    />
    <!-- Fill-based custom icons (building, taxipark, etc.) -->
    <svg
      v-else-if="customSvgPath && isFillBased"
      class="w-full h-full transition-transform duration-fast"
      :class="[rotationClass]"
      viewBox="0 0 24 24"
      fill="currentColor"
      v-html="customSvgPath"
    ></svg>
    <!-- Stroke-based custom icons (map-pin, maximize, etc.) -->
    <svg
      v-else-if="customSvgPath"
      class="w-full h-full transition-transform duration-fast"
      :class="[rotationClass]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      v-html="customSvgPath"
    ></svg>
  </div>
</template>
