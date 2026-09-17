<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOwnerStore, ownerApi } from '@/entities/owner';
import AppHeader from '@/widgets/AppHeader/index.vue';
import FormField from '@/shared/ui/FormField/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'LoginPage',
});

const route = useRoute();
const router = useRouter();
const store = useOwnerStore();

type Step = 'phone' | 'code' | 'credentials';
const step = ref<Step>('phone');
const mode = ref<'otp' | 'password'>('otp');

const phone = ref('');
const code = ref('');
const login = ref('');
const password = ref('');

const busy = ref(false);
const error = ref<string | null>(null);

/**
 * Демо-режим: SMS не отправляется, код приходит в ответе и подставляется сам.
 * Фронт не знает про настройки сервера — он реагирует только на поля ответа,
 * поэтому при переключении на боевой шлюз здесь ничего менять не нужно.
 */
const isStub = ref(false);
const credentials = ref<{ login: string; password: string } | null>(null);
const savedAcknowledged = ref(false);

const isPhoneValid = computed(() => phone.value.replace(/\D/g, '').length >= 9);

async function requestCode() {
  if (!isPhoneValid.value) return;
  busy.value = true;
  error.value = null;
  try {
    const res = await ownerApi.requestOtp(phone.value);
    isStub.value = res.delivery === 'stub';
    if (res.stubCode) code.value = res.stubCode;
    step.value = 'code';
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Не удалось отправить код.';
  } finally {
    busy.value = false;
  }
}

async function verify() {
  busy.value = true;
  error.value = null;
  try {
    const res = await ownerApi.verifyOtp(phone.value, code.value);
    store.setSession(res.token, res.owner);

    if (res.credentials) {
      credentials.value = res.credentials;
      step.value = 'credentials';
      return;
    }
    finish();
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Неверный код.';
  } finally {
    busy.value = false;
  }
}

async function signInWithPassword() {
  busy.value = true;
  error.value = null;
  try {
    const res = await ownerApi.loginWithPassword(login.value, password.value);
    store.setSession(res.token, res.owner);
    finish();
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Неверный логин или пароль.';
  } finally {
    busy.value = false;
  }
}

function finish() {
  router.push((route.query.next as string) || '/cabinet');
}

async function copyCredentials() {
  if (!credentials.value) return;
  try {
    await navigator.clipboard.writeText(
      `Логин: ${credentials.value.login}\nПароль: ${credentials.value.password}`,
    );
  } catch {
    /* буфер недоступен — данные и так на экране */
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-canvas">
    <AppHeader />

    <main class="container flex flex-1 items-start justify-center py-2xl">
      <div class="w-full max-w-[24rem] rounded-radius-lg border border-hairline bg-surface-paper p-lg">
        <!-- ---------- Телефон ---------- -->
        <template v-if="step === 'phone'">
          <h1 class="text-title font-bold text-ink">Вход для владельцев</h1>
          <p class="mt-1.5 text-small text-ink-muted">
            Чтобы разместить авто и получать заявки.
          </p>

          <div class="mt-lg flex gap-1 rounded-radius-md bg-surface-sunken p-1">
            <button
              v-for="m in [
                { id: 'otp', label: 'По телефону' },
                { id: 'password', label: 'По паролю' },
              ]"
              :key="m.id"
              class="flex-1 rounded-radius-sm px-3 py-2 text-small font-semibold transition-colors duration-fast"
              :class="mode === m.id ? 'bg-surface-paper text-ink shadow-hairline' : 'text-ink-soft'"
              @click="mode = m.id as 'otp' | 'password'"
            >
              {{ m.label }}
            </button>
          </div>

          <template v-if="mode === 'otp'">
            <FormField label="Номер телефона" class="mt-lg" for="l-phone">
              <TextField id="l-phone" v-model="phone" inputmode="tel" placeholder="+992 __ ___ __ __" />
            </FormField>
            <button
              :disabled="!isPhoneValid || busy"
              class="mt-lg w-full rounded-radius-md bg-brand-ink py-3 text-body font-semibold text-white transition-colors duration-fast hover:bg-brand-deep disabled:bg-surface-sunken disabled:text-ink-soft"
              @click="requestCode"
            >
              {{ busy ? 'Отправляем…' : 'Получить код' }}
            </button>
          </template>

          <template v-else>
            <FormField label="Логин" class="mt-lg" for="l-login">
              <TextField id="l-login" v-model="login" />
            </FormField>
            <FormField label="Пароль" class="mt-md" for="l-pass">
              <TextField id="l-pass" v-model="password" type="password" />
            </FormField>
            <button
              :disabled="!login || !password || busy"
              class="mt-lg w-full rounded-radius-md bg-brand-ink py-3 text-body font-semibold text-white transition-colors duration-fast hover:bg-brand-deep disabled:bg-surface-sunken disabled:text-ink-soft"
              @click="signInWithPassword"
            >
              Войти
            </button>
          </template>
        </template>

        <!-- ---------- Код ---------- -->
        <template v-else-if="step === 'code'">
          <h1 class="text-title font-bold text-ink">Введите код</h1>
          <p class="mt-1.5 text-small text-ink-muted">
            Отправили на <span class="tnum font-semibold text-ink">{{ phone }}</span>
          </p>

          <p
            v-if="isStub"
            class="mt-md rounded-radius-md border border-state-warning bg-state-warning-tint px-3.5 py-2.5 text-caption font-semibold text-state-warning"
          >
            Демо-режим: SMS не отправляется, код подставлен автоматически.
          </p>

          <FormField label="Код из SMS" class="mt-lg" for="l-code">
            <TextField id="l-code" v-model="code" inputmode="numeric" maxlength="4" />
          </FormField>

          <p v-if="error" class="mt-sm text-caption text-state-error">{{ error }}</p>

          <button
            :disabled="code.length < 4 || busy"
            class="mt-lg w-full rounded-radius-md bg-brand-ink py-3 text-body font-semibold text-white transition-colors duration-fast hover:bg-brand-deep disabled:bg-surface-sunken disabled:text-ink-soft"
            @click="verify"
          >
            {{ busy ? 'Проверяем…' : 'Подтвердить' }}
          </button>

          <button
            class="mt-md w-full text-small font-semibold text-ink-soft transition-colors duration-fast hover:text-ink"
            @click="step = 'phone'"
          >
            Изменить номер
          </button>
        </template>

        <!-- ---------- Учётные данные ---------- -->
        <template v-else>
          <h1 class="text-title font-bold text-ink">Сохраните данные для входа</h1>
          <p class="mt-1.5 text-small text-ink-muted">
            В следующий раз сможете войти по логину и паролю. Показываем один раз.
          </p>

          <dl class="mt-lg rounded-radius-md bg-surface-sunken p-base">
            <div class="flex items-center justify-between py-1.5">
              <dt class="text-small text-ink-muted">Логин</dt>
              <dd class="tnum text-small font-bold text-ink">{{ credentials?.login }}</dd>
            </div>
            <div class="flex items-center justify-between py-1.5">
              <dt class="text-small text-ink-muted">Пароль</dt>
              <dd class="tnum text-small font-bold text-ink">{{ credentials?.password }}</dd>
            </div>
          </dl>

          <button
            class="mt-md w-full rounded-radius-md border border-hairline py-2.5 text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken"
            @click="copyCredentials"
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
            @click="finish"
          >
            Продолжить
          </button>
        </template>
      </div>
    </main>
  </div>
</template>
