<script setup lang="ts">
import logoSvg from '@/shared/icons/gg-icon.svg';

defineOptions({
  name: 'AppLogo',
});

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl';
    hideTextOnMobile?: boolean;
  }>(),
  {
    size: 'md',
    hideTextOnMobile: false,
  },
);
</script>

<template>
  <div
    class="flex items-center select-none"
    :class="[
      size === 'sm' && 'gap-xs',
      size === 'md' && 'gap-sm',
      size === 'lg' && 'gap-sm md:gap-md',
      size === 'xl' && 'gap-md',
    ]"
  >
    <img
      :src="logoSvg"
      alt="Gram Garage"
      class="shrink-0 transition-transform duration-fast"
      :class="[
        size === 'sm' && 'w-6 h-6',
        size === 'md' && 'w-8 h-8',
        size === 'lg' && 'w-10 h-10 md:w-12 md:h-12',
        size === 'xl' && 'w-14 h-14 md:w-16 md:h-16',
      ]"
    />
    <span
      class="font-semibold whitespace-nowrap tracking-tight"
      :class="[
        hideTextOnMobile ? 'hidden sm:block' : 'block',
        size === 'sm' && 'text-base',
        size === 'md' && 'text-lg',
        size === 'lg' && 'text-xl md:text-2xl font-bold',
        size === 'xl' && 'text-2xl md:text-3xl font-bold',
      ]"
    >
      Gram Garage
    </span>
  </div>
</template>
