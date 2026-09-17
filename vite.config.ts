import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import { adminDevRoute } from './preview/admin-dev-route';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), VueDevTools(), adminDevRoute()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      /**
       * Две независимые страницы: витрина и админка.
       *
       * Админка деплоится отдельно — берётся dist/admin.html со своими
       * чанками и кладётся в корень своего домена. Общими остаются только
       * токены дизайна и компоненты, а не рантайм.
       */
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 5173,
  },
});
