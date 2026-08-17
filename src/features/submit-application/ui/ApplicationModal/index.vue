<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { type Car, useCarTariffs } from '@/entities/car';
import { useLocationStore } from '@/entities/location';
import { submitApplication } from '../../api';
import { maskito as vMaskito } from '@maskito/vue';
import { phoneOptions } from '@ioyandasoz/io_ui_lib';

defineOptions({
  name: 'ApplicationModal',
});

const props = defineProps<{
  car: Car;
  initialTariffId?: number;
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const modalRef = ref<{ open: () => void; close: () => void } | null>(null);
const locationStore = useLocationStore();
const { selectedTariffId, tariffOptions } = useCarTariffs(
  () => props.car,
  () => props.initialTariffId,
);

onMounted(() => {
  modalRef.value?.open();
});

const name = ref('');
const phone = ref('');
const comment = ref('');
const isSubmitting = ref(false);

const toastRef = ref<{ open: () => void; close: () => void } | null>(null);
const toastMessage = ref('');

const isPhoneValid = computed(() => {
  const clean = phone.value.replace(/\D/g, '');
  return clean.length === 12 || clean.length === 9;
});

async function handleSubmit() {
  if (!isPhoneValid.value || !name.value.trim()) return;

  isSubmitting.value = true;
  try {
    const cityId = locationStore.currentCity?.id || Number(props.car.city?.id);
    const offerId = Number(props.car.id);
    const tariffId = selectedTariffId.value ? Number(selectedTariffId.value) : undefined;

    // Очищаем телефон (оставляем только цифры, убираем +, пробелы и тире)
    const cleanPhone = phone.value.replace(/\D/g, '');

    const result = await submitApplication({
      name: name.value.trim(),
      phone: cleanPhone,
      cityId,
      offerId,
      tariffId,
      comment: comment.value.trim() || undefined,
    });

    if (result.success) {
      emit('success');
    } else {
      toastMessage.value = result.message || 'Произошла ошибка при отправке заявки';
      toastRef.value?.open();
    }
  } catch (error: unknown) {
    let errMsg = 'Ошибка при отправке заявки. Попробуйте еще раз.';
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      if (axiosError.response?.data?.errors) {
        const firstError = Object.values(axiosError.response.data.errors)[0]?.[0];
        if (firstError) errMsg = firstError;
      } else if (axiosError.response?.data?.message) {
        errMsg = axiosError.response.data.message;
      }
    }
    toastMessage.value = errMsg;
    toastRef.value?.open();
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <CModal
    ref="modalRef"
    title="Оставьте свои данные для завершения бронирования"
    :hidden-overflow="true"
    @before-close="$emit('close')"
  >
    <div class="pt-0">
      <div class="flex flex-col gap-md mb-xl">
        <CSelect
          class="border-1 border-[#444]"
          v-model="selectedTariffId"
          :options="tariffOptions"
          label="label"
          placeholder="Выберите тариф"
          value-key="value"
          :search="false"
        />
        <CInput v-model="name" placeholder="Ваше имя" type="text" />
        <CInput
          v-model="phone"
          v-maskito="phoneOptions"
          placeholder="+992 00 000 00 00"
          type="tel"
        />
        <CInput v-model="comment" placeholder="Комментарий" />
      </div>

      <p class="text-sm text-text-secondary text-center leading-relaxed mb-sm px-md">
        Нажимая на кнопку вы соглашаетесь с
        <a href="#" class="text-[#007aff] hover:text-primary-hover hover:underline"
          >Условиями использования сервиса «Gram Гараж»</a
        >, а также с
        <a href="#" class="text-[#007aff] hover:text-primary-hover hover:underline"
          >Политикой конфиденциальности</a
        >
      </p>

      <p class="text-sm text-text-secondary text-center mb-md">Это бесплатно</p>

      <DButton
        theme="primary"
        size="lg"
        :disabled="isSubmitting || !isPhoneValid || !name.trim()"
        @click="handleSubmit"
        class="w-full"
      >
        Оставить заявку
      </DButton>
    </div>

    <CToast ref="toastRef" :duration="3000" theme="error">
      {{ toastMessage }}
    </CToast>
  </CModal>
</template>

<style scoped>
:deep(.custom-select_input) {
  background-color: #f9f9f9 !important;
  border: 1px solid #e2e2e2 !important;
}
</style>
