<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { apiInstance } from '@/shared/api';
import AdminLayout from '@/widgets/AdminLayout/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';
import NativeSelect from '@/shared/ui/NativeSelect/index.vue';

defineOptions({
  name: 'AdminListingsPage',
});

interface Offer {
  id: number;
  listing_type: 'taxi' | 'general';
  brand: string;
  model: string;
  year: number;
  city: { id: number | null; name: string | null };
  gearbox: { id: number | null; name: string | null };
  fuel_type: { id: number | null; name: string | null };
  min_price: number | null;
  min_rent_days: number | null;
  photos: string[];
}

/** Админка на своём домене, поэтому карточка открывается по абсолютной ссылке */
const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '');

const rows = ref<Offer[]>([]);
const total = ref(0);
const loading = ref(false);
const search = ref('');
const listingType = ref('');

async function load() {
  loading.value = true;
  try {
    const { data } = await apiInstance.get('/landing/offers', {
      params: {
        per_page: 50,
        ...(listingType.value ? { listing_type: listingType.value } : {}),
      },
    });
    rows.value = data.data?.data ?? [];
    total.value = data.data?.meta?.total ?? rows.value.length;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(listingType, load);

/** Поиск по уже загруженной странице: серверный фильтр по названию тут не нужен */
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((r) => `${r.brand} ${r.model}`.toLowerCase().includes(q));
});
</script>

<template>
  <AdminLayout title="Объявления" :subtitle="`На витрине ${total}`">
    <div
      class="mb-lg rounded-radius-md border-l-2 border-brand-ink bg-surface-paper px-base py-3 text-small text-ink-muted"
    >
      Премодерация отключена: объявления выходят на витрину сразу. Этот раздел — пост-контроль,
      снять с публикации можно в любой момент.
    </div>

    <div class="mb-md flex flex-wrap items-center gap-sm">
      <div class="min-w-[14rem] flex-1">
        <TextField v-model="search" placeholder="Марка или модель" />
      </div>
      <div class="w-48">
        <NativeSelect
          v-model="listingType"
          :options="[
            { id: '', name: 'Все типы' },
            { id: 'general', name: 'Обычная аренда' },
            { id: 'taxi', name: 'Под такси' },
          ]"
          placeholder="Все типы"
        />
      </div>
    </div>

    <div class="overflow-x-auto rounded-radius-lg border border-hairline bg-surface-paper">
      <table class="w-full min-w-[48rem] border-collapse">
        <thead>
          <tr class="border-b border-hairline text-left">
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Автомобиль</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Город</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Тип</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Цена</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft"></th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="n in 6" :key="n" class="border-b border-hairline-soft">
            <td v-for="c in 5" :key="c" class="px-base py-3.5"><div class="skeleton h-4 w-full rounded" /></td>
          </tr>
        </tbody>

        <tbody v-else-if="!filtered.length">
          <tr>
            <td colspan="5" class="px-base py-3xl text-center text-body text-ink-muted">
              Ничего не нашлось.
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="r in filtered"
            :key="r.id"
            class="border-b border-hairline-soft transition-colors duration-fast last:border-0 hover:bg-surface-sunken"
          >
            <td class="px-base py-3 align-middle">
              <div class="flex items-center gap-3">
                <img
                  v-if="r.photos?.[0]"
                  :src="r.photos[0]"
                  alt=""
                  class="h-11 w-16 shrink-0 rounded-radius-sm object-cover"
                />
                <div class="min-w-0">
                  <p class="truncate text-small font-semibold text-ink">{{ r.brand }} {{ r.model }}</p>
                  <p class="tnum text-caption text-ink-soft">
                    {{ r.year }} · {{ r.gearbox?.name }} · {{ r.fuel_type?.name }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-base py-3 align-middle text-small text-ink-muted">{{ r.city?.name }}</td>
            <td class="px-base py-3 align-middle">
              <span
                class="rounded-full px-2.5 py-0.5 text-caption font-semibold"
                :class="r.listing_type === 'taxi' ? 'bg-surface-sunken text-ink-muted' : 'bg-brand-tint text-brand-ink'"
              >
                {{ r.listing_type === 'taxi' ? 'Под такси' : 'Обычная' }}
              </span>
            </td>
            <td class="tnum px-base py-3 align-middle text-small font-semibold text-ink">
              {{ r.min_price ? `${r.min_price} с.` : '—' }}
            </td>
            <td class="px-base py-3 text-right align-middle">
              <a
                :href="`${SITE_URL}/car/${r.id}`"
                target="_blank"
                rel="noopener"
                class="text-small font-semibold text-brand-ink no-underline transition-colors duration-fast hover:text-brand-deep"
              >
                Открыть
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>
