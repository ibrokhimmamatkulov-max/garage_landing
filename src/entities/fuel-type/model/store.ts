import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FuelType } from './types';
import { getFuelTypes } from '../api';

export const useFuelTypeStore = defineStore('fuel-type', () => {
  const fuelTypes = ref<FuelType[]>([]);
  const isLoading = ref(false);

  async function fetchFuelTypes() {
    isLoading.value = true;
    try {
      const data = await getFuelTypes();
      fuelTypes.value = data;
    } catch (error) {
      console.error('Failed to fetch fuel types:', error);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    fuelTypes,
    isLoading,
    fetchFuelTypes,
  };
});
