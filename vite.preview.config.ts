import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { mockApi } from './preview/mock-api';
import { adminDevRoute } from './preview/admin-dev-route';

/**
 * Конфиг ТОЛЬКО для визуального превью главного экрана.
 *
 * Зачем: @ioyandasoz/io_ui_lib лежит в приватном GitHub Packages и недоступен,
 * поэтому обычный dev-сервер не поднимается. Здесь пакет подменяется локальной
 * заглушкой, а /api/landing/* отдаётся из моков — бэкенд не нужен.
 *
 * Боевую сборку (vite.config.ts) этот файл не трогает.
 *
 *   npx vite --config vite.preview.config.ts
 */
export default defineConfig({
  plugins: [vue(), adminDevRoute(), mockApi()],
  resolve: {
    alias: [
      {
        find: '@ioyandasoz/io_ui_lib/dist/io_ui_lib.css',
        replacement: fileURLToPath(new URL('./preview/empty.css', import.meta.url)),
      },
      {
        find: '@ioyandasoz/io_ui_lib',
        replacement: fileURLToPath(new URL('./preview/io-ui-lib-stub.ts', import.meta.url)),
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  build: {
    // Те же две точки входа, что и в боевой сборке — чтобы разделение
    // витрины и админки можно было проверить без приватного пакета
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 5180,
    strictPort: true,
  },
});
