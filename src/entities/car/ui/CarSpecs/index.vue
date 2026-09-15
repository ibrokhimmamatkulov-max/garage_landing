<script setup lang="ts">
import { computed } from 'vue';
import type { Car } from '../../model/types';

defineOptions({
  name: 'CarSpecs',
});

const props = defineProps<{
  car: Car;
}>();

/**
 * Раньше это был вертикальный список из трёх строк по 40px с серыми плашками
 * иконок — половина высоты карточки уходила на то, что читается одним взглядом.
 * Теперь компактные теги в одну-две строки, место отдано цене.
 */
const tags = computed(() =>
  [
    props.car.transmission,
    props.car.fuelType,
    props.car.bodyType?.name || props.car.carClass,
    props.car.countSeat ? `${props.car.countSeat} мест` : null,
  ].filter((value): value is string => Boolean(value)),
);
</script>

<template>
  <ul class="flex flex-wrap gap-1.5">
    <li
      v-for="tag in tags"
      :key="tag"
      class="rounded-radius-sm bg-surface-sunken px-2 py-1 text-caption font-medium text-ink-muted"
    >
      {{ tag }}
    </li>
  </ul>
</template>
