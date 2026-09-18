<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Car } from '../../model/types';
import { AppIcon } from '@/shared/ui';
import { useGallerySwipe } from './useGallerySwipe';
import CarGalleryLightbox from './CarGalleryLightbox.vue';
import CarGalleryThumbs from './CarGalleryThumbs.vue';

defineOptions({
  name: 'CarGallery',
});

const props = defineProps<{
  car: Car;
}>();

// State
const currentIndex = ref(0);
const isFullscreen = ref(false);

// Computed
const currentImage = computed(() => {
  return props.car.images[currentIndex.value] ?? props.car.images[0];
});

const totalImages = computed(() => props.car.images.length);
const hasMultipleImages = computed(() => totalImages.value > 1);

function goTo(index: number) {
  currentIndex.value = index;
}

function prev() {
  if (!hasMultipleImages.value) return;
  const newIndex = currentIndex.value > 0 ? currentIndex.value - 1 : totalImages.value - 1;
  goTo(newIndex);
}

function next() {
  if (!hasMultipleImages.value) return;
  const newIndex = currentIndex.value < totalImages.value - 1 ? currentIndex.value + 1 : 0;
  goTo(newIndex);
}

function selectImage(index: number) {
  if (index !== currentIndex.value) {
    goTo(index);
  }
}

// Swipe/drag logic
const {
  slideTransformStyle,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown,
} = useGallerySwipe(totalImages, next, prev);

function openFullscreen() {
  isFullscreen.value = true;
}

function closeFullscreen() {
  isFullscreen.value = false;
}
</script>

<template>
  <div class="block">
    <!-- Main carousel -->
    <div
      class="group relative rounded-radius-lg overflow-hidden bg-surface-sunken aspect-[16/10] select-none cursor-grab active:cursor-grabbing"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
    >
      <div class="w-full h-full will-change-transform" :style="slideTransformStyle">
        <transition name="gallery-fade" mode="out-in">
          <img
            :key="currentIndex"
            :src="currentImage"
            :alt="`${car.brand} ${car.model} — фото ${currentIndex + 1}`"
            class="w-full h-full object-cover pointer-events-none"
            draggable="false"
          />
        </transition>
      </div>

      <!-- Navigation arrows -->
      <template v-if="hasMultipleImages">
        <button
          class="absolute top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-fast z-[2] left-0.5 md:left-1.5 cursor-pointer group/arrow"
          aria-label="Предыдущее фото"
          @click.stop="prev"
        >
          <span class="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/95 text-ink shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-fast group-hover/arrow:bg-white group-hover/arrow:shadow-[0_4px_16px_rgba(0,0,0,0.18)] group-hover/arrow:scale-105 group-active/arrow:scale-95">
            <AppIcon name="chevron-left" :size="20" />
          </span>
        </button>
        <button
          class="absolute top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-fast z-[2] right-0.5 md:right-1.5 cursor-pointer group/arrow"
          aria-label="Следующее фото"
          @click.stop="next"
        >
          <span class="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/95 text-ink shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-fast group-hover/arrow:bg-white group-hover/arrow:shadow-[0_4px_16px_rgba(0,0,0,0.18)] group-hover/arrow:scale-105 group-active/arrow:scale-95">
            <AppIcon name="chevron-right" :size="20" />
          </span>
        </button>
      </template>

      <!-- Counter badge -->
      <div
        v-if="hasMultipleImages"
        class="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-black/60 text-white text-xs font-medium px-[0.6rem] py-[0.2rem] rounded-full z-[2] backdrop-blur-[4px] tracking-wide"
      >
        {{ currentIndex + 1 }} / {{ totalImages }}
      </div>

      <!-- Expand button -->
      <button
        class="absolute top-0.5 right-0.5 md:top-1.5 md:right-1.5 flex h-11 w-11 items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-fast z-[2] cursor-pointer group/expand"
        aria-label="Открыть на весь экран"
        @click.stop="openFullscreen"
      >
        <span class="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-radius-sm bg-black/50 text-white backdrop-blur-[4px] transition-all duration-fast group-hover/expand:bg-black/70 group-hover/expand:scale-105 group-active/expand:scale-95">
          <AppIcon name="maximize" :size="18" />
        </span>
      </button>

      <!-- Dot indicators -->
      <div
        v-if="hasMultipleImages && totalImages <= 8"
        class="absolute bottom-0 md:bottom-1 left-1/2 -translate-x-1/2 flex z-[2]"
      >
        <!--
          Точка остаётся мелкой, а нажимается квадрат 24px — минимум WCAG 2.5.8.
          Растить саму точку до этого размера нельзя: индикатор превратился бы
          в ряд крупных кружков поверх фотографии.
        -->
        <button
          v-for="(_, index) in car.images"
          :key="index"
          class="group/dot flex h-6 w-6 items-center justify-center cursor-pointer"
          :aria-label="`Фото ${index + 1}`"
          @click.stop="selectImage(index)"
        >
          <span
            class="h-2 rounded-full transition-all duration-fast"
            :class="
              index === currentIndex
                ? 'w-5 bg-white rounded-[4px]'
                : 'w-2 bg-white/50 group-hover/dot:bg-white/80 group-hover/dot:scale-110'
            "
          />
        </button>
      </div>
    </div>

    <!-- Thumbnails strip -->
    <CarGalleryThumbs
      v-if="hasMultipleImages"
      :images="car.images"
      :current-index="currentIndex"
      @select="selectImage"
    />

    <!-- Fullscreen lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <CarGalleryLightbox
          v-if="isFullscreen"
          :car="car"
          v-model:index="currentIndex"
          @close="closeFullscreen"
        />
      </Transition>
    </Teleport>
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

/* Lightbox transition */
.lightbox-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.lightbox-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active :deep(.car-gallery-lightbox__stage) {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lightbox-leave-active :deep(.car-gallery-lightbox__stage) {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.lightbox-enter-from :deep(.car-gallery-lightbox__stage) {
  transform: scale(0.9);
}

.lightbox-leave-to :deep(.car-gallery-lightbox__stage) {
  transform: scale(0.95);
}
</style>
