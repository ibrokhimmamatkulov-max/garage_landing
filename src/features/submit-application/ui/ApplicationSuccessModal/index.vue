<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Car } from '@/entities/car';

defineOptions({
  name: 'ApplicationSuccessModal',
});

defineProps<{
  car: Car;
}>();

defineEmits<{
  close: [];
}>();

const modalRef = ref<{ open: () => void; close: () => void } | null>(null);

onMounted(() => {
  modalRef.value?.open();
});
</script>

<template>
  <CModal ref="modalRef" title="Заявка отправлена" @before-close="$emit('close')">
    <div class="flex flex-col">
      <div class="w-full pt-md mb-xl flex flex-col gap-xs">
        <div>
          <p class="text-xl font-bold text-text-primary">{{ car.brand }} {{ car.model }}</p>
        </div>
      </div>

      <div class="mb-xl text-center">
        <h3 class="text-xl font-bold text-text-primary mb-xs">Заявка отправлена</h3>
        <p class="text-[13px] text-text-secondary leading-relaxed">
          Мы сохранили контакт и передали его<br />менеджеру парка
        </p>
      </div>
    </div>
  </CModal>
</template>
