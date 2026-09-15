<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { type Car, CarCard } from '@/entities/car';

defineOptions({
  name: 'CarCatalog',
});

const props = withDefaults(
  defineProps<{
    cars: Car[];
    isLoading: boolean;
    isMoreLoading?: boolean;
    hasMore?: boolean;
  }>(),
  {
    isMoreLoading: false,
    hasMore: false,
  },
);

const emit = defineEmits<{
  apply: [car: Car];
  details: [car: Car];
  loadMore: [];
  resetFilters: [];
}>();

const triggerRef = ref<HTMLElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let resizeObserver: ResizeObserver | null = null;

/**
 * Сетка раскладывается через auto-fill, поэтому число колонок нельзя угадать
 * по брейкпоинтам — иначе промо-баннер врезается в середину ряда.
 * Читаем фактическую раскладку из вычисленных стилей.
 */
const columnsCount = ref(1);

function measureColumns() {
  if (!gridRef.value) return;
  const template = getComputedStyle(gridRef.value).gridTemplateColumns;
  const count = template.split(' ').filter(Boolean).length;
  columnsCount.value = Math.max(1, count);
}

function setupObserver() {
  observer?.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && props.hasMore && !props.isLoading && !props.isMoreLoading) {
        emit('loadMore');
      }
    },
    { rootMargin: '400px' },
  );

  if (triggerRef.value) {
    observer.observe(triggerRef.value);
  }
}

onMounted(() => {
  setupObserver();
  measureColumns();

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(measureColumns);
    if (gridRef.value) resizeObserver.observe(gridRef.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
  resizeObserver?.disconnect();
});

watch(triggerRef, setupObserver);

watch(gridRef, (el) => {
  measureColumns();
  if (el && resizeObserver) resizeObserver.observe(el);
});
</script>

<template>
  <section class="py-lg sm:py-xl">
    <div class="container">
      <!--
        Скелетоны вместо строчки «Загрузка автомобилей…»: сетка не схлопывается,
        и глаз заранее видит, куда придёт контент.
      -->
      <div
        v-if="isLoading && cars.length === 0"
        class="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-base sm:gap-lg"
        aria-busy="true"
        aria-label="Загрузка автомобилей"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="overflow-hidden rounded-radius-lg border border-hairline bg-surface-paper"
        >
          <div class="skeleton aspect-[4/3]" />
          <div class="flex flex-col gap-md p-base">
            <div class="skeleton h-4 w-3/5 rounded" />
            <div class="flex gap-1.5">
              <div class="skeleton h-5 w-16 rounded-radius-sm" />
              <div class="skeleton h-5 w-14 rounded-radius-sm" />
              <div class="skeleton h-5 w-20 rounded-radius-sm" />
            </div>
            <div class="skeleton mt-xs h-6 w-2/5 rounded" />
            <div class="skeleton h-10 w-full rounded-radius-md" />
          </div>
        </div>
      </div>

      <div
        v-else-if="cars.length === 0"
        class="mx-auto max-w-[24rem] py-3xl text-center"
      >
        <div
          class="mx-auto mb-base flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken"
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle
              cx="10.5"
              cy="10.5"
              r="6.5"
              stroke="currentColor"
              stroke-width="1.8"
              class="text-ink-soft"
            />
            <path
              d="M15.5 15.5L20 20"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              class="text-ink-soft"
            />
          </svg>
        </div>
        <h3 class="text-title font-bold text-ink">Ничего не нашлось</h3>
        <p class="mt-sm text-body text-ink-muted">
          Под выбранные условия нет ни одного автомобиля. Попробуйте расширить диапазон цены
          или снять часть фильтров.
        </p>
        <button
          class="mt-lg rounded-radius-md border border-hairline px-4 py-2.5 text-small font-semibold text-ink transition-colors duration-fast hover:border-hairline-strong hover:bg-surface-sunken"
          @click="$emit('resetFilters')"
        >
          Сбросить фильтры
        </button>
      </div>

      <div v-else>
        <div
          ref="gridRef"
          class="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-base sm:gap-lg"
        >
          <template v-for="(car, index) in cars" :key="car.id">
            <CarCard
              :car="car"
              @apply="$emit('apply', $event)"
              @details="$emit('details', $event)"
            />
            <div
              v-if="
                $slots.promo &&
                (index === columnsCount - 1 ||
                  (cars.length < columnsCount && index === cars.length - 1))
              "
              class="col-span-full"
            >
              <slot name="promo" />
            </div>
          </template>
        </div>

        <div ref="triggerRef" class="mt-xl flex min-h-[40px] items-center justify-center">
          <div v-if="isMoreLoading" class="flex items-center gap-sm text-small text-ink-soft">
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-hairline border-t-brand-ink"
            />
            Загружаем ещё
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
