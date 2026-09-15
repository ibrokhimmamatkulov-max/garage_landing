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

const currentImage = computed(
  () => props.car.images[currentImageIndex.value] ?? props.car.images[0],
);

const hasManyImages = computed(() => props.car.images.length > 1);

const isTaxiListing = computed(() => props.car.listingType === 'taxi');

/** Строка под ценой: у обычной аренды — срок и депозит, у такси — старая схема N/M */
const priceNote = computed(() => {
  if (isTaxiListing.value) {
    return `схема ${props.car.workDays} / ${props.car.weekendDays}`;
  }

  const parts: string[] = [];
  if (props.car.minRentDays > 1) parts.push(`от ${props.car.minRentDays} сут.`);
  if (props.car.deposit !== undefined && props.car.deposit !== null) {
    parts.push(props.car.deposit > 0 ? `депозит ${props.car.deposit}` : 'без депозита');
  }
  return parts.join(' · ');
});

let touchStartX = 0;

function handleTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0].clientX;
}

function handleTouchEnd(event: TouchEvent) {
  const diffX = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diffX) <= 50) return;

  const last = props.car.images.length - 1;
  if (diffX < 0) {
    currentImageIndex.value = currentImageIndex.value < last ? currentImageIndex.value + 1 : 0;
  } else {
    currentImageIndex.value = currentImageIndex.value > 0 ? currentImageIndex.value - 1 : last;
  }
}
</script>

<template>
  <article
    class="group flex min-w-0 flex-col overflow-hidden rounded-radius-lg border border-hairline bg-surface-paper transition-all duration-base ease-out hover:-translate-y-0.5 hover:border-transparent hover:shadow-lift"
    @mouseleave="currentImageIndex = 0"
  >
    <div
      class="relative aspect-[4/3] shrink-0 overflow-hidden bg-surface-sunken"
      @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd"
    >
      <img
        :src="currentImage"
        :alt="`${car.brand} ${car.model}, ${car.year}`"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
      />

      <span
        v-if="isTaxiListing"
        class="absolute left-3 top-3 rounded-full bg-ink/75 px-2.5 py-1 text-caption font-semibold text-white backdrop-blur-sm"
      >
        Под такси
      </span>

      <!-- Невидимые зоны переключения кадров при наведении -->
      <div v-if="hasManyImages" class="absolute inset-0 hidden md:flex">
        <button
          v-for="(_, imgIdx) in car.images"
          :key="imgIdx"
          class="h-full flex-1 cursor-default"
          tabindex="-1"
          :aria-label="`Фото ${imgIdx + 1}`"
          @mouseenter="currentImageIndex = imgIdx"
        />
      </div>

      <div
        v-if="hasManyImages"
        class="pointer-events-none absolute inset-x-3 bottom-3 flex gap-1"
        aria-hidden="true"
      >
        <span
          v-for="(_, imgIdx) in car.images"
          :key="imgIdx"
          class="h-[3px] flex-1 rounded-full transition-colors duration-base"
          :class="imgIdx === currentImageIndex ? 'bg-white' : 'bg-white/35'"
        />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-md p-base">
      <h3 class="text-title-sm font-bold text-ink">
        {{ car.brand }} {{ car.model }}
        <span class="tnum font-semibold text-ink-soft">· {{ car.year }}</span>
      </h3>

      <CarSpecs :car="car" />

      <div class="mt-auto pt-xs">
        <p class="flex flex-wrap items-baseline gap-x-1.5 text-price font-extrabold text-ink">
          <span class="tnum">{{ car.pricePerDay }}</span>
          <span class="text-body font-semibold text-ink-muted">{{ car.currency }} / сутки</span>
        </p>
        <p v-if="priceNote" class="tnum mt-0.5 text-caption text-ink-soft">{{ priceNote }}</p>

        <div class="mt-md flex gap-sm">
          <button
            class="flex-1 rounded-radius-md bg-brand-ink px-3 py-2.5 text-small font-semibold text-white transition-colors duration-fast hover:bg-brand-deep"
            @click="$emit('apply', car)"
          >
            Оставить заявку
          </button>
          <button
            class="shrink-0 rounded-radius-md border border-hairline px-3.5 py-2.5 text-small font-semibold text-ink transition-colors duration-fast hover:border-hairline-strong hover:bg-surface-sunken"
            @click="$emit('details', car)"
          >
            Ещё
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
