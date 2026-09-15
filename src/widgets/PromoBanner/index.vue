<script setup lang="ts">
defineOptions({
  name: 'PromoBanner',
});

withDefaults(
  defineProps<{
    isEmbedded?: boolean;
  }>(),
  {
    isEmbedded: false,
  },
);
</script>

<template>
  <!--
    Раньше здесь было то же фото ночного города, что и в герое — одна картинка
    дважды на одном экране. Теперь блок работает как призыв к владельцам авто:
    это вторая сторона витрины, и ей нужно место в каталоге.
  -->
  <component :is="isEmbedded ? 'div' : 'section'" :class="!isEmbedded ? 'py-xl' : ''">
    <div :class="!isEmbedded ? 'container' : ''">
      <div
        class="relative overflow-hidden rounded-radius-xl bg-surface-inverse px-lg py-xl sm:px-xl sm:py-2xl"
      >
        <!-- Мягкое зелёное свечение вместо фотографии -->
        <div
          class="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />

        <div class="relative flex flex-col gap-lg md:flex-row md:items-center md:justify-between">
          <div class="max-w-[32rem]">
            <p class="text-caption font-bold uppercase tracking-[0.12em] text-brand">
              Для владельцев
            </p>
            <h2 class="mt-sm text-display-sm font-extrabold text-white sm:text-display">
              Ваша машина простаивает?
            </h2>
            <p class="mt-md text-body text-white/70 sm:text-body-lg">
              Разместите объявление и получайте заявки от арендаторов. Условия вы задаёте сами —
              цену, срок, депозит и правила.
            </p>
          </div>

          <a
            href="/rent-out"
            class="inline-flex shrink-0 items-center justify-center rounded-radius-md bg-white px-6 py-3.5 text-body font-semibold text-ink no-underline transition-transform duration-fast ease-out hover:-translate-y-0.5"
          >
            Сдать авто
          </a>
        </div>
      </div>
    </div>
  </component>
</template>
