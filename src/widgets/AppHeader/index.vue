<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLocationStore, type City } from '@/entities/location';
import { useCarStore } from '@/entities/car';
import { AppIcon } from '@/shared/ui';

defineOptions({
  name: 'AppHeader',
});

defineEmits<{
  openFilters: [];
}>();

const route = useRoute();
const locationStore = useLocationStore();
const carStore = useCarStore();

const isScrolled = ref(false);
const isCityDropdownOpen = ref(false);

function handleScroll() {
  isScrolled.value = window.scrollY > 50;
}

function toggleCityDropdown(event: Event) {
  event.stopPropagation();
  isCityDropdownOpen.value = !isCityDropdownOpen.value;
}

function selectCity(city: City) {
  locationStore.setCity(city);
  isCityDropdownOpen.value = false;
}

function closeDropdowns() {
  isCityDropdownOpen.value = false;
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('click', closeDropdowns);
  handleScroll();

  // Загружаем города (там будет заглушка с Душанбе id 6)
  if (locationStore.cities.length === 0) {
    await locationStore.fetchCities();
  }

  // При первой загрузке синхронизируем город
  if (locationStore.currentCity && carStore.filters.cityId === null) {
    carStore.setCityId(locationStore.currentCity.id);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('click', closeDropdowns);
});

// Следим за изменением города и обновляем фильтр в сторе машин
watch(
  () => locationStore.currentCity,
  (newCity) => {
    if (newCity) {
      carStore.setCityId(newCity.id);
    }
  },
);

const isHome = computed(() => {
  return route.name === 'home';
});

const isTransparent = computed(() => {
  return isHome.value && !isScrolled.value;
});
</script>

<template>
  <header
    class="sticky top-0 z-[100] transition-all duration-base"
    :class="
      isTransparent
        ? 'bg-transparent shadow-none text-white'
        : 'bg-bg-card shadow-header text-text-primary'
    "
  >
    <div class="flex items-center justify-between h-16 container">
      <div class="flex items-center gap-xl">
        <router-link
          to="/"
          class="flex items-center gap-sm no-underline transition-colors duration-base"
          :class="isTransparent ? 'text-white' : 'text-text-primary'"
        >
          <span
            class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full font-bold text-[14px]"
            >G</span
          >
          <span class="text-base font-semibold">Gram Гараж</span>
        </router-link>
      </div>

      <div class="flex items-center gap-lg">
        <!-- City Selector -->
        <div class="relative">
          <button
            class="flex items-center gap-xs text-[14px] bg-none border-none cursor-pointer px-2.5 py-1 rounded-radius-sm transition-all duration-base"
            :class="
              isTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-text-primary hover:bg-bg-section'
            "
            @click="toggleCityDropdown"
          >
            <AppIcon name="map-pin" :size="16" />
            <span class="font-medium">{{
              locationStore.currentCity?.name || 'Выбрать город'
            }}</span>
            <span class="text-[8px] ml-[2px] opacity-70">▼</span>
          </button>

          <Transition name="fade-slide">
            <div
              v-if="isCityDropdownOpen"
              class="absolute top-full left-0 mt-2 bg-bg-card border border-border-light rounded-radius-md shadow-card min-w-[160px] flex flex-col py-1 z-[101]"
              @click.stop
            >
              <button
                v-for="city in locationStore.cities"
                :key="city.id"
                class="px-4 py-2 text-[14px] text-left bg-none border-none cursor-pointer w-full transition-colors duration-fast"
                :class="
                  city.id === locationStore.currentCity?.id
                    ? 'text-primary font-semibold bg-primary-light'
                    : 'text-text-primary hover:bg-bg-section hover:text-primary'
                "
                @click="selectCity(city)"
              >
                {{ city.name }}
              </button>
            </div>
          </Transition>
        </div>

        <button
          class="flex items-center gap-xs text-[14px] cursor-pointer bg-none border-none p-0 transition-colors duration-fast"
          :class="
            isTransparent ? 'text-white hover:text-primary' : 'text-text-primary hover:text-primary'
          "
          @click="$emit('openFilters')"
        >
          <AppIcon name="filter" :size="16" />
          Фильтр
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
