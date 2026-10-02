<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

defineOptions({
  name: 'SearchSelect',
});

/**
 * Список с поиском: можно выбрать из списка, а можно начать печатать и сразу
 * получить подходящие варианты.
 *
 * В справочнике марок больше трёхсот строк, моделей у популярной марки —
 * сотни. Родной <select> листается пальцем минуту; здесь «toy» оставляет
 * только Toyota. Контракт тот же, что у NativeSelect (modelValue — id строкой,
 * событие update:modelValue), поэтому поле меняется на месте без правок
 * остального кода формы.
 */
const props = defineProps<{
  modelValue: string | number | null;
  options: Array<{ id: string | number; name: string }>;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const input = ref<HTMLInputElement | null>(null);
const list = ref<HTMLElement | null>(null);
const open = ref(false);
const query = ref('');
const active = ref(0);

const selected = computed(
  () => props.options.find((o) => String(o.id) === String(props.modelValue ?? '')) ?? null,
);

// ё и е в поиске считаем одной буквой: «зелёный» ищут и как «зеленый»
const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').trim();

const filtered = computed(() => {
  const q = norm(query.value);
  if (!q) return props.options;
  return props.options.filter((o) => norm(o.name).includes(q));
});

// Пока список закрыт, в поле — выбранное значение; пока открыт — то, что печатают
const shown = computed(() => (open.value ? query.value : (selected.value?.name ?? '')));

function openList() {
  if (props.disabled) return;
  open.value = true;
  query.value = '';
  const current = filtered.value.findIndex((o) => String(o.id) === String(props.modelValue ?? ''));
  active.value = Math.max(0, current);
  void scrollToActive();
}

function closeList() {
  open.value = false;
  query.value = '';
}

function choose(opt: { id: string | number }) {
  emit('update:modelValue', String(opt.id));
  closeList();
  input.value?.blur();
}

function onInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value;
  open.value = true;
  active.value = 0;
  void scrollToActive();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (!open.value) openList();
    else active.value = Math.min(active.value + 1, filtered.value.length - 1);
    void scrollToActive();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    active.value = Math.max(active.value - 1, 0);
    void scrollToActive();
  } else if (e.key === 'Enter') {
    if (open.value && filtered.value[active.value]) {
      e.preventDefault();
      choose(filtered.value[active.value]);
    }
  } else if (e.key === 'Escape') {
    closeList();
  }
}

async function scrollToActive() {
  await nextTick();
  list.value?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
}

// Список обновился снаружи (подгрузились модели) — не оставляем индекс за краем
watch(filtered, (items) => {
  if (active.value >= items.length) active.value = Math.max(0, items.length - 1);
});
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      ref="input"
      type="text"
      role="combobox"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      aria-autocomplete="list"
      :aria-expanded="open"
      :value="shown"
      :disabled="disabled"
      :placeholder="open && selected ? selected.name : (placeholder ?? 'Выберите из списка')"
      class="w-full rounded-radius-md border bg-surface-paper py-2.5 pl-3.5 pr-10 text-body text-ink transition-colors duration-fast placeholder:text-ink-ghost focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
      :class="
        invalid
          ? 'border-state-error'
          : 'border-hairline focus:border-brand-ink focus:shadow-focus-brand'
      "
      @focus="openList"
      @click="!open && openList()"
      @input="onInput"
      @keydown="onKeydown"
      @blur="closeList"
    />

    <svg
      class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft transition-transform duration-fast"
      :class="open && 'rotate-180'"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!--
      mousedown.prevent: иначе поле теряет фокус раньше, чем срабатывает
      клик по варианту, список закрывается и выбор не происходит.
    -->
    <ul
      v-if="open"
      ref="list"
      role="listbox"
      class="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto overscroll-contain rounded-radius-md border border-hairline bg-surface-paper py-1 shadow-pop"
      @mousedown.prevent
    >
      <li
        v-for="(opt, i) in filtered"
        :key="opt.id"
        role="option"
        :aria-selected="String(opt.id) === String(modelValue ?? '')"
        :data-active="i === active"
        class="flex cursor-pointer items-center justify-between gap-sm px-3.5 py-2.5 text-body text-ink"
        :class="[
          i === active && 'bg-surface-sunken',
          String(opt.id) === String(modelValue ?? '') && 'font-semibold',
        ]"
        @mouseenter="active = i"
        @click="choose(opt)"
      >
        <span class="truncate">{{ opt.name }}</span>
        <svg
          v-if="String(opt.id) === String(modelValue ?? '')"
          class="shrink-0 text-brand-ink"
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 7.5l3 3 6-6.5"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </li>
      <li v-if="filtered.length === 0" class="px-3.5 py-3 text-small text-ink-soft">
        Ничего не найдено
      </li>
    </ul>
  </div>
</template>
