<script setup lang="ts">
import { type Car, CarGallery, useCarTariffs } from '@/entities/car';
import AppIcon from '@/shared/ui/AppIcon/index.vue';

defineOptions({
  name: 'CarDetails',
});

const props = defineProps<{
  car: Car;
}>();

const emit = defineEmits<{
  apply: [car: Car, tariffId?: number];
  back: [];
}>();

const {
  selectedTariffId,
  tariffOptions,
  currentPrice,
  currentWorkDays,
  currentWeekendDays,
  currentDeposit,
  currentDepositPerDay,
} = useCarTariffs(() => props.car);

function handleApply() {
  const tariffIdNum =
    selectedTariffId.value && selectedTariffId.value !== 'default'
      ? Number(selectedTariffId.value)
      : undefined;
  emit('apply', props.car, tariffIdNum);
}
</script>

<template>
  <section class="py-xl md:pb-2xl">
    <div class="container">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-xl items-start">
        <!-- Left column: gallery + rental info -->
        <div>
          <CarGallery :car="car" />

          <div class="mt-xl bg-bg-card border border-border-light rounded-radius-lg p-lg">
            <h2 class="text-xl font-bold mb-lg">Подневная аренда</h2>

            <div
              class="flex justify-between items-start py-base border-b border-border-light last:border-b-0"
            >
              <span class="text-[14px] text-text-primary">Стоимость и схема аренды</span>
              <div class="text-right">
                <strong class="block text-base font-bold">{{ currentPrice }} TJS/день</strong>
                <span class="text-[13px] text-text-secondary">
                  Аренда · {{ currentWorkDays }}/{{ currentWeekendDays }}
                </span>
              </div>
            </div>

            <div
              v-if="currentDeposit"
              class="flex justify-between items-start py-base border-b border-border-light last:border-b-0"
            >
              <span class="text-[14px] text-text-primary">Депозит</span>
              <div class="text-right">
                <strong class="block text-base font-bold">{{ currentDeposit }} TJS</strong>
                <span v-if="currentDepositPerDay" class="text-[13px] text-text-secondary">
                  {{ currentDepositPerDay }} TJS/день
                </span>
              </div>
            </div>

            <div
              class="flex justify-between items-start py-base border-b border-border-light last:border-b-0"
            >
              <span class="text-[14px] text-text-primary">Минимальный срок аренды</span>
              <div class="text-right">
                <strong class="block text-base font-bold">{{ car.minRentDays }} дней</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column: specs + booking -->
        <div>
          <div class="bg-bg-card border border-border-light rounded-radius-lg p-lg mb-base">
            <button
              class="text-[16px] text-text-primary mb-md w-9 h-9 flex items-center justify-center border-none rounded-full !bg-grey cursor-pointer transition-all duration-fast hover:opacity-80 hover:-translate-x-[2px]"
              @click="$emit('back')"
            >
              <AppIcon name="chevron-left" />
            </button>
            <h1 class="text-[30px] font-bold leading-10">Аренда {{ car.brand }} {{ car.model }}</h1>
            <p class="text-base text-text-secondary mt-xs mb-lg">{{ car.year }}</p>

            <div class="border-t border-border-light">
              <div
                class="flex justify-between py-md text-[14px] border-b border-border-light last:border-b-0"
              >
                <span>Коробка передач</span>
                <strong class="font-bold">{{ car.transmission }}</strong>
              </div>
              <div
                class="flex justify-between py-md text-[14px] border-b border-border-light last:border-b-0"
              >
                <span>Тип топлива</span>
                <strong class="font-bold">{{ car.fuelType }}</strong>
              </div>
              <div
                class="flex justify-between py-md text-[14px] border-b border-border-light last:border-b-0"
              >
                <span>Кузов</span>
                <strong class="font-bold">{{ car.bodyType?.name || car.carClass }}</strong>
              </div>
              <div
                v-if="car.countSeat"
                class="flex justify-between py-md text-[14px] border-b border-border-light last:border-b-0"
              >
                <span>Количество мест</span>
                <strong class="font-bold">{{ car.countSeat }}</strong>
              </div>
              <div
                v-if="car.color?.name"
                class="flex justify-between py-md text-[14px] border-b border-border-light last:border-b-0"
              >
                <span>Цвет</span>
                <strong class="font-bold">{{ car.color.name }}</strong>
              </div>
            </div>
          </div>

          <div class="bg-bg-card border border-border-light rounded-radius-lg p-lg">
            <h3 class="text-[20px] font-bold leading-6 mb-base">Выберите тип аренды</h3>

            <CSelect
              v-model="selectedTariffId"
              :options="tariffOptions"
              label="label"
              value-key="value"
              placeholder="Выберите тариф"
              :search="false"
            />

            <p class="text-[13px] text-text-secondary mt-xs mb-base">
              Аренда · {{ currentWorkDays }}/{{ currentWeekendDays }}
            </p>

            <DButton theme="primary" size="lg" class="w-full" @click="handleApply">
              Оставить заявку
            </DButton>

            <p class="text-[13px] text-text-secondary text-center mt-sm">Это бесплатно</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
