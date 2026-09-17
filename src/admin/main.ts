import { createApp } from 'vue';
import { createPinia } from 'pinia';
import AdminApp from './App.vue';
import { router } from './router';
import { configureAuth } from '@/shared/api';
import { MANAGER_TOKEN_KEY } from '@/entities/manager/model/store';

import '@/shared/assets/styles/global.css';

/**
 * Точка входа админки — отдельный бандл, отдельный деплой.
 *
 * Библиотека io_ui_lib здесь не подключается: админка собрана на своих
 * компонентах, и лишняя приватная зависимость ей ни к чему.
 */
configureAuth({
  tokenKey: MANAGER_TOKEN_KEY,
  loginPath: '/login',
  authPaths: ['/auth/login'],
});

const app = createApp(AdminApp);

app.use(createPinia());
app.use(router);

app.mount('#admin');
