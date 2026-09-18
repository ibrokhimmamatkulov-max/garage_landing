export interface CarCity {
  id: number;
  name: string;
}

export interface CarGearbox {
  id: number;
  name: string;
}

export interface CarBodyType {
  id: number;
  name: string;
}

export interface CarColor {
  id: number;
  name: string;
}

export interface CarFuelType {
  id: number;
  name: string;
}

export interface CarDopOption {
  id: number;
  name: string;
}

/** Ступень цены обычной аренды: чем дольше срок, тем дешевле сутки */
export interface CarPriceTier {
  id: number;
  minDays: number;
  maxDays: number | null;
  pricePerDay: number;
}

export interface CarTariff {
  id: number;
  durationDays: number;
  price: number;
  freeWeekendDay: number;
  deposit?: number;
  depositPerDay?: number;
}

export type CarListingType = 'taxi' | 'general';

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  /** 'taxi' — старая таксопарковая схема N/M, 'general' — обычная посуточная аренда */
  listingType: CarListingType;
  transmission: string;
  fuelType: string;
  carClass: string;
  pricePerDay: number;
  currency: string;
  deposit?: number;
  depositPerDay?: number;
  minRentDays: number;
  workDays: number;
  weekendDays: number;
  images: string[];

  // Дополнительные свойства из API
  countSeat?: number;
  dopInfo?: string;
  address?: string;
  performerId?: number;
  city?: CarCity;
  gearbox?: CarGearbox;
  bodyType?: CarBodyType;
  color?: CarColor;
  fuelTypeObj?: CarFuelType;
  dopOptions?: CarDopOption[];
  tariffs?: CarTariff[];
  priceTiers?: CarPriceTier[];
}

export interface CarFilters {
  cityId: number | null;
  gearboxId: number | null;
  fuelTypeId?: number | null;
  tariffId?: number | null;
  durationDays: number | null;
  sort: 'price_asc' | 'price_desc' | 'year_asc' | 'year_desc' | null;
  page?: number;
  perPage?: number;
  /** Гараж 2.0 */
  listingType?: CarListingType | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  priceFrom?: number | null;
  priceTo?: number | null;
  brandId?: number | null;
  bodyTypeId?: number | null;
  yearFrom?: number | null;
  yearTo?: number | null;
}
