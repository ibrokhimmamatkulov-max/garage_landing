<script setup lang="ts">
import { ref } from 'vue';
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

const login = ref('');
const password = ref('');

async function submit() {
  if (!login.value || !password.value) return;
  const ok = await store.signIn(login.value, password.value);
  if (ok) {
    await store.loadMe();
    router.replace((route.query.next as string) || '/');
  }
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

      <form
        class="rounded-radius-lg border border-hairline bg-surface-paper p-lg"
        @submit.prevent="submit"
      >
        <h1 class="text-title font-bold text-ink">Вход для сотрудников</h1>
        <p class="mt-1.5 text-small text-ink-muted">
          Доступ выдаёт администратор системы.
        </p>

        <FormField label="Логин" class="mt-lg" for="m-login">
          <TextField id="m-login" v-model="login" :invalid="Boolean(store.error)" />
        </FormField>

        <FormField label="Пароль" class="mt-md" for="m-pass">
          <TextField id="m-pass" v-model="password" type="password" :invalid="Boolean(store.error)" />
        </FormField>

        <p v-if="store.error" class="mt-sm text-caption text-state-error">{{ store.error }}</p>

        <button
          type="submit"
          :disabled="!login || !password || store.busy"
          class="mt-lg w-full rounded-radius-md bg-brand-ink py-3 text-body font-semibold text-white transition-colors duration-fast hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
        >
          {{ store.busy ? 'Проверяем…' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>
