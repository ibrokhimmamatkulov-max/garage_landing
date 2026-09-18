<script setup lang="ts">
import { computed } from 'vue';
import { useLocationStore } from '@/entities/location';
import { inCity } from '@/shared/lib/city';
import { AppLogo } from '@/shared/ui';

defineOptions({
  name: 'AppFooter',
});

const locationStore = useLocationStore();
const year = new Date().getFullYear();

/** Города — это ещё и навигация: человек часто ищет «аренда авто <город>» */
const cities = computed(() => locationStore.cities.slice(0, 8));
</script>

<template>
  <footer class="mt-auto border-t border-hairline bg-surface-paper">
    <div class="container py-2xl">
      <div class="grid gap-xl md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:gap-lg">
        <!-- Бренд -->
        <div class="max-w-[22rem]">
          <router-link to="/" class="inline-flex text-ink no-underline">
            <AppLogo size="lg" />
          </router-link>
          <p class="mt-base text-small leading-relaxed text-ink-muted">
            Витрина аренды автомобилей. Показываем условия и передаём контакт — договор и
            оплату стороны обсуждают между собой.
          </p>
        </div>

        <!-- Арендаторам -->
        <nav aria-labelledby="f-rent">
          <h3
            id="f-rent"
            class="text-caption font-extrabold uppercase tracking-[0.1em] text-ink-soft"
          >
            Аренда
          </h3>
          <ul class="mt-base space-y-2.5">
            <li>
              <router-link
                to="/"
                class="text-small text-ink no-underline transition-colors duration-fast hover:text-brand-ink"
                >Все автомобили</router-link
              >
            </li>
            <li>
              <a
                href="#"
                class="text-small text-ink no-underline transition-colors duration-fast hover:text-brand-ink"
                >Как это работает</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-small text-ink no-underline transition-colors duration-fast hover:text-brand-ink"
                >Частые вопросы</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-small text-ink no-underline transition-colors duration-fast hover:text-brand-ink"
                >Аренда под такси</a
              >
            </li>
          </ul>
        </nav>

        <!-- Владельцам -->
        <nav aria-labelledby="f-owners">
          <h3
            id="f-owners"
            class="text-caption font-extrabold uppercase tracking-[0.1em] text-ink-soft"
          >
            Владельцам
          </h3>
          <ul class="mt-base space-y-2.5">
            <li>
              <a
                href="/rent-out"
                class="text-small font-semibold text-brand-ink no-underline transition-colors duration-fast hover:text-brand-deep"
                >Сдать авто в аренду</a
              >
            </li>
            <li>
              <a
                href="/cabinet"
                class="text-small text-ink no-underline transition-colors duration-fast hover:text-brand-ink"
                >Личный кабинет</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-small text-ink no-underline transition-colors duration-fast hover:text-brand-ink"
                >Правила размещения</a
              >
            </li>
          </ul>
        </nav>

        <!-- Контакты -->
        <div>
          <h3 class="text-caption font-extrabold uppercase tracking-[0.1em] text-ink-soft">
            Поддержка
          </h3>
          <a
            href="tel:+992446506655"
            class="tnum mt-base block text-title-sm font-extrabold text-ink no-underline transition-colors duration-fast hover:text-brand-ink"
          >
            44 650 66 55
          </a>
          <p class="mt-1 text-caption text-ink-soft">Ежедневно, 9:00 — 20:00</p>

          <div class="mt-base flex gap-2">
            <a
              v-for="social in [
                { name: 'Telegram', href: '#', d: 'M21.5 4.3 2.9 11.5c-1.1.4-1.1 1.1-.2 1.4l4.7 1.5 1.8 5.5c.2.6.4.8.8.8.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14c.3-1.2-.5-1.8-1.3-1.4z' },
                { name: 'Instagram', href: '#', d: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6zm8.4-11.2a1.5 1.5 0 1 1-3.1 0 1.5 1.5 0 0 1 3.1 0z' },
              ]"
              :key="social.name"
              :href="social.href"
              :aria-label="social.name"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-surface-sunken text-ink-muted transition-colors duration-fast hover:bg-ink hover:text-white"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path :d="social.d" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Города -->
      <div v-if="cities.length" class="mt-2xl border-t border-hairline-soft pt-lg">
        <h3 class="text-caption font-extrabold uppercase tracking-[0.1em] text-ink-soft">
          Города
        </h3>
        <ul class="mt-md flex flex-wrap gap-x-lg gap-y-sm">
          <li v-for="city in cities" :key="city.id">
            <button
              class="text-small text-ink-muted transition-colors duration-fast hover:text-brand-ink"
              @click="locationStore.setCity(city)"
            >
              Аренда авто в {{ inCity(city.name) }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Низ -->
      <div
        class="mt-xl flex flex-col gap-md border-t border-hairline-soft pt-lg md:flex-row md:items-center md:justify-between"
      >
        <p class="tnum text-caption text-ink-soft">© {{ year }} ООО «0110 Garage»</p>
        <div class="flex flex-wrap gap-x-lg gap-y-xs">
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
          <a
            href="#"
            class="text-caption text-ink-soft no-underline transition-colors duration-fast hover:text-ink"
            >Условия использования</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>
