export interface TariffLike {
  durationDays: number;
  freeWeekendDay: number;
  price?: number;
  deposit?: number;
  depositPerDay?: number;
}

/**
 * Форматирует схему тарифа (например, "7 / 0" или "7 / 3")
 */
export function formatTariffSchedule(durationDays: number, freeWeekendDay: number): string {
  return `${durationDays} / ${freeWeekendDay}`;
}

/**
 * Форматирует полное наименование тарифа со схемой и стоимостью
 * (например, "7 / 3 (200 TJS/день)")
 */
export function formatTariffLabel(
  tariff: TariffLike,
  fallbackPrice?: number,
  currency = 'TJS',
): string {
  const schedule = formatTariffSchedule(tariff.durationDays, tariff.freeWeekendDay);
  const price = tariff.price ?? fallbackPrice;

  if (price !== undefined && price !== null) {
    return `${schedule} (${price} ${currency}/день)`;
  }

  return schedule;
}
