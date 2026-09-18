<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Car } from '@/entities/car';
import { useLocationStore } from '@/entities/location';
import { submitApplication } from '../../api';
import FormField from '@/shared/ui/FormField/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'ApplicationModal',
});

/**
 * Заявка на аренду.
 *
 * Принцип взят у Яндекс Гаража: спрашиваем минимум. Там вообще только
 * телефон — имени не просят. Мы имя оставили, но НЕобязательным: владельцу
 * с ним удобнее перезванивать, а терять заявку из-за лишнего поля глупо.
 *
 * Рядом с формой всё время висит выбранный тариф с ценой — человек должен
 * видеть, на что подписывается, в момент нажатия кнопки.
 */
const props = defineProps<{
  car: Car;
  initialTariffId?: number;
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const locationStore = useLocationStore();

const phone = ref('');
const name = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const promo = ref('');
const showPromo = ref(false);
const allowSimilar = ref(true);

const busy = ref(false);
const error = ref<string | null>(null);
const dialog = ref<HTMLElement | null>(null);

const isGeneral = computed(() => props.car.listingType === 'general');

/* ---------------- выбор тарифа ---------------- */

interface Option {
  id: number | 'default';
  price: number;
  label: string;
}

const options = computed<Option[]>(() => {
  if (isGeneral.value && props.car.priceTiers?.length) {
    return props.car.priceTiers.map((t) => ({
      id: t.id,
      price: t.pricePerDay,
      label: t.maxDays ? `от ${t.minDays} до ${t.maxDays} суток` : `от ${t.minDays} суток`,
    }));
  }

  if (props.car.tariffs?.length) {
    return props.car.tariffs.map((t) => ({
      id: t.id,
      price: t.price,
      label: `${t.durationDays} рабочих / ${t.freeWeekendDay} выходных`,
    }));
  }

  return [
    {
      id: 'default',
      price: props.car.pricePerDay,
      label: isGeneral.value ? `от ${props.car.minRentDays} суток` : 'аренда',
    },
  ];
});

const selectedId = ref<number | 'default'>(props.initialTariffId ?? options.value[0].id);

const selected = computed(
  () => options.value.find((o) => o.id === selectedId.value) ?? options.value[0],
);

/* ---------------- расчёт ---------------- */

const days = computed(() => {
  if (!dateFrom.value || !dateTo.value) return 0;
  const a = new Date(dateFrom.value).getTime();
  const b = new Date(dateTo.value).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.round((b - a) / 86_400_000);
});

const total = computed(() => (days.value ? days.value * selected.value.price : null));

const today = new Date().toISOString().slice(0, 10);

/* ---------------- отправка ---------------- */

const isPhoneValid = computed(() => phone.value.replace(/\D/g, '').length >= 9);

async function submit() {
  if (!isPhoneValid.value || busy.value) return;

  busy.value = true;
  error.value = null;
  try {
    const result = await submitApplication({
      name: name.value.trim() || 'Без имени',
      phone: phone.value.replace(/\D/g, ''),
      cityId: locationStore.currentCity?.id ?? Number(props.car.city?.id),
      offerId: Number(props.car.id),
      tariffId: selectedId.value === 'default' ? undefined : Number(selectedId.value),
      comment: promo.value.trim() ? `Промокод: ${promo.value.trim()}` : undefined,
      desiredStartDate: dateFrom.value || undefined,
      desiredEndDate: dateTo.value || undefined,
      allowSimilar: allowSimilar.value,
    });

    if (result.success) emit('success');
    else error.value = result.message ?? 'Не удалось отправить заявку.';
  } catch (e: any) {
    const errors = e?.response?.data?.errors;
    error.value =
      (errors && Object.values(errors)[0]?.[0]) ??
      e?.response?.data?.message ??
      'Не удалось отправить заявку. Попробуйте ещё раз.';
  } finally {
    busy.value = false;
  }
}

/* ---------------- окно ---------------- */

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
      class="flex max-h-[92vh] w-full max-w-[27rem] flex-col overflow-y-auto rounded-t-radius-xl bg-surface-paper shadow-modal sm:rounded-radius-xl"
    >
      <header class="flex items-start justify-between gap-md px-lg pb-md pt-lg">
        <div>
          <h2 id="apply-title" class="text-title font-bold text-ink">
            Оставьте номер телефона
          </h2>
          <p class="mt-1 text-small text-ink-muted">
            Владелец перезвонит и договорится об осмотре.
          </p>
        </div>
        <!-- 44px — минимум для пальца; иконка внутри остаётся мелкой -->
        <button
          class="-mr-3 -mt-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
          aria-label="Закрыть"
          @click="emit('close')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </header>

      <div class="flex flex-col gap-lg px-lg pb-lg">
        <!-- Машина и выбранный тариф: видно, на что подписываешься -->
        <section class="rounded-radius-md border border-hairline">
          <div class="flex items-center gap-3 border-b border-hairline-soft p-3">
            <img
              v-if="car.images?.[0]"
              :src="car.images[0]"
              alt=""
              class="h-12 w-16 shrink-0 rounded-radius-sm object-cover"
            />
            <div class="min-w-0">
              <p class="truncate text-small font-bold text-ink">{{ car.brand }} {{ car.model }}</p>
              <p class="tnum text-caption text-ink-soft">
                {{ car.year }} · {{ car.transmission }} · {{ car.city?.name }}
              </p>
            </div>
          </div>

          <ul class="flex flex-col">
            <li v-for="opt in options" :key="opt.id">
              <label
                class="flex cursor-pointer items-center justify-between gap-md px-3 py-2.5 transition-colors duration-fast"
                :class="selectedId === opt.id ? 'bg-brand-tint' : 'hover:bg-surface-sunken'"
              >
                <span class="min-w-0">
                  <span class="tnum block text-title-sm font-extrabold text-ink">
                    {{ opt.price }}
                    <span class="text-small font-semibold text-ink-muted">сомони / сутки</span>
                  </span>
                  <span class="text-caption text-ink-soft">{{ opt.label }}</span>
                </span>

                <input
                  v-model="selectedId"
                  type="radio"
                  :value="opt.id"
                  name="tariff"
                  class="sr-only"
                />
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-fast"
                  :class="selectedId === opt.id ? 'border-brand-ink bg-brand' : 'border-hairline-strong'"
                  aria-hidden="true"
                >
                  <svg
                    v-if="selectedId === opt.id"
                    width="11"
                    height="11"
                    viewBox="0 0 14 14"
                    fill="none"
                    class="text-brand-on"
                  >
                    <path d="M2.5 7.5l3 3 6-6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </label>
            </li>
          </ul>

          <p
            v-if="car.deposit !== undefined && car.deposit !== null"
            class="tnum border-t border-hairline-soft px-3 py-2 text-caption text-ink-soft"
          >
            {{ car.deposit > 0 ? `Депозит ${car.deposit} сомони` : 'Без депозита' }}
            <template v-if="car.minRentDays > 1"> · от {{ car.minRentDays }} суток</template>
          </p>
        </section>

        <!-- Телефон — единственное обязательное поле -->
        <FormField label="Номер телефона" required for="ap-phone">
          <TextField
            id="ap-phone"
            v-model="phone"
            inputmode="tel"
            placeholder="+992 __ ___ __ __"
            :invalid="Boolean(error)"
            @keyup.enter="submit"
          />
        </FormField>

        <FormField label="Как к вам обращаться" for="ap-name" hint="Необязательно">
          <TextField id="ap-name" v-model="name" placeholder="Имя" />
        </FormField>

        <div>
          <p class="mb-1.5 text-small font-semibold text-ink">
            Когда нужна машина <span class="font-normal text-ink-soft">— необязательно</span>
          </p>
          <div class="grid grid-cols-2 gap-sm">
            <TextField id="ap-from" v-model="dateFrom" type="date" :maxlength="10" />
            <TextField id="ap-to" v-model="dateTo" type="date" :maxlength="10" />
          </div>
          <p v-if="total" class="tnum mt-2 text-small text-ink-muted">
            {{ days }} сут. × {{ selected.price }} =
            <span class="font-bold text-ink">{{ total }} сомони</span>
            <span class="text-ink-soft"> — ориентировочно</span>
          </p>
        </div>

        <!-- Промокод спрятан: нужен единицам, а поле видят все -->
        <div>
          <button
            v-if="!showPromo"
            class="-my-2.5 inline-flex min-h-[44px] items-center text-small font-semibold text-brand-ink transition-colors duration-fast hover:text-brand-deep"
            @click="showPromo = true"
          >
            У меня есть промокод
          </button>
          <FormField v-else label="Промокод" for="ap-promo">
            <TextField id="ap-promo" v-model="promo" placeholder="Введите код" />
          </FormField>
        </div>

        <label class="-my-1 flex min-h-[44px] cursor-pointer items-start gap-2.5 py-1">
          <input v-model="allowSimilar" type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 accent-brand-ink" />
          <span class="text-small text-ink-muted">
            Показать заявку владельцам похожих машин — так быстрее найдётся свободная
          </span>
        </label>

        <p v-if="error" class="text-caption text-state-error">{{ error }}</p>

        <div>
          <button
            :disabled="!isPhoneValid || busy"
            class="w-full rounded-radius-md bg-brand py-3.5 text-body font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
            @click="submit"
          >
            {{ busy ? 'Отправляем…' : 'Оставить заявку' }}
          </button>
          <p class="mt-2 text-center text-caption font-semibold text-ink-muted">Это бесплатно</p>
          <p class="mt-3 text-caption leading-relaxed text-ink-soft">
            Нажимая кнопку, вы соглашаетесь с
            <a href="#" class="text-ink-muted underline">условиями использования</a> и
            <a href="#" class="text-ink-muted underline">политикой конфиденциальности</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
