import { computed, ref } from 'vue';
import { useOwnerStore, ownerApi } from '@/entities/owner';

export type AuthStep = 'phone' | 'code' | 'credentials';

/**
 * Состояние входа по телефону.
 *
 * Живёт отдельно от разметки, потому что тот же поток нужен в двух местах:
 * окном поверх формы подачи (авторизация последним шагом, по ТЗ §6.2)
 * и отдельной страницей /login для тех, кто заходит напрямую.
 */
export function useOtpAuth() {
  const store = useOwnerStore();

  const step = ref<AuthStep>('phone');
  const mode = ref<'otp' | 'password'>('otp');

  const phone = ref('');
  const code = ref('');
  const login = ref('');
  const password = ref('');

  const busy = ref(false);
  const error = ref<string | null>(null);

  /**
   * Демо-режим определяется по ответу сервера, а не по настройкам фронта.
   * Когда бэкенд переключат на боевой шлюз, здесь ничего менять не нужно:
   * поля stub_code и credentials просто перестанут приходить.
   */
  const isStub = ref(false);
  const isNewAccount = ref(false);
  const credentials = ref<{ login: string; password: string } | null>(null);

  const isPhoneValid = computed(() => phone.value.replace(/\D/g, '').length >= 9);
  const isCodeValid = computed(() => code.value.replace(/\D/g, '').length >= 4);

  async function requestCode() {
    if (!isPhoneValid.value) return false;
    busy.value = true;
    error.value = null;
    try {
      const res = await ownerApi.requestOtp(phone.value);
      isStub.value = res.delivery === 'stub';
      isNewAccount.value = res.isNew;
      if (res.stubCode) code.value = res.stubCode;
      step.value = 'code';
      return true;
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Не удалось отправить код. Попробуйте ещё раз.';
      return false;
    } finally {
      busy.value = false;
    }
  }

  /** @returns true, если вход завершён и можно продолжать дальше */
  async function verify(): Promise<boolean> {
    busy.value = true;
    error.value = null;
    try {
      const res = await ownerApi.verifyOtp(phone.value, code.value);
      store.setSession(res.token, res.owner);

      if (res.credentials) {
        // Демо-режим: SMS не ушло, учётку показываем на экране
        credentials.value = res.credentials;
        step.value = 'credentials';
        return false;
      }
      return true;
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Неверный код.';
      return false;
    } finally {
      busy.value = false;
    }
  }

  async function signInWithPassword(): Promise<boolean> {
    busy.value = true;
    error.value = null;
    try {
      const res = await ownerApi.loginWithPassword(login.value, password.value);
      store.setSession(res.token, res.owner);
      return true;
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Неверный логин или пароль.';
      return false;
    } finally {
      busy.value = false;
    }
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

  function reset() {
    step.value = 'phone';
    code.value = '';
    error.value = null;
    credentials.value = null;
  }

  return {
    step,
    mode,
    phone,
    code,
    login,
    password,
    busy,
    error,
    isStub,
    isNewAccount,
    credentials,
    isPhoneValid,
    isCodeValid,
    requestCode,
    verify,
    signInWithPassword,
    copyCredentials,
    reset,
  };
}
