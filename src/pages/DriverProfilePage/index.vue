<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CarCard, type Car } from '@/entities/car';
import { getOwnerProfile, type OwnerProfile } from '@/entities/car/api';
import AppHeader from '@/widgets/AppHeader/index.vue';
import AppFooter from '@/widgets/AppFooter/index.vue';

defineOptions({
  name: 'DriverProfilePage',
});

const OWNER_TYPE_LABELS: Record<string, string> = {
  individual: 'Частное лицо',
  company: 'Компания',
};

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const notFound = ref(false);
const owner = ref<OwnerProfile | null>(null);
const listings = ref<Car[]>([]);
const page = ref(1);
const lastPage = ref(1);
const loadingMore = ref(false);

const ownerTypeLabel = computed(() => OWNER_TYPE_LABELS[owner.value?.ownerType ?? ''] ?? '');

async function load() {
  loading.value = true;
  notFound.value = false;

  const id = route.params.id as string;
  const result = await getOwnerProfile(id, 1);

  if (!result.owner) {
    notFound.value = true;
    loading.value = false;
    return;
  }

  owner.value = result.owner;
  listings.value = result.listings.data;
  page.value = result.listings.meta.currentPage;
  lastPage.value = result.listings.meta.lastPage;
  loading.value = false;
}

async function loadMore() {
  if (loadingMore.value || page.value >= lastPage.value) return;
  loadingMore.value = true;

  const result = await getOwnerProfile(route.params.id as string, page.value + 1);
  listings.value = [...listings.value, ...result.listings.data];
  page.value = result.listings.meta.currentPage;
  lastPage.value = result.listings.meta.lastPage;
  loadingMore.value = false;
}

function goToCar(car: Car) {
  router.push({ name: 'car', params: { id: car.id } });
}

onMounted(load);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-canvas">
    <AppHeader />

    <div class="container flex-1 py-xl">
      <div
        v-if="loading"
        class="flex flex-1 items-center justify-center py-3xl text-body text-ink-muted"
      >
        <p>Загружаем профиль…</p>
      </div>

      <div
        v-else-if="notFound"
        class="flex flex-1 flex-col items-center gap-md py-3xl text-center text-body text-ink-muted"
      >
        <p>Профиль не найден.</p>
      </div>

      <template v-else-if="owner">
        <header class="flex items-center gap-4 rounded-radius-lg border border-hairline bg-surface-paper p-lg">
          <span
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-title font-extrabold text-brand-on"
            aria-hidden="true"
          >
            {{ owner.displayName.charAt(0) }}
          </span>
          <div class="min-w-0">
            <h1 class="truncate text-title font-bold text-ink">{{ owner.displayName }}</h1>
            <p class="text-small text-ink-soft">
              {{ ownerTypeLabel }}<template v-if="owner.memberSince"> · на платформе с {{ owner.memberSince }}</template>
            </p>
          </div>
        </header>

        <h2 class="mb-md mt-xl text-title-sm font-bold text-ink">
          Объявления ({{ listings.length }})
        </h2>

        <p v-if="!listings.length" class="text-body text-ink-muted">
          У этого владельца пока нет опубликованных объявлений.
        </p>

        <div
          v-else
          class="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-base sm:gap-lg"
        >
          <CarCard
            v-for="car in listings"
            :key="car.id"
            :car="car"
            @details="goToCar"
            @apply="goToCar"
          />
        </div>

        <div v-if="page < lastPage" class="mt-lg flex justify-center">
          <button
            type="button"
            :disabled="loadingMore"
            class="rounded-radius-md border border-hairline-strong px-6 py-2.5 text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60"
            @click="loadMore"
          >
            {{ loadingMore ? 'Загружаем…' : 'Показать ещё' }}
          </button>
        </div>
      </template>
    </div>

    <AppFooter />
  </div>
</template>
