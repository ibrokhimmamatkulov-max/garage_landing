<script setup lang="ts">
import { computed, ref } from 'vue';
import { useManagerStore } from '@/entities/manager/model/store';
import FormField from '@/shared/ui/FormField/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'PhoneBindModal',
});

const emit = defineEmits<{
  close: [];
}>();

/**
 * Привязка телефона к учётке менеджера: после этого можно входить
 * в админку по SMS-коду, а не только по логину и паролю.
 * Номер подтверждается кодом — иначе можно было бы привязать чужой.
 */
const store = useManagerStore();

const digits = ref('');
const code = ref('');
const codeSent = ref(false);
const busy = ref(false);
const error = ref<string | null>(null);
const done = ref(false);

const fullPhone = computed(() => `992${digits.value}`);
const isPhoneValid = computed(() => digits.value.length === 9);

function onPhoneInput(value: string) {
  digits.value = value.replace(/\D/g, '').slice(0, 9);
}

function onCodeInput(value: string) {
  code.value = value.replace(/\D/g, '').slice(0, 6);
}

async function sendCode() {
  if (!isPhoneValid.value || busy.value) return;
  busy.value = true;
  error.value = null;
  const result = await store.requestPhoneBind(fullPhone.value);
  busy.value = false;
  if (!result.ok) {
    error.value = result.error;
    return;
  }
  codeSent.value = true;
  code.value = result.stubCode ?? '';
}

async function confirm() {
  if (!code.value || busy.value) return;
  busy.value = true;
  error.value = await store.confirmPhoneBind(fullPhone.value, code.value);
  busy.value = false;
  if (!error.value) done.value = true;
}
</script>

<template>
  <div
    class="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 p-base backdrop-blur-sm sm:p-lg"
    @click.self="emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-bind-title"
      class="relative w-full max-w-[24rem] rounded-radius-2xl bg-surface-paper p-lg shadow-modal sm:p-xl"
    >
      <button
        type="button"
        aria-label="Закрыть"
        class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
        @click="emit('close')"
      >
        ✕
      </button>

      <h2 id="phone-bind-title" class="pr-8 text-title font-bold text-ink">Телефон для входа</h2>

      <template v-if="done">
        <p class="mt-md text-small text-ink-muted">
          Готово. Теперь в админку можно входить по SMS-коду на этот номер — логин и пароль
          тоже продолжают работать.
        </p>
        <button
          type="button"
          class="mt-lg w-full rounded-radius-md bg-brand py-3 text-body font-semibold text-brand-on transition-colors duration-fast hover:bg-brand-press"
          @click="emit('close')"
        >
          Понятно
        </button>
      </template>

      <form v-else @submit.prevent="codeSent ? confirm() : sendCode()">
        <p class="mt-1.5 text-small text-ink-muted">
          Привяжите номер, чтобы входить по коду из SMS. Логин и пароль останутся рабочими.
        </p>

        <FormField label="Телефон" class="mt-lg" for="bind-phone">
          <div class="flex items-stretch gap-2">
            <span
              class="flex items-center rounded-radius-md border border-hairline bg-surface-sunken px-3 text-body text-ink-muted"
              >+992</span
            >
            <TextField
              id="bind-phone"
              class="flex-1"
              :model-value="digits"
              inputmode="tel"
              placeholder="90 123 45 67"
              :disabled="codeSent"
              @update:model-value="onPhoneInput"
            />
          </div>
        </FormField>

        <FormField v-if="codeSent" label="Код из SMS" class="mt-md" for="bind-code">
          <TextField
            id="bind-code"
            :model-value="code"
            inputmode="numeric"
            placeholder="0000"
            :invalid="Boolean(error)"
            @update:model-value="onCodeInput"
          />
        </FormField>

        <p v-if="error" class="mt-sm text-caption text-state-error">{{ error }}</p>

        <button
          type="submit"
          :disabled="(codeSent ? !code : !isPhoneValid) || busy"
          class="mt-lg w-full rounded-radius-md bg-brand py-3 text-body font-semibold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
        >
          <template v-if="busy">Подождите…</template>
          <template v-else>{{ codeSent ? 'Подтвердить' : 'Получить код' }}</template>
        </button>
      </form>
    </div>
  </div>
</template>
