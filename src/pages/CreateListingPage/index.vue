<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { apiInstance } from '@/shared/api';
import AppHeader from '@/widgets/AppHeader/index.vue';
import AppFooter from '@/widgets/AppFooter/index.vue';
import FormField from '@/shared/ui/FormField/index.vue';
import NativeSelect from '@/shared/ui/NativeSelect/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';
import DocumentCheck from '@/features/create-listing/ui/DocumentCheck/index.vue';
import PriceTiers from '@/features/create-listing/ui/PriceTiers/index.vue';
import PhotoUploader from '@/features/create-listing/ui/PhotoUploader/index.vue';
import AuthModal from '@/features/auth-otp/ui/AuthModal/index.vue';
import {
  clearDraft,
  emptyDraft,
  loadDraft,
  saveDraft,
  type ListingDraft,
} from '@/features/create-listing/model/draft';

defineOptions({
  name: 'CreateListingPage',
});

const router = useRouter();

const draft = reactive<ListingDraft>(loadDraft() ?? emptyDraft());
const documents = ref<File[]>([]);
const photos = ref<File[]>([]);
const restoredFromDraft = ref(Boolean(loadDraft()));
const submitting = ref(false);

/* ---------------- справочники ---------------- */

type Option = { id: string | number; name: string };

const cities = ref<Option[]>([]);
const brands = ref<Option[]>([]);
const models = ref<Option[]>([]);
const bodyTypes = ref<Option[]>([]);
const colors = ref<Option[]>([]);
const gearboxes = ref<Option[]>([]);
const fuelTypes = ref<Option[]>([]);
const reference = ref<{
  conditions: Option[];
  drive_types: Option[];
  engine_volumes: Option[];
  years: Option[];
}>({ conditions: [], drive_types: [], engine_volumes: [], years: [] });

const YES_NO: Option[] = [
  { id: '1', name: 'Да' },
  { id: '0', name: 'Нет' },
];

async function pick<T = Option[]>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiInstance.get(url, { params });
  return (data?.data ?? []) as T;
}

onMounted(async () => {
  const [c, b, bt, col, g, f, ref_] = await Promise.all([
    pick('/landing/cities'),
    pick('/landing/car-brands'),
    pick('/landing/body-types'),
    pick('/landing/colors'),
    pick('/landing/gearboxes'),
    pick('/landing/fuel-types'),
    pick<typeof reference.value>('/owner/reference'),
  ]);
  cities.value = c;
  brands.value = b;
  bodyTypes.value = bt;
  colors.value = col;
  gearboxes.value = g;
  fuelTypes.value = f;
  reference.value = ref_;

  if (draft.brandId) await loadModels(draft.brandId);
});

async function loadModels(brandId: string) {
  const rows = await pick<Array<{ id: number; car_model: string }>>('/landing/car-models', {
    brand_id: brandId,
  });
  models.value = rows.map((m) => ({ id: m.id, name: m.car_model }));
}

watch(
  () => draft.brandId,
  async (id, prev) => {
    if (prev !== undefined && id !== prev) draft.modelId = '';
    if (id) await loadModels(id);
    else models.value = [];
  },
);

/* ---------------- черновик ---------------- */

watch(draft, () => saveDraft(draft), { deep: true });

/* ---------------- готовность ---------------- */

const REQUIRED: Array<[keyof ListingDraft, string]> = [
  ['cityId', 'Город'],
  ['brandId', 'Марка'],
  ['modelId', 'Модель'],
  ['year', 'Год выпуска'],
  ['conditionId', 'Состояние'],
  ['customsCleared', 'Растаможен в РТ'],
  ['engineVolume', 'Объём двигателя'],
  ['bodyTypeId', 'Кузов'],
  ['colorId', 'Цвет'],
  ['gearboxId', 'Коробка передач'],
  ['fuelTypeId', 'Вид топлива'],
  ['driveType', 'Привод'],
  ['hasTaxiLicense', 'Лицензия на такси'],
  ['hasTurbo', 'Турбина'],
  ['carNumber', 'Госномер'],
];

const missing = computed(() => {
  const out = REQUIRED.filter(([key]) => !String(draft[key] ?? '').trim()).map(([, label]) => label);

  if (photos.value.length < 3) out.push('Минимум 3 фотографии');
  if (!draft.priceTiers.some((t) => Number(t.pricePerDay) > 0)) out.push('Цена аренды');

  return out;
});

const canSubmit = computed(() => missing.value.length === 0);

const minPrice = computed(() => {
  const prices = draft.priceTiers.map((t) => Number(t.pricePerDay)).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : null;
});

/**
 * Авторизация — последним шагом и НЕ уходом на отдельную страницу.
 * Человек только что заполнил 25 полей: увести его со своего экрана значит
 * порвать контекст и напугать потерей заполненного. Окно открывается поверх,
 * форма остаётся на месте.
 */
const authOpen = ref(false);

function submit() {
  if (!canSubmit.value) return;
  authOpen.value = true;
}

async function onAuthSuccess() {
  authOpen.value = false;
  submitting.value = true;
  try {
    // Здесь уйдёт POST /owner/listings с уже полученным токеном,
    // затем догрузка фотографий и документов.
    clearDraft();
    router.push({ name: 'cabinet', query: { published: '1' } });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-canvas">
    <AppHeader />

    <main class="container flex-1 py-xl">
      <div class="mx-auto max-w-[52rem]">
        <header class="mb-xl">
          <h1 class="text-display-sm font-extrabold text-ink sm:text-display">
            Сдать автомобиль в аренду
          </h1>
          <p class="mt-sm max-w-[36rem] text-body text-ink-muted">
            Заполните данные — после проверки объявление появится на сайте. Войти попросим
            только в конце, перед публикацией.
          </p>
          <p
            v-if="restoredFromDraft"
            class="mt-md inline-flex items-center gap-2 rounded-radius-md bg-brand-tint px-3 py-2 text-caption font-semibold text-brand-ink"
          >
            Мы восстановили черновик — можно продолжить с того же места.
          </p>
        </header>

        <div class="flex flex-col gap-lg">
          <!-- ---------- Автомобиль ---------- -->
          <section class="rounded-radius-lg border border-hairline bg-surface-paper p-lg">
            <h2 class="text-title font-bold text-ink">Автомобиль</h2>
            <p class="mt-1 text-small text-ink-muted">Данные из техпаспорта.</p>

            <div class="mt-lg grid gap-md sm:grid-cols-2">
              <FormField label="Город" required for="f-city">
                <NativeSelect id="f-city" v-model="draft.cityId" :options="cities" />
              </FormField>
              <FormField label="Госномер" required for="f-plate" hint="По нему мы не даём выставить одну машину дважды">
                <TextField id="f-plate" v-model="draft.carNumber" placeholder="01 AB 123 TJ" />
              </FormField>

              <FormField label="Марка" required for="f-brand">
                <NativeSelect id="f-brand" v-model="draft.brandId" :options="brands" />
              </FormField>
              <FormField label="Модель" required for="f-model">
                <NativeSelect
                  id="f-model"
                  v-model="draft.modelId"
                  :options="models"
                  :disabled="!draft.brandId"
                  :placeholder="draft.brandId ? 'Выберите из списка' : 'Сначала выберите марку'"
                />
              </FormField>

              <FormField label="Год выпуска" required for="f-year">
                <NativeSelect id="f-year" v-model="draft.year" :options="reference.years" />
              </FormField>
              <FormField label="Состояние" required for="f-cond">
                <NativeSelect id="f-cond" v-model="draft.conditionId" :options="reference.conditions" />
              </FormField>

              <FormField label="Растаможен в РТ" required for="f-customs">
                <NativeSelect id="f-customs" v-model="draft.customsCleared" :options="YES_NO" />
              </FormField>
              <FormField label="Объём двигателя" required for="f-vol">
                <NativeSelect id="f-vol" v-model="draft.engineVolume" :options="reference.engine_volumes" />
              </FormField>

              <FormField label="Пробег" for="f-mileage">
                <TextField id="f-mileage" v-model="draft.mileage" inputmode="numeric" suffix="км" />
              </FormField>
              <FormField label="Число мест" for="f-seats">
                <TextField id="f-seats" v-model="draft.countSeat" inputmode="numeric" placeholder="5" />
              </FormField>

              <FormField label="Кузов" required for="f-body">
                <NativeSelect id="f-body" v-model="draft.bodyTypeId" :options="bodyTypes" />
              </FormField>
              <FormField label="Цвет" required for="f-color">
                <NativeSelect id="f-color" v-model="draft.colorId" :options="colors" />
              </FormField>

              <FormField label="Коробка передач" required for="f-gear">
                <NativeSelect id="f-gear" v-model="draft.gearboxId" :options="gearboxes" />
              </FormField>
              <FormField label="Вид топлива" required for="f-fuel">
                <NativeSelect id="f-fuel" v-model="draft.fuelTypeId" :options="fuelTypes" />
              </FormField>

              <FormField label="Привод" required for="f-drive">
                <NativeSelect id="f-drive" v-model="draft.driveType" :options="reference.drive_types" />
              </FormField>
              <FormField label="Турбина" required for="f-turbo">
                <NativeSelect id="f-turbo" v-model="draft.hasTurbo" :options="YES_NO" />
              </FormField>

              <FormField label="Лицензия на такси" required for="f-lic">
                <NativeSelect id="f-lic" v-model="draft.hasTaxiLicense" :options="YES_NO" />
              </FormField>
            </div>
          </section>

          <!-- ---------- Документы ---------- -->
          <DocumentCheck v-model="documents" />

          <!-- ---------- Фотографии ---------- -->
          <section class="rounded-radius-lg border border-hairline bg-surface-paper p-lg">
            <h2 class="text-title font-bold text-ink">Фотографии</h2>
            <p class="mt-1 text-small text-ink-muted">
              От 3 до 15 снимков. Первый станет главным — его видят в каталоге.
            </p>
            <PhotoUploader v-model="photos" class="mt-lg" />
          </section>

          <!-- ---------- Условия аренды ---------- -->
          <section class="rounded-radius-lg border border-hairline bg-surface-paper p-lg">
            <h2 class="text-title font-bold text-ink">Условия аренды</h2>
            <p class="mt-1 text-small text-ink-muted">
              Это то, ради чего арендатор открывает объявление. Чем понятнее условия, тем меньше
              пустых звонков.
            </p>

            <div class="mt-lg flex flex-col gap-lg">
              <div>
                <h3 class="mb-sm text-small font-bold text-ink">Цена по сроку аренды</h3>
                <PriceTiers v-model="draft.priceTiers" :min-rent-days="Number(draft.minRentDays) || 1" />
              </div>

              <div class="grid gap-md sm:grid-cols-2">
                <FormField label="Минимальный срок" for="f-min" hint="Суток">
                  <TextField id="f-min" v-model="draft.minRentDays" inputmode="numeric" suffix="сут." />
                </FormField>
                <FormField label="Максимальный срок" for="f-max" hint="Можно не указывать">
                  <TextField id="f-max" v-model="draft.maxRentDays" inputmode="numeric" suffix="сут." />
                </FormField>

                <FormField label="Депозит" for="f-dep" hint="0 — без депозита">
                  <TextField id="f-dep" v-model="draft.depositAmount" inputmode="numeric" suffix="с." />
                </FormField>
                <FormField label="Возврат депозита" for="f-depret">
                  <NativeSelect
                    id="f-depret"
                    v-model="draft.depositReturnPolicy"
                    :options="[
                      { id: 'on_return', name: 'Целиком при возврате авто' },
                      { id: 'daily', name: 'Частями по дням' },
                      { id: 'none', name: 'Не возвращается' },
                    ]"
                  />
                </FormField>

                <FormField label="Лимит пробега в сутки" for="f-lim" hint="Пусто — без лимита">
                  <TextField id="f-lim" v-model="draft.mileageLimitPerDay" inputmode="numeric" suffix="км" />
                </FormField>
                <FormField label="Цена за км сверх лимита" for="f-over">
                  <TextField id="f-over" v-model="draft.overmileagePrice" inputmode="numeric" suffix="с." />
                </FormField>

                <FormField label="Топливо" for="f-fp">
                  <NativeSelect
                    id="f-fp"
                    v-model="draft.fuelPolicy"
                    :options="[
                      { id: 'full_to_full', name: 'Полный бак — полный бак' },
                      { id: 'tenant', name: 'Платит арендатор' },
                      { id: 'owner', name: 'Платит владелец' },
                    ]"
                  />
                </FormField>
                <FormField label="Залог документов" for="f-pledge">
                  <NativeSelect
                    id="f-pledge"
                    v-model="draft.documentsPledge"
                    :options="[
                      { id: 'none', name: 'Не требуется' },
                      { id: 'passport', name: 'Паспорт' },
                      { id: 'any_id', name: 'Любой документ' },
                    ]"
                  />
                </FormField>

                <FormField label="Минимальный возраст" for="f-age">
                  <TextField id="f-age" v-model="draft.minDriverAge" inputmode="numeric" suffix="лет" />
                </FormField>
                <FormField label="Минимальный стаж" for="f-exp">
                  <TextField id="f-exp" v-model="draft.minDriverExperience" inputmode="numeric" suffix="лет" />
                </FormField>
              </div>

              <div>
                <h3 class="mb-sm text-small font-bold text-ink">Что разрешено</h3>
                <div class="grid gap-2 sm:grid-cols-2">
                  <label
                    v-for="rule in [
                      { key: 'allowTaxi', label: 'Работа в такси' },
                      { key: 'allowIntercity', label: 'Выезд за пределы города' },
                      { key: 'allowAbroad', label: 'Выезд за пределы страны' },
                      { key: 'allowSmoking', label: 'Курение в салоне' },
                      { key: 'allowPets', label: 'Перевозка животных' },
                    ]"
                    :key="rule.key"
                    class="flex cursor-pointer items-center gap-2.5 rounded-radius-md border border-hairline px-3.5 py-2.5 transition-colors duration-fast hover:bg-surface-sunken"
                  >
                    <input
                      v-model="(draft as any)[rule.key]"
                      type="checkbox"
                      class="h-4 w-4 shrink-0 accent-brand-ink"
                    />
                    <span class="text-small text-ink">{{ rule.label }}</span>
                  </label>
                </div>
              </div>

              <div>
                <label
                  class="flex cursor-pointer items-center gap-2.5 rounded-radius-md border border-hairline px-3.5 py-2.5 transition-colors duration-fast hover:bg-surface-sunken"
                >
                  <input v-model="draft.deliveryAvailable" type="checkbox" class="h-4 w-4 accent-brand-ink" />
                  <span class="text-small text-ink">Могу подать авто по адресу</span>
                </label>
                <FormField v-if="draft.deliveryAvailable" label="Стоимость доставки" class="mt-md" for="f-deliv">
                  <TextField id="f-deliv" v-model="draft.deliveryPrice" inputmode="numeric" suffix="с." />
                </FormField>
              </div>
            </div>
          </section>

          <!-- ---------- Описание ---------- -->
          <section class="rounded-radius-lg border border-hairline bg-surface-paper p-lg">
            <h2 class="text-title font-bold text-ink">Описание</h2>

            <div class="mt-lg flex flex-col gap-md">
              <FormField label="Адрес выдачи" for="f-addr" hint="Район или ориентир, точный адрес согласуете сами">
                <TextField id="f-addr" v-model="draft.address" placeholder="Район Сино, рядом с рынком" />
              </FormField>

              <FormField label="О машине" for="f-desc">
                <textarea
                  id="f-desc"
                  v-model="draft.description"
                  rows="4"
                  placeholder="Что важно знать арендатору: состояние, обслуживание, особенности."
                  class="w-full resize-y rounded-radius-md border border-hairline bg-surface-paper px-3.5 py-2.5 text-body text-ink transition-colors duration-fast placeholder:text-ink-ghost focus:border-brand-ink focus:shadow-focus-brand focus:outline-none"
                />
              </FormField>

              <FormField label="Дополнительные условия" for="f-terms">
                <textarea
                  id="f-terms"
                  v-model="draft.additionalTerms"
                  rows="3"
                  placeholder="Всё, что не уместилось в поля выше."
                  class="w-full resize-y rounded-radius-md border border-hairline bg-surface-paper px-3.5 py-2.5 text-body text-ink transition-colors duration-fast placeholder:text-ink-ghost focus:border-brand-ink focus:shadow-focus-brand focus:outline-none"
                />
              </FormField>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Липкая панель публикации: всегда видно, чего не хватает -->
    <div class="sticky bottom-0 z-50 border-t border-hairline bg-surface-paper/95 backdrop-blur-xl">
      <div class="container flex flex-wrap items-center justify-between gap-md py-md">
        <div class="min-w-0">
          <p v-if="canSubmit" class="text-small font-semibold text-brand-ink">
            Всё заполнено — можно публиковать
          </p>
          <p v-else class="text-small text-ink-muted">
            Осталось заполнить:
            <span class="font-semibold text-ink">{{ missing.slice(0, 3).join(', ') }}</span>
            <span v-if="missing.length > 3" class="text-ink-soft"> и ещё {{ missing.length - 3 }}</span>
          </p>
          <p v-if="minPrice" class="tnum mt-0.5 text-caption text-ink-soft">
            В каталоге будет показано «от {{ minPrice }} сомони / сутки»
          </p>
        </div>

        <button
          type="button"
          :disabled="!canSubmit || submitting"
          class="shrink-0 rounded-radius-md bg-brand px-6 py-3 text-body font-semibold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
          @click="submit"
        >
          Опубликовать
        </button>
      </div>
    </div>

    <AppFooter />

    <AuthModal
      v-if="authOpen"
      title="Остался один шаг"
      subtitle="Подтвердите номер — по нему вы будете управлять объявлением и получать заявки."
      confirm-label="Опубликовать"
      @close="authOpen = false"
      @success="onAuthSuccess"
    />
  </div>
</template>
