import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Car, CarFilters } from './types';
import { getCars, getCarById } from '../api';

export const useCarStore = defineStore('car', () => {
  const cars = ref<Car[]>([]);
  const currentCar = ref<Car | null>(null);
  const isLoading = ref(false);
  const isMoreLoading = ref(false);

  const filters = ref<CarFilters>({
    cityId: null,
    gearboxId: null,
    fuelTypeId: null,
    tariffId: null,
    durationDays: null,
    sort: 'price_asc',
    page: 1,
    perPage: 12,
  });

  const pagination = ref({
    total: 0,
    currentPage: 1,
    lastPage: 1,
  });

  const hasMore = computed(() => {
    return pagination.value.currentPage < pagination.value.lastPage;
  });

  async function fetchCars() {
    isLoading.value = true;
    filters.value.page = 1; // Сбрасываем на первую страницу
    try {
      const response = await getCars(filters.value);
      cars.value = response.data;
      pagination.value = {
        total: response.meta.total,
        currentPage: response.meta.currentPage,
        lastPage: response.meta.lastPage,
      };
    } catch (error) {
      console.error('Failed to fetch cars:', error);
      cars.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function loadNextPage() {
    if (isMoreLoading.value || !hasMore.value) return;

    isMoreLoading.value = true;
    const nextPage = pagination.value.currentPage + 1;
    const nextFilters = { ...filters.value, page: nextPage };

    try {
      const response = await getCars(nextFilters);
      cars.value = [...cars.value, ...response.data];
      pagination.value = {
        total: response.meta.total,
        currentPage: response.meta.currentPage,
        lastPage: response.meta.lastPage,
      };
      filters.value.page = nextPage;
    } catch (error) {
      console.error('Failed to load next page of cars:', error);
    } finally {
      isMoreLoading.value = false;
    }
  }

  async function fetchCarById(id: string) {
    isLoading.value = true;
    try {
      const car = await getCarById(id);
      currentCar.value = car ?? null;
    } catch (error) {
      console.error(`Failed to fetch car by ID ${id}:`, error);
      currentCar.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  async function applyFilters(newFilters: Partial<CarFilters>) {
    filters.value = {
      ...filters.value,
      ...newFilters,
      page: 1, // сбрасываем при смене фильтров
    };
    await fetchCars();
  }

  async function setCityId(cityId: number | null) {
    filters.value.cityId = cityId;
    filters.value.page = 1;
    await fetchCars();
  }

  return {
    cars,
    currentCar,
    isLoading,
    isMoreLoading,
    filters,
    pagination,
    hasMore,
    fetchCars,
    loadNextPage,
    fetchCarById,
    applyFilters,
    setCityId,
  };
});
