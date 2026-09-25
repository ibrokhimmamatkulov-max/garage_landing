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
      <!--
        Было четыре колонки, у трёх из четырёх ссылок вело в никуда (#).
        Вместо заголовков-пустышек ради заголовков — одна колонка с
        реальными переходами. Как появятся страницы про условия работы
        и правила размещения, ссылки на них возвращаются сюда же.
      -->
      <div class="grid gap-xl md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] md:gap-lg">
        <!-- Бренд -->
        <div class="max-w-[22rem]">
          <router-link to="/" class="inline-flex text-ink no-underline">
            <AppLogo size="lg" />
          </router-link>
        </div>

        <!-- Навигация -->
        <nav aria-labelledby="f-nav">
          <h3
            id="f-nav"
            class="text-caption font-extrabold uppercase tracking-[0.1em] text-ink-soft"
          >
            Навигация
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

      <!--
        Низ: три юридические ссылки вели на #, а такая ссылка ещё и в самой
        заявке — человек соглашался бы с документом, которого не существует.
        Вернутся сюда вместе с реальными текстами.
      -->
      <div class="mt-xl border-t border-hairline-soft pt-lg">
        <p class="tnum text-caption text-ink-soft">© {{ year }} ООО «0110 Garage»</p>
      </div>
    </div>
  </footer>
</template>
