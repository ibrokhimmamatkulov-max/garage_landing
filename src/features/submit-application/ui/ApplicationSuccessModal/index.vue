<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { Car } from '@/entities/car';

defineOptions({
  name: 'ApplicationSuccessModal',
});

/**
 * Экран после отправки.
 *
 * Прежний просто дублировал «Заявка отправлена» дважды и не отвечал на
 * единственный вопрос, который у человека есть в этот момент: что дальше
 * и когда со мной свяжутся. Теперь отвечает.
 */
defineProps<{
  car: Car;
}>();

const emit = defineEmits<{
  close: [];
}>();

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => {
  document.addEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="ok-title"
      class="w-full max-w-[25rem] rounded-t-radius-xl bg-surface-paper p-lg shadow-modal sm:rounded-radius-xl"
    >
      <div
        class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand"
        aria-hidden="true"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" class="text-brand-on">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <h2 id="ok-title" class="mt-base text-center text-title font-bold text-ink">
        Заявка отправлена
      </h2>
      <p class="mt-1.5 text-center text-small text-ink-muted">
        {{ car.brand }} {{ car.model }} · {{ car.year }}
      </p>

      <!-- Единственный вопрос в этот момент: что теперь будет -->
      <ol class="mt-lg flex flex-col gap-3">
        <li
          v-for="(step, i) in [
            'Владелец получил ваш номер и заявку',
            'Он позвонит в ближайшее время, обычно в тот же день',
            'Договоритесь об осмотре машины и условиях',
          ]"
          :key="i"
          class="flex items-start gap-3"
        >
          <span
            class="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-bold text-ink-muted"
          >
            {{ i + 1 }}
          </span>
          <span class="text-small text-ink">{{ step }}</span>
        </li>
      </ol>

      <p class="mt-lg rounded-radius-md bg-surface-sunken px-3.5 py-2.5 text-caption text-ink-muted">
        Договор и оплату вы обсуждаете с владельцем напрямую — мы только сводим стороны.
      </p>

      <button
        class="mt-lg w-full rounded-radius-md bg-brand py-3.5 text-body font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press"
        @click="emit('close')"
      >
        Смотреть другие машины
      </button>
    </div>
  </div>
</template>
