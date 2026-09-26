<script setup lang="ts">
import { computed } from 'vue';
import { useLocationStore } from '@/entities/location';
import { useCarStore } from '@/entities/car';
import { inCity } from '@/shared/lib/city';

defineOptions({
  name: 'HeroBanner',
});

const locationStore = useLocationStore();
const carStore = useCarStore();

const cityName = computed(() => {
  const name = locationStore.currentCity?.name;
  return name ? inCity(name) : '';
});

const total = computed(() => carStore.pagination.total);

/** «47 автомобилей» — склонение по последней цифре */
const carsLabel = computed(() => {
  const n = total.value;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'автомобиль';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'автомобиля';
  return 'автомобилей';
});

const sortLabel = computed(() => {
  switch (carStore.filters.sort) {
    case 'price_desc':
      return 'сначала дороже';
    case 'year_desc':
      return 'сначала новее';
    case 'year_asc':
      return 'сначала старше';
    default:
      return 'сначала дешевле';
  }
});
</script>

<template>
  <!--
    Раньше здесь был фото-постер на 500px и первая машина уходила ниже сгиба.
    Теперь это рабочая полоса: заголовок, чипы фильтров и счётчик результатов.
    Каталог начинается сразу — он и есть продукт.
  -->
  <section class="border-b border-hairline-soft bg-surface-paper">
    <div class="container pb-lg pt-xl sm:pb-xl sm:pt-2xl">
      <div class="max-w-[46rem]">
        <h1
          class="text-display-sm font-extrabold text-ink sm:text-display lg:text-display-lg"
        >
          Аренда автомобилей<template v-if="cityName"><br class="hidden sm:block" />
            <span class="sm:inline"> в {{ cityName }}</span></template>
        </h1>
        <p class="mt-md max-w-[34rem] text-body text-ink-muted sm:mt-base sm:text-body-lg">
          Посуточно, на неделю или на месяц. Напрямую у владельцев — условия видны сразу,
          без звонков и торга вслепую.
        </p>
      </div>

      <p v-if="total > 0" class="tnum mt-lg text-small text-ink-soft">
        Найдено {{ total }} {{ carsLabel }} · {{ sortLabel }}
      </p>
    </div>
  </section>
</template>
