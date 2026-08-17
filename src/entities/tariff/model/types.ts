export interface Tariff {
  id: number;
  name: string;
  durationDays: number;
  price: number;
  freeWeekendDay: number;
  deposit?: number;
  depositPerDay?: number;
}
