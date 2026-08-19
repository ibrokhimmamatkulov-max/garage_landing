<script setup lang="ts">
defineOptions({
  name: 'HeroBanner',
});
</script>

<template>
  <section
    class="relative min-h-[260px] sm:min-h-[360px] md:min-h-[500px] flex items-center justify-center bg-[url('/dushanbe_city_night-fhd.png')] bg-cover bg-center overflow-hidden -mt-16"
  >
    <div class="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
    <div class="relative z-[1] text-center pt-20 pb-8 sm:pt-24 sm:pb-14 md:pt-28 md:pb-16 container">
      <h1
        class="text-xl sm:text-3xl md:text-[55px] font-semibold text-white leading-tight md:leading-[59px] tracking-[-0.5px]"
      >
        Аренда авто для такси<br />в Душанбе
      </h1>
    </div>
  </section>
</template>
