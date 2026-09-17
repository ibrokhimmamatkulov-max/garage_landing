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

  return { token, manager, busy, error, isAuthenticated, signIn, loadMe, signOut };
});
