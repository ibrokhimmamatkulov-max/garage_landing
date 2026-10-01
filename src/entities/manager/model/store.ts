import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { apiInstance } from '@/shared/api';

export const MANAGER_TOKEN_KEY = 'garage.manager.token';

export interface Manager {
  id: number;
  login: string;
  firstName: string;
  lastName: string | null;
  displayName: string;
  roles: string[];
  /** Телефон для входа по SMS-коду; null — ещё не привязан. */
  phone: string | null;
}

/** Ответ на запрос кода: в демо-режиме бэк возвращает сам код. */
export interface OtpRequestResult {
  ok: boolean;
  stubCode: string | null;
  error: string | null;
}

function firstError(e: any, fallback: string): string {
  const errors = e?.response?.data?.errors as Record<string, string[]> | undefined;
  return (errors && Object.values(errors)[0]?.[0]) ?? e?.response?.data?.message ?? fallback;
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* приватное окно — вход работает, но не запоминается */
  }
}

function mapManager(raw: Record<string, any>): Manager {
  const first = raw.first_name ?? '';
  const last = raw.last_name ?? null;
  return {
    id: raw.id,
    login: raw.login ?? '',
    firstName: first,
    lastName: last,
    displayName: [first, last].filter(Boolean).join(' ') || raw.login || 'Менеджер',
    roles: (raw.roles ?? []).map((r: any) => (typeof r === 'string' ? r : r.name)),
    phone: raw.phone ?? null,
  };
}

export const useManagerStore = defineStore('manager', () => {
  const token = ref<string | null>(read(MANAGER_TOKEN_KEY));
  const manager = ref<Manager | null>(null);
  const busy = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(token.value));

  async function signIn(login: string, password: string): Promise<boolean> {
    busy.value = true;
    error.value = null;
    try {
      const { data } = await apiInstance.post('/auth/login', { login, password });
      const payload = data.data ?? data;

      const accessToken = payload.access_token ?? payload.token;
      if (!accessToken) {
        error.value = 'Сервер не вернул токен доступа.';
        return false;
      }

      token.value = accessToken;
      write(MANAGER_TOKEN_KEY, accessToken);

      if (payload.user) manager.value = mapManager(payload.user);
      return true;
    } catch (e: any) {
      // 401 здесь означает неверную пару логин/пароль, а не протухшую сессию
      error.value =
        e?.response?.status === 401
          ? 'Неверный логин или пароль.'
          : (e?.response?.data?.message ?? 'Не удалось войти. Попробуйте ещё раз.');
      return false;
    } finally {
      busy.value = false;
    }
  }

  /* ---------- вход по SMS-коду ---------- */

  async function requestOtp(phone: string): Promise<OtpRequestResult> {
    busy.value = true;
    error.value = null;
    try {
      const { data } = await apiInstance.post('/auth/request-otp', { phone });
      return { ok: true, stubCode: data?.data?.stub_code ?? null, error: null };
    } catch (e: any) {
      error.value = firstError(e, 'Не удалось отправить код. Попробуйте ещё раз.');
      return { ok: false, stubCode: null, error: error.value };
    } finally {
      busy.value = false;
    }
  }

  async function signInWithOtp(phone: string, code: string): Promise<boolean> {
    busy.value = true;
    error.value = null;
    try {
      const { data } = await apiInstance.post('/auth/verify-otp', { phone, code });
      const payload = data.data ?? data;
      const accessToken = payload.access_token ?? payload.token;
      if (!accessToken) {
        error.value = 'Сервер не вернул токен доступа.';
        return false;
      }
      token.value = accessToken;
      write(MANAGER_TOKEN_KEY, accessToken);
      return true;
    } catch (e: any) {
      // 401 — номер не привязан ни к одному действующему сотруднику
      error.value =
        e?.response?.status === 401
          ? 'Этот номер не привязан к учётной записи сотрудника.'
          : firstError(e, 'Не удалось войти. Попробуйте ещё раз.');
      return false;
    } finally {
      busy.value = false;
    }
  }

  /* ---------- привязка телефона после входа по паролю ---------- */

  async function requestPhoneBind(phone: string): Promise<OtpRequestResult> {
    try {
      const { data } = await apiInstance.post('/auth/phone/request-otp', { phone });
      return { ok: true, stubCode: data?.data?.stub_code ?? null, error: null };
    } catch (e: any) {
      return { ok: false, stubCode: null, error: firstError(e, 'Не удалось отправить код.') };
    }
  }

  async function confirmPhoneBind(phone: string, code: string): Promise<string | null> {
    try {
      const { data } = await apiInstance.post('/auth/phone/verify-otp', { phone, code });
      if (manager.value) manager.value.phone = data?.data?.phone ?? phone;
      return null;
    } catch (e: any) {
      return firstError(e, 'Не удалось подтвердить код.');
    }
  }

  async function loadMe() {
    if (!token.value) return;
    try {
      const { data } = await apiInstance.get('/user');
      manager.value = mapManager(data.data ?? data);
    } catch {
      signOut();
    }
  }

  function signOut() {
    token.value = null;
    manager.value = null;
    write(MANAGER_TOKEN_KEY, null);
  }

  return {
    token,
    manager,
    busy,
    error,
    isAuthenticated,
    signIn,
    requestOtp,
    signInWithOtp,
    requestPhoneBind,
    confirmPhoneBind,
    loadMe,
    signOut,
  };
});
