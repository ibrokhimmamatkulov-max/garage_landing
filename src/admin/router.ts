import { createRouter, createWebHistory } from 'vue-router';
import { MANAGER_TOKEN_KEY } from '@/entities/manager/model/store';

/**
 * Админка деплоится отдельно от витрины, поэтому в бою живёт в корне своего
 * домена. В разработке она отдаётся по /admin — отсюда разная база истории.
 * Пути внутри при этом одинаковые: '/', '/listings', '/owners'.
 */
export const ADMIN_BASE = import.meta.env.DEV ? '/admin' : (import.meta.env.BASE_URL || '/');

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
