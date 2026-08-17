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
    class="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-between backdrop-blur-md select-none"
    @click.self="$emit('close')"
  >
    <!-- Close button -->
    <button
      class="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center text-white bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-full border border-white/20 shadow-lg z-30 transition-all duration-fast hover:scale-110 active:scale-95 cursor-pointer"
      aria-label="Закрыть"
      title="Закрыть (Esc)"
      @click="$emit('close')"
    >
      <AppIcon name="x" :size="24" color="#ffffff" />
    </button>

    <!-- Counter -->
    <div
      class="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 text-white/90 text-sm md:text-base font-medium px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm z-20 tracking-wider pointer-events-none"
    >
      {{ index + 1 }} / {{ totalImages }}
    </div>

    <!-- Main image area -->
    <div
      class="car-gallery-lightbox__stage flex-1 w-full min-h-0 relative flex items-center justify-center px-4 py-14 md:px-20 md:py-16 cursor-grab active:cursor-grabbing"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <div class="relative w-full h-full flex items-center justify-center min-h-0 overflow-hidden">
        <transition name="gallery-fade" mode="out-in">
          <img
            :key="index"
            :src="currentImage"
            :alt="`${car.brand} ${car.model} — фото ${index + 1}`"
            class="w-full h-full max-w-full max-h-full object-contain rounded-radius-md pointer-events-none drop-shadow-2xl"
            :style="slideTransformStyle"
            draggable="false"
          />
        </transition>
      </div>
    </div>

    <!-- Navigation arrows -->
    <template v-if="hasMultipleImages">
      <button
        class="absolute top-1/2 -translate-y-1/2 left-3 md:left-6 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center text-white bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-full border border-white/20 backdrop-blur-md shadow-lg z-20 transition-all duration-fast hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Предыдущее фото"
        title="Предыдущее фото (←)"
        @click.stop="prev"
      >
        <AppIcon name="chevron-left" :size="28" color="#ffffff" />
      </button>
      <button
        class="absolute top-1/2 -translate-y-1/2 right-3 md:right-6 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center text-white bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-full border border-white/20 backdrop-blur-md shadow-lg z-20 transition-all duration-fast hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Следующее фото"
        title="Следующее фото (→)"
        @click.stop="next"
      >
        <AppIcon name="chevron-right" :size="28" color="#ffffff" />
      </button>
    </template>

    <!-- Fullscreen thumbnails -->
    <div
      v-if="hasMultipleImages"
      ref="fullscreenThumbsContainer"
      class="shrink-0 flex gap-2 px-6 py-3 md:px-8 md:py-4 max-w-full overflow-x-auto scroll-smooth z-20 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        v-for="(image, imgIdx) in car.images"
        :key="imgIdx"
        class="shrink-0 w-16 h-11 md:w-20 md:h-14 rounded-radius-sm overflow-hidden border-2 cursor-pointer transition-all duration-fast hover:opacity-100 hover:scale-105"
        :class="[
          imgIdx === index
            ? 'border-primary opacity-100 shadow-md active-thumb ring-2 ring-primary/40'
            : 'border-transparent opacity-50 hover:opacity-80',
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
