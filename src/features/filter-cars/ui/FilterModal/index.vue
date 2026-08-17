<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCarStore, type CarFilters } from '@/entities/car';
import { useGearboxStore } from '@/entities/gearbox';
import { useFuelTypeStore } from '@/entities/fuel-type';
import { useTariffStore } from '@/entities/tariff';
import type { SelectOption } from '@/shared/ui';

defineOptions({
  name: 'FilterModal',
});

defineEmits<{
  close: [];
}>();

const modalRef = ref<{ open: () => void; close: () => void } | null>(null);
const carStore = useCarStore();
const gearboxStore = useGearboxStore();
const fuelTypeStore = useFuelTypeStore();
const tariffStore = useTariffStore();

onMounted(async () => {
  modalRef.value?.open();

  // Загружаем справочники при открытии фильтра
  if (gearboxStore.gearboxes.length === 0) {
    gearboxStore.fetchGearboxes();
  }
  if (fuelTypeStore.fuelTypes.length === 0) {
    fuelTypeStore.fetchFuelTypes();
  }
  if (tariffStore.tariffs.length === 0) {
    tariffStore.fetchTariffs();
  }

  // Инициализируем локальные фильтры из стора автомобилей
  transmission.value = carStore.filters.gearboxId ? String(carStore.filters.gearboxId) : '';
  fuelType.value = carStore.filters.fuelTypeId ? String(carStore.filters.fuelTypeId) : '';
  tariff.value = carStore.filters.tariffId ? String(carStore.filters.tariffId) : '';
  duration.value = carStore.filters.durationDays ? String(carStore.filters.durationDays) : '';
  sort.value = carStore.filters.sort || 'price_asc';
});

// Опции для селекта коробок передач
const transmissionOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [{ label: 'Все', value: '' }];
  gearboxStore.gearboxes.forEach((g) => {
    options.push({ label: g.name, value: String(g.id) });
  });
  return options;
});

// Опции для типа топлива
const fuelTypeOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [{ label: 'Все', value: '' }];
  fuelTypeStore.fuelTypes.forEach((f) => {
    options.push({ label: f.name, value: String(f.id) });
  });
  return options;
});

// Опции для тарифа
const tariffOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [{ label: 'Все', value: '' }];
  tariffStore.tariffs.forEach((t) => {
    options.push({ label: t.name, value: String(t.id) });
  });
  return options;
});

// Опции для сортировки
const sortOptions: SelectOption[] = [
  { label: 'Сначала дешевле', value: 'price_asc' },
  { label: 'Сначала дороже', value: 'price_desc' },
  { label: 'Сначала новее по году', value: 'year_desc' },
  { label: 'Сначала старше по году', value: 'year_asc' },
];

const transmission = ref('');
const fuelType = ref('');
const tariff = ref('');
const duration = ref(''); // Оставил для обратной совместимости, если потребуется
const sort = ref<CarFilters['sort']>('price_asc');

function handleApply() {
  carStore.applyFilters({
    gearboxId: transmission.value ? Number(transmission.value) : null,
    fuelTypeId: fuelType.value ? Number(fuelType.value) : null,
    tariffId: tariff.value ? Number(tariff.value) : null,
    durationDays: duration.value ? Number(duration.value) : null,
    sort: sort.value,
  });
  modalRef.value?.close();
}
</script>

<template>
  <CModal ref="modalRef" title="Фильтры" @before-close="$emit('close')">
    <div class="flex flex-col gap-lg mb-xl mt-xs">
      <div class="flex flex-col gap-xs">
        <label class="text-base font-semibold text-text-primary">Тариф</label>
        <CSelect
          v-model="tariff"
          label="label"
          placeholder="Все"
          :options="tariffOptions"
          value-key="value"
          :search="false"
        />
      </div>
      <div class="flex flex-col gap-xs">
        <label class="text-base font-semibold text-text-primary">Коробка передач</label>
        <CSelect
          v-model="transmission"
          label="label"
          placeholder="Все"
          :options="transmissionOptions"
          value-key="value"
          :search="false"
        />
      </div>
      <div class="flex flex-col gap-xs">
        <label class="text-base font-semibold text-text-primary">Тип топлива</label>
        <CSelect
          v-model="fuelType"
          label="label"
          placeholder="Все"
          :options="fuelTypeOptions"
          value-key="value"
          :search="false"
        />
      </div>
      <div class="flex flex-col gap-xs">
        <label class="text-base font-semibold text-text-primary">Сортировка</label>
        <CSelect
          v-model="sort"
          label="label"
          placeholder="Сначала дешевле"
          :options="sortOptions"
          value-key="value"
          :search="false"
        />
      </div>
    </div>

    <DButton theme="primary" size="lg" @click="handleApply" class="w-full">
      Применить фильтры
    </DButton>
  </CModal>
</template>
