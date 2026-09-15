<script setup lang="ts">
import { AppLogo } from '@/shared/ui';

defineOptions({
  name: 'AppFooter',
});

const year = new Date().getFullYear();
</script>

<template>
  <footer class="mt-auto border-t border-hairline bg-surface-paper">
    <div class="container py-xl">
      <div class="flex flex-col gap-lg md:flex-row md:items-start md:justify-between">
        <div class="max-w-[22rem]">
          <router-link to="/" class="inline-flex text-ink no-underline">
            <AppLogo size="lg" />
          </router-link>
          <p class="mt-md text-small text-ink-muted">
            Витрина аренды автомобилей. Мы показываем условия и передаём контакт — договор и
            оплату стороны обсуждают между собой.
          </p>
        </div>

        <div class="flex flex-col gap-lg sm:flex-row sm:gap-3xl">
          <div>
            <h3 class="text-caption font-bold uppercase tracking-[0.1em] text-ink-soft">
              Поддержка
            </h3>
            <a
              href="tel:446506655"
              class="tnum mt-sm block text-title-sm font-bold text-ink no-underline transition-colors duration-fast hover:text-brand-ink"
            >
              44 650 66 55
            </a>
            <p class="mt-xs text-caption text-ink-soft">Ежедневно, 9:00 — 20:00</p>
          </div>

          <div>
            <h3 class="text-caption font-bold uppercase tracking-[0.1em] text-ink-soft">
              Владельцам
            </h3>
            <a
              href="/rent-out"
              class="mt-sm block text-small font-semibold text-brand-ink no-underline transition-colors duration-fast hover:text-brand-deep"
            >
              Сдать авто в аренду
            </a>
          </div>
        </div>
      </div>

      <div
        class="mt-xl flex flex-col items-center gap-md border-t border-hairline-soft pt-lg text-center md:flex-row md:justify-between md:text-left"
      >
        <p class="tnum text-caption text-ink-soft">© {{ year }} ООО «Gram Garage»</p>
        <div class="flex flex-wrap items-center justify-center gap-x-lg gap-y-xs">
          <a
            href="#"
            class="text-caption text-ink-soft no-underline transition-colors duration-fast hover:text-ink"
            >Политика конфиденциальности</a
          >
          <a
            href="#"
            class="text-caption text-ink-soft no-underline transition-colors duration-fast hover:text-ink"
            >Обработка персональных данных</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>
