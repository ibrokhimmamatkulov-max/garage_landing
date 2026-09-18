<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Car } from '@/entities/car';
import { useLocationStore } from '@/entities/location';
import { requestApplyOtp, submitApplication } from '../../api';

defineOptions({
  name: 'ApplicationModal',
});

/**
 * Заявка на аренду. Спрашиваем ровно одно — номер телефона.
 *
 * Код из SMS нужен не ради регистрации (арендатор остаётся анонимным),
 * а чтобы отсечь выдуманные номера: владелец должен получать лиды,
 * по которым можно дозвониться.
 */
const props = defineProps<{
  car: Car;
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const locationStore = useLocationStore();

type Step = 'phone' | 'code';
const step = ref<Step>('phone');

const phone = ref('');
const code = ref('');
const busy = ref(false);
const error = ref<string | null>(null);
const isStub = ref(false);
const dialog = ref<HTMLElement | null>(null);

const isPhoneValid = computed(() => phone.value.replace(/\D/g, '').length >= 9);
const isCodeValid = computed(() => code.value.replace(/\D/g, '').length >= 4);

/**
 * Характеристики отдельными тегами, а не строкой через точки:
 * склеенные в предложение, они читаются как мелкий шрифт договора
 * и глаз по ним просто скользит.
 */
const specs = computed(() =>
  [props.car.transmission, props.car.fuelType, props.car.bodyType?.name ?? props.car.carClass]
    .filter(Boolean)
    .slice(0, 3),
);

/** Условия сделки — то, что человеку важно знать до звонка */
const conditions = computed<Array<{ label: string; value: string }>>(() => {
  const car = props.car;
  const out: Array<{ label: string; value: string }> = [];

  if (car.listingType === 'taxi') {
    out.push({ label: 'Схема', value: `${car.workDays} / ${car.weekendDays}` });
  } else {
    out.push({ label: 'Минимальный срок', value: `${car.minRentDays} сут.` });
  }

  if (car.deposit !== undefined && car.deposit !== null) {
    out.push({
      label: 'Депозит',
      value: car.deposit > 0 ? `${car.deposit} сомони` : 'нет',
    });
  }

  if (car.city?.name) out.push({ label: 'Город', value: car.city.name });

  return out;
});

async function sendCode() {
  if (!isPhoneValid.value || busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    const res = await requestApplyOtp(phone.value);
    isStub.value = res.delivery === 'stub';
    if (res.stubCode) code.value = res.stubCode;
    step.value = 'code';
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Не удалось отправить код.';
  } finally {
    busy.value = false;
  }
}

async function submit() {
  if (!isCodeValid.value || busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    const result = await submitApplication({
      phone: phone.value.replace(/\D/g, ''),
      code: code.value.replace(/\D/g, ''),
      cityId: locationStore.currentCity?.id ?? Number(props.car.city?.id),
      offerId: Number(props.car.id),
    });

    if (result.success) emit('success');
    else error.value = result.message ?? 'Не удалось отправить заявку.';
  } catch (e: any) {
    const errors = e?.response?.data?.errors;
    error.value =
      (errors && Object.values(errors)[0]?.[0]) ??
      e?.response?.data?.message ??
      'Не удалось отправить заявку.';
  } finally {
    busy.value = false;
  }
}

function back() {
  step.value = 'phone';
  code.value = '';
  error.value = null;
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => {
  document.addEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => dialog.value?.querySelector('input')?.focus());
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKey);
  document.body.style.overflow = '';
});
</script>

<template>
  <div
    class="fixed inset-0 z-[200] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-lg"
    @click.self="emit('close')"
  >
    <div
      ref="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-title"
      class="w-full max-w-[25rem] overflow-hidden rounded-t-radius-2xl bg-surface-paper shadow-modal sm:rounded-radius-2xl"
    >
      <!--
        Шапка на бренде: даёт окну визуальный якорь и сразу отвечает на
        вопрос «за что я плачу». Цена — самый крупный элемент, потому что
        это единственное число, ради которого человек сюда нажал.
      -->
      <header class="relative bg-brand px-lg pb-lg pt-base">
        <button
          class="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-brand-on/60 transition-colors duration-fast hover:bg-brand-on/10 hover:text-brand-on"
          aria-label="Закрыть"
          @click="emit('close')"
        >
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <p class="text-caption font-bold uppercase tracking-[0.1em] text-brand-on/65">
          Заявка на аренду
        </p>

        <p class="mt-2 pr-10 text-title-sm font-bold text-brand-on">
          {{ car.brand }} {{ car.model }}
          <span class="tnum font-semibold text-brand-on/60">· {{ car.year }}</span>
        </p>

        <p class="tnum mt-1 flex items-baseline gap-1.5 text-brand-on">
          <span class="text-display-sm font-extrabold leading-none">{{ car.pricePerDay }}</span>
          <span class="text-small font-bold">{{ car.currency }} / сутки</span>
        </p>

        <ul v-if="specs.length" class="mt-md flex flex-wrap gap-1.5">
          <li
            v-for="s in specs"
            :key="s"
            class="rounded-full bg-brand-on/10 px-2.5 py-1 text-caption font-semibold text-brand-on"
          >
            {{ s }}
          </li>
        </ul>
      </header>

      <!-- Условия: пары «что — сколько», а не строка через точки -->
      <dl v-if="conditions.length" class="flex flex-col divide-y divide-hairline-soft px-lg">
        <div
          v-for="c in conditions"
          :key="c.label"
          class="flex items-center justify-between gap-md py-2.5"
        >
          <dt class="text-small text-ink-muted">{{ c.label }}</dt>
          <dd class="tnum text-small font-bold text-ink">{{ c.value }}</dd>
        </div>
      </dl>

      <div class="border-t border-hairline px-lg py-lg">
        <!-- ---------- Шаг 1: номер ---------- -->
        <template v-if="step === 'phone'">
          <h2 id="apply-title" class="text-title font-bold text-ink">Оставьте номер</h2>
          <p class="mt-1 text-small text-ink-muted">
            Владелец перезвонит и договорится об осмотре.
          </p>

          <input
            id="ap-phone"
            v-model="phone"
            inputmode="tel"
            placeholder="+992 __ ___ __ __"
            aria-label="Номер телефона"
            class="tnum mt-base w-full rounded-radius-md border bg-surface-paper px-base py-3.5 text-title-sm font-semibold text-ink transition-colors duration-fast placeholder:font-normal placeholder:text-ink-ghost focus:outline-none"
            :class="
              error
                ? 'border-state-error'
                : 'border-hairline focus:border-brand-ink focus:shadow-focus-brand'
            "
            @keyup.enter="sendCode"
          />

          <p v-if="error" class="mt-sm text-caption text-state-error">{{ error }}</p>

          <button
            :disabled="!isPhoneValid || busy"
            class="mt-base w-full rounded-radius-md bg-ink py-3.5 text-body font-bold text-white transition-colors duration-fast hover:bg-ink-muted disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
            @click="sendCode"
          >
            {{ busy ? 'Отправляем…' : 'Получить код' }}
          </button>
        </template>

        <!-- ---------- Шаг 2: код ---------- -->
        <template v-else>
          <button
            class="-ml-2 mb-2 inline-flex min-h-[44px] items-center gap-1.5 pl-2 pr-3 text-small font-semibold text-ink-soft transition-colors duration-fast hover:text-ink"
            @click="back"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Изменить номер
          </button>

          <h2 id="apply-title" class="text-title font-bold text-ink">Введите код</h2>
          <p class="tnum mt-1 text-small text-ink-muted">
            Отправили на <span class="font-semibold text-ink">{{ phone }}</span>
          </p>

          <!-- Поле кода: крупное, по центру, с разрядкой — как в SMS-подтверждениях -->
          <input
            id="ap-code"
            v-model="code"
            inputmode="numeric"
            maxlength="4"
            aria-label="Код из SMS"
            class="tnum mt-base w-full rounded-radius-md border bg-surface-paper py-3.5 text-center text-display-sm font-extrabold tracking-[0.5em] text-ink transition-colors duration-fast focus:outline-none"
            :class="
              error
                ? 'border-state-error'
                : 'border-hairline focus:border-brand-ink focus:shadow-focus-brand'
            "
            @keyup.enter="submit"
          />

          <p
            v-if="isStub"
            class="mt-sm text-center text-caption font-semibold text-state-warning"
          >
            Демо-режим: SMS не отправляется, код подставлен
          </p>
          <p v-if="error" class="mt-sm text-caption text-state-error">{{ error }}</p>

          <button
            :disabled="!isCodeValid || busy"
            class="mt-base w-full rounded-radius-md bg-ink py-3.5 text-body font-bold text-white transition-colors duration-fast hover:bg-ink-muted disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
            @click="submit"
          >
            {{ busy ? 'Отправляем…' : 'Отправить заявку' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
