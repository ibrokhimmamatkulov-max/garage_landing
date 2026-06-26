import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { City } from './types';
import { getCities } from '../api';

export const useLocationStore = defineStore('location', () => {
  const cities = ref<City[]>([]);
  const currentCity = ref<City | null>(null);
  const isLoading = ref(false);

  async function fetchCities() {
    isLoading.value = true;
    try {
      const data = await getCities();
      cities.value = data;
      // Установим дефолтный город, если еще не выбран
      if (data.length > 0 && !currentCity.value) {
        currentCity.value = data[0];
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function setCity(city: City) {
    currentCity.value = city;
  }

  return {
    cities,
    currentCity,
    isLoading,
    fetchCities,
    setCity,
  };
});
