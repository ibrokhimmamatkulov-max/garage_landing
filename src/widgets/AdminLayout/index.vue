<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useManagerStore } from '@/entities/manager/model/store';
import { AppLogo } from '@/shared/ui';

defineOptions({
  name: 'AdminLayout',
});

defineProps<{
  title: string;
  subtitle?: string;
}>();

/**
 * Каркас админки: боковое меню слева, рабочая область справа.
 *
 * Отличается от публичной части намеренно. Витрину открывают на минуту
 * с телефона, админку менеджер держит открытой весь день на большом экране:
 * здесь важнее плотность и постоянная навигация, а не воздух.
 */
const NAV = [
  { to: '/', label: 'Заявки' },
  { to: '/listings', label: 'Объявления' },
  { to: '/owners', label: 'Арендодатели' },
];

const router = useRouter();
const store = useManagerStore();

onMounted(() => {
  if (!store.manager) store.loadMe();
});

function signOut() {
  store.signOut();
  router.replace({ name: 'admin-login' });
}
</script>

<template>
  <div class="flex min-h-screen bg-surface-canvas">
    <!-- Боковое меню -->
    <aside
      class="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-hairline bg-surface-paper lg:flex"
    >
      <div class="border-b border-hairline px-lg py-base">
        <div class="flex items-center gap-2 text-ink">
          <AppLogo size="sm" />
        </div>
        <p class="mt-1 text-caption font-semibold uppercase tracking-[0.1em] text-ink-soft">
          Администрирование
        </p>
      </div>

      <nav class="flex flex-1 flex-col gap-0.5 p-sm">
        <router-link
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="rounded-radius-md px-3.5 py-2.5 text-small font-semibold no-underline transition-colors duration-fast"
          exact-active-class="bg-brand-tint text-brand-ink"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="border-t border-hairline p-sm">
        <p class="truncate px-3.5 py-1 text-caption text-ink-soft">
          {{ store.manager?.displayName ?? '—' }}
        </p>
        <button
          class="w-full rounded-radius-md px-3.5 py-2.5 text-left text-small font-semibold text-ink-muted transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
          @click="signOut"
        >
          Выйти
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Меню для узких экранов -->
      <nav
        class="flex items-center justify-between gap-sm border-b border-hairline bg-surface-paper px-base py-2 lg:hidden"
      >
        <div class="scroll-x flex gap-1">
          <router-link
            v-for="item in NAV"
            :key="item.to"
            :to="item.to"
            class="shrink-0 rounded-full px-3.5 py-2 text-small font-semibold no-underline transition-colors duration-fast"
            exact-active-class="bg-brand-tint text-brand-ink"
          >
            {{ item.label }}
          </router-link>
        </div>
        <button
          class="shrink-0 text-small font-semibold text-ink-muted transition-colors duration-fast hover:text-ink"
          @click="signOut"
        >
          Выйти
        </button>
      </nav>

      <header class="border-b border-hairline bg-surface-paper px-base py-lg sm:px-lg">
        <h1 class="text-display-sm font-extrabold text-ink">{{ title }}</h1>
        <p v-if="subtitle" class="tnum mt-1 text-small text-ink-muted">{{ subtitle }}</p>
      </header>

      <main class="min-w-0 flex-1 px-base py-lg sm:px-lg">
        <slot />
      </main>
    </div>
  </div>
</template>
