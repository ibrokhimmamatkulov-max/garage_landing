<script setup lang="ts">
defineOptions({
  name: 'AppFooter',
});
</script>

<template>
  <footer class="mt-auto pt-2xl pb-xl border-t border-border-light">
    <div class="container">
      <div class="flex flex-col md:flex-row justify-between items-start gap-lg md:gap-0 mb-xl">
        <div>
          <div class="flex items-center gap-sm">
            <span
              class="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full font-bold text-lg"
              >G</span
            >
            <span class="text-xl font-semibold">Gram Гараж</span>
          </div>
        </div>

        <div>
          <h3 class="text-base font-semibold text-text-accent mb-sm">Контакты</h3>
          <p class="text-[14px] text-text-primary">Call center: 446506655</p>
        </div>
      </div>

      <div
        class="flex flex-col md:flex-row justify-between items-center gap-md md:gap-0 pt-lg border-t border-border-light text-center md:text-left"
      >
        <p class="text-[13px] text-text-secondary">© 2026 ООО «Gram Гараж»</p>
        <div class="flex flex-col items-center md:items-end gap-xs">
          <a
            href="#"
            class="text-[13px] text-text-secondary transition-colors duration-fast hover:text-text-primary"
            >Политика конфиденциальности</a
          >
          <a
            href="#"
            class="text-[13px] text-text-secondary transition-colors duration-fast hover:text-text-primary"
            >Согласие на обработку персональных данных</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>
