<script setup lang="ts">
import { computed } from 'vue';
import { useLocationStore } from '@/entities/location';
import { inCity } from '@/shared/lib/city';

defineOptions({
  name: 'HeroBanner',
});

const locationStore = useLocationStore();

const cityName = computed(() => {
  const name = locationStore.currentCity?.name;
  return name ? inCity(name) : '';
});
</script>

<template>
  <!--
    Раньше здесь был фото-постер на 500px и первая машина уходила ниже сгиба.
    Теперь это рабочая полоса с заголовком; фильтр и счётчик результатов
    вынесены в CatalogFilter. Каталог начинается сразу — он и есть продукт.
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
    </div>
  </section>
</template>
