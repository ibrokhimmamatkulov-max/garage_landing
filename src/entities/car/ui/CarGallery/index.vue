<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { Car } from '../../model/types';
import { AppIcon } from '@/shared/ui';
import { useGallerySwipe } from './useGallerySwipe';
import CarGalleryLightbox from './CarGalleryLightbox.vue';

defineOptions({
  name: 'CarGallery',
});

const props = defineProps<{
  car: Car;
}>();

// State
const currentIndex = ref(0);
const isFullscreen = ref(false);

// Refs
const thumbsContainer = ref<HTMLElement | null>(null);

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

// Auto-scroll thumbnails
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

watch(currentIndex, () => {
  nextTick(() => {
    scrollThumbIntoView(thumbsContainer.value);
  });
});

onMounted(() => {
  nextTick(() => {
    scrollThumbIntoView(thumbsContainer.value);
  });
});
</script>

<template>
  <div class="block">
    <!-- Main carousel -->
    <div
      class="group relative rounded-radius-lg overflow-hidden bg-bg-section aspect-[16/10] select-none cursor-grab active:cursor-grabbing"
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
          class="absolute top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/92 rounded-full text-text-primary shadow-[0_2px_8px_rgba(0,0,0,0.12)] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-fast z-[2] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:scale-108 active:scale-95 left-2 md:left-3 cursor-pointer"
          aria-label="Предыдущее фото"
          @click.stop="prev"
        >
          <AppIcon name="chevron-left" :size="20" />
        </button>
        <button
          class="absolute top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/92 rounded-full text-text-primary shadow-[0_2px_8px_rgba(0,0,0,0.12)] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-fast z-[2] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:scale-108 active:scale-95 right-2 md:right-3 cursor-pointer"
          aria-label="Следующее фото"
          @click.stop="next"
        >
          <AppIcon name="chevron-right" :size="20" />
        </button>
      </template>

      <!-- Counter badge -->
      <div
        v-if="hasMultipleImages"
        class="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-black/55 text-white text-xs font-medium px-[0.6rem] py-[0.2rem] rounded-full z-[2] backdrop-blur-[4px] tracking-wide"
      >
        {{ currentIndex + 1 }} / {{ totalImages }}
      </div>

      <!-- Expand button -->
      <button
        class="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-black/45 rounded-radius-sm text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-fast z-[2] backdrop-blur-[4px] hover:bg-black/70 hover:scale-108 active:scale-95 cursor-pointer"
        aria-label="Открыть на весь экран"
        @click.stop="openFullscreen"
      >
        <AppIcon name="maximize" :size="18" />
      </button>

      <!-- Dot indicators -->
      <div
        v-if="hasMultipleImages && totalImages <= 8"
        class="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-[2]"
      >
        <button
          v-for="(_, index) in car.images"
          :key="index"
          class="w-2 h-2 rounded-full transition-all duration-fast cursor-pointer"
          :class="[
            index === currentIndex
              ? 'bg-white !w-5 rounded-[4px]'
              : 'bg-white/50 hover:bg-white/80 hover:scale-120',
          ]"
          :aria-label="`Фото ${index + 1}`"
          @click.stop="selectImage(index)"
        />
      </div>
    </div>

    <!-- Thumbnails strip -->
    <div
      v-if="hasMultipleImages"
      ref="thumbsContainer"
      class="flex gap-sm mt-md overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] pb-[2px] [&::-webkit-scrollbar]:hidden"
    >
      <button
        v-for="(image, index) in car.images"
        :key="index"
        class="shrink-0 w-[4rem] h-[2.75rem] md:w-[5.5rem] md:h-[3.75rem] rounded-radius-sm overflow-hidden border-2 cursor-pointer transition-all duration-fast hover:opacity-85 hover:-translate-y-[1px]"
        :class="[
          index === currentIndex
            ? 'border-primary opacity-100 active-thumb'
            : 'border-transparent opacity-60',
        ]"
        @click="selectImage(index)"
      >
        <img
          :src="image"
          :alt="`Миниатюра ${index + 1}`"
          class="w-full h-full object-cover pointer-events-none"
          draggable="false"
        />
      </button>
    </div>

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
