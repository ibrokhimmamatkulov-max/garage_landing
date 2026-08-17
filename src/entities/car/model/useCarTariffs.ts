import { ref, computed, onMounted, watch, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import type { Car, CarTariff } from './types';
import { useTariffStore, formatTariffLabel } from '@/entities/tariff';
import type { SelectOption } from '@/shared/ui';

export function useCarTariffs(
  carSource: MaybeRefOrGetter<Car>,
  initialTariffId?: MaybeRefOrGetter<number | undefined>,
) {
  const tariffStore = useTariffStore();

  onMounted(() => {
    const car = toValue(carSource);
    if (!car.tariffs?.length && tariffStore.tariffs.length === 0) {
      tariffStore.fetchTariffs();
    }
  });

  const tariffOptions = computed<SelectOption[]>(() => {
    const car = toValue(carSource);
    if (car.tariffs && car.tariffs.length > 0) {
      return car.tariffs.map((t) => ({
        label: formatTariffLabel(t),
        value: String(t.id),
      }));
    }

    if (tariffStore.tariffs && tariffStore.tariffs.length > 0) {
      return tariffStore.tariffs.map((t) => ({
        label: formatTariffLabel(t, car.pricePerDay),
        value: String(t.id),
      }));
    }

    return [
      {
        label: formatTariffLabel({
          durationDays: car.workDays,
          freeWeekendDay: car.weekendDays,
          price: car.pricePerDay,
        }),
        value: 'default',
      },
    ];
  });

  const getInitialSelectedId = (): string => {
    const initId = toValue(initialTariffId);
    if (initId !== undefined && initId !== null) {
      return String(initId);
    }
    const car = toValue(carSource);
    if (car.tariffs?.[0]?.id) {
      return String(car.tariffs[0].id);
    }
    if (tariffStore.tariffs?.[0]?.id) {
      return String(tariffStore.tariffs[0].id);
    }
    return 'default';
  };

  const selectedTariffId = ref<string>(getInitialSelectedId());

  watch(
    () => toValue(initialTariffId),
    (newInitId) => {
      if (newInitId !== undefined && newInitId !== null) {
        selectedTariffId.value = String(newInitId);
      }
    },
  );

  watch(
    () => toValue(carSource),
    (newCar) => {
      const initId = toValue(initialTariffId);
      if (initId !== undefined && initId !== null) {
        selectedTariffId.value = String(initId);
      } else if (newCar.tariffs?.[0]?.id) {
        selectedTariffId.value = String(newCar.tariffs[0].id);
      } else if (tariffStore.tariffs?.[0]?.id) {
        selectedTariffId.value = String(tariffStore.tariffs[0].id);
      } else {
        selectedTariffId.value = 'default';
      }
    },
  );

  const currentTariff = computed<CarTariff | null>(() => {
    const car = toValue(carSource);
    if (car.tariffs && car.tariffs.length > 0) {
      return car.tariffs.find((t) => String(t.id) === selectedTariffId.value) || car.tariffs[0];
    }

    if (tariffStore.tariffs && tariffStore.tariffs.length > 0) {
      const storeTariff = tariffStore.tariffs.find((t) => String(t.id) === selectedTariffId.value);
      if (storeTariff) {
        return {
          id: storeTariff.id,
          price: storeTariff.price || car.pricePerDay,
          durationDays: storeTariff.durationDays,
          freeWeekendDay: storeTariff.freeWeekendDay,
          deposit: storeTariff.deposit,
          depositPerDay: storeTariff.depositPerDay,
        };
      }
    }

    return null;
  });

  const currentPrice = computed(() => {
    const car = toValue(carSource);
    return currentTariff.value?.price ?? car.pricePerDay;
  });

  const currentWorkDays = computed(() => {
    const car = toValue(carSource);
    return currentTariff.value?.durationDays ?? car.workDays;
  });

  const currentWeekendDays = computed(() => {
    const car = toValue(carSource);
    return currentTariff.value?.freeWeekendDay ?? car.weekendDays;
  });

  const currentDeposit = computed(() => {
    const car = toValue(carSource);
    return currentTariff.value?.deposit ?? car.deposit;
  });

  const currentDepositPerDay = computed(() => {
    const car = toValue(carSource);
    return currentTariff.value?.depositPerDay ?? car.depositPerDay;
  });

  return {
    selectedTariffId,
    tariffOptions,
    currentTariff,
    currentPrice,
    currentWorkDays,
    currentWeekendDays,
    currentDeposit,
    currentDepositPerDay,
  };
}
