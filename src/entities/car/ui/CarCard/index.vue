<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Car } from '../../model/types';
import CarSpecs from '../CarSpecs/index.vue';

defineOptions({
  name: 'CarCard',
});

const props = defineProps<{
  car: Car;
}>();

defineEmits<{
  apply: [car: Car];
  details: [car: Car];
}>();

const currentImageIndex = ref(0);

const imageCounter = computed(() => {
  const total = props.car.images.length;
  return `${currentImageIndex.value + 1} / ${total}`;
});

const currentImage = computed(() => {
  return props.car.images[currentImageIndex.value] ?? props.car.images[0];
});

let touchStartX = 0;

function handleTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0].clientX;
}

function handleTouchEnd(event: TouchEvent) {
  const touchEndX = event.changedTouches[0].clientX;
  const diffX = touchEndX - touchStartX;

  if (Math.abs(diffX) > 50) {
    if (diffX < 0) {
      if (currentImageIndex.value < props.car.images.length - 1) {
        currentImageIndex.value++;
      } else {
        currentImageIndex.value = 0;
      }
    } else {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
      } else {
        currentImageIndex.value = props.car.images.length - 1;
      }
    }
  }
}
</script>

<template>
  <article
    class="min-w-0 w-full bg-bg-card rounded-radius-lg border border-border-light overflow-hidden transition-shadow duration-base hover:shadow-card"
    @mouseleave="currentImageIndex = 0"
  >
    <div
      class="relative aspect-[16/10] overflow-hidden bg-bg-section group/image"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <img
        :src="currentImage"
        :alt="`${car.brand} ${car.model} ${car.year}`"
        class="w-full h-full object-cover"
      />
      <span
        class="absolute top-md right-md px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-full z-20 pointer-events-none"
        >{{ imageCounter }}</span
      >

      <!-- Зоны для переключения картинок при наведении (только если больше 1 картинки) -->
      <div v-if="car.images.length > 1" class="absolute inset-0 hidden md:flex">
        <div
          v-for="(_, imgIdx) in car.images"
          :key="imgIdx"
          class="h-full flex-1 z-10"
          @mouseenter="currentImageIndex = imgIdx"
        />
      </div>

      <!-- Индикаторы (точки/полоски) внизу картинки -->
      <div
        v-if="car.images.length > 1"
        class="absolute bottom-md left-1/2 -translate-x-1/2 flex gap-[4px] z-10 w-[calc(100%-24px)] justify-center pointer-events-none"
      >
        <div
          v-for="(_, imgIdx) in car.images"
          :key="imgIdx"
          class="h-[3px] flex-1 max-w-[20px] rounded-full transition-all duration-base"
          :class="imgIdx === currentImageIndex ? 'bg-primary' : 'bg-white/20 blur-[2px]'"
        />
      </div>
    </div>

    <div class="p-base">
      <div class="mb-md">
        <h3 class="text-[24px] font-semibold text-text-primary leading-[24px]">
          {{ car.brand }} {{ car.model }} {{ car.year }}
        </h3>
        <p class="font-normal leading-5 text-text-secondary mt-xs">
          Рейтинг модели <strong class="font-bold text-text-primary">{{ car.rating }}</strong>
        </p>
      </div>

      <CarSpecs :car="car" />

      <div class="mt-base">
        <div class="mb-[2px]">
          <span class="text-[22px] font-bold text-text-primary"
            >{{ car.pricePerDay }} {{ car.currency }}</span
          >
          <span class="text-text-secondary">/день</span>
        </div>
        <p class="text-[13px] text-text-secondary mb-lg">
          Аренда · {{ car.workDays }}/{{ car.weekendDays }}
        </p>

        <div class="flex gap-sm">
          <DButton
            theme="primary"
            size="md"
            class="!h-[48px] !rounded-[12px] !text-[15px] !font-semibold !whitespace-nowrap !px-2 !flex-[1.45]"
            @click="$emit('apply', car)"
          >
            Оставить заявку
          </DButton>
          <DButton
            theme="secondary"
            size="md"
            class="!h-[48px] !rounded-[12px] !text-[15px] !font-semibold !whitespace-nowrap !px-2 !flex-1"
            @click="$emit('details', car)"
          >
            Подробнее
          </DButton>
        </div>
      </div>
    </div>
  </article>
</template>
