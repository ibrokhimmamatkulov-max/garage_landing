<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Car } from '@/entities/car';
import { useLocationStore } from '@/entities/location';
import { submitApplication } from '../../api';
import { maskito as vMaskito } from '@maskito/vue';
import { phoneOptions } from '@ioyandasoz/io_ui_lib';

defineOptions({
  name: 'ApplicationModal',
});

const props = defineProps<{
  car: Car;
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const modalRef = ref<{ open: () => void; close: () => void } | null>(null);
const locationStore = useLocationStore();

onMounted(() => {
  modalRef.value?.open();
});

const name = ref('');
const phone = ref('');
const promoCode = ref('');
const isSubmitting = ref(false);

const isPhoneValid = computed(() => phone.value.length === 16);

async function handleSubmit() {
  if (!isPhoneValid.value || !name.value.trim()) return;

  isSubmitting.value = true;
  try {
    const cityId = locationStore.currentCity?.id || Number(props.car.city?.id);
    const offerId = Number(props.car.id);
    const tariffId =
      props.car.tariffs && props.car.tariffs.length > 0 ? props.car.tariffs[0].id : undefined;

    const result = await submitApplication({
      name: name.value.trim(),
      phone: phone.value.trim(),
      cityId,
      offerId,
      tariffId,
      comment: promoCode.value ? `Промокод: ${promoCode.value}` : undefined,
    });

    if (result.success) {
      emit('success');
    } else {
      alert(result.message || 'Произошла ошибка при отправке заявки');
    }
  } catch (error: unknown) {
    let errMsg = 'Ошибка при отправке заявки. Попробуйте еще раз.';
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        errMsg = axiosError.response.data.message;
      }
    }
    alert(errMsg);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <CModal
    ref="modalRef"
    title="Оставьте свои данные для завершения бронирования"
    @before-close="$emit('close')"
  >
    <div class="pt-0">
      <div class="flex justify-between items-center mb-xl mt-md">
        <div class="flex flex-col">
          <span class="text-xl font-bold text-text-primary">
            {{ car.pricePerDay }} сомон/день
          </span>
          <p class="text-[13px] text-text-secondary mt-xs">
            Аренда · {{ car.workDays }} рабочих дней / {{ car.weekendDays }} выходных
          </p>
        </div>
        <span
          class="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-[14px] shrink-0"
          >✓</span
        >
      </div>

      <div class="flex flex-col gap-md mb-xl">
        <CInput v-model="name" placeholder="Ваше имя" type="text" />
        <CInput v-model="phone" v-maskito="phoneOptions" placeholder="+992 17 300 22 88" type="tel" />
        <CInput v-model="promoCode" placeholder="Промокод, если есть" />
      </div>

      <p class="text-[12px] text-text-secondary text-center leading-relaxed mb-xl px-md">
        Нажимая на кнопку вы соглашаетесь с
        <a href="#" class="text-[#007aff] hover:text-primary-hover hover:underline"
          >Условиями использования сервиса «Gram Гараж»</a
        >, а также с
        <a href="#" class="text-[#007aff] hover:text-primary-hover hover:underline"
          >Политикой конфиденциальности</a
        >
      </p>

      <p class="text-[13px] text-text-secondary text-center mb-md">Это бесплатно</p>

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
  </CModal>
</template>
