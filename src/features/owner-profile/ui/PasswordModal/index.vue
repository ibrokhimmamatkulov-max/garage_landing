<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ownerApi } from '@/entities/owner';
import FormField from '@/shared/ui/FormField/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'PasswordModal',
});

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const MIN_LENGTH = 6;

const form = reactive({ current: '', next: '', repeat: '' });
const busy = ref(false);
const error = ref<string | null>(null);
const fieldErrors = ref<Record<string, string>>({});

/**
 * Повтор проверяем на клиенте: сервер о нём не знает, ему уходит один
 * пароль. Без повтора опечатка в новом пароле запирает вход.
 */
const repeatMismatch = computed(
  () => form.repeat.length > 0 && form.repeat !== form.next,
);

const canSubmit = computed(
  () =>
    form.current.length > 0 &&
    form.next.length >= MIN_LENGTH &&
    form.next !== form.current &&
    form.repeat === form.next,
);

async function save() {
  if (!canSubmit.value || busy.value) return;
  busy.value = true;
  error.value = null;
  fieldErrors.value = {};

  try {
    await ownerApi.changePassword(form.current, form.next);
    emit('saved');
  } catch (e: any) {
    const errors = e?.response?.data?.errors;
    if (errors) {
      fieldErrors.value = Object.fromEntries(
        Object.entries(errors).map(([k, v]) => [k, (v as string[])[0]]),
      );
    }
    error.value = errors ? null : (e?.response?.data?.message ?? 'Не удалось сменить пароль.');
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-[200] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-lg"
    @click.self="emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-title"
      class="w-full max-w-[26rem] rounded-t-radius-2xl bg-surface-paper p-lg shadow-modal sm:rounded-radius-2xl sm:p-xl"
    >
      <h2 id="pass-title" class="text-title font-bold text-ink">Смена пароля</h2>
      <p class="mt-1 text-small text-ink-muted">
        Логин остаётся прежним. По новому паролю вы будете входить в кабинет.
      </p>

      <div class="mt-lg flex flex-col gap-md">
        <FormField label="Текущий пароль" required for="pw-cur" :error="fieldErrors.current_password">
          <TextField id="pw-cur" v-model="form.current" type="password" autocomplete="current-password" />
        </FormField>

        <FormField
          label="Новый пароль"
          required
          for="pw-new"
          :hint="`Не короче ${MIN_LENGTH} символов`"
          :error="fieldErrors.new_password"
        >
          <TextField id="pw-new" v-model="form.next" type="password" autocomplete="new-password" />
        </FormField>

        <FormField
          label="Новый пароль ещё раз"
          required
          for="pw-rep"
          :error="repeatMismatch ? 'Пароли не совпадают' : null"
        >
          <TextField id="pw-rep" v-model="form.repeat" type="password" autocomplete="new-password" />
        </FormField>
      </div>

      <p v-if="error" class="mt-md text-caption text-state-error">{{ error }}</p>

      <div class="mt-lg flex justify-end gap-sm">
        <button
          class="rounded-radius-md px-4 py-2.5 text-small font-semibold text-ink-muted transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
          @click="emit('close')"
        >
          Отмена
        </button>
        <button
          :disabled="!canSubmit || busy"
          class="rounded-radius-md bg-brand px-5 py-2.5 text-small font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
          @click="save"
        >
          {{ busy ? 'Сохраняем…' : 'Сменить пароль' }}
        </button>
      </div>
    </div>
  </div>
</template>
