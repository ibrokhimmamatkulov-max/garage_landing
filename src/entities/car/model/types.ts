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

export type CarDriveType = 'fwd' | 'rwd' | 'awd';

/** Как возвращается депозит */
export type DepositReturnPolicy = 'on_return' | 'daily' | 'none';

/** Кто платит за топливо */
export type FuelPolicy = 'full_to_full' | 'tenant' | 'owner';

/**
 * Условия аренды — то, что владелец задаёт при подаче объявления.
 * Платформа их только показывает: договор стороны заключают между собой.
 */
export interface CarTerms {
  depositAmount: number;
  depositReturnPolicy: DepositReturnPolicy;
  depositDailyReturn: number | null;

  mileageLimitPerDay: number | null;
  overmileagePrice: number | null;

  fuelPolicy: FuelPolicy | null;

  minDriverAge: number | null;
  minDriverExperience: number | null;
  documentsPledge: string | null;
  requireCleanRecord: boolean;

  allowTaxi: boolean;
  allowIntercity: boolean;
  allowAbroad: boolean;
  allowSmoking: boolean;
  allowPets: boolean;

  deliveryAvailable: boolean;
  deliveryPrice: number | null;

  additionalTerms: string | null;
}

/** Занятый интервал. Брони не создаёт — заявку на эти даты всё равно примут (ТЗ §2) */
export interface CarUnavailablePeriod {
  dateFrom: string;
  dateTo: string;
}

export interface CarOwner {
  displayName: string;
  ownerType: string;
}

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

  /** Гараж 2.0 — то, что показывает карточка объявления */
  description?: string;
  maxRentDays?: number;
  terms?: CarTerms;
  unavailablePeriods?: CarUnavailablePeriod[];
  owner?: CarOwner;

  // Технические поля из формы подачи
  customsCleared?: boolean | null;
  engineVolume?: number | null;
  mileage?: number | null;
  driveType?: CarDriveType | null;
  hasTaxiLicense?: boolean;
  hasTurbo?: boolean;
  /** Менеджер сверил VIN с техпаспортом. Сами документы не показываются */
  vinVerified?: boolean;
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
