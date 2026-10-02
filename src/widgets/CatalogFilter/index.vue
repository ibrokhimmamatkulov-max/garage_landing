<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useCarStore } from '@/entities/car';
import { apiInstance } from '@/shared/api';
import { AppIcon } from '@/shared/ui';
import FormField from '@/shared/ui/FormField/index.vue';
import NativeSelect from '@/shared/ui/NativeSelect/index.vue';
import SearchSelect from '@/shared/ui/SearchSelect/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'CatalogFilter',
});

type Option = { id: number | string; name: string };

const carStore = useCarStore();

const open = ref(false);

const brands = ref<Option[]>([]);
const bodyTypes = ref<Option[]>([]);
const gearboxes = ref<Option[]>([]);
const fuelTypes = ref<Option[]>([]);
let optionsLoaded = false;

/**
 * Черновик фильтра. Применяется кнопкой, а не на каждое движение: иначе
 * набор цены «250» слал бы три запроса подряд и список прыгал под пальцем.
 */
const draft = reactive({
  brandId: '',
  bodyTypeId: '',
  gearboxId: '',
  fuelTypeId: '',
  priceFrom: '',
  priceTo: '',
  sort: 'price_asc',
});

// В списке — короткие подписи: в узкой колонке на телефоне «Сначала дешевле»
// обрезалось до «Сначала деше…». Полная фраза нужна только в строке счётчика.
const SORTS: Option[] = [
  { id: 'price_asc', name: 'Дешевле' },
  { id: 'price_desc', name: 'Дороже' },
  { id: 'year_desc', name: 'Новее' },
  { id: 'year_asc', name: 'Старше' },
];

const SORT_PHRASE: Record<string, string> = {
  price_asc: 'сначала дешевле',
  price_desc: 'сначала дороже',
  year_desc: 'сначала новее',
  year_asc: 'сначала старше',
};

const brandOptions = computed<Option[]>(() => [{ id: '', name: 'Любая' }, ...brands.value]);

const activeCount = computed(() => {
  const f = carStore.filters;
  return [f.brandId, f.bodyTypeId, f.gearboxId, f.fuelTypeId, f.priceFrom, f.priceTo].filter(
    (v) => v !== null && v !== undefined,
  ).length;
});

const total = computed(() => carStore.pagination.total);

/** «47 автомобилей» — склонение по последней цифре */
const carsLabel = computed(() => {
  const n = total.value;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'автомобиль';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'автомобиля';
  return 'автомобилей';
});

const sortLabel = computed(() => SORT_PHRASE[carStore.filters.sort ?? 'price_asc'] ?? SORT_PHRASE.price_asc);

const str = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v));
const num = (v: string) => {
  const n = Number(v);
  return v.trim() !== '' && Number.isFinite(n) && n > 0 ? n : null;
};

function syncDraft() {
  const f = carStore.filters;
  draft.brandId = str(f.brandId);
  draft.bodyTypeId = str(f.bodyTypeId);
  draft.gearboxId = str(f.gearboxId);
  draft.fuelTypeId = str(f.fuelTypeId);
  draft.priceFrom = str(f.priceFrom);
  draft.priceTo = str(f.priceTo);
  draft.sort = f.sort ?? 'price_asc';
}

async function pick(url: string): Promise<Option[]> {
  const { data } = await apiInstance.get(url);
  return (data?.data ?? []) as Option[];
}

async function loadOptions() {
  if (optionsLoaded) return;
  optionsLoaded = true;

  // allSettled: упавший справочник оставляет пустым только свой список
  const [b, bt, g, f] = await Promise.allSettled([
    pick('/landing/car-brands'),
    pick('/landing/body-types'),
    pick('/landing/gearboxes'),
    pick('/landing/fuel-types'),
  ]);
  brands.value = b.status === 'fulfilled' ? b.value : [];
  bodyTypes.value = bt.status === 'fulfilled' ? bt.value : [];
  gearboxes.value = g.status === 'fulfilled' ? g.value : [];
  fuelTypes.value = f.status === 'fulfilled' ? f.value : [];
}

function toggle() {
  open.value = !open.value;
  if (open.value) {
    syncDraft();
    void loadOptions();
  }
}

const priceRangeInvalid = computed(() => {
  const from = num(draft.priceFrom);
  const to = num(draft.priceTo);
  return from !== null && to !== null && from > to;
});

async function apply() {
  if (priceRangeInvalid.value) return;
  open.value = false;
  await carStore.applyFilters({
    brandId: num(draft.brandId),
    bodyTypeId: num(draft.bodyTypeId),
    gearboxId: num(draft.gearboxId),
    fuelTypeId: num(draft.fuelTypeId),
    priceFrom: num(draft.priceFrom),
    priceTo: num(draft.priceTo),
    sort: draft.sort as typeof carStore.filters.sort,
  });
}

async function reset() {
  open.value = false;
  await carStore.applyFilters({
    brandId: null,
    bodyTypeId: null,
    gearboxId: null,
    fuelTypeId: null,
    priceFrom: null,
    priceTo: null,
    sort: 'price_asc',
  });
}
</script>

<template>
  <section class="container pt-lg sm:pt-xl">
    <div class="flex flex-wrap items-center justify-between gap-x-base gap-y-sm">
      <button
        type="button"
        class="inline-flex min-h-[44px] items-center gap-2 rounded-full border bg-surface-paper px-4 text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken"
        :class="open || activeCount ? 'border-ink' : 'border-hairline hover:border-hairline-strong'"
        :aria-expanded="open"
        aria-controls="catalog-filter-panel"
        @click="toggle"
      >
        <AppIcon name="filter" :size="18" class="shrink-0" />
        Фильтр
        <span
          v-if="activeCount"
          class="tnum flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1.5 text-[11px] font-bold leading-none text-white"
        >
          {{ activeCount }}
        </span>
        <svg
          class="shrink-0 text-ink-soft transition-transform duration-base"
          :class="open && 'rotate-180'"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 4l3 3 3-3"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <p v-if="total > 0" class="tnum text-small text-ink-soft">
        Найдено {{ total }} {{ carsLabel }} · {{ sortLabel }}
      </p>
    </div>

    <!--
      Раскрытие через grid-rows 0fr → 1fr: высота анимируется без замеров
      в JS. inert убирает скрытые поля из табуляции и экранных читалок.
    -->
    <div
      id="catalog-filter-panel"
      class="grid transition-[grid-template-rows] duration-base ease-out"
      :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      :inert="open ? undefined : true"
    >
      <div class="min-h-0 overflow-hidden">
        <form
          class="mt-md rounded-radius-lg border border-hairline bg-surface-paper p-base sm:p-lg"
          @submit.prevent="apply"
        >
          <div class="grid grid-cols-2 gap-x-md gap-y-base sm:gap-x-base lg:grid-cols-3">
            <FormField label="Марка" for="cf-brand" class="col-span-2 sm:col-span-1">
              <SearchSelect
                id="cf-brand"
                v-model="draft.brandId"
                :options="brandOptions"
                placeholder="Любая"
              />
            </FormField>

            <FormField label="Кузов" for="cf-body">
              <NativeSelect id="cf-body" v-model="draft.bodyTypeId" :options="bodyTypes" empty-label="Любой" />
            </FormField>

            <FormField label="Коробка передач" for="cf-gear">
              <NativeSelect id="cf-gear" v-model="draft.gearboxId" :options="gearboxes" empty-label="Любая" />
            </FormField>

            <FormField label="Топливо" for="cf-fuel">
              <NativeSelect id="cf-fuel" v-model="draft.fuelTypeId" :options="fuelTypes" empty-label="Любое" />
            </FormField>

            <FormField label="Сортировка" for="cf-sort">
              <NativeSelect id="cf-sort" v-model="draft.sort" :options="SORTS" />
            </FormField>
            <FormField
              label="Цена за сутки, сомони"
              class="col-span-2 sm:col-span-1"
              for="cf-price-from"
              :error="priceRangeInvalid ? '«От» больше, чем «До»' : null"
            >
              <div class="flex items-center gap-2">
                <TextField
                  id="cf-price-from"
                  v-model="draft.priceFrom"
                  inputmode="numeric"
                  placeholder="от"
                  :invalid="priceRangeInvalid"
                />
                <span class="text-ink-ghost" aria-hidden="true">—</span>
                <TextField
                  id="cf-price-to"
                  v-model="draft.priceTo"
                  inputmode="numeric"
                  placeholder="до"
                  :invalid="priceRangeInvalid"
                />
              </div>
            </FormField>

          </div>

          <div class="mt-lg flex items-center gap-sm sm:justify-end">
            <button
              type="button"
              class="min-h-[44px] shrink-0 rounded-radius-md px-4 text-small font-semibold text-ink-muted transition-colors duration-fast hover:text-ink"
              @click="reset"
            >
              Сбросить
            </button>
            <button
              type="submit"
              :disabled="priceRangeInvalid"
              class="min-h-[44px] flex-1 rounded-radius-md bg-brand px-6 text-body font-semibold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft sm:flex-none"
            >
              Показать
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
