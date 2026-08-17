<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
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
}>();

const triggerRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);

function handleResize() {
  windowWidth.value = window.innerWidth;
}

const columnsCount = computed(() => {
  const w = windowWidth.value;
  if (w >= 1440) return 4;
  if (w >= 1056) return 3;
  if (w >= 712) return 2;
  return 1;
});

function setupObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && props.hasMore && !props.isLoading && !props.isMoreLoading) {
        emit('loadMore');
      }
    },
    {
      rootMargin: '200px', // Начинаем загрузку за 200px до появления триггера на экране
    },
  );

  if (triggerRef.value) {
    observer.observe(triggerRef.value);
  }
}

onMounted(() => {
  setupObserver();
  window.addEventListener('resize', handleResize);
  handleResize();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  window.removeEventListener('resize', handleResize);
});

// Пересобираем обзервер при изменении триггера (на всякий случай)
watch(triggerRef, () => {
  setupObserver();
});
</script>

<template>
  <section class="pt-2xl">
    <div class="container">
      <div
        v-if="isLoading && cars.length === 0"
        class="text-center py-3xl text-text-secondary text-base"
      >
        <p>Загрузка автомобилей...</p>
      </div>

      <div v-else-if="cars.length === 0" class="text-center py-3xl text-text-secondary text-base">
        <p>Автомобили не найдены. Попробуйте изменить фильтры.</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-lg">
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

        <!-- Триггер для бесконечного скролла -->
        <div ref="triggerRef" class="flex justify-center items-center min-h-[40px] mt-xl">
          <div
            v-if="isMoreLoading"
            class="flex items-center gap-sm text-text-secondary text-[14px]"
          >
            <span
              class="w-5 h-5 border-2 border-border-light border-t-primary rounded-full animate-spin"
            ></span>
            <span>Загрузка еще автомобилей...</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
