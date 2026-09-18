<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { type Car, CarGallery } from '@/entities/car';
import { inCity } from '@/shared/lib/city';

defineOptions({
  name: 'CarDetails',
});

const props = defineProps<{
  car: Car;
}>();

const emit = defineEmits<{
  apply: [car: Car];
  back: [];
}>();

const isTaxi = computed(() => props.car.listingType === 'taxi');
const terms = computed(() => props.car.terms);

/** Неразрывный пробел в разрядах оставляем: «1 500» не должно рваться по строкам */
const num = (v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: 2 });

/* ---------- Заголовок ---------- */

const subtitle = computed(() => {
  const c = props.car;
  const parts = [String(c.year), c.bodyType?.name || c.carClass];
  if (c.city?.name) parts.push(inCity(c.city.name));
  return parts.filter(Boolean).join(' · ');
});

const badges = computed(() => {
  const c = props.car;
  const out: Array<{ text: string; tone: 'brand' | 'ok' }> = [];
  if (isTaxi.value) out.push({ text: 'Под такси', tone: 'brand' });
  if (c.vinVerified) out.push({ text: 'VIN проверен', tone: 'ok' });
  if (c.customsCleared) out.push({ text: 'Растаможен в РТ', tone: 'ok' });
  return out;
});

/* ---------- Характеристики ---------- */

const DRIVE_LABELS: Record<string, string> = {
  fwd: 'Передний',
  rwd: 'Задний',
  awd: 'Полный',
};

/**
 * Пустые поля не показываем вовсе.
 *
 * Прочерк в строке «Пробег» читается как «пробега нет», хотя означает
 * «владелец не заполнил» — а про такие вещи арендатор спросит по телефону.
 */
const specs = computed(() => {
  const c = props.car;
  const rows: Array<[string, string]> = [];

  const push = (label: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return;
    rows.push([label, String(value)]);
  };

  push('Коробка передач', c.transmission);
  push('Тип топлива', c.fuelType);
  push('Объём двигателя', c.engineVolume ? `${num(c.engineVolume)} л` : null);
  push('Привод', c.driveType ? DRIVE_LABELS[c.driveType] : null);
  push('Пробег', c.mileage ? `${num(c.mileage)} км` : null);
  push('Кузов', c.bodyType?.name || c.carClass);
  push('Мест', c.countSeat);
  push('Цвет', c.color?.name);
  if (c.hasTurbo) push('Турбина', 'Есть');
  if (c.hasTaxiLicense) push('Лицензия на такси', 'Есть');

  return rows;
});

/* ---------- Цена ---------- */

/** «3–7 сут.» / «от 21 сут.» */
function tierRange(minDays: number, maxDays: number | null): string {
  return maxDays === null ? `от ${minDays} сут.` : `${minDays}–${maxDays} сут.`;
}

const tiers = computed(() => {
  const c = props.car;

  if (isTaxi.value) {
    return (c.tariffs ?? []).map((t) => ({
      key: `t${t.id}`,
      range: `${t.durationDays} / ${t.freeWeekendDay}`,
      price: Number(t.price),
    }));
  }

  return (c.priceTiers ?? [])
    .slice()
    .sort((a, b) => a.minDays - b.minDays)
    .map((t) => ({
      key: `p${t.id}`,
      range: tierRange(t.minDays, t.maxDays),
      price: t.pricePerDay,
    }));
});

/** Ступени показываем только когда их правда несколько — одна строка дублировала бы цену сверху */
const hasTierTable = computed(() => tiers.value.length > 1);

/* ---------- Условия ---------- */

const DEPOSIT_LABELS: Record<string, string> = {
  on_return: 'возвращается при сдаче машины',
  daily: 'возвращается частями за каждые сутки',
  none: 'не берётся',
};

const FUEL_LABELS: Record<string, string> = {
  full_to_full: 'Полный бак при выдаче, полный при возврате',
  tenant: 'Топливо за счёт арендатора',
  owner: 'Топливо включено в стоимость',
};

const rentalTerms = computed(() => {
  const c = props.car;
  const t = terms.value;
  const rows: Array<[string, string]> = [];

  const push = (label: string, value: string | null) => {
    if (value) rows.push([label, value]);
  };

  if (isTaxi.value) {
    // Таксопарковая схема в принятой записи «7 / 1»: столько суток работы,
    // столько выходных. При одном тарифе таблица ступеней не выводится,
    // и схема иначе не попала бы на страницу вообще.
    push('Рабочих / выходных', `${c.workDays} / ${c.weekendDays}`);
  }

  push('Минимальный срок', `${c.minRentDays} сут.`);
  push('Максимальный срок', c.maxRentDays ? `${c.maxRentDays} сут.` : null);

  if (t) {
    push(
      'Депозит',
      t.depositAmount > 0
        ? `${num(t.depositAmount)} ${c.currency}, ${DEPOSIT_LABELS[t.depositReturnPolicy] ?? ''}`.trim()
        : 'Без депозита',
    );
    push(
      'Лимит пробега',
      t.mileageLimitPerDay
        ? `${num(t.mileageLimitPerDay)} км в сутки` +
            (t.overmileagePrice ? `, сверх — ${num(t.overmileagePrice)} ${c.currency}/км` : '')
        : 'Без ограничения',
    );
    push('Топливо', t.fuelPolicy ? FUEL_LABELS[t.fuelPolicy] : null);
    push(
      'Доставка',
      t.deliveryAvailable
        ? t.deliveryPrice
          ? `${num(t.deliveryPrice)} ${c.currency}`
          : 'Бесплатно'
        : null,
    );
  } else if (c.deposit) {
    push('Депозит', `${num(c.deposit)} ${c.currency}`);
  }

  return rows;
});

const driverTerms = computed(() => {
  const t = terms.value;
  if (!t) return [];

  const rows: Array<[string, string]> = [];
  if (t.minDriverAge) rows.push(['Возраст', `от ${t.minDriverAge} лет`]);
  if (t.minDriverExperience) rows.push(['Стаж вождения', `от ${t.minDriverExperience} лет`]);
  if (t.documentsPledge) rows.push(['Документы в залог', t.documentsPledge]);
  if (t.requireCleanRecord) rows.push(['Нарушения', 'Без серьёзных нарушений ПДД']);
  return rows;
});

/** Разрешения показываем обеими сторонами: «нельзя» здесь так же важно, как «можно» */
const permissions = computed(() => {
  const t = terms.value;
  if (!t) return [];

  return [
    { text: 'Работа в такси', allowed: t.allowTaxi },
    { text: 'Междугородние поездки', allowed: t.allowIntercity },
    { text: 'Выезд за границу', allowed: t.allowAbroad },
    { text: 'Курение в салоне', allowed: t.allowSmoking },
    { text: 'Перевозка животных', allowed: t.allowPets },
  ];
});

/* ---------- Занятые даты ---------- */

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function formatRange(from: string, to: string): string {
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return `${from} — ${to}`;

  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  return sameMonth
    ? `${a.getDate()} — ${b.getDate()} ${MONTHS[b.getMonth()]}`
    : `${a.getDate()} ${MONTHS[a.getMonth()]} — ${b.getDate()} ${MONTHS[b.getMonth()]}`;
}

const busyPeriods = computed(() =>
  (props.car.unavailablePeriods ?? []).map((p) => formatRange(p.dateFrom, p.dateTo)),
);

const ownerTypeLabel = computed(() =>
  props.car.owner?.ownerType === 'company' ? 'Компания' : 'Частное лицо',
);

/* ---------- Закреплённая панель ---------- */

/**
 * На узком экране карточка с ценой уезжает под все условия, поэтому кнопку
 * дублирует панель снизу. Но пока настоящая кнопка на экране, панель только
 * мешает — две одинаковые кнопки рядом сбивают с толку.
 */
const applyButton = ref<HTMLElement | null>(null);
const isApplyVisible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!applyButton.value || typeof IntersectionObserver === 'undefined') return;

  observer = new IntersectionObserver(([entry]) => {
    isApplyVisible.value = entry.isIntersecting;
  });
  observer.observe(applyButton.value);
});

onUnmounted(() => observer?.disconnect());
</script>

<template>
  <section class="flex-1 bg-surface-canvas pb-28 lg:pb-3xl">
    <div class="container pt-base lg:pt-lg">
      <button
        class="-ml-2 flex h-11 items-center gap-1.5 rounded-full px-2 text-small font-semibold text-ink-muted transition-colors duration-fast hover:text-ink"
        @click="emit('back')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Ко всем автомобилям
      </button>

      <div class="mt-sm grid items-start gap-xl lg:grid-cols-[minmax(0,1fr)_21rem]">
        <!-- ================= Основная колонка ================= -->
        <div class="min-w-0">
          <CarGallery :car="car" />

          <header class="mt-lg">
            <h1 class="text-balance text-display-sm font-extrabold leading-tight text-ink">
              {{ car.brand }} {{ car.model }}
            </h1>
            <p class="tnum mt-1.5 text-body-lg text-ink-muted">{{ subtitle }}</p>

            <div v-if="badges.length" class="mt-md flex flex-wrap gap-2">
              <span
                v-for="b in badges"
                :key="b.text"
                class="rounded-full px-3 py-1.5 text-caption font-semibold"
                :class="b.tone === 'brand' ? 'bg-ink text-white' : 'bg-brand-tint text-brand-deep'"
              >
                {{ b.text }}
              </span>
            </div>
          </header>

          <!-- ---------- Характеристики ---------- -->
          <div class="mt-lg rounded-radius-lg border border-hairline bg-surface-paper p-lg">
            <h2 class="text-title font-bold text-ink">Характеристики</h2>
            <dl class="mt-sm grid gap-x-xl sm:grid-cols-2">
              <div
                v-for="[label, value] in specs"
                :key="label"
                class="flex items-baseline justify-between gap-base border-b border-hairline-soft py-3 last:border-b-0"
              >
                <dt class="text-small text-ink-muted">{{ label }}</dt>
                <dd class="tnum text-right text-small font-semibold text-ink">{{ value }}</dd>
              </div>
            </dl>

            <div v-if="car.dopOptions?.length" class="mt-md flex flex-wrap gap-2 border-t border-hairline-soft pt-md">
              <span
                v-for="opt in car.dopOptions"
                :key="opt.id"
                class="rounded-full bg-surface-sunken px-3 py-1.5 text-caption font-medium text-ink-muted"
              >
                {{ opt.name }}
              </span>
            </div>
          </div>

          <!-- ---------- Описание ---------- -->
          <div
            v-if="car.description"
            class="mt-base rounded-radius-lg border border-hairline bg-surface-paper p-lg"
          >
            <h2 class="text-title font-bold text-ink">Описание</h2>
            <p class="mt-sm whitespace-pre-line text-body text-ink-muted">{{ car.description }}</p>
          </div>

          <!-- ---------- Условия аренды ---------- -->
          <div
            v-if="rentalTerms.length"
            class="mt-base rounded-radius-lg border border-hairline bg-surface-paper p-lg"
          >
            <h2 class="text-title font-bold text-ink">Условия аренды</h2>
            <dl class="mt-sm">
              <div
                v-for="[label, value] in rentalTerms"
                :key="label"
                class="flex flex-col gap-0.5 border-b border-hairline-soft py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-lg"
              >
                <dt class="shrink-0 text-small text-ink-muted">{{ label }}</dt>
                <dd class="tnum text-small font-semibold text-ink sm:text-right">{{ value }}</dd>
              </div>
            </dl>

            <template v-if="driverTerms.length">
              <h3 class="mt-lg text-title-sm font-bold text-ink">Требования к водителю</h3>
              <dl class="mt-xs">
                <div
                  v-for="[label, value] in driverTerms"
                  :key="label"
                  class="flex flex-col gap-0.5 border-b border-hairline-soft py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-lg"
                >
                  <dt class="shrink-0 text-small text-ink-muted">{{ label }}</dt>
                  <dd class="tnum text-small font-semibold text-ink sm:text-right">{{ value }}</dd>
                </div>
              </dl>
            </template>

            <template v-if="permissions.length">
              <h3 class="mt-lg text-title-sm font-bold text-ink">Что можно и нельзя</h3>
              <ul class="mt-sm grid gap-2 sm:grid-cols-2">
                <li
                  v-for="p in permissions"
                  :key="p.text"
                  class="flex items-center gap-2 text-small"
                  :class="p.allowed ? 'text-ink' : 'text-ink-soft'"
                >
                  <span
                    class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    :class="p.allowed ? 'bg-brand text-brand-on' : 'bg-surface-sunken text-ink-soft'"
                  >
                    <svg v-if="p.allowed" width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6.2l2.4 2.4L9.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg v-else width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    </svg>
                  </span>
                  {{ p.text }}
                  <span class="sr-only">{{ p.allowed ? '— разрешено' : '— запрещено' }}</span>
                </li>
              </ul>
            </template>

            <p
              v-if="terms?.additionalTerms"
              class="mt-lg rounded-radius-md bg-surface-sunken p-base text-small leading-relaxed text-ink-muted"
            >
              {{ terms.additionalTerms }}
            </p>
          </div>

          <!-- ---------- Занятость ---------- -->
          <div
            v-if="busyPeriods.length"
            class="mt-base rounded-radius-lg border border-hairline bg-surface-paper p-lg"
          >
            <h2 class="text-title font-bold text-ink">Машина занята</h2>
            <!--
              Заявку на занятые даты всё равно примут (ТЗ §2): платформа
              ничего не бронирует, а планы у владельца могут поменяться.
            -->
            <p class="mt-1 text-small text-ink-muted">
              Заявку можно оставить и на эти даты — владелец ответит, получится ли.
            </p>
            <ul class="mt-sm flex flex-wrap gap-2">
              <li
                v-for="p in busyPeriods"
                :key="p"
                class="tnum rounded-full bg-state-error-tint px-3 py-1.5 text-caption font-semibold text-state-error"
              >
                {{ p }}
              </li>
            </ul>
          </div>
        </div>

        <!-- ================= Боковая колонка ================= -->
        <aside class="lg:sticky lg:top-lg">
          <div class="rounded-radius-lg border border-hairline bg-surface-paper p-lg shadow-card">
            <p class="text-caption font-bold uppercase tracking-[0.08em] text-ink-soft">
              {{ hasTierTable ? 'Цена от' : 'Стоимость' }}
            </p>
            <p class="tnum mt-1 text-display-sm font-extrabold leading-none text-ink">
              {{ num(car.pricePerDay) }}
              <span class="text-title font-bold text-ink-muted">{{ car.currency }}/сутки</span>
            </p>

            <!-- Ступени цены: то, что владелец задал при подаче -->
            <dl v-if="hasTierTable" class="mt-md rounded-radius-md bg-surface-sunken p-3">
              <div
                v-for="t in tiers"
                :key="t.key"
                class="flex items-baseline justify-between gap-base px-1 py-1.5"
              >
                <dt class="tnum text-small text-ink-muted">{{ t.range }}</dt>
                <dd class="tnum text-small font-bold text-ink">
                  {{ num(t.price) }} {{ car.currency }}
                </dd>
              </div>
            </dl>

            <button
              ref="applyButton"
              class="mt-lg h-14 w-full rounded-full bg-brand text-body-lg font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press"
              @click="emit('apply', car)"
            >
              Оставить заявку
            </button>
            <p class="mt-sm text-center text-small font-semibold text-ink-muted">Это бесплатно</p>

            <!--
              Витрина лидов, а не бронирование: платформа сводит стороны
              и на этом заканчивается (ТЗ §2). Сказать об этом нужно до
              заявки, а не после неё.
            -->
            <p class="mt-md border-t border-hairline-soft pt-md text-caption leading-relaxed text-ink-soft">
              Мы передадим ваш номер владельцу. Договор и оплату вы обсуждаете напрямую —
              платформа в расчётах не участвует.
            </p>
          </div>

          <div
            v-if="car.owner"
            class="mt-base flex items-center gap-3 rounded-radius-lg border border-hairline bg-surface-paper p-base"
          >
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-title-sm font-extrabold text-brand-on"
              aria-hidden="true"
            >
              {{ car.owner.displayName.charAt(0) }}
            </span>
            <span class="min-w-0">
              <span class="block truncate text-small font-bold text-ink">
                {{ car.owner.displayName }}
              </span>
              <span class="block text-caption text-ink-soft">{{ ownerTypeLabel }}</span>
            </span>
          </div>
        </aside>
      </div>
    </div>

    <!--
      На узком экране боковая колонка уезжает под всю страницу, поэтому
      кнопку дублируем закреплённой панелью — иначе до неё нужно
      пролистать все условия.
    -->
    <div
      v-if="!isApplyVisible"
      class="fixed inset-x-0 bottom-0 z-40 flex items-center gap-base border-t border-hairline bg-surface-paper px-base py-3 lg:hidden"
    >
      <span class="min-w-0">
        <span class="tnum block text-title font-extrabold leading-tight text-ink">
          {{ num(car.pricePerDay) }}
        </span>
        <span class="block text-caption text-ink-soft">{{ car.currency }}/сутки</span>
      </span>
      <button
        class="h-12 flex-1 rounded-full bg-brand text-body font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press"
        @click="emit('apply', car)"
      >
        Оставить заявку
      </button>
    </div>
  </section>
</template>
