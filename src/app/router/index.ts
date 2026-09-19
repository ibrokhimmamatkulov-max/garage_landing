import { createRouter, createWebHistory } from 'vue-router';

const TOKEN_KEY = 'garage.owner.token';

function hasToken(): boolean {
  try {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage/index.vue'),
    },
    {
      path: '/car/:id',
      name: 'car',
      component: () => import('@/pages/CarPage/index.vue'),
    },
    {
      path: '/listings/new',
      name: 'listing-new',
      component: () => import('@/pages/ListingFormPage/index.vue'),
    },
    {
      // Та же форма, что и подача: 37 полей в двух копиях неизбежно разъедутся
      path: '/listings/:id/edit',
      name: 'listing-edit',
      component: () => import('@/pages/ListingFormPage/index.vue'),
      meta: { requiresOwner: true },
    },
    {
      // Форма проходится анонимно, поэтому /rent-out ведёт туда же
      path: '/rent-out',
      redirect: { name: 'listing-new' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage/index.vue'),
    },
    {
      path: '/cabinet',
      name: 'cabinet',
      component: () => import('@/pages/CabinetPage/index.vue'),
      meta: { requiresOwner: true },
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

/** Кабинет закрыт. Цель запоминаем, чтобы после входа вернуть человека туда же. */
router.beforeEach((to) => {
  if (to.meta.requiresOwner && !hasToken()) {
    return { name: 'login', query: { next: to.fullPath } };
  }
  return true;
});
