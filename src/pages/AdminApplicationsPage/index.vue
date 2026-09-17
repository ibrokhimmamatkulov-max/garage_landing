<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { apiInstance } from '@/shared/api';
import NativeSelect from '@/shared/ui/NativeSelect/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';
import AdminLayout from '@/widgets/AdminLayout/index.vue';

defineOptions({
  name: 'AdminApplicationsPage',
});

interface Status {
  id: number;
  code: string;
  name: string;
  count?: number;
}

interface Application {
  id: number;
  name: string;
  phone: string;
  comment: string | null;
  desired_start_date: string | null;
  desired_end_date: string | null;
  calculated_total: number | null;
  status: Status | null;
  status_changed_at: string | null;
  source: string;
  city: { id: number; name: string } | null;
  listing: { id: number; brand: string; model: string; year: number; car_number: string };
  owner: { id: number; name: string; phone: string } | null;
  created_at: string;
}

const rows = ref<Application[]>([]);
const statuses = ref<Status[]>([]);
const cities = ref<Array<{ id: number; name: string }>>([]);
const total = ref(0);

const activeStatus = ref<number | null>(null);
const search = ref('');
const cityId = ref('');
const sort = ref('new');

const loading = ref(false);
const selected = ref<Application | null>(null);
const copied = ref<number | null>(null);

async function loadSummary() {
  const { data } = await apiInstance.get('/rental-applications/summary');
  statuses.value = data.data?.statuses ?? [];
  total.value = data.data?.total ?? 0;
}

async function loadRows() {
  loading.value = true;
  try {
    const { data } = await apiInstance.get('/rental-applications', {
      params: {
        ...(activeStatus.value ? { status_id: activeStatus.value } : {}),
        ...(search.value ? { search: search.value } : {}),
        ...(cityId.value ? { city_id: cityId.value } : {}),
        sort: sort.value,
      },
    });
    rows.value = data.data?.data ?? [];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const { data } = await apiInstance.get('/cities');
  cities.value = data.data ?? [];
  await Promise.all([loadSummary(), loadRows()]);
});

/** Поиск с задержкой: менеджер печатает, а не жмёт «найти» */
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadRows, 300);
});
watch([activeStatus, cityId, sort], loadRows);

async function changeStatus(app: Application, statusId: string) {
  const { data } = await apiInstance.patch(`/rental-applications/${app.id}`, {
    status_id: Number(statusId),
  });
  const updated = data.data;
  const i = rows.value.findIndex((r) => r.id === app.id);
  if (i !== -1) rows.value[i] = { ...rows.value[i], status: updated.status };
  if (selected.value?.id === app.id) selected.value = { ...selected.value, status: updated.status };
  await loadSummary();
  // Если фильтр по статусу активен, заявка уезжает из текущей вкладки
  if (activeStatus.value) await loadRows();
}

async function copyPhone(app: Application) {
  try {
    await navigator.clipboard.writeText(`+${app.phone}`);
    copied.value = app.id;
    setTimeout(() => (copied.value = null), 1600);
  } catch {
    /* буфер недоступен — телефон и так на экране */
  }
}

/* ---------------- форматирование ---------------- */

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return `сегодня, ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `вчера, ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function fmtPeriod(from: string | null, to: string | null) {
  if (!from || !to) return '—';
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${new Date(from).toLocaleDateString('ru-RU', opts)} — ${new Date(to).toLocaleDateString('ru-RU', opts)}`;
}

function fmtPhone(phone: string) {
  const d = phone.replace(/\D/g, '');
  if (d.length !== 12) return `+${d}`;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
}

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-brand-tint text-brand-ink',
  contacted: 'bg-state-warning-tint text-state-warning',
  deal: 'bg-brand-tint text-brand-ink',
  rejected: 'bg-surface-sunken text-ink-muted',
  spam: 'bg-state-error-tint text-state-error',
};

const hasFilters = computed(() => Boolean(search.value || cityId.value || activeStatus.value));

function resetFilters() {
  search.value = '';
  cityId.value = '';
  activeStatus.value = null;
}
</script>

<template>
  <AdminLayout title="Заявки" :subtitle="`Всего ${total}`">
    <!-- Вкладки по статусам со счётчиками -->
    <nav class="scroll-x flex gap-1 border-b border-hairline" role="tablist">
      <button
        role="tab"
        :aria-selected="activeStatus === null"
        class="-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-small font-semibold transition-colors duration-fast"
        :class="activeStatus === null ? 'border-brand-ink text-ink' : 'border-transparent text-ink-soft hover:text-ink'"
        @click="activeStatus = null"
      >
        Все
        <span class="tnum rounded-full bg-surface-sunken px-1.5 py-0.5 text-caption font-bold text-ink-muted">
          {{ total }}
        </span>
      </button>
      <button
        v-for="s in statuses"
        :key="s.id"
        role="tab"
        :aria-selected="activeStatus === s.id"
        class="-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-small font-semibold transition-colors duration-fast"
        :class="activeStatus === s.id ? 'border-brand-ink text-ink' : 'border-transparent text-ink-soft hover:text-ink'"
        @click="activeStatus = s.id"
      >
        {{ s.name }}
        <span
          class="tnum rounded-full px-1.5 py-0.5 text-caption font-bold"
          :class="s.code === 'new' && s.count ? 'bg-brand-ink text-white' : 'bg-surface-sunken text-ink-muted'"
        >
          {{ s.count ?? 0 }}
        </span>
      </button>
    </nav>

    <!-- Поиск и фильтры -->
    <div class="flex flex-wrap items-center gap-sm py-md">
      <div class="min-w-[14rem] flex-1">
        <TextField v-model="search" placeholder="Имя, телефон или машина" />
      </div>
      <div class="w-40">
        <NativeSelect v-model="cityId" :options="cities" placeholder="Все города" />
      </div>
      <div class="w-44">
        <NativeSelect
          v-model="sort"
          :options="[
            { id: 'new', name: 'Сначала новые' },
            { id: 'old', name: 'Сначала старые' },
          ]"
        />
      </div>
      <button
        v-if="hasFilters"
        class="rounded-radius-md border border-hairline px-3.5 py-2.5 text-small font-semibold text-ink-muted transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
        @click="resetFilters"
      >
        Сбросить
      </button>
    </div>

    <!-- Таблица. Менеджер работает в ней весь день, поэтому плотно и без карточек -->
    <div class="overflow-x-auto rounded-radius-lg border border-hairline bg-surface-paper">
      <table class="w-full min-w-[56rem] border-collapse">
        <thead>
          <tr class="border-b border-hairline text-left">
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Клиент</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Автомобиль</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Даты</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Сумма</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Создана</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Статус</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="n in 8" :key="n" class="border-b border-hairline-soft">
            <td v-for="c in 6" :key="c" class="px-base py-3.5">
              <div class="skeleton h-4 w-full rounded" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="!rows.length">
          <tr>
            <td colspan="6" class="px-base py-3xl text-center">
              <p class="text-body text-ink-muted">Заявок не нашлось.</p>
              <button
                v-if="hasFilters"
                class="mt-md rounded-radius-md border border-hairline px-4 py-2.5 text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken"
                @click="resetFilters"
              >
                Сбросить фильтры
              </button>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="a in rows"
            :key="a.id"
            class="cursor-pointer border-b border-hairline-soft transition-colors duration-fast last:border-0 hover:bg-surface-sunken"
            :class="selected?.id === a.id && 'bg-surface-sunken'"
            @click="selected = a"
          >
            <td class="px-base py-3.5 align-top">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-ink">{{ a.name }}</span>
                <span
                  v-if="a.status?.code === 'new'"
                  class="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-ink"
                  title="Новая"
                />
              </div>
              <button
                class="tnum mt-0.5 text-small text-ink-muted transition-colors duration-fast hover:text-brand-ink"
                @click.stop="copyPhone(a)"
              >
                {{ copied === a.id ? 'Скопировано' : fmtPhone(a.phone) }}
              </button>
            </td>

            <td class="px-base py-3.5 align-top">
              <p class="text-small text-ink">{{ a.listing.brand }} {{ a.listing.model }}</p>
              <p class="tnum mt-0.5 text-caption text-ink-soft">
                {{ a.listing.year }} · {{ a.city?.name }}
              </p>
            </td>

            <td class="tnum px-base py-3.5 align-top text-small text-ink-muted">
              {{ fmtPeriod(a.desired_start_date, a.desired_end_date) }}
            </td>

            <td class="tnum px-base py-3.5 align-top text-small font-semibold text-ink">
              {{ a.calculated_total ? `${a.calculated_total} с.` : '—' }}
            </td>

            <td class="px-base py-3.5 align-top text-small text-ink-muted">
              {{ fmtDate(a.created_at) }}
            </td>

            <td class="px-base py-3.5 align-top" @click.stop>
              <div class="w-40">
                <NativeSelect
                  :model-value="a.status?.id ?? ''"
                  :options="statuses"
                  @update:model-value="changeStatus(a, $event)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Панель заявки -->
    <Teleport to="body">
      <div
        v-if="selected"
        class="fixed inset-0 z-[150] flex justify-end bg-ink/40"
        @click.self="selected = null"
      >
        <aside class="flex h-full w-full max-w-[26rem] flex-col overflow-y-auto bg-surface-paper shadow-modal">
          <header class="sticky top-0 flex items-start justify-between gap-md border-b border-hairline bg-surface-paper px-lg py-base">
            <div>
              <h2 class="text-title font-bold text-ink">{{ selected.name }}</h2>
              <span
                class="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-caption font-bold"
                :class="STATUS_STYLE[selected.status?.code ?? ''] ?? 'bg-surface-sunken text-ink-muted'"
              >
                {{ selected.status?.name }}
              </span>
            </div>
            <button
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
              aria-label="Закрыть"
              @click="selected = null"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
          </header>

          <div class="flex flex-col gap-lg px-lg py-lg">
            <a
              :href="`tel:+${selected.phone}`"
              class="tnum block rounded-radius-md bg-brand-ink px-base py-3.5 text-center text-title-sm font-bold text-white no-underline transition-colors duration-fast hover:bg-brand-deep"
            >
              {{ fmtPhone(selected.phone) }}
            </a>

            <dl class="flex flex-col divide-y divide-hairline-soft">
              <div
                v-for="row in [
                  { k: 'Автомобиль', v: `${selected.listing.brand} ${selected.listing.model}, ${selected.listing.year}` },
                  { k: 'Госномер', v: selected.listing.car_number },
                  { k: 'Город', v: selected.city?.name ?? '—' },
                  { k: 'Даты аренды', v: fmtPeriod(selected.desired_start_date, selected.desired_end_date) },
                  { k: 'Расчёт', v: selected.calculated_total ? `${selected.calculated_total} сомони` : '—' },
                  { k: 'Создана', v: fmtDate(selected.created_at) },
                  { k: 'Источник', v: selected.source === 'admin' ? 'Заведена вручную' : 'С сайта' },
                ]"
                :key="row.k"
                class="flex items-start justify-between gap-md py-2.5 first:pt-0"
              >
                <dt class="shrink-0 text-small text-ink-muted">{{ row.k }}</dt>
                <dd class="tnum text-right text-small font-semibold text-ink">{{ row.v }}</dd>
              </div>
            </dl>

            <div v-if="selected.comment">
              <h3 class="text-caption font-bold uppercase tracking-[0.08em] text-ink-soft">Комментарий</h3>
              <p class="mt-2 rounded-radius-md bg-surface-sunken px-3.5 py-2.5 text-small italic text-ink">
                «{{ selected.comment }}»
              </p>
            </div>

            <!-- Кому уходит лид: менеджеру нужно понимать, с кем связываться -->
            <div v-if="selected.owner">
              <h3 class="text-caption font-bold uppercase tracking-[0.08em] text-ink-soft">Владелец авто</h3>
              <div class="mt-2 rounded-radius-md border border-hairline px-3.5 py-2.5">
                <p class="text-small font-semibold text-ink">{{ selected.owner.name }}</p>
                <a
                  :href="`tel:+${selected.owner.phone}`"
                  class="tnum text-small text-ink-muted no-underline transition-colors duration-fast hover:text-brand-ink"
                >
                  {{ fmtPhone(selected.owner.phone) }}
                </a>
              </div>
            </div>

            <div>
              <h3 class="mb-2 text-caption font-bold uppercase tracking-[0.08em] text-ink-soft">Статус</h3>
              <NativeSelect
                :model-value="selected.status?.id ?? ''"
                :options="statuses"
                @update:model-value="changeStatus(selected, $event)"
              />
            </div>
          </div>
        </aside>
      </div>
    </Teleport>
  </AdminLayout>
</template>
