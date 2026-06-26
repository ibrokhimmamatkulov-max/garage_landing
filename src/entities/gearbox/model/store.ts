import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Gearbox } from './types';
import { getGearboxes } from '../api';

export const useGearboxStore = defineStore('gearbox', () => {
  const gearboxes = ref<Gearbox[]>([]);
  const isLoading = ref(false);

  async function fetchGearboxes() {
    isLoading.value = true;
    try {
      const data = await getGearboxes();
      gearboxes.value = data;
    } catch (error) {
      console.error('Failed to fetch gearboxes:', error);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    gearboxes,
    isLoading,
    fetchGearboxes,
  };
});
