<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useCarStore, type Car } from '@/entities/car';
import AppHeader from '@/widgets/AppHeader/index.vue';
import CarDetails from '@/widgets/CarDetails/index.vue';
import AppFooter from '@/widgets/AppFooter/index.vue';
import { FilterModal } from '@/features/filter-cars';
import { ApplicationModal, ApplicationSuccessModal } from '@/features/submit-application';

defineOptions({
  name: 'CarPage',
});

const route = useRoute();
const router = useRouter();
const carStore = useCarStore();

const isFilterOpen = ref(false);
const isApplicationOpen = ref(false);
const isSuccessOpen = ref(false);
const selectedTariffId = ref<number | undefined>(undefined);

onMounted(async () => {
  const id = route.params.id as string;
  await carStore.fetchCarById(id);
});

function handleApply(_car: Car, tariffId?: number) {
  selectedTariffId.value = tariffId;
  isApplicationOpen.value = true;
}

function handleApplicationSuccess() {
  isApplicationOpen.value = false;
  isSuccessOpen.value = true;
}

function handleBack() {
  router.push({ name: 'home' });
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-bg-section">
    <AppHeader @open-filters="isFilterOpen = true" />

    <div
      v-if="carStore.isLoading"
      class="flex-1 flex items-center justify-center text-text-secondary text-base py-3xl container"
    >
      <p>Загрузка...</p>
    </div>

    <div
      v-else-if="!carStore.currentCar"
      class="flex-1 flex items-center justify-center text-text-secondary text-base py-3xl container"
    >
      <p>Автомобиль не найден.</p>
    </div>

    <CarDetails v-else :car="carStore.currentCar" @apply="handleApply" @back="handleBack" />

    <AppFooter />

    <!-- Modals -->
    <FilterModal v-if="isFilterOpen" @close="isFilterOpen = false" />

    <ApplicationModal
      v-if="isApplicationOpen && carStore.currentCar"
      :car="carStore.currentCar"
      :initial-tariff-id="selectedTariffId"
      @close="isApplicationOpen = false"
      @success="handleApplicationSuccess"
    />

    <ApplicationSuccessModal
      v-if="isSuccessOpen && carStore.currentCar"
      :car="carStore.currentCar"
      @close="isSuccessOpen = false"
    />
  </div>
</template>
