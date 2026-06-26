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
  <component :is="isEmbedded ? 'div' : 'section'" :class="!isEmbedded ? 'py-xl md:pb-2xl' : ''">
    <div :class="!isEmbedded ? 'container' : ''">
      <div
        class="relative rounded-radius-lg overflow-hidden min-h-[300px] md:min-h-[300px] flex items-end bg-[url('https://placehold.co/1200x300/1a1a2e/6b7280?text=Promo+Car')] bg-cover bg-center"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
        <!-- <div class="relative z-[1] p-xl">
          <DButton theme="primary" size="md"> Подробнее </DButton>
        </div> -->
      </div>
    </div>
  </component>
</template>
