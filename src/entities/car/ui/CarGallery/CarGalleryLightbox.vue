<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { Car } from '../../model/types';
import { AppIcon } from '@/shared/ui';
import { useGallerySwipe } from './useGallerySwipe';

defineOptions({
  name: 'CarGalleryLightbox',
});

const props = defineProps<{
  car: Car;
  index: number;
}>();

const emit = defineEmits<{
  close: [];
  'update:index': [index: number];
}>();

const fullscreenThumbsContainer = ref<HTMLElement | null>(null);

const totalImages = computed(() => props.car.images.length);
const hasMultipleImages = computed(() => totalImages.value > 1);

const currentImage = computed(() => {
  return props.car.images[props.index] ?? props.car.images[0];
});

function goTo(newIndex: number) {
  emit('update:index', newIndex);
}

function prev() {
  if (!hasMultipleImages.value) return;
  const newIndex = props.index > 0 ? props.index - 1 : totalImages.value - 1;
  goTo(newIndex);
}

function next() {
  if (!hasMultipleImages.value) return;
  const newIndex = props.index < totalImages.value - 1 ? props.index + 1 : 0;
  goTo(newIndex);
}

// Подключаем жест свайпа
const {
  slideTransformStyle,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown,
} = useGallerySwipe(totalImages, next, prev);

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowLeft':
      prev();
      break;
    case 'ArrowRight':
      next();
      break;
    case 'Escape':
      emit('close');
      break;
  }
}

function scrollThumbIntoView(container: HTMLElement | null) {
  if (!container) return;
  const activeThumb = container.querySelector('.active-thumb') as HTMLElement;
  if (!activeThumb) return;

  const containerRect = container.getBoundingClientRect();
  const thumbRect = activeThumb.getBoundingClientRect();

  if (thumbRect.left < containerRect.left) {
    container.scrollBy({ left: thumbRect.left - containerRect.left - 16, behavior: 'smooth' });
  } else if (thumbRect.right > containerRect.right) {
    container.scrollBy({ left: thumbRect.right - containerRect.right + 16, behavior: 'smooth' });
  }
}

watch(
  () => props.index,
  () => {
    nextTick(() => {
      scrollThumbIntoView(fullscreenThumbsContainer.value);
    });
  },
);

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';
  nextTick(() => {
    scrollThumbIntoView(fullscreenThumbsContainer.value);
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <div
    class="fixed inset-0 z-[9999] bg-black/92 flex flex-col items-center justify-center backdrop-blur-[12px]"
    @click.self="$emit('close')"
  >
    <!-- Close button -->
    <button
      class="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center text-white/80 bg-white/10 rounded-full z-10 transition-all duration-fast hover:text-white hover:bg-white/20 hover:scale-110 active:scale-92 cursor-pointer"
      aria-label="Закрыть"
      @click="$emit('close')"
    >
      <AppIcon name="x" :size="24" />
    </button>

    <!-- Counter -->
    <div
      class="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 text-white/75 text-sm md:text-base font-medium z-10 tracking-wider"
    >
      {{ index + 1 }} / {{ totalImages }}
    </div>

    <!-- Main image area -->
    <div
      class="car-gallery-lightbox__stage flex-1 flex items-center justify-center w-full pt-14 px-4 pb-2 md:pt-16 md:px-20 md:pb-4 cursor-grab active:cursor-grabbing select-none"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <transition name="gallery-fade" mode="out-in">
        <img
          :key="index"
          :src="currentImage"
          :alt="`${car.brand} ${car.model} — фото ${index + 1}`"
          class="max-w-full max-height-full object-contain rounded-radius-sm pointer-events-none"
          :style="slideTransformStyle"
          draggable="false"
        />
      </transition>
    </div>

    <!-- Navigation arrows -->
    <template v-if="hasMultipleImages">
      <button
        class="absolute top-1/2 -translate-y-1/2 w-10 h-10 md:w-13 md:h-13 flex items-center justify-center text-white/70 bg-white/8 rounded-full z-10 transition-all duration-fast hover:text-white hover:bg-white/18 hover:scale-110 active:scale-92 left-2 md:left-6 cursor-pointer"
        aria-label="Предыдущее фото"
        @click.stop="prev"
      >
        <AppIcon name="chevron-left" :size="28" />
      </button>
      <button
        class="absolute top-1/2 -translate-y-1/2 w-10 h-10 md:w-13 md:h-13 flex items-center justify-center text-white/70 bg-white/8 rounded-full z-10 transition-all duration-fast hover:text-white hover:bg-white/18 hover:scale-110 active:scale-92 right-2 md:right-6 cursor-pointer"
        aria-label="Следующее фото"
        @click.stop="next"
      >
        <AppIcon name="chevron-right" :size="28" />
      </button>
    </template>

    <!-- Fullscreen thumbnails -->
    <div
      v-if="hasMultipleImages"
      ref="fullscreenThumbsContainer"
      class="flex gap-2 px-8 py-4 md:px-8 md:py-4 max-w-full overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        v-for="(image, imgIdx) in car.images"
        :key="imgIdx"
        class="shrink-0 w-[3.5rem] h-[2.25rem] md:w-[4.5rem] md:h-[3rem] rounded-radius-sm overflow-hidden border-2 cursor-pointer transition-all duration-fast hover:opacity-70 hover:-translate-y-[2px]"
        :class="[
          imgIdx === index
            ? 'border-primary opacity-100 active-thumb'
            : 'border-transparent opacity-45',
        ]"
        @click="goTo(imgIdx)"
      >
        <img
          :src="image"
          :alt="`Миниатюра ${imgIdx + 1}`"
          class="w-full h-full object-cover pointer-events-none"
          draggable="false"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Fade transition for image switching */
.gallery-fade-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-fade-leave-active {
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0;
}
</style>
