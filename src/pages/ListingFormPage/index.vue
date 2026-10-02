<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiInstance } from '@/shared/api';
import { useOwnerStore } from '@/entities/owner';
import AppHeader from '@/widgets/AppHeader/index.vue';
import AppFooter from '@/widgets/AppFooter/index.vue';
import FormField from '@/shared/ui/FormField/index.vue';
import NativeSelect from '@/shared/ui/NativeSelect/index.vue';
import SearchSelect from '@/shared/ui/SearchSelect/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';
import DocumentCheck from '@/features/create-listing/ui/DocumentCheck/index.vue';
import PhotoUploader from '@/features/create-listing/ui/PhotoUploader/index.vue';
import AuthModal from '@/features/auth-otp/ui/AuthModal/index.vue';
import {
  clearDraft,
  emptyDraft,
  loadDraft,
  saveDraft,
  type ListingDraft,
} from '@/features/create-listing/model/draft';
import {
  draftToPayload,
  listingToDraft,
  type ApiOwnerListing,
} from '@/features/create-listing/model/mapListing';
import { formatPhotoUrl } from '@/shared/lib/photoUrl';

/**
 * Одна форма на подачу и на правку.
 *
 * Полей тридцать семь; во второй копии они неминуемо разъехались бы, и
 * правка молча теряла бы то, что появилось в подаче. Режим различается
 * только наличием id в адресе.
 */
defineOptions({
  name: 'ListingFormPage',
});

const route = useRoute();
const router = useRouter();

const listingId = computed(() => (route.params.id ? String(route.params.id) : null));
const isEdit = computed(() => listingId.value !== null);

// Черновик из localStorage — только для подачи. Подставлять его в правку
// нельзя: это заготовка другого, ещё не созданного объявления.
const storedDraft = route.params.id ? null : loadDraft();

const draft = reactive<ListingDraft>(storedDraft ?? emptyDraft());
const documents = ref<File[]>([]);
const photos = ref<File[]>([]);
const restoredFromDraft = ref(Boolean(storedDraft));
const submitting = ref(false);

/**
 * Редкие поля свёрнуты по умолчанию — растаможка, пробег, число мест,
 * турбина, лицензия на такси. Ни одно не обязательно, форма из 37 полей
 * не должна казаться длиннее, чем она есть; кто хочет — раскроет галочкой.
 */
const showOptionalFields = ref(false);
/** Лимит пробега и «Что разрешено» — не влияют на решение сдать/снять, спрятаны так же */
const showAdvancedTerms = ref(false);

/* ---------------- правка ---------------- */

const loading = ref(false);
const loadError = ref<string | null>(null);
const saveError = ref<string | null>(null);
const vinVerified = ref(false);

/** Загруженные ранее снимки и те из них, что владелец пометил на удаление */
const savedPhotos = ref<Array<{ id: number; url: string }>>([]);
const removedPhotoIds = ref<number[]>([]);

const visiblePhotos = computed(() =>
  savedPhotos.value.filter((p) => !removedPhotoIds.value.includes(p.id)),
);

/**
 * Удаление откладываем до сохранения.
 *
 * Ручка удаления на сервере необратима, а из формы можно уйти не сохранившись —
 * снимок исчез бы у того, кто просто передумал редактировать.
 */
function markPhotoRemoved(id: number) {
  if (!removedPhotoIds.value.includes(id)) removedPhotoIds.value.push(id);
}

/**
 * Пока идёт заполнение формы с сервера, следим, чтобы наблюдатель за маркой
 * не сбросил модель: он для того и написан, что при смене марки старая
 * модель становится неверной, но при загрузке они приходят согласованной парой.
 */
let hydrating = false;

async function loadListing(id: string) {
  loading.value = true;
  loadError.value = null;
  try {
    const { data } = await apiInstance.get(`/owner/listings/${id}`);
    const listing = (data?.data ?? data) as ApiOwnerListing;

    hydrating = true;
    Object.assign(draft, listingToDraft(listing));

    // Поля свёрнуты по умолчанию, но если в объявлении они уже заполнены —
    // прятать их значило бы выглядеть как потеря данных при открытии правки.
    // '0' у да/нет-полей — тоже осознанный ответ («растаможки нет»), а не
    // пропуск, поэтому проверка на непустую строку, а не строго на '1'.
    if (draft.countSeat || draft.hasTurbo) {
      showOptionalFields.value = true;
    }

    if (
      draft.mileageLimitPerDay
      || draft.overmileagePrice
      || draft.allowAbroad
      || draft.allowSmoking
      || draft.allowPets
      || !draft.allowIntercity
    ) {
      showAdvancedTerms.value = true;
    }

    savedPhotos.value = (listing.photos ?? []).map((p) => ({
      id: p.id,
      url: formatPhotoUrl(p.url),
    }));
    vinVerified.value = Boolean(listing.vin_verified);

    if (draft.brandId) await loadModels(draft.brandId);
    await nextTick();
    hydrating = false;
  } catch (e: any) {
    loadError.value =
      e?.response?.status === 404
        ? 'Объявление не найдено или принадлежит другому аккаунту.'
        : 'Не удалось загрузить объявление.';
  } finally {
    loading.value = false;
  }
}

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

/** Результат одного справочника или запасное значение, если запрос упал. */
function settledOr<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback;
}

onMounted(async () => {
  // allSettled, а не all: с Promise.all одна упавшая ручка (было — 404 на
  // /owner/reference после переезда ручки) обнуляла ВСЕ списки формы разом.
  const [c, b, bt, col, g, f, ref_] = await Promise.allSettled([
    pick('/landing/cities'),
    pick('/landing/car-brands'),
    pick('/landing/body-types'),
    pick('/landing/colors'),
    pick('/landing/gearboxes'),
    pick('/landing/fuel-types'),
    pick<typeof reference.value>('/landing/reference'),
  ]);
  cities.value = settledOr(c, []);
  brands.value = settledOr(b, []);
  bodyTypes.value = settledOr(bt, []);
  colors.value = settledOr(col, []);
  gearboxes.value = settledOr(g, []);
  fuelTypes.value = settledOr(f, []);
  reference.value = settledOr(ref_, reference.value);

  if (listingId.value) {
    await loadListing(listingId.value);
    return;
  }

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
    if (!hydrating && prev !== undefined && id !== prev) draft.modelId = '';
    if (id) await loadModels(id);
    else models.value = [];
  },
);

/* ---------------- черновик ---------------- */

watch(
  draft,
  () => {
    if (!isEdit.value) saveDraft(draft);
  },
  { deep: true },
);

/* ---------------- готовность ---------------- */

/**
 * Растаможка, пробег и лицензия на такси — обязательные (решение от
 * 26.09.2026): для аренды под такси это ровно то, что арендатор спрашивает
 * первым делом, прятать за «Показать ещё поля» не имеет смысла. Турбина и
 * число мест остаются необязательными — они не влияют на решение об аренде.
 */
const REQUIRED: Array<[keyof ListingDraft, string]> = [
  ['cityId', 'Город'],
  ['brandId', 'Марка'],
  ['modelId', 'Модель'],
  ['year', 'Год выпуска'],
  ['engineVolume', 'Объём двигателя'],
  ['bodyTypeId', 'Кузов'],
  ['colorId', 'Цвет'],
  ['gearboxId', 'Коробка передач'],
  ['fuelTypeId', 'Вид топлива'],
  ['carNumber', 'Госномер'],
  ['customsCleared', 'Растаможен в РТ'],
  ['mileage', 'Пробег'],
  ['hasTaxiLicense', 'Лицензия на такси'],
];

/**
 * Электромобилю нечего спрашивать про объём двигателя и турбину — этих
 * узлов у него нет. Определяем по названию топлива: стабильного кода у
 * типов топлива на бэке нет, только id и текст, так что матчим по
 * вхождению корня «электр» без учёта регистра: в справочнике io топливо
 * называется «Электричество», а прежний шаблон «электро» его не ловил —
 * поле объёма двигателя не пропадало. Гибрид сюда не попадает: у него
 * двигатель есть.
 */
const isElectric = computed(() =>
  /электр/i.test(fuelTypes.value.find((f) => String(f.id) === draft.fuelTypeId)?.name ?? ''),
);

// Поля скрываются, но значение в черновике без этого осталось бы висеть —
// после возврата с электро на бензин форма молча подставила бы старое.
watch(isElectric, (electric) => {
  if (!electric) return;
  draft.engineVolume = '';
  draft.hasTurbo = '';
});

/**
 * Формат госномера РТ (проверено 01.10.2026): 4 цифры + 2 буквы + 2-значный
 * код региона, например 1234 AB 01 (пробелы необязательны). Прежний паттерн
 * (2 цифры + 2 буквы + 3 цифры + TJ) не совпадал с реальным форматом вообще —
 * ни один настоящий номер РТ под него не подходил.
 * VIN — 17 латинских букв и цифр без I/O/Q (их путают с 1/0), как того
 * требует стандарт. Ошибка показывается в реальном времени под полем, а не
 * только при попытке отправить форму (решение от 26.09.2026).
 */
const CAR_NUMBER_PATTERN = /^\d{4}\s?[A-Z]{2}\s?\d{2}$/i;
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

const carNumberError = computed(() => {
  const value = draft.carNumber.trim();
  if (!value) return null;
  return CAR_NUMBER_PATTERN.test(value) ? null : 'Формат: 1234 AB 01';
});

const vinError = computed(() => {
  const value = draft.vin.trim();
  if (!value) return null;
  return VIN_PATTERN.test(value) ? null : 'VIN — 17 символов, латиница и цифры, без I, O, Q';
});

const missing = computed(() => {
  const requiredNow = REQUIRED.filter(([key]) => !(isElectric.value && key === 'engineVolume'));
  const out = requiredNow
    .filter(([key]) => !String(draft[key] ?? '').trim())
    .map(([, label]) => label);

  if (visiblePhotos.value.length + photos.value.length < 3) out.push('Минимум 3 фотографии');
  if (!(Number(draft.tariffPricePerDay) > 0)) out.push('Цена за сутки');
  if (carNumberError.value) out.push('Формат госномера');
  if (vinError.value) out.push('Формат VIN');

  return out;
});

const canSubmit = computed(() => missing.value.length === 0);

const minPrice = computed(() => {
  const price = Number(draft.tariffPricePerDay);
  return price > 0 ? price : null;
});

/**
 * «Сколько выходит в месяц» — владелец должен увидеть это сразу, не
 * дожидаясь сохранения. Условный месяц 30 дней: та же цифра, что и на
 * бэке (TaxiTariff::getMonthlyTotalAttribute), чтобы после сохранения
 * число на экране не поменялось.
 */
const monthlyTotal = computed(() => {
  const price = Number(draft.tariffPricePerDay);
  const offDays = Number(draft.tariffOffDaysPerMonth);
  if (!(price > 0)) return null;
  return Math.round(price * (30 - offDays));
});

/**
 * Авторизация — последним шагом и НЕ уходом на отдельную страницу.
 * Человек только что заполнил 25 полей: увести его со своего экрана значит
 * порвать контекст и напугать потерей заполненного. Окно открывается поверх,
 * форма остаётся на месте.
 */
const authOpen = ref(false);
const ownerStore = useOwnerStore();

function submit() {
  if (!canSubmit.value || submitting.value) return;

  // Вход нужен один раз. Уже вошедшему (в правке, либо зашёл заранее и
  // вернулся к форме) код второй раз не спрашиваем — сразу публикуем.
  if (isEdit.value) {
    void save();
    return;
  }

  if (ownerStore.isAuthenticated) {
    void publish();
    return;
  }

  authOpen.value = true;
}

/**
 * Загрузка файлов — с запасом по времени. Общий таймаут клиента 10 секунд,
 * а несколько снимков с телефона по мобильной сети грузятся дольше: клиент
 * обрывал запрос и писал «не удалось опубликовать», хотя сервер файлы уже
 * принял и объявление было создано.
 */
const UPLOAD_TIMEOUT_MS = 120_000;
const CREATE_TIMEOUT_MS = 30_000;

/** Загрузка снимков одной пачкой: ручка принимает массив photos[] */
async function uploadPhotos(id: string | number, files: File[]) {
  if (!files.length) return;

  const form = new FormData();
  files.forEach((f) => form.append('photos[]', f));
  await apiInstance.post(`/owner/listings/${id}/photos`, form, { timeout: UPLOAD_TIMEOUT_MS });
}

/**
 * Снимки техпаспорта.
 *
 * Уходят отдельной ручкой на приватный диск: в объявлении они не
 * показываются, их смотрит только менеджер, когда сверяет VIN.
 */
async function uploadDocuments(id: string | number, files: File[]) {
  if (!files.length) return;

  const form = new FormData();
  files.forEach((f) => form.append('documents[]', f));
  await apiInstance.post(`/owner/listings/${id}/documents`, form, { timeout: UPLOAD_TIMEOUT_MS });
}

function readError(e: any, fallback: string): string {
  const errors = e?.response?.data?.errors;
  return (
    (errors && (Object.values(errors)[0] as string[] | undefined)?.[0]) ??
    e?.response?.data?.message ??
    fallback
  );
}

function onAuthSuccess() {
  authOpen.value = false;
  void publish();
}

/**
 * Id уже созданного объявления. Если создание прошло, а загрузка файлов
 * споткнулась, повторное нажатие дозагружает файлы к тому же объявлению, а не
 * создаёт второе (его бы отбил бэк: «машина с таким госномером уже размещена»).
 */
const createdId = ref<number | null>(null);

async function publish() {
  submitting.value = true;
  saveError.value = null;

  try {
    if (createdId.value === null) {
      const { data } = await apiInstance.post('/owner/listings', draftToPayload(draft), {
        timeout: CREATE_TIMEOUT_MS,
      });
      createdId.value = ((data?.data ?? data) as { id: number }).id;
    }
  } catch (e: any) {
    saveError.value = readError(e, 'Не удалось опубликовать объявление.');
    submitting.value = false;
    return;
  }

  // Объявление создано и уже на витрине. Сбой файлов — не провал публикации:
  // владелец увидит это в кабинете и добавит снимки там.
  const failed: string[] = [];
  const id = createdId.value;

  try {
    await uploadPhotos(id, photos.value);
  } catch {
    failed.push('photos');
  }

  try {
    await uploadDocuments(id, documents.value);
  } catch {
    failed.push('documents');
  }

  clearDraft();
  submitting.value = false;
  router.push({
    name: 'cabinet',
    query: failed.length ? { published: '1', partial: failed.join(',') } : { published: '1' },
  });
}

async function save() {
  const id = listingId.value;
  if (!id) return;

  submitting.value = true;
  saveError.value = null;
  try {
    await apiInstance.patch(`/owner/listings/${id}`, draftToPayload(draft));

    // Удаление отложено до сохранения, поэтому применяем его здесь
    for (const photoId of removedPhotoIds.value) {
      await apiInstance.delete(`/owner/listings/${id}/photos/${photoId}`);
    }

    await uploadPhotos(id, photos.value);

    router.push({ name: 'cabinet', query: { saved: '1' } });
  } catch (e: any) {
    saveError.value = readError(e, 'Не удалось сохранить изменения.');
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
            {{ isEdit ? 'Редактирование объявления' : 'Сдать автомобиль в аренду' }}
          </h1>
          <p class="mt-sm max-w-[36rem] text-body text-ink-muted">
            <template v-if="isEdit">
              Изменения появятся на витрине сразу после сохранения.
            </template>
            <template v-else>
              Заполните данные — после проверки объявление появится на сайте. Войти попросим
              только в конце, перед публикацией.
            </template>
          </p>
          <p
            v-if="restoredFromDraft"
            class="mt-md inline-flex items-center gap-2 rounded-radius-md bg-brand-tint px-3 py-2 text-caption font-semibold text-brand-ink"
          >
            Мы восстановили черновик — можно продолжить с того же места.
          </p>
        </header>

        <p
          v-if="loading"
          class="rounded-radius-lg border border-hairline bg-surface-paper p-lg text-body text-ink-muted"
        >
          Загружаем объявление…
        </p>
        <p
          v-else-if="loadError"
          class="rounded-radius-lg border border-state-error bg-state-error-tint p-lg text-body text-state-error"
        >
          {{ loadError }}
        </p>

        <div v-if="!loading && !loadError" class="flex flex-col gap-lg">
          <!-- ---------- Автомобиль ---------- -->
          <section class="rounded-radius-lg border border-hairline bg-surface-paper p-lg">
            <h2 class="text-title font-bold text-ink">Автомобиль</h2>
            <p class="mt-1 text-small text-ink-muted">Данные из техпаспорта.</p>

            <div class="mt-lg grid gap-md sm:grid-cols-2">
              <FormField label="Город" required for="f-city">
                <NativeSelect id="f-city" v-model="draft.cityId" :options="cities" />
              </FormField>
              <FormField
                label="Госномер"
                required
                for="f-plate"
                :error="carNumberError"
                hint="По нему мы не даём выставить одну машину дважды"
              >
                <TextField id="f-plate" v-model="draft.carNumber" placeholder="1234 AB 01" />
              </FormField>

              <FormField label="Марка" required for="f-brand">
                <SearchSelect id="f-brand" v-model="draft.brandId" :options="brands" placeholder="Выберите или начните вводить" />
              </FormField>
              <FormField label="Модель" required for="f-model">
                <SearchSelect
                  id="f-model"
                  v-model="draft.modelId"
                  :options="models"
                  :disabled="!draft.brandId"
                  :placeholder="draft.brandId ? 'Выберите или начните вводить' : 'Сначала выберите марку'"
                />
              </FormField>

              <FormField label="Год выпуска" required for="f-year">
                <NativeSelect id="f-year" v-model="draft.year" :options="reference.years" />
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

              <!-- У электромобиля нет объёма двигателя — поле снято, а не просто спрятано -->
              <FormField v-if="!isElectric" label="Объём двигателя" required for="f-vol">
                <NativeSelect id="f-vol" v-model="draft.engineVolume" :options="reference.engine_volumes" />
              </FormField>

              <FormField label="Растаможен в РТ" required for="f-customs">
                <NativeSelect id="f-customs" v-model="draft.customsCleared" :options="YES_NO" />
              </FormField>
              <FormField label="Пробег" required for="f-mileage">
                <TextField id="f-mileage" v-model="draft.mileage" inputmode="numeric" suffix="км" />
              </FormField>

              <FormField label="Лицензия на такси" required for="f-lic">
                <NativeSelect id="f-lic" v-model="draft.hasTaxiLicense" :options="YES_NO" />
              </FormField>
              <FormField
                label="VIN"
                for="f-vin"
                :error="vinError"
                hint="17 символов из техпаспорта — не обязателен, но ускоряет проверку менеджером"
              >
                <TextField
                  id="f-vin"
                  :model-value="draft.vin"
                  placeholder="XTA212140Y1234567"
                  @update:model-value="(v) => (draft.vin = v.toUpperCase())"
                />
              </FormField>
            </div>

            <label
              class="mt-md flex cursor-pointer items-center gap-2.5 rounded-radius-md border border-hairline px-3.5 py-2.5 transition-colors duration-fast hover:bg-surface-sunken"
            >
              <input v-model="draft.hasGpsTracker" type="checkbox" class="h-4 w-4 shrink-0 accent-brand-ink" />
              <span class="text-small text-ink">Есть GPS-трекер отслеживания</span>
            </label>

            <!--
              Число мест и турбина — не влияют на решение об аренде под такси,
              поэтому остались за необязательным «Заполнить ещё» (в отличие
              от растаможки/пробега/лицензии, которые с 26.09.2026 обязательны).
            -->
            <button
              type="button"
              class="mt-lg flex items-center gap-2 text-small font-semibold text-brand-ink"
              @click="showOptionalFields = !showOptionalFields"
            >
              <span
                class="flex h-5 w-5 items-center justify-center rounded border-2 transition-colors duration-fast"
                :class="showOptionalFields ? 'border-brand-ink bg-brand-ink text-white' : 'border-hairline-strong'"
              >
                <svg v-if="showOptionalFields" width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2l2.4 2.4L9.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              Заполнить ещё: число мест{{ isElectric ? '' : ', турбина' }}
            </button>

            <div v-if="showOptionalFields" class="mt-md grid gap-md sm:grid-cols-2">
              <FormField label="Число мест" for="f-seats">
                <TextField id="f-seats" v-model="draft.countSeat" inputmode="numeric" placeholder="5" />
              </FormField>
              <FormField v-if="!isElectric" label="Турбина" for="f-turbo">
                <NativeSelect id="f-turbo" v-model="draft.hasTurbo" :options="YES_NO" />
              </FormField>
            </div>
          </section>

          <!-- ---------- Документы ---------- -->
          <!--
            В правке техпаспорт заново не просим: VIN сверяет менеджер один раз,
            а повторная загрузка документов ничего не проверяет.
          -->
          <section
            v-if="isEdit"
            class="rounded-radius-lg border border-hairline bg-surface-paper p-lg"
          >
            <h2 class="text-title font-bold text-ink">Документы</h2>
            <p v-if="vinVerified" class="mt-sm flex items-center gap-2 text-small text-ink-muted">
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-brand-on"
                aria-hidden="true"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2l2.4 2.4L9.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              VIN проверен по техпаспорту. Заново загружать документы не нужно.
            </p>
            <p v-else class="mt-sm text-small text-ink-muted">
              Техпаспорт на проверке. Отметка «VIN проверен» появится в объявлении, когда менеджер
              сверит документы.
            </p>
          </section>
          <DocumentCheck v-else v-model="documents" />

          <!-- ---------- Фотографии ---------- -->
          <section class="rounded-radius-lg border border-hairline bg-surface-paper p-lg">
            <h2 class="text-title font-bold text-ink">Фотографии</h2>
            <p class="mt-1 text-small text-ink-muted">
              От 3 до 15 снимков. Первый станет главным — его видят в каталоге.
            </p>
            <PhotoUploader
              v-model="photos"
              :existing="visiblePhotos"
              class="mt-lg"
              @remove-existing="markPhotoRemoved"
            />
            <p v-if="removedPhotoIds.length" class="mt-sm text-caption text-ink-soft">
              Помечено к удалению: {{ removedPhotoIds.length }}. Снимки исчезнут после сохранения.
            </p>
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
                <h3 class="mb-sm text-small font-bold text-ink">Тариф аренды</h3>
                <!--
                  Один тариф, не список: у объявления он единственный,
                  выбирать арендатору нечего. Три фиксированных варианта
                  на каждое поле — не свободный ввод, чтобы владельцы не
                  разъезжались по случайным числам, которые потом не с чем
                  сравнить.
                -->
                <div class="grid gap-md sm:grid-cols-3">
                  <FormField label="Минимальный срок" required for="f-months">
                    <NativeSelect
                      id="f-months"
                      v-model="draft.tariffMinMonths"
                      :options="[
                        { id: '3', name: '3 месяца' },
                        { id: '4', name: '4 месяца' },
                        { id: '6', name: '6 месяцев' },
                      ]"
                    />
                  </FormField>
                  <FormField label="Выходных в месяц" required for="f-offdays">
                    <NativeSelect
                      id="f-offdays"
                      v-model="draft.tariffOffDaysPerMonth"
                      :options="[
                        { id: '0', name: 'Без выходных' },
                        { id: '2', name: '2 дня' },
                        { id: '3', name: '3 дня' },
                        { id: '4', name: '4 дня' },
                      ]"
                    />
                  </FormField>
                  <FormField label="Цена за сутки" required for="f-tprice">
                    <TextField id="f-tprice" v-model="draft.tariffPricePerDay" inputmode="numeric" suffix="с." />
                  </FormField>
                </div>

                <!-- Расчёт сразу, без сохранения — то, ради чего вообще эти три поля -->
                <p
                  v-if="monthlyTotal !== null"
                  class="tnum mt-md rounded-radius-md bg-brand-tint px-3.5 py-2.5 text-small font-semibold text-brand-deep"
                >
                  Выходит {{ monthlyTotal }} сомони в месяц
                  ({{ 30 - Number(draft.tariffOffDaysPerMonth) }} дн. × {{ draft.tariffPricePerDay }} с.)
                </p>
              </div>

              <div class="grid gap-md sm:grid-cols-2">
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
                <!--
                  Лимит пробега и «Что разрешено» — необязательные мелочи,
                  которые не влияют на решение сдать/снять авто (решение от
                  26.09.2026). Открытыми по умолчанию раздували и без того
                  длинный раздел условий аренды.
                -->
                <button
                  type="button"
                  class="flex items-center gap-2 text-small font-semibold text-brand-ink"
                  @click="showAdvancedTerms = !showAdvancedTerms"
                >
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded border-2 transition-colors duration-fast"
                    :class="showAdvancedTerms ? 'border-brand-ink bg-brand-ink text-white' : 'border-hairline-strong'"
                  >
                    <svg v-if="showAdvancedTerms" width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6.2l2.4 2.4L9.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  Заполнить ещё: лимит пробега, выезд за город/за границу, курение, животные
                </button>

                <div v-if="showAdvancedTerms" class="mt-md flex flex-col gap-lg">
                  <div class="grid gap-md sm:grid-cols-2">
                    <FormField label="Лимит пробега в сутки" for="f-lim" hint="Пусто — без лимита">
                      <TextField id="f-lim" v-model="draft.mileageLimitPerDay" inputmode="numeric" suffix="км" />
                    </FormField>
                    <FormField label="Цена за км сверх лимита" for="f-over">
                      <TextField id="f-over" v-model="draft.overmileagePrice" inputmode="numeric" suffix="с." />
                    </FormField>
                  </div>

                  <div>
                    <!-- «Работа в такси» убрана: с 25.09.2026 это и есть смысл любого
                         объявления на платформе, спрашивать об этом отдельно нечего -->
                    <h3 class="mb-sm text-small font-bold text-ink">Что разрешено</h3>
                    <div class="grid gap-2 sm:grid-cols-2">
                      <label
                        v-for="rule in [
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
    <div
      v-if="!loading && !loadError"
      class="sticky bottom-0 z-50 border-t border-hairline bg-surface-paper/95 backdrop-blur-xl"
    >
      <div class="container flex flex-wrap items-center justify-between gap-md py-md">
        <div class="min-w-0">
          <p v-if="saveError" class="text-small font-semibold text-state-error">
            {{ saveError }}
          </p>
          <p v-else-if="canSubmit" class="text-small font-semibold text-brand-ink">
            {{ isEdit ? 'Всё заполнено — можно сохранять' : 'Всё заполнено — можно публиковать' }}
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
          <template v-if="submitting">Сохраняем…</template>
          <template v-else>{{ isEdit ? 'Сохранить' : 'Опубликовать' }}</template>
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
