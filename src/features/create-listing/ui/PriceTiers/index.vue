<script setup lang="ts">
import { computed } from 'vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'PriceTiers',
});

export interface Tier {
  minDays: number | string;
  maxDays: number | string | null;
  pricePerDay: number | string;
}

/**
 * Ступени цены — главное отличие аренды от продажи.
 *
 * В форме-референсе было одно поле «Цена» и галочка «Торг»: для продажи этого
 * хватает, для аренды нет. Здесь владелец задаёт, сколько стоят сутки при
 * разном сроке — чем дольше, тем дешевле.
 */
const props = defineProps<{
  modelValue: Tier[];
  minRentDays: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [tiers: Tier[]];
}>();

/** Те же правила, что проверяет бэк: без дыр, без пересечений, последняя открыта */
const problems = computed<string[]>(() => {
  const out: string[] = [];
  const tiers = props.modelValue;

  if (!tiers.length) return ['Добавьте хотя бы одну ступень.'];

  if (Number(tiers[0].minDays) !== props.minRentDays) {
    out.push(`Первая ступень должна начинаться с ${props.minRentDays} сут. — это минимальный срок.`);
  }

  tiers.forEach((t, i) => {
    if (!t.pricePerDay || Number(t.pricePerDay) <= 0) {
      out.push(`Ступень ${i + 1}: укажите цену.`);
    }

    const next = tiers[i + 1];
    if (!next) return;

    if (t.maxDays === null || t.maxDays === '') {
      out.push('Ступень без верхней границы может быть только последней.');
      return;
    }

    const expected = Number(t.maxDays) + 1;
    const actual = Number(next.minDays);
    if (actual < expected) out.push(`Ступени ${i + 1} и ${i + 2} пересекаются.`);
    else if (actual > expected) {
      out.push(`Не задана цена для срока ${expected}–${actual - 1} сут.`);
    }
  });

  const last = tiers[tiers.length - 1];
  if (last.maxDays !== null && last.maxDays !== '') {
    out.push(`Последняя ступень должна быть без верхней границы — иначе для срока дольше ${last.maxDays} сут. цены нет.`);
  }

  return out;
});

function update(index: number, patch: Partial<Tier>) {
  const next = props.modelValue.map((t, i) => (i === index ? { ...t, ...patch } : t));
  emit('update:modelValue', next);
}

function addTier() {
  const last = props.modelValue[props.modelValue.length - 1];
  const start = last?.maxDays ? Number(last.maxDays) + 1 : Number(last?.minDays ?? 0) + 1;

  const next = props.modelValue.map((t, i) =>
    i === props.modelValue.length - 1 && (t.maxDays === null || t.maxDays === '')
      ? { ...t, maxDays: String(Number(t.minDays) + 2) }
      : t,
  );

  emit('update:modelValue', [
    ...next,
    { minDays: String(Math.max(start, Number(next[next.length - 1]?.maxDays ?? 0) + 1)), maxDays: null, pricePerDay: '' },
  ]);
}

function removeTier(index: number) {
  if (props.modelValue.length === 1) return;
  const next = props.modelValue.filter((_, i) => i !== index);
  // Последняя всегда открыта сверху
  next[next.length - 1] = { ...next[next.length - 1], maxDays: null };
  emit('update:modelValue', next);
}
</script>

<template>
  <div class="flex flex-col gap-md">
    <div
      v-for="(tier, i) in modelValue"
      :key="i"
      class="flex flex-wrap items-end gap-sm rounded-radius-md border border-hairline bg-surface-paper p-md"
    >
      <div class="min-w-[5.5rem] flex-1">
        <label class="mb-1 block text-caption font-semibold text-ink-soft">От, суток</label>
        <TextField
          :model-value="tier.minDays"
          inputmode="numeric"
          @update:model-value="update(i, { minDays: $event })"
        />
      </div>

      <div class="min-w-[5.5rem] flex-1">
        <label class="mb-1 block text-caption font-semibold text-ink-soft">До, суток</label>
        <TextField
          :model-value="tier.maxDays"
          inputmode="numeric"
          :placeholder="i === modelValue.length - 1 ? 'без предела' : ''"
          :disabled="i === modelValue.length - 1"
          @update:model-value="update(i, { maxDays: $event })"
        />
      </div>

      <div class="min-w-[8rem] flex-[1.4]">
        <label class="mb-1 block text-caption font-semibold text-ink-soft">Цена за сутки</label>
        <TextField
          :model-value="tier.pricePerDay"
          inputmode="numeric"
          suffix="с."
          @update:model-value="update(i, { pricePerDay: $event })"
        />
      </div>

      <button
        v-if="modelValue.length > 1"
        type="button"
        class="flex h-[42px] w-10 shrink-0 items-center justify-center rounded-radius-md border border-hairline text-ink-soft transition-colors duration-fast hover:border-state-error hover:text-state-error"
        aria-label="Удалить ступень"
        @click="removeTier(i)"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 5h10M6.5 5V3.5h3V5M5 5l.6 8h4.8L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <button
      type="button"
      class="self-start rounded-radius-md border border-dashed border-hairline-strong px-4 py-2.5 text-small font-semibold text-ink-muted transition-colors duration-fast hover:border-brand-ink hover:text-brand-ink"
      @click="addTier"
    >
      + Добавить ступень
    </button>

    <ul v-if="problems.length" class="space-y-1">
      <li v-for="p in problems" :key="p" class="text-caption text-state-error">{{ p }}</li>
    </ul>
    <p v-else class="text-caption text-ink-soft">
      Пример: 1–2 суток по 250, 3–6 по 220, от 7 суток по 190 — чем дольше, тем выгоднее.
    </p>
  </div>
</template>
