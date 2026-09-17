<script setup lang="ts">
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
  { to: '/admin', label: 'Заявки', exact: true },
  { to: '/admin/listings', label: 'Объявления', exact: false },
  { to: '/admin/owners', label: 'Арендодатели', exact: false },
];
</script>

<template>
  <div class="flex min-h-screen bg-surface-canvas">
    <!-- Боковое меню -->
    <aside
      class="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-hairline bg-surface-paper lg:flex"
    >
      <div class="border-b border-hairline px-lg py-base">
        <router-link to="/" class="flex items-center gap-2 text-ink no-underline">
          <AppLogo size="sm" />
        </router-link>
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
          active-class="bg-brand-tint text-brand-ink"
          :exact-active-class="item.exact ? 'bg-brand-tint text-brand-ink' : ''"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="border-t border-hairline p-sm">
        <router-link
          to="/"
          class="block rounded-radius-md px-3.5 py-2.5 text-small text-ink-muted no-underline transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
        >
          ← На витрину
        </router-link>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Меню для узких экранов -->
      <nav class="scroll-x flex gap-1 border-b border-hairline bg-surface-paper px-base py-2 lg:hidden">
        <router-link
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="shrink-0 rounded-full px-3.5 py-2 text-small font-semibold no-underline transition-colors duration-fast"
          active-class="bg-brand-tint text-brand-ink"
        >
          {{ item.label }}
        </router-link>
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
