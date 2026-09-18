<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Car } from '@/entities/car';
import { useLocationStore } from '@/entities/location';
import { requestApplyOtp, submitApplication } from '../../api';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'ApplicationModal',
});

/**
 * Заявка на аренду. Спрашиваем ровно одно — номер телефона.
 *
 * Код из SMS нужен не ради регистрации (арендатор остаётся анонимным),
 * а чтобы отсечь выдуманные номера: владелец должен получать лиды,
 * по которым можно дозвониться.
 *
 * Условия показаны текстом — человек должен понимать, на что подаёт заявку,
 * но выбирать ему здесь нечего: всё согласуется голосом.
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

/** Условия одной строкой каждое — чтобы читалось взглядом, а не вчитывалось */
const terms = computed<string[]>(() => {
  const out: string[] = [];
  const car = props.car;

  if (car.listingType === 'taxi') {
    out.push(`Схема ${car.workDays} рабочих / ${car.weekendDays} выходных`);
  } else if (car.minRentDays > 1) {
    out.push(`Минимальный срок — ${car.minRentDays} суток`);
  }

  if (car.deposit !== undefined && car.deposit !== null) {
    out.push(car.deposit > 0 ? `Депозит ${car.deposit} сомони` : 'Без депозита');
  }

  if (car.transmission) out.push(car.transmission);
  if (car.fuelType) out.push(car.fuelType);

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
    class="fixed inset-0 z-[200] flex items-end justify-center bg-ink/55 backdrop-blur-sm sm:items-center sm:p-lg"
    @click.self="emit('close')"
  >
    <div
      ref="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-title"
      class="w-full max-w-[24rem] rounded-t-radius-xl bg-surface-paper p-lg shadow-modal sm:rounded-radius-xl"
    >
      <div class="flex items-start justify-between gap-md">
        <h2 id="apply-title" class="text-title font-bold text-ink">
          {{ step === 'phone' ? 'Оставьте номер' : 'Введите код' }}
        </h2>
        <button
          class="-mr-3 -mt-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
          aria-label="Закрыть"
          @click="emit('close')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- ---------- Шаг 1: номер ---------- -->
      <template v-if="step === 'phone'">
        <p class="mt-1 text-small text-ink-muted">Владелец перезвонит и договорится об осмотре.</p>

        <!-- На что подаём заявку -->
        <div class="mt-lg rounded-radius-md bg-surface-sunken px-base py-3">
          <p class="text-title-sm font-bold text-ink">
            {{ car.brand }} {{ car.model }}
            <span class="tnum font-semibold text-ink-soft">· {{ car.year }}</span>
          </p>
          <p class="tnum mt-1 text-price font-extrabold text-ink">
            {{ car.pricePerDay }}
            <span class="text-body font-semibold text-ink-muted">{{ car.currency }} / сутки</span>
          </p>
          <p v-if="terms.length" class="mt-1.5 text-caption leading-relaxed text-ink-muted">
            {{ terms.join(' · ') }}
          </p>
        </div>

        <div class="mt-lg">
          <label for="ap-phone" class="mb-1.5 block text-small font-semibold text-ink">
            Номер телефона
          </label>
          <TextField
            id="ap-phone"
            v-model="phone"
            inputmode="tel"
            placeholder="+992 __ ___ __ __"
            :invalid="Boolean(error)"
            @keyup.enter="sendCode"
          />
        </div>

        <p v-if="error" class="mt-sm text-caption text-state-error">{{ error }}</p>

        <button
          :disabled="!isPhoneValid || busy"
          class="mt-lg w-full rounded-radius-md bg-brand py-3.5 text-body font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
          @click="sendCode"
        >
          {{ busy ? 'Отправляем…' : 'Получить код' }}
        </button>
      </template>

      <!-- ---------- Шаг 2: код ---------- -->
      <template v-else>
        <p class="mt-1 text-small text-ink-muted">
          Отправили на <span class="tnum font-semibold text-ink">{{ phone }}</span>
        </p>

        <p
          v-if="isStub"
          class="mt-md rounded-radius-md border border-state-warning bg-state-warning-tint px-3.5 py-2.5 text-caption font-semibold text-state-warning"
        >
          Демо-режим: SMS не отправляется, код подставлен автоматически.
        </p>

        <div class="mt-lg">
          <label for="ap-code" class="mb-1.5 block text-small font-semibold text-ink">
            Код из SMS
          </label>
          <TextField
            id="ap-code"
            v-model="code"
            inputmode="numeric"
            :maxlength="4"
            :invalid="Boolean(error)"
            @keyup.enter="submit"
          />
        </div>

        <p v-if="error" class="mt-sm text-caption text-state-error">{{ error }}</p>

        <button
          :disabled="!isCodeValid || busy"
          class="mt-lg w-full rounded-radius-md bg-brand py-3.5 text-body font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
          @click="submit"
        >
          {{ busy ? 'Отправляем…' : 'Отправить заявку' }}
        </button>

        <button
          class="-mb-2 mt-1 w-full py-2 text-small font-semibold text-ink-soft transition-colors duration-fast hover:text-ink"
          @click="step = 'phone'; code = ''; error = null"
        >
          Изменить номер
        </button>
      </template>
    </div>
  </div>
</template>
