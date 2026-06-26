<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCarStore, type CarFilters } from '@/entities/car';
import { useGearboxStore } from '@/entities/gearbox';
import type { SelectOption } from '@/shared/ui/AppSelect/index.vue';

defineOptions({
  name: 'FilterModal',
});

defineEmits<{
  close: [];
}>();

const modalRef = ref<{ open: () => void; close: () => void } | null>(null);
const carStore = useCarStore();
const gearboxStore = useGearboxStore();

onMounted(async () => {
  modalRef.value?.open();

  // Загружаем коробки передач при открытии фильтра
  if (gearboxStore.gearboxes.length === 0) {
    await gearboxStore.fetchGearboxes();
  }

  // Инициализируем локальные фильтры из стора автомобилей
  transmission.value = carStore.filters.gearboxId ? String(carStore.filters.gearboxId) : '';
  duration.value = carStore.filters.durationDays ? String(carStore.filters.durationDays) : '';
  sort.value = carStore.filters.sort || 'price_asc';
});

// Опции для селекта коробок передач
const transmissionOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [{ label: 'Любая', value: '' }];
  gearboxStore.gearboxes.forEach((g) => {
    options.push({ label: g.name, value: String(g.id) });
  });
  return options;
});

// Опции для длительности тарифа
const durationOptions: SelectOption[] = [
  { label: 'Любой', value: '' },
  { label: 'Суточный', value: '1' },
  { label: 'Недельный', value: '7' },
  { label: 'Месячный', value: '30' },
];

// Опции для сортировки
const sortOptions: SelectOption[] = [
  { label: 'Сначала дешевле', value: 'price_asc' },
  { label: 'Сначала дороже', value: 'price_desc' },
  { label: 'Сначала новее по году', value: 'year_desc' },
  { label: 'Сначала старше по году', value: 'year_asc' },
];

const transmission = ref('');
const duration = ref('');
const sort = ref<CarFilters['sort']>('price_asc');

function handleApply() {
  carStore.applyFilters({
    gearboxId: transmission.value ? Number(transmission.value) : null,
    durationDays: duration.value ? Number(duration.value) : null,
    sort: sort.value,
  });
  modalRef.value?.close();
}
</script>

<template>
  <CModal ref="modalRef" title="Фильтры" @before-close="$emit('close')">
    <div class="flex flex-col gap-lg mb-xl mt-md">
      <div class="flex flex-col gap-xs">
        <label class="text-base font-semibold text-text-primary">Тариф</label>
        <CSelect
          v-model="duration"
          label="label"
          placeholder="Любой"
          :options="durationOptions"
          value-key="value"
        />
      </div>
      <div class="flex flex-col gap-xs">
        <label class="text-base font-semibold text-text-primary">Коробка передач</label>
        <CSelect
          v-model="transmission"
          label="label"
          placeholder="Любая"
          :options="transmissionOptions"
          value-key="value"
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
        />
      </div>
    </div>

    <DButton theme="primary" size="lg" @click="handleApply" class="w-full">
      Применить фильтры
    </DButton>
  </CModal>
</template>
