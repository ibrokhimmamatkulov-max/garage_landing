<script setup lang="ts">
import { ref, computed } from 'vue';

defineOptions({
  name: 'DocumentCheck',
});

/**
 * Проверка техпаспорта. Взято из формы-референса и оставлено почти как есть:
 * это единственное место, где владелец получает что-то взамен усилий —
 * видимый бейдж доверия в объявлении.
 *
 * Сами снимки в объявлении не показываются, наружу уходит только признак.
 */
const props = defineProps<{
  modelValue: File[];
}>();

const emit = defineEmits<{
  'update:modelValue': [files: File[]];
}>();

const MAX_MB = 5;
const error = ref<string | null>(null);

const previews = computed(() =>
  props.modelValue.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
);

function onPick(event: Event) {
  const input = event.target as HTMLInputElement;
  const picked = Array.from(input.files ?? []);
  error.value = null;

  const tooBig = picked.find((f) => f.size > MAX_MB * 1024 * 1024);
  if (tooBig) {
    error.value = `Файл «${tooBig.name}» больше ${MAX_MB} МБ. Уменьшите или снимите заново.`;
    input.value = '';
    return;
  }

  const next = [...props.modelValue, ...picked].slice(0, 2);
  emit('update:modelValue', next);
  input.value = '';
}

function remove(index: number) {
  const next = [...props.modelValue];
  next.splice(index, 1);
  emit('update:modelValue', next);
}
</script>

<template>
  <section class="rounded-radius-lg border border-hairline bg-surface-paper p-lg">
    <div class="flex flex-col gap-lg md:flex-row md:items-start md:justify-between">
      <div class="max-w-[30rem]">
        <h3 class="text-title-sm font-bold text-ink">Проверка документов на машину</h3>
        <p class="mt-1.5 text-small text-ink-muted">
          Сфотографируйте техпаспорт с двух сторон и загрузите. Мы сверим данные с объявлением.
        </p>

        <ul class="mt-md space-y-2">
          <li class="flex items-start gap-2 text-small text-ink-muted">
            <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-ghost" aria-hidden="true" />
            <span>
              После проверки объявление получит отметку
              <span
                class="ml-0.5 inline-flex items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-caption font-bold text-brand-ink"
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 7.5l3 3 6-6.5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                VIN проверен
              </span>
            </span>
          </li>
          <li class="flex items-start gap-2 text-small text-ink-muted">
            <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-ghost" aria-hidden="true" />
            Сами документы в объявлении не показываются — их видит только модератор.
          </li>
        </ul>

        <div class="mt-lg flex flex-wrap gap-sm">
          <div
            v-for="(p, i) in previews"
            :key="p.url"
            class="relative h-24 w-32 overflow-hidden rounded-radius-md border border-hairline bg-surface-sunken"
          >
            <img :src="p.url" :alt="p.name" class="h-full w-full object-cover" />
            <button
              type="button"
              class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/75 text-white transition-colors duration-fast hover:bg-ink"
              :aria-label="`Удалить ${p.name}`"
              @click="remove(i)"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <label
            v-if="modelValue.length < 2"
            class="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-radius-md border-2 border-dashed border-hairline-strong bg-surface-sunken text-ink-soft transition-colors duration-fast hover:border-brand-ink hover:text-brand-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            <span class="text-caption font-semibold">
              {{ modelValue.length === 0 ? 'Лицевая' : 'Оборот' }}
            </span>
          </label>
          <input type="file" accept="image/*" class="hidden" @change="onPick" />
        </div>

        <p v-if="error" class="mt-sm text-caption text-state-error">{{ error }}</p>
      </div>

      <!-- Иллюстрация: как снимать -->
      <div
        class="hidden shrink-0 items-center justify-center rounded-radius-lg bg-surface-sunken p-lg md:flex"
        aria-hidden="true"
      >
        <svg width="150" height="118" viewBox="0 0 150 118" fill="none">
          <rect x="4" y="30" width="86" height="56" rx="6" fill="#fff" stroke="#D4D8E0" stroke-width="2"/>
          <rect x="14" y="40" width="30" height="22" rx="3" fill="#E3E6EC"/>
          <g stroke="#C7CCD6" stroke-width="3" stroke-linecap="round">
            <path d="M52 44h28M52 53h28M14 70h66M14 78h44"/>
          </g>
          <rect x="84" y="8" width="58" height="102" rx="10" fill="#10141A"/>
          <rect x="89" y="18" width="48" height="76" rx="5" fill="#2B3644"/>
          <rect x="95" y="34" width="36" height="26" rx="3" fill="#E3E6EC"/>
          <circle cx="113" cy="101" r="6" fill="#3E4A5A"/>
          <rect x="104" y="12" width="18" height="3" rx="1.5" fill="#3E4A5A"/>
        </svg>
      </div>
    </div>
  </section>
</template>
