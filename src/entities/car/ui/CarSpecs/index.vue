<script setup lang="ts">
import type { Car } from '../../model/types';
import { AppIcon } from '@/shared/ui';

defineOptions({
  name: 'CarSpecs',
});

defineProps<{
  car: Car;
}>();
</script>

<template>
  <div class="flex flex-col border-t border-border-light">
    <div class="flex items-center gap-md py-2.5 border-b border-border-light">
      <div class="flex items-center justify-center w-8 h-8 rounded-radius-md !bg-grey shrink-0">
        <AppIcon class="shrink-0 text-text-secondary" name="settings" :size="20" />
      </div>
      <span
        >Коробка передач: <strong>{{ car.transmission }}</strong></span
      >
    </div>

    <div class="flex items-center gap-md py-2.5 border-b border-border-light">
      <div class="flex items-center justify-center w-8 h-8 rounded-radius-md !bg-grey shrink-0">
        <AppIcon class="shrink-0 text-text-secondary fill-text-secondary" name="car" :size="20" />
      </div>
      <span
        >Тип топлива: <strong>{{ car.fuelType }}</strong></span
      >
    </div>

    <div class="flex items-center gap-md py-2.5 border-b border-border-light">
      <div class="flex items-center justify-center w-8 h-8 rounded-radius-md !bg-grey shrink-0">
        <AppIcon class="shrink-0 text-text-secondary" name="star" :size="20" />
      </div>
      <span
        >Класс авто: <strong>{{ car.carClass }}</strong></span
      >
    </div>

    <div class="flex items-center gap-md py-2.5 border-b border-border-light">
      <div class="flex items-center justify-center w-8 h-8 rounded-radius-md !bg-grey shrink-0">
        <AppIcon class="text-text-secondary" name="taxipark" :size="20" />
      </div>
      <span
        >Таксопарк «<strong>{{ car.taxiPark }}</strong
        >»</span
      >
    </div>
  </div>
</template>
