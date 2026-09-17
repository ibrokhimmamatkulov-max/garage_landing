import axios from 'axios';

export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Витрина и админка — разные приложения с разными контурами авторизации:
 * владелец ходит по токену Sanctum, менеджер — по токену Passport.
 * Каждая точка входа сообщает, откуда брать токен и куда уводить при 401,
 * поэтому общий клиент не знает про оба контура сразу.
 */
export interface AuthContext {
  /** Ключ токена в localStorage */
  tokenKey: string;
  /** Куда уводить, когда сервер ответил 401 */
  loginPath: string;
  /** Пути, на которых 401 означает «неверный пароль», а не протухшую сессию */
  authPaths: string[];
}

let context: AuthContext = {
  tokenKey: 'garage.owner.token',
  loginPath: '/login',
  authPaths: ['/owner/auth/'],
};

export function configureAuth(next: AuthContext) {
  context = next;
}

function readToken(): string | null {
  try {
    return localStorage.getItem(context.tokenKey);
  } catch {
    return null;
  }
}

apiInstance.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';

    const isAuthCall = context.authPaths.some((p) => url.includes(p));

    if (status === 401 && !isAuthCall) {
      try {
        localStorage.removeItem(context.tokenKey);
      } catch {
        /* ignore */
      }
      if (!window.location.pathname.endsWith(context.loginPath)) {
        window.location.replace(context.loginPath);
      }
    }

    return Promise.reject(error);
  },
);
