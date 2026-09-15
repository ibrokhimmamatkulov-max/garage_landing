<script setup lang="ts">
import { computed } from 'vue';
import { useLocationStore } from '@/entities/location';
import { useCarStore } from '@/entities/car';

defineOptions({
  name: 'HeroBanner',
});

defineEmits<{
  openFilters: [];
}>();

const locationStore = useLocationStore();
const carStore = useCarStore();

/**
 * Предложный падеж города: «в Худжанде», но «в Душанбе».
 * Наивное добавление «е» ломалось бы на Душанбе и Турсунзаде — они несклоняемые.
 */
function inCity(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';

  const last = trimmed.slice(-1).toLowerCase();

  if ('аеёиоуыэюя'.includes(last)) return trimmed; // Душанбе, Турсунзаде
  if (last === 'ь' || last === 'й') return `${trimmed.slice(0, -1)}е`; // Гулистонь → Гулистоне
  return `${trimmed}е`; // Худжанд → Худжанде, Бохтар → Бохтаре
}

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

      <!-- Чипы фильтров: раньше всё это пряталось в модалке за кнопкой в шапке -->
      <div class="scroll-x -mx-4 mt-lg flex gap-sm px-4 sm:-mx-6 sm:px-6">
        <button
          v-for="chip in [
            { key: 'dates', label: 'Даты' },
            { key: 'price', label: 'Цена' },
            { key: 'brand', label: 'Марка' },
            { key: 'gearbox', label: 'Коробка' },
            { key: 'fuel', label: 'Топливо' },
          ]"
          :key="chip.key"
          class="flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-hairline bg-surface-paper px-3.5 py-2 text-small font-semibold text-ink transition-all duration-fast ease-out hover:border-hairline-strong hover:bg-surface-sunken"
          @click="$emit('openFilters')"
        >
          {{ chip.label }}
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M2 4l3 3 3-3"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-ink-ghost"
            />
          </svg>
        </button>

        <button
          class="flex shrink-0 snap-start items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-small font-semibold text-white transition-colors duration-fast hover:bg-ink-muted"
          @click="$emit('openFilters')"
        >
          Все фильтры
        </button>
      </div>

      <p v-if="total > 0" class="tnum mt-lg text-small text-ink-soft">
        Найдено {{ total }} {{ carsLabel }} · {{ sortLabel }}
      </p>
    </div>
  </section>
</template>
