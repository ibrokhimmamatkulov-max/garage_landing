<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useCarStore } from '@/entities/car';
import AppHeader from '@/widgets/AppHeader/index.vue';
import CarDetails from '@/widgets/CarDetails/index.vue';
import AppFooter from '@/widgets/AppFooter/index.vue';
import { FilterModal } from '@/features/filter-cars';
import { ApplicationModal, ApplicationSuccessModal } from '@/features/submit-application';

defineOptions({
  name: 'CarPage',
});

const route = useRoute();
const router = useRouter();
const carStore = useCarStore();

const isFilterOpen = ref(false);
const isApplicationOpen = ref(false);
const isSuccessOpen = ref(false);

onMounted(async () => {
  const id = route.params.id as string;
  await carStore.fetchCarById(id);
});

function handleApply() {
  isApplicationOpen.value = true;
}

function handleApplicationSuccess() {
  isApplicationOpen.value = false;
  isSuccessOpen.value = true;
}

function handleBack() {
  router.push({ name: 'home' });
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-canvas">
    <AppHeader @open-filters="isFilterOpen = true" />

    <div
      v-if="carStore.isLoading"
      class="container flex flex-1 items-center justify-center py-3xl text-body text-ink-muted"
    >
      <p>Загружаем объявление…</p>
    </div>

    <div
      v-else-if="!carStore.currentCar"
      class="container flex flex-1 items-center justify-center py-3xl text-body text-ink-muted"
    >
      <p>Объявление не найдено или снято с публикации.</p>
    </div>

    <CarDetails v-else :car="carStore.currentCar" @apply="handleApply" @back="handleBack" />

    <AppFooter />

    <!--
      Просвет под закреплённой панелью: без него она навсегда закрывала
      нижние строки подвала — дальше страница уже не прокручивается.
      Фон совпадает с подвалом, чтобы полоса не читалась отдельным блоком.
    -->
    <div class="h-[4.75rem] bg-surface-paper lg:hidden" aria-hidden="true" />

    <!-- Modals -->
    <FilterModal v-if="isFilterOpen" @close="isFilterOpen = false" />

    <ApplicationModal
      v-if="isApplicationOpen && carStore.currentCar"
      :car="carStore.currentCar"
      @close="isApplicationOpen = false"
      @success="handleApplicationSuccess"
    />

    <ApplicationSuccessModal
      v-if="isSuccessOpen && carStore.currentCar"
      :car="carStore.currentCar"
      @close="isSuccessOpen = false"
    />
  </div>
</template>
