<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useLocationStore, type City } from '@/entities/location';
import { useCarStore } from '@/entities/car';
import { AppIcon, AppLogo } from '@/shared/ui';

defineOptions({
  name: 'AppHeader',
});

defineEmits<{
  openFilters: [];
}>();

const locationStore = useLocationStore();
const carStore = useCarStore();

const isScrolled = ref(false);
const isCityDropdownOpen = ref(false);

function handleScroll() {
  isScrolled.value = window.scrollY > 4;
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

  if (locationStore.cities.length === 0) {
    await locationStore.fetchCities();
  }

  if (locationStore.currentCity && carStore.filters.cityId === null) {
    carStore.setCityId(locationStore.currentCity.id);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('click', closeDropdowns);
});

watch(
  () => locationStore.currentCity,
  (newCity) => {
    if (newCity) {
      carStore.setCityId(newCity.id);
    }
  },
);
</script>

<template>
  <!--
    Шапка всегда на бумаге, а не прозрачная поверх фото: герой больше не постер,
    и плавающая белая шапка на светлом фоне читалась бы как артефакт.
    Граница появляется только при скролле — в покое линии нет.
  -->
  <header
    class="sticky top-0 z-[100] bg-surface-paper/85 backdrop-blur-xl transition-shadow duration-base ease-out"
    :class="isScrolled ? 'shadow-header' : 'shadow-none'"
  >
    <div class="container flex h-[60px] items-center justify-between gap-base">
      <router-link
        to="/"
        class="shrink-0 text-ink no-underline transition-opacity duration-fast hover:opacity-70"
      >
        <AppLogo hide-text-on-mobile />
      </router-link>

      <div class="flex items-center gap-xs sm:gap-sm">
        <!-- Город -->
        <div class="relative">
          <button
            class="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken sm:px-3"
            @click="toggleCityDropdown"
          >
            <AppIcon name="map-pin" :size="15" class="shrink-0 text-ink-soft" />
            <span class="max-w-[7.5rem] truncate">{{
              locationStore.currentCity?.name || 'Город'
            }}</span>
            <svg
              class="shrink-0 text-ink-ghost transition-transform duration-fast"
              :class="isCityDropdownOpen && 'rotate-180'"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 4l3 3 3-3"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <Transition name="drop">
            <div
              v-if="isCityDropdownOpen"
              class="absolute right-0 top-full z-[101] mt-2 flex max-h-[19rem] min-w-[11rem] flex-col overflow-y-auto rounded-radius-lg border border-hairline bg-surface-paper p-1 shadow-pop"
              @click.stop
            >
              <button
                v-for="city in locationStore.cities"
                :key="city.id"
                class="flex items-center justify-between gap-sm rounded-radius-sm px-3 py-2 text-left text-small transition-colors duration-fast"
                :class="
                  city.id === locationStore.currentCity?.id
                    ? 'bg-brand-tint font-semibold text-brand-ink'
                    : 'text-ink hover:bg-surface-sunken'
                "
                @click="selectCity(city)"
              >
                {{ city.name }}
                <svg
                  v-if="city.id === locationStore.currentCity?.id"
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 7.5l3 3 6-6.5"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </Transition>
        </div>

        <span class="hidden h-4 w-px bg-hairline sm:block" aria-hidden="true" />

        <button
          class="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken sm:px-3"
          @click="$emit('openFilters')"
        >
          <AppIcon name="filter" :size="15" class="shrink-0 text-ink-soft" />
          <span class="hidden sm:inline">Фильтры</span>
        </button>

        <!-- Вход в кабинет арендодателя: второй канал, который делает витрину двусторонней -->
        <a
          href="/rent-out"
          class="ml-1 hidden rounded-full bg-ink px-4 py-2 text-small font-semibold text-white no-underline transition-colors duration-fast hover:bg-ink-muted md:inline-block"
        >
          Сдать авто
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s cubic-bezier(0.22, 1, 0.36, 1);
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
