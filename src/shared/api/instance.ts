import axios from 'axios';

const TOKEN_KEY = 'garage.owner.token';

export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Токен кабинета подставляется здесь, а не в каждом вызове.
 * Читаем из хранилища на каждый запрос, чтобы вход и выход применялись сразу,
 * без перезагрузки страницы.
 */
apiInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* приватное окно — работаем без токена */
  }
  return config;
});

/**
 * 401 означает, что токен протух или отозван. Гасим сессию и уводим на вход,
 * иначе кабинет будет молча показывать пустые списки.
 */
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';

    // На самих ручках входа 401 — это «неверный логин или пароль», не разлогин
    const isAuthCall = url.includes('/owner/auth/');

    if (status === 401 && !isAuthCall) {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* ignore */
      }
      if (window.location.pathname.startsWith('/cabinet')) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);
