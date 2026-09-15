<script setup lang="ts">
defineOptions({
  name: 'AppLogo',
});

/**
 * Знак нарисован инлайном, а не подключён как <img>.
 *
 * Причина: в <img> не работает currentColor, и цвет плашки был зашит
 * в файл хексом. Из-за этого смена фирменного цвета оставляла логотип
 * прежним — на экране получалось два бренда сразу.
 * Теперь плашка берёт цвет из палитры.
 */
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
    class="flex select-none items-center"
    :class="[
      size === 'sm' && 'gap-xs',
      size === 'md' && 'gap-sm',
      size === 'lg' && 'gap-sm md:gap-md',
      size === 'xl' && 'gap-md',
    ]"
  >
    <svg
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Gram Garage"
      class="shrink-0 text-brand"
      :class="[
        size === 'sm' && 'h-6 w-6',
        size === 'md' && 'h-8 w-8',
        size === 'lg' && 'h-10 w-10 md:h-12 md:w-12',
        size === 'xl' && 'h-14 w-14 md:h-16 md:w-16',
      ]"
    >
      <path
        d="M0 15C0 10.3406 0 8.01088 0.761205 6.17317C1.77614 3.72288 3.72288 1.77614 6.17317 0.761205C8.01088 0 10.3406 0 15 0V0C19.6594 0 21.9891 0 23.8268 0.761205C26.2771 1.77614 28.2239 3.72288 29.2388 6.17317C30 8.01088 30 10.3406 30 15V15C30 19.6594 30 21.9891 29.2388 23.8268C28.2239 26.2771 26.2771 28.2239 23.8268 29.2388C21.9891 30 19.6594 30 15 30V30C10.3406 30 8.01088 30 6.17317 29.2388C3.72288 28.2239 1.77614 26.2771 0.761205 23.8268C0 21.9891 0 19.6594 0 15V15Z"
        fill="currentColor"
      />
      <path
        d="M17.5156 13.5933C17.572 14.2127 17.7429 14.8413 17.663 15.4373C17.4607 16.96 16.0858 17.9502 14.5338 17.7981C13.0679 17.6553 11.9407 16.367 11.9909 14.8925C12.0426 13.404 13.2372 12.2228 14.7736 12.1607C15.4101 12.1359 16.0482 12.1638 16.6831 12.1266C18.4343 12.0241 19.7104 11.1596 20.9035 9.88525C21.6591 9.07813 22.0087 8.08941 22.0087 6.5C22.0087 6.5 15.4807 6.50466 14.4852 6.5326C9.77567 6.66608 6.01624 10.7855 6.29373 15.4016C6.64177 21.1958 12.4737 25.0948 18.3214 22.8147C20.5037 21.9626 21.8708 20.3483 22.026 17.9642C22.2345 14.7776 19.585 13.3264 17.5156 13.5918V13.5933Z"
        fill="#fff"
      />
    </svg>

    <span
      class="whitespace-nowrap font-bold tracking-tight"
      :class="[
        hideTextOnMobile ? 'hidden sm:block' : 'block',
        size === 'sm' && 'text-body-lg',
        size === 'md' && 'text-title-sm',
        size === 'lg' && 'text-title md:text-display-sm',
        size === 'xl' && 'text-display-sm md:text-display',
      ]"
    >
      Gram Garage
    </span>
  </div>
</template>
