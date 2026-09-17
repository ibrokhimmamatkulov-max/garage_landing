<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useOtpAuth } from '../../model/useOtpAuth';
import FormField from '@/shared/ui/FormField/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'AuthModal',
});

/**
 * Вход поверх текущего экрана.
 *
 * Появляется в конце заполнения формы: человек уже вложил силы в 25 полей,
 * уводить его на отдельную страницу входа — значит рвать контекст и рисковать
 * потерей заполненного.
 */
const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    /** Подпись финальной кнопки — «Опубликовать», «Войти» и т.п. */
    confirmLabel?: string;
  }>(),
  {
    title: 'Подтвердите номер',
    subtitle: 'Это нужно, чтобы вы могли управлять объявлением и получать заявки.',
    confirmLabel: 'Продолжить',
  },
);

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const auth = useOtpAuth();
const savedAcknowledged = ref(false);
const dialog = ref<HTMLElement | null>(null);

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => {
  document.addEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
  // Фокус в первое поле, а не на сам диалог: иначе глобальный стиль фокуса
  // рисует рамку вокруг всего окна, и это читается как ошибка ввода.
  requestAnimationFrame(() => {
    dialog.value?.querySelector<HTMLInputElement>('input')?.focus();
  });
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKey);
  document.body.style.overflow = '';
});

async function onRequest() {
  await auth.requestCode();
}

async function onVerify() {
  const done = await auth.verify();
  if (done) emit('success');
}

async function onPassword() {
  const done = await auth.signInWithPassword();
  if (done) emit('success');
}

function onCredentialsDone() {
  emit('success');
}
</script>

<template>
  <div
    class="fixed inset-0 z-[200] flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-lg"
    @click.self="emit('close')"
  >
    <div
      ref="dialog"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      class="w-full max-w-[26rem] rounded-t-radius-xl bg-surface-paper p-lg shadow-modal outline-none sm:rounded-radius-xl"
    >
      <!-- ---------- Телефон ---------- -->
      <template v-if="auth.step.value === 'phone'">
        <div class="flex items-start justify-between gap-md">
          <div>
            <h2 class="text-title font-bold text-ink">{{ props.title }}</h2>
            <p class="mt-1.5 text-small text-ink-muted">{{ props.subtitle }}</p>
          </div>
          <button
            class="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
            aria-label="Закрыть"
            @click="emit('close')"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="mt-lg flex gap-1 rounded-radius-md bg-surface-sunken p-1">
          <button
            v-for="m in [
              { id: 'otp', label: 'По телефону' },
              { id: 'password', label: 'По паролю' },
            ]"
            :key="m.id"
            class="flex-1 rounded-radius-sm px-3 py-2 text-small font-semibold transition-colors duration-fast"
            :class="
              auth.mode.value === m.id
                ? 'bg-surface-paper text-ink shadow-hairline'
                : 'text-ink-soft hover:text-ink'
            "
            @click="auth.mode.value = m.id as 'otp' | 'password'"
          >
            {{ m.label }}
          </button>
        </div>

        <template v-if="auth.mode.value === 'otp'">
          <FormField label="Номер телефона" class="mt-lg" for="a-phone">
            <TextField
              id="a-phone"
              v-model="auth.phone.value"
              inputmode="tel"
              placeholder="+992 __ ___ __ __"
              @keyup.enter="onRequest"
            />
          </FormField>

          <p v-if="auth.error.value" class="mt-sm text-caption text-state-error">
            {{ auth.error.value }}
          </p>

          <button
            :disabled="!auth.isPhoneValid.value || auth.busy.value"
            class="mt-lg w-full rounded-radius-md bg-brand-ink py-3 text-body font-semibold text-white transition-colors duration-fast hover:bg-brand-deep disabled:bg-surface-sunken disabled:text-ink-soft"
            @click="onRequest"
          >
            {{ auth.busy.value ? 'Отправляем…' : 'Получить код' }}
          </button>
        </template>

        <template v-else>
          <FormField label="Логин" class="mt-lg" for="a-login">
            <TextField id="a-login" v-model="auth.login.value" />
          </FormField>
          <FormField label="Пароль" class="mt-md" for="a-pass">
            <TextField id="a-pass" v-model="auth.password.value" type="password" @keyup.enter="onPassword" />
          </FormField>

          <p v-if="auth.error.value" class="mt-sm text-caption text-state-error">
            {{ auth.error.value }}
          </p>

          <button
            :disabled="!auth.login.value || !auth.password.value || auth.busy.value"
            class="mt-lg w-full rounded-radius-md bg-brand-ink py-3 text-body font-semibold text-white transition-colors duration-fast hover:bg-brand-deep disabled:bg-surface-sunken disabled:text-ink-soft"
            @click="onPassword"
          >
            {{ props.confirmLabel }}
          </button>
        </template>
      </template>

      <!-- ---------- Код ---------- -->
      <template v-else-if="auth.step.value === 'code'">
        <h2 class="text-title font-bold text-ink">Введите код</h2>
        <p class="mt-1.5 text-small text-ink-muted">
          Отправили на <span class="tnum font-semibold text-ink">{{ auth.phone.value }}</span>
        </p>

        <p
          v-if="auth.isStub.value"
          class="mt-md rounded-radius-md border border-state-warning bg-state-warning-tint px-3.5 py-2.5 text-caption font-semibold text-state-warning"
        >
          Демо-режим: SMS не отправляется, код подставлен автоматически.
        </p>
        <p
          v-else-if="auth.isNewAccount.value"
          class="mt-md rounded-radius-md bg-brand-tint px-3.5 py-2.5 text-caption font-semibold text-brand-ink"
        >
          После подтверждения придёт второе SMS — с логином и паролем для следующих входов.
        </p>

        <FormField label="Код из SMS" class="mt-lg" for="a-code">
          <TextField
            id="a-code"
            v-model="auth.code.value"
            inputmode="numeric"
            :maxlength="4"
            @keyup.enter="onVerify"
          />
        </FormField>

        <p v-if="auth.error.value" class="mt-sm text-caption text-state-error">
          {{ auth.error.value }}
        </p>

        <button
          :disabled="!auth.isCodeValid.value || auth.busy.value"
          class="mt-lg w-full rounded-radius-md bg-brand-ink py-3 text-body font-semibold text-white transition-colors duration-fast hover:bg-brand-deep disabled:bg-surface-sunken disabled:text-ink-soft"
          @click="onVerify"
        >
          {{ auth.busy.value ? 'Проверяем…' : props.confirmLabel }}
        </button>

        <button
          class="mt-md w-full text-small font-semibold text-ink-soft transition-colors duration-fast hover:text-ink"
          @click="auth.reset()"
        >
          Изменить номер
        </button>
      </template>

      <!-- ---------- Учётные данные ---------- -->
      <template v-else>
        <h2 class="text-title font-bold text-ink">Сохраните данные для входа</h2>
        <p class="mt-1.5 text-small text-ink-muted">
          В следующий раз сможете войти по логину и паролю. Показываем один раз.
        </p>

        <dl class="mt-lg rounded-radius-md bg-surface-sunken p-base">
          <div class="flex items-center justify-between py-1.5">
            <dt class="text-small text-ink-muted">Логин</dt>
            <dd class="tnum text-small font-bold text-ink">{{ auth.credentials.value?.login }}</dd>
          </div>
          <div class="flex items-center justify-between py-1.5">
            <dt class="text-small text-ink-muted">Пароль</dt>
            <dd class="tnum text-small font-bold text-ink">{{ auth.credentials.value?.password }}</dd>
          </div>
        </dl>

        <button
          class="mt-md w-full rounded-radius-md border border-hairline py-2.5 text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken"
          @click="auth.copyCredentials()"
        >
          Скопировать
        </button>

        <label class="mt-lg flex cursor-pointer items-start gap-2.5">
          <input v-model="savedAcknowledged" type="checkbox" class="mt-0.5 h-4 w-4 accent-brand-ink" />
          <span class="text-small text-ink-muted">Я сохранил данные</span>
        </label>

        <button
          :disabled="!savedAcknowledged"
          class="mt-lg w-full rounded-radius-md bg-brand-ink py-3 text-body font-semibold text-white transition-colors duration-fast hover:bg-brand-deep disabled:bg-surface-sunken disabled:text-ink-soft"
          @click="onCredentialsDone"
        >
          {{ props.confirmLabel }}
        </button>
      </template>
    </div>
  </div>
</template>
