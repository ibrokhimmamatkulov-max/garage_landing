<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';

defineOptions({
  name: 'CarGalleryThumbs',
});

const props = defineProps<{
  images: string[];
  currentIndex: number;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

const thumbsContainer = ref<HTMLElement | null>(null);

function scrollThumbIntoView(container: HTMLElement | null) {
  if (!container) return;
  const activeThumb = container.querySelector('.active-thumb') as HTMLElement;
  if (!activeThumb) return;

  const containerRect = container.getBoundingClientRect();
  const thumbRect = activeThumb.getBoundingClientRect();

  if (thumbRect.left < containerRect.left) {
    container.scrollBy({ left: thumbRect.left - containerRect.left - 16, behavior: 'smooth' });
  } else if (thumbRect.right > containerRect.right) {
    container.scrollBy({ left: thumbRect.right - containerRect.right + 16, behavior: 'smooth' });
  }
}

watch(
  () => props.currentIndex,
  () => {
    nextTick(() => {
      scrollThumbIntoView(thumbsContainer.value);
    });
  },
);

onMounted(() => {
  nextTick(() => {
    scrollThumbIntoView(thumbsContainer.value);
  });
});
</script>

<template>
  <div
    ref="thumbsContainer"
    class="flex gap-sm mt-md overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] pb-[2px] [&::-webkit-scrollbar]:hidden"
  >
    <button
      v-for="(image, index) in images"
      :key="index"
      class="shrink-0 w-[4rem] h-[2.75rem] md:w-[5.5rem] md:h-[3.75rem] rounded-radius-sm overflow-hidden border-2 cursor-pointer transition-all duration-fast hover:opacity-85 hover:-translate-y-[1px]"
      :class="[
        index === currentIndex
          ? 'border-primary opacity-100 active-thumb'
          : 'border-transparent opacity-60',
      ]"
      @click="emit('select', index)"
    >
      <img
        :src="image"
        :alt="`Миниатюра ${index + 1}`"
        class="w-full h-full object-cover pointer-events-none"
        draggable="false"
      />
    </button>
  </div>
</template>
