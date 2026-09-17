<script setup lang="ts">
import { computed, ref } from 'vue';

defineOptions({
  name: 'PhotoUploader',
});

const props = defineProps<{
  modelValue: File[];
}>();

const emit = defineEmits<{
  'update:modelValue': [files: File[]];
}>();

const MAX = 15;
const MIN = 3;
const MAX_MB = 5;

const error = ref<string | null>(null);

const items = computed(() =>
  props.modelValue.map((f, i) => ({ key: `${f.name}-${i}`, name: f.name, url: URL.createObjectURL(f) })),
);

const left = computed(() => Math.max(0, MIN - props.modelValue.length));

function onPick(event: Event) {
  const input = event.target as HTMLInputElement;
  const picked = Array.from(input.files ?? []);
  error.value = null;

  const tooBig = picked.find((f) => f.size > MAX_MB * 1024 * 1024);
  if (tooBig) {
    error.value = `Файл «${tooBig.name}» больше ${MAX_MB} МБ.`;
    input.value = '';
    return;
  }

  const next = [...props.modelValue, ...picked];
  if (next.length > MAX) {
    error.value = `Больше ${MAX} фотографий загрузить нельзя.`;
    input.value = '';
    return;
  }

  emit('update:modelValue', next);
  input.value = '';
}

function remove(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
}

/** Главной считается первая — даём переставить её без drag-and-drop */
function makeMain(index: number) {
  if (index === 0) return;
  const next = [...props.modelValue];
  const [file] = next.splice(index, 1);
  next.unshift(file);
  emit('update:modelValue', next);
}
</script>

<template>
  <div>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-sm">
      <div
        v-for="(item, i) in items"
        :key="item.key"
        class="group relative aspect-[4/3] overflow-hidden rounded-radius-md border bg-surface-sunken"
        :class="i === 0 ? 'border-brand-ink' : 'border-hairline'"
      >
        <img :src="item.url" :alt="item.name" class="h-full w-full object-cover" />

        <span
          v-if="i === 0"
          class="absolute left-1.5 top-1.5 rounded-full bg-brand-ink px-2 py-0.5 text-caption font-bold text-white"
        >
          Главная
        </span>
        <button
          v-else
          type="button"
          class="absolute left-1.5 top-1.5 rounded-full bg-ink/70 px-2 py-0.5 text-caption font-semibold text-white opacity-0 transition-opacity duration-fast group-hover:opacity-100 focus-visible:opacity-100"
          @click="makeMain(i)"
        >
          Сделать главной
        </button>

        <button
          type="button"
          class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white transition-colors duration-fast hover:bg-state-error"
          :aria-label="`Удалить ${item.name}`"
          @click="remove(i)"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <label
        v-if="modelValue.length < MAX"
        class="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-radius-md border-2 border-dashed border-hairline-strong bg-surface-sunken text-ink-soft transition-colors duration-fast hover:border-brand-ink hover:text-brand-ink"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <span class="text-caption font-semibold">Добавить</span>
        <input type="file" accept="image/*" multiple class="hidden" @change="onPick" />
      </label>
    </div>

    <p v-if="error" class="mt-sm text-caption text-state-error">{{ error }}</p>
    <p v-else-if="left > 0" class="mt-sm text-caption text-ink-soft">
      Загружено {{ modelValue.length }} из {{ MIN }} минимально нужных. Можно выбрать несколько
      файлов сразу.
    </p>
    <p v-else class="mt-sm text-caption text-ink-soft">
      Загружено {{ modelValue.length }}. Наведите на снимок, чтобы сделать его главным.
    </p>
  </div>
</template>
