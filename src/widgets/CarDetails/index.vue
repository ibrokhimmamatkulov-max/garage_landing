<script setup lang="ts">
import { ref, computed } from 'vue';
import { type Car, CarGallery } from '@/entities/car';
import AppIcon from '@/shared/ui/AppIcon/index.vue';
import type { SelectOption } from '@/shared/ui/AppSelect/index.vue';

defineOptions({
  name: 'CarDetails',
});

const props = defineProps<{
  car: Car;
}>();

defineEmits<{
  apply: [car: Car];
  back: [];
}>();

const rentalOptions = computed<SelectOption[]>(() => [
  { label: `${props.car.pricePerDay} сомон/день`, value: String(props.car.pricePerDay) },
]);

const selectedPrice = ref(String(props.car.pricePerDay));
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
                <strong class="block text-base font-bold">{{ car.pricePerDay }} сомон/день</strong>
                <span class="text-[13px] text-text-secondary">
                  Аренда · {{ car.workDays }}/{{ car.weekendDays }}
                </span>
              </div>
            </div>

            <div
              class="flex justify-between items-start py-base border-b border-border-light last:border-b-0"
            >
              <span class="text-[14px] text-text-primary">Депозит</span>
              <div class="text-right">
                <strong class="block text-base font-bold">{{ car.deposit }} tjs</strong>
                <span class="text-[13px] text-text-secondary">
                  {{ car.depositPerDay }} tjs/день
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
                <span>Тариф</span>
                <strong class="font-bold">{{ car.carClass }}</strong>
              </div>
            </div>
          </div>

          <div class="bg-bg-card border border-border-light rounded-radius-lg p-lg">
            <h3 class="text-[20px] font-bold leading-6 mb-base">Выберите тип аренды</h3>

            <CSelect
              v-model="selectedPrice"
              :options="rentalOptions"
              label="label"
              value-key="value"
            />

            <p class="text-[13px] text-text-secondary mt-xs mb-base">
              Аренда · {{ car.workDays }}/{{ car.weekendDays }}
            </p>

            <DButton theme="primary" size="lg" class="w-full" @click="$emit('apply', car)">
              Оставить заявку
            </DButton>

            <p class="text-[13px] text-text-secondary text-center mt-sm">Это бесплатно</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
