import type { Plugin } from 'vite';

/**
 * В разработке админка отдаётся по /admin, хотя физически это admin.html.
 *
 * Нужно потому, что в бою она деплоится отдельно и живёт в корне своего
 * домена — а держать в dev ссылку вида /admin.html неудобно и непохоже
 * на то, что увидит менеджер.
 */
export function adminDevRoute(): Plugin {
  return {
    name: 'garage-admin-dev-route',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? '/';

        // Ассеты, служебные пути и API не трогаем
        if (
          url.startsWith('/@') ||
          url.startsWith('/src/') ||
          url.startsWith('/node_modules/') ||
          url.startsWith('/api/') ||
          url.includes('.')
        ) {
          return next();
        }

        if (url === '/admin' || url.startsWith('/admin/') || url.startsWith('/admin?')) {
          req.url = '/admin.html';
        }

        return next();
      });
    },
  };
}
