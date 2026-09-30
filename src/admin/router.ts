import { createRouter, createWebHistory } from 'vue-router';
import { MANAGER_TOKEN_KEY } from '@/entities/manager/model/store';

/**
 * Решение от 30.09.2026: админка живёт на том же домене, что и витрина,
 * под путём /admin (https://ijora.gram.tj/admin), а не на отдельном
 * поддомене — сервер отдаёт admin.html на этот путь, а ассеты остаются
 * в корне (Vite base не менялся). Пути внутри одинаковые что в проде,
 * что в разработке: '/', '/listings', '/owners'.
 */
export const ADMIN_BASE = '/admin';

function hasToken(): boolean {
  try {
    return Boolean(localStorage.getItem(MANAGER_TOKEN_KEY));
  } catch {
    return false;
  }
}

export const router = createRouter({
  history: createWebHistory(ADMIN_BASE),
  routes: [
    {
      path: '/login',
      name: 'admin-login',
      component: () => import('@/pages/AdminLoginPage/index.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'admin-applications',
      component: () => import('@/pages/AdminApplicationsPage/index.vue'),
    },
    {
      path: '/listings',
      name: 'admin-listings',
      component: () => import('@/pages/AdminListingsPage/index.vue'),
    },
    {
      path: '/owners',
      name: 'admin-owners',
      component: () => import('@/pages/AdminOwnersPage/index.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  if (to.meta.public) {
    // Вошедшего не держим на форме входа
    return hasToken() && to.name === 'admin-login' ? { path: '/' } : true;
  }

  if (!hasToken()) {
    return { name: 'admin-login', query: { next: to.fullPath } };
  }

  return true;
});
