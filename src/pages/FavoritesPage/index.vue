<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { type Car, CarCard } from '@/entities/car';
import { getCarById } from '@/entities/car/api';
import { useFavoriteStore } from '@/entities/favorite';
import AppHeader from '@/widgets/AppHeader/index.vue';
import AppFooter from '@/widgets/AppFooter/index.vue';
import { ApplicationModal, ApplicationSuccessModal } from '@/features/submit-application';

defineOptions({
  name: 'FavoritesPage',
});

const router = useRouter();
const favorites = useFavoriteStore();

const loading = ref(true);
const loadFailed = ref(false);
const loaded = ref<Car[]>([]);
/** Объявления, которых больше нет на витрине: срок вышел или владелец снял */
const goneIds = ref<string[]>([]);

const isApplicationOpen = ref(false);
const isSuccessOpen = ref(false);
const selectedCar = ref<Car | null>(null);

// Снятое сердечко убирает карточку сразу — список следует за хранилищем
const cars = computed(() => loaded.value.filter((c) => favorites.has(c.id)));
const gone = computed(() => goneIds.value.filter((id) => favorites.has(id)));
const isEmpty = computed(() => !loading.value && !loadFailed.value && favorites.count === 0);

async function load() {
  loading.value = true;
  loadFailed.value = false;
  loaded.value = [];
  goneIds.value = [];

  const ids = [...favorites.ids];
  const results = await Promise.allSettled(ids.map((id) => getCarById(id)));

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      loaded.value.push(result.value);
    } else if (
      result.status === 'fulfilled' ||
      (result.status === 'rejected' && [404, 422].includes(result.reason?.response?.status))
    ) {
      goneIds.value.push(ids[i]);
    } else {
      // Сеть или сервер: отличать это от «объявления нет» важно — иначе
      // из-за одного сбоя человеку покажут, что избранное пропало
      loadFailed.value = true;
    }
  });

  loading.value = false;
}

onMounted(load);

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
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-canvas">
    <AppHeader />

    <main class="container flex-1 py-xl">
      <header class="mb-lg">
        <h1 class="text-display-sm font-extrabold text-ink sm:text-display">Избранное</h1>
        <p v-if="favorites.count" class="tnum mt-1.5 text-body text-ink-muted">
          Отмечено: {{ favorites.count }}
        </p>
      </header>

      <div
        v-if="loading"
        class="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-base sm:gap-lg"
        aria-busy="true"
      >
        <div
          v-for="n in Math.min(Math.max(favorites.count, 1), 4)"
          :key="n"
          class="overflow-hidden rounded-radius-lg border border-hairline bg-surface-paper"
        >
          <div class="skeleton aspect-[4/3]" />
          <div class="flex flex-col gap-md p-base">
            <div class="skeleton h-4 w-3/5 rounded" />
            <div class="skeleton h-6 w-2/5 rounded" />
          </div>
        </div>
      </div>

      <div v-else-if="isEmpty" class="mx-auto max-w-[24rem] py-3xl text-center">
        <div
          class="mx-auto mb-base flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken"
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" class="text-ink-soft">
            <path
              d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7C19.5 15.9 12 20.5 12 20.5z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="text-title font-bold text-ink">Здесь пока пусто</h2>
        <p class="mt-sm text-body text-ink-muted">
          Нажмите на сердечко на карточке автомобиля — он появится здесь, и к нему можно будет
          вернуться.
        </p>
        <router-link
          to="/"
          class="mt-lg inline-block rounded-radius-md bg-brand px-5 py-3 text-body font-semibold text-brand-on no-underline transition-colors duration-fast hover:bg-brand-press"
        >
          Смотреть автомобили
        </router-link>
      </div>

      <template v-else>
        <div
          v-if="loadFailed"
          class="mb-lg flex flex-wrap items-center justify-between gap-sm rounded-radius-md border border-state-warning bg-state-warning-tint px-base py-3 text-small text-state-warning"
        >
          <span>Не удалось загрузить часть объявлений. Проверьте соединение.</span>
          <button class="font-semibold underline" @click="load">Повторить</button>
        </div>

        <div
          v-if="cars.length"
          class="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-base sm:gap-lg"
        >
          <CarCard
            v-for="car in cars"
            :key="car.id"
            :car="car"
            @apply="handleApply"
            @details="handleDetails"
          />
        </div>

        <ul v-if="gone.length" class="mt-lg flex flex-col gap-sm">
          <li
            v-for="id in gone"
            :key="id"
            class="flex items-center justify-between gap-sm rounded-radius-md border border-hairline bg-surface-paper px-base py-3 text-small text-ink-muted"
          >
            <span>Объявление больше не доступно — его сняли или срок размещения вышел.</span>
            <button class="shrink-0 font-semibold text-ink underline" @click="favorites.remove(id)">
              Убрать
            </button>
          </li>
        </ul>
      </template>
    </main>

    <AppFooter />

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
