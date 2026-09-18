<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
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

/** Только девять местных цифр: код страны в поле не попадает. */
const phone = ref('');
const code = ref('');
const busy = ref(false);
const error = ref<string | null>(null);
const isStub = ref(false);
const dialog = ref<HTMLElement | null>(null);

const digits = computed(() => phone.value.replace(/\D/g, ''));
const isPhoneValid = computed(() => digits.value.length === 9);
const isCodeValid = computed(() => code.value.replace(/\D/g, '').length >= 4);

/** 173002288 → «17 300 22 88» */
function groupLocal(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
}

/**
 * Префикс +992 вынесен из поля и не редактируется.
 *
 * Пока он был частью значения, форматирование ломалось на стирании:
 * из «+99» не понять, остаток это кода страны или начало номера,
 * и поле дописывало себе цифры само.
 */
function onPhoneInput(e: Event) {
  const el = e.target as HTMLInputElement;
  phone.value = groupLocal(el.value);
  // Значение перерисовано целиком, поэтому каретку возвращаем в конец:
  // номер короткий, его правят с хвоста.
  nextTick(() => {
    el.value = phone.value;
    el.setSelectionRange(phone.value.length, phone.value.length);
  });
}

const fullPhone = computed(() => `+992 ${phone.value}`);

/**
 * Тариф показываем, а не предлагаем выбрать.
 *
 * Владелец задаёт объявлению одну схему, так что выбирать арендатору нечего:
 * выпадающий список создавал бы иллюзию выбора там, где его нет.
 */
const tariff = computed(() => {
  const car = props.car;

  if (car.listingType === 'taxi') {
    return `${car.workDays} / ${car.weekendDays} · ${car.pricePerDay} ${car.currency} в сутки`;
  }

  const from = car.minRentDays > 1 ? `от ${car.minRentDays} сут. · ` : '';
  return `${from}${car.pricePerDay} ${car.currency} в сутки`;
});

const depositNote = computed(() => {
  const d = props.car.deposit;
  if (d === undefined || d === null) return null;
  return d > 0 ? `Депозит ${d} ${props.car.currency}` : 'Без депозита';
});

async function sendCode() {
  if (!isPhoneValid.value || busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    const res = await requestApplyOtp(`992${digits.value}`);
    isStub.value = res.delivery === 'stub';
    if (res.stubCode) code.value = res.stubCode;
    step.value = 'code';
    nextTick(() => dialog.value?.querySelector<HTMLInputElement>('#ap-code')?.focus());
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
      phone: `992${digits.value}`,
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
  nextTick(() => dialog.value?.querySelector<HTMLInputElement>('#ap-phone')?.focus());
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
      class="relative w-full max-w-[25rem] rounded-t-radius-2xl bg-surface-paper p-lg shadow-modal sm:rounded-radius-2xl sm:p-xl"
    >
      <!--
        Крестик выведен из потока: пока он стоял рядом с заголовком, тот
        не мог быть по центру — кнопка съедала правую часть строки.
      -->
      <button
        class="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors duration-fast hover:text-ink sm:right-3 sm:top-3"
        aria-label="Закрыть"
        @click="emit('close')"
      >
        <span class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-sunken transition-colors duration-fast hover:bg-hairline">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
          </svg>
        </span>
      </button>

      <h2
        id="apply-title"
        class="text-balance text-center text-display-sm font-extrabold leading-tight text-ink"
      >
        {{ step === 'phone' ? 'Оставьте номер' : 'Подтвердите номер' }}
      </h2>

      <!-- Подзаголовок есть на обоих шагах: без него второй экран выглядел голым -->
      <p class="mt-1.5 text-balance text-center text-small text-ink-muted">
        <template v-if="step === 'phone'">Владелец перезвонит и договорится об осмотре</template>
        <template v-else>
          Отправили код на
          <span class="tnum whitespace-nowrap font-semibold text-ink">{{ fullPhone }}</span>
        </template>
      </p>

      <!-- ---------- Шаг 1: номер ---------- -->
      <template v-if="step === 'phone'">
        <!-- Тариф: показан, а не выбирается — у объявления он один -->
        <div class="mt-lg rounded-radius-2xl bg-brand px-base py-4 text-center">
          <p class="text-caption font-bold uppercase tracking-[0.08em] text-brand-on/65">
            {{ car.brand }} {{ car.model }} · {{ car.year }}
          </p>
          <p class="tnum mt-1 text-title-sm font-extrabold text-brand-on">{{ tariff }}</p>
          <p v-if="depositNote" class="tnum mt-0.5 text-caption font-semibold text-brand-on/70">
            {{ depositNote }}
          </p>
        </div>

        <!--
          Поле-пилюля: прямоугольник с левым выравниванием выбивался из
          центрированной композиции. Код страны — статичная приставка слева,
          редактируются только девять местных цифр.
        -->
        <label
          class="mt-md flex h-14 w-full cursor-text items-center justify-center gap-2 rounded-full border-2 bg-surface-sunken transition-all duration-fast focus-within:bg-surface-paper"
          :class="
            error
              ? 'border-state-error'
              : 'border-transparent focus-within:border-ink focus-within:shadow-focus-brand'
          "
        >
          <span class="tnum select-none text-body-lg font-semibold text-ink-soft">+992</span>
          <input
            id="ap-phone"
            :value="phone"
            inputmode="tel"
            placeholder="00 000 00 00"
            aria-label="Номер телефона"
            class="tnum w-[7.25rem] bg-transparent text-body-lg font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-soft"
            @input="onPhoneInput"
            @keyup.enter="sendCode"
          />
        </label>

        <p v-if="error" class="mt-sm text-center text-caption text-state-error">{{ error }}</p>

        <!-- Прижато к кнопке: с равными отступами строка висела сама по себе -->
        <p class="mb-sm mt-lg text-center text-small font-semibold text-ink-muted">Это бесплатно</p>

        <button
          :disabled="!isPhoneValid || busy"
          class="h-14 w-full rounded-full bg-brand text-body-lg font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
          @click="sendCode"
        >
          {{ busy ? 'Отправляем…' : 'Оставить заявку' }}
        </button>

        <!--
          Согласие оставлено одной фразой вместо абзаца: сам текст убрать
          нельзя — это обработка персональных данных, но занимать им треть
          окна незачем.
        -->
        <p class="mt-md text-balance text-center text-caption leading-relaxed text-ink-soft">
          Нажимая кнопку, вы соглашаетесь с
          <a href="#" class="text-ink-muted underline">обработкой персональных данных</a>
        </p>
      </template>

      <!-- ---------- Шаг 2: код ---------- -->
      <template v-else>
        <!--
          Трекинг добавляет пробел и после последней цифры, из-за чего
          центрированный текст уезжает влево — компенсируем отступом слева.
        -->
        <input
          id="ap-code"
          v-model="code"
          inputmode="numeric"
          maxlength="4"
          aria-label="Код из SMS"
          class="tnum mt-lg h-14 w-full rounded-full border-2 bg-surface-sunken pl-[0.45em] text-center text-price font-extrabold tracking-[0.45em] text-ink transition-all duration-fast focus:bg-surface-paper focus:outline-none"
          :class="
            error
              ? 'border-state-error'
              : 'border-transparent focus:border-ink focus:shadow-focus-brand'
          "
          @keyup.enter="submit"
        />

        <!-- Предупреждение о демо-режиме — плашкой, а не россыпью жёлтого текста -->
        <p v-if="isStub" class="mt-sm text-center">
          <span
            class="inline-block rounded-full bg-brand-tint px-3 py-1.5 text-caption font-semibold text-brand-deep"
          >
            Демо-режим: код подставлен
          </span>
        </p>
        <p v-if="error" class="mt-sm text-center text-caption text-state-error">{{ error }}</p>

        <button
          :disabled="!isCodeValid || busy"
          class="mt-lg h-14 w-full rounded-full bg-brand text-body-lg font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
          @click="submit"
        >
          {{ busy ? 'Отправляем…' : 'Подтвердить' }}
        </button>

        <button
          class="mt-sm flex min-h-[44px] w-full items-center justify-center text-small font-semibold text-ink-soft transition-colors duration-fast hover:text-ink"
          @click="back"
        >
          Изменить номер
        </button>
      </template>
    </div>
  </div>
</template>
