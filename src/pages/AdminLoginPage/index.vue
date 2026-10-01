<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useManagerStore } from '@/entities/manager/model/store';
import { AppLogo } from '@/shared/ui';
import FormField from '@/shared/ui/FormField/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'AdminLoginPage',
});

const route = useRoute();
const router = useRouter();
const store = useManagerStore();

/**
 * Два способа входа. По телефону — только для тех, кто уже привязал
 * номер к своей учётке (в меню админки после первого входа по паролю).
 */
const mode = ref<'password' | 'phone'>('password');

const login = ref('');
const password = ref('');

const digits = ref('');
const code = ref('');
const codeSent = ref(false);

const fullPhone = computed(() => `992${digits.value}`);
const isPhoneValid = computed(() => digits.value.length === 9);

function setMode(next: 'password' | 'phone') {
  mode.value = next;
  store.error = null;
}

function onPhoneInput(value: string) {
  digits.value = value.replace(/\D/g, '').slice(0, 9);
}

function onCodeInput(value: string) {
  code.value = value.replace(/\D/g, '').slice(0, 6);
}

async function finish() {
  await store.loadMe();
  router.replace((route.query.next as string) || '/');
}

async function submitPassword() {
  if (!login.value || !password.value) return;
  if (await store.signIn(login.value, password.value)) await finish();
}

async function sendCode() {
  if (!isPhoneValid.value || store.busy) return;
  const result = await store.requestOtp(fullPhone.value);
  if (!result.ok) return;
  codeSent.value = true;
  code.value = result.stubCode ?? '';
}

async function submitCode() {
  if (!code.value || store.busy) return;
  if (await store.signInWithOtp(fullPhone.value, code.value)) await finish();
}

function changePhone() {
  codeSent.value = false;
  code.value = '';
  store.error = null;
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface-canvas px-base py-2xl">
    <div class="w-full max-w-[22rem]">
      <div class="mb-lg flex flex-col items-center gap-2 text-center">
        <AppLogo size="lg" />
        <p class="text-caption font-bold uppercase tracking-[0.12em] text-ink-soft">
          Администрирование
        </p>
      </div>

      <div class="rounded-radius-lg border border-hairline bg-surface-paper p-lg">
        <h1 class="text-title font-bold text-ink">Вход для сотрудников</h1>
        <p class="mt-1.5 text-small text-ink-muted">Доступ выдаёт администратор системы.</p>

        <div class="mt-lg grid grid-cols-2 gap-1 rounded-radius-md bg-surface-sunken p-1">
          <button
            type="button"
            class="rounded-radius-sm py-2 text-small font-semibold transition-colors duration-fast"
            :class="mode === 'password' ? 'bg-surface-paper text-ink shadow-sm' : 'text-ink-muted'"
            @click="setMode('password')"
          >
            По паролю
          </button>
          <button
            type="button"
            class="rounded-radius-sm py-2 text-small font-semibold transition-colors duration-fast"
            :class="mode === 'phone' ? 'bg-surface-paper text-ink shadow-sm' : 'text-ink-muted'"
            @click="setMode('phone')"
          >
            По телефону
          </button>
        </div>

        <!-- Логин и пароль -->
        <form v-if="mode === 'password'" @submit.prevent="submitPassword">
          <FormField label="Логин" class="mt-lg" for="m-login">
            <TextField id="m-login" v-model="login" :invalid="Boolean(store.error)" />
          </FormField>

          <FormField label="Пароль" class="mt-md" for="m-pass">
            <TextField
              id="m-pass"
              v-model="password"
              type="password"
              :invalid="Boolean(store.error)"
            />
          </FormField>

          <p v-if="store.error" class="mt-sm text-caption text-state-error">{{ store.error }}</p>

          <button
            type="submit"
            :disabled="!login || !password || store.busy"
            class="mt-lg w-full rounded-radius-md bg-brand py-3 text-body font-semibold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
          >
            {{ store.busy ? 'Проверяем…' : 'Войти' }}
          </button>
        </form>

        <!-- Телефон и код из SMS -->
        <form v-else @submit.prevent="codeSent ? submitCode() : sendCode()">
          <FormField label="Телефон" class="mt-lg" for="m-phone">
            <div class="flex items-stretch gap-2">
              <span
                class="flex items-center rounded-radius-md border border-hairline bg-surface-sunken px-3 text-body text-ink-muted"
                >+992</span
              >
              <TextField
                id="m-phone"
                class="flex-1"
                :model-value="digits"
                inputmode="tel"
                placeholder="90 123 45 67"
                :disabled="codeSent"
                :invalid="Boolean(store.error) && !codeSent"
                @update:model-value="onPhoneInput"
              />
            </div>
          </FormField>

          <template v-if="codeSent">
            <FormField label="Код из SMS" class="mt-md" for="m-code">
              <TextField
                id="m-code"
                :model-value="code"
                inputmode="numeric"
                placeholder="0000"
                :invalid="Boolean(store.error)"
                @update:model-value="onCodeInput"
              />
            </FormField>
            <button
              type="button"
              class="mt-sm text-caption font-semibold text-brand-ink"
              @click="changePhone"
            >
              Изменить номер
            </button>
          </template>

          <p v-if="store.error" class="mt-sm text-caption text-state-error">{{ store.error }}</p>

          <button
            type="submit"
            :disabled="(codeSent ? !code : !isPhoneValid) || store.busy"
            class="mt-lg w-full rounded-radius-md bg-brand py-3 text-body font-semibold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
          >
            <template v-if="store.busy">Подождите…</template>
            <template v-else>{{ codeSent ? 'Войти' : 'Получить код' }}</template>
          </button>

          <p v-if="!codeSent" class="mt-sm text-caption text-ink-soft">
            Вход по телефону работает, если номер привязан к вашей учётной записи — это
            делается в меню админки после входа по паролю.
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
