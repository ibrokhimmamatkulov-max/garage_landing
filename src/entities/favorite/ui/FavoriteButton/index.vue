<script setup lang="ts">
import { computed } from 'vue';
import { useFavoriteStore } from '../../model/store';

defineOptions({
  name: 'FavoriteButton',
});

const props = withDefaults(
  defineProps<{
    carId: string | number;
    /** overlay — круглая кнопка поверх фото; inline — с подписью, на странице авто */
    variant?: 'overlay' | 'inline';
  }>(),
  { variant: 'overlay' },
);

const store = useFavoriteStore();
const active = computed(() => store.has(props.carId));

function onClick(e: Event) {
  // Кнопка лежит поверх фото, клик по которому открывает карточку авто
  e.stopPropagation();
  store.toggle(props.carId);
}
</script>

<template>
  <button
    type="button"
    :aria-pressed="active"
    :aria-label="active ? 'Убрать из избранного' : 'Добавить в избранное'"
    :title="active ? 'Убрать из избранного' : 'Добавить в избранное'"
    class="inline-flex shrink-0 items-center justify-center gap-2 transition-all duration-fast ease-out active:scale-90"
    :class="
      variant === 'overlay'
        ? 'h-10 w-10 rounded-full bg-surface-paper/90 text-ink shadow-hairline backdrop-blur-sm hover:bg-surface-paper'
        : 'min-h-[44px] rounded-full border border-hairline bg-surface-paper px-4 text-small font-semibold text-ink hover:border-hairline-strong hover:bg-surface-sunken'
    "
    @click="onClick"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      class="transition-colors duration-fast"
      :class="active ? 'text-[#E5322D]' : 'text-ink'"
    >
      <path
        d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7C19.5 15.9 12 20.5 12 20.5z"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
        :fill="active ? 'currentColor' : 'none'"
      />
    </svg>
    <span v-if="variant === 'inline'">{{ active ? 'В избранном' : 'В избранное' }}</span>
  </button>
</template>
