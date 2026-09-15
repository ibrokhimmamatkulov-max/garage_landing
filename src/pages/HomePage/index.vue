<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { type Car, useCarStore } from '@/entities/car';
import { useLocationStore } from '@/entities/location';
import AppHeader from '@/widgets/AppHeader/index.vue';
import HeroBanner from '@/widgets/HeroBanner/index.vue';
import CarCatalog from '@/widgets/CarCatalog/index.vue';
import PromoBanner from '@/widgets/PromoBanner/index.vue';
import AppFooter from '@/widgets/AppFooter/index.vue';
import { FilterModal } from '@/features/filter-cars';
import { ApplicationModal, ApplicationSuccessModal } from '@/features/submit-application';

defineOptions({
  name: 'HomePage',
});

const router = useRouter();
const carStore = useCarStore();
const locationStore = useLocationStore();

const isFilterOpen = ref(false);
const isApplicationOpen = ref(false);
const isSuccessOpen = ref(false);
const selectedCar = ref<Car | null>(null);

onMounted(async () => {
  if (locationStore.cities.length === 0) {
    await locationStore.fetchCities();
  }

  if (locationStore.currentCity) {
    carStore.setCityId(locationStore.currentCity.id);
  } else {
    carStore.fetchCars();
  }
});

function handleOpenFilters() {
  isFilterOpen.value = true;
}


function handleLoadMore() {
  carStore.loadNextPage();
}

function handleApply(car: Car) {
  selectedCar.value = car;
  isApplicationOpen.value = true;
}

function handleApplicationSuccess() {
  isApplicationOpen.value = false;
  isSuccessOpen.value = true;
}

function handleDetails(car: Car) {
  router.push({ name: 'car', params: { id: car.id } });
}

function handleResetFilters() {
  carStore.applyFilters({
    gearboxId: null,
    fuelTypeId: null,
    tariffId: null,
    durationDays: null,
    listingType: null,
    priceFrom: null,
    priceTo: null,
    brandId: null,
    bodyTypeId: null,
    sort: 'price_asc',
  });
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-canvas">
    <AppHeader @open-filters="handleOpenFilters" />
    <HeroBanner @open-filters="handleOpenFilters" />

    <CarCatalog
      :cars="carStore.cars"
      :is-loading="carStore.isLoading"
      :is-more-loading="carStore.isMoreLoading"
      :has-more="carStore.hasMore"
      @apply="handleApply"
      @details="handleDetails"
      @load-more="handleLoadMore"
      @reset-filters="handleResetFilters"
    >
      <template #promo>
        <PromoBanner is-embedded />
      </template>
    </CarCatalog>
    <AppFooter />

    <!-- Modals -->
    <FilterModal v-if="isFilterOpen" @close="isFilterOpen = false" />

    <ApplicationModal
      v-if="isApplicationOpen && selectedCar"
      :car="selectedCar"
      @close="isApplicationOpen = false"
      @success="handleApplicationSuccess"
    />

    <ApplicationSuccessModal
      v-if="isSuccessOpen && selectedCar"
      :car="selectedCar"
      @close="isSuccessOpen = false"
    />
  </div>
</template>
