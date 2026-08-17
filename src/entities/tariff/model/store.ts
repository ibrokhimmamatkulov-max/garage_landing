import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Tariff } from './types';
import { getTariffs } from '../api';

export const useTariffStore = defineStore('tariff', () => {
  const tariffs = ref<Tariff[]>([]);
  const isLoading = ref(false);

  async function fetchTariffs() {
    isLoading.value = true;
    try {
      const data = await getTariffs();
      tariffs.value = data;
    } catch (error) {
      console.error('Failed to fetch tariffs:', error);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    tariffs,
    isLoading,
    fetchTariffs,
  };
});
