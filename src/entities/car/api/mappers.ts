import { formatPhotoUrl, PHOTO_PLACEHOLDER } from '@/shared/lib/photoUrl';
import type { Car, CarDriveType, CarTerms, DepositReturnPolicy, FuelPolicy } from '../model/types';

export interface ApiCarData {
  id: number;
  brand: string;
  model: string;
  year: number;
  listing_type?: 'taxi' | 'general';
  price_tiers?: Array<{
    id: number;
    min_days: number;
    max_days: number | null;
    price_per_day: number;
  }>;
  city: {
    id: number | null;
    name: string | null;
  };
  gearbox: {
    id: number | null;
    name: string | null;
  };
  body_type?: {
    id: number;
    name: string;
  };
  min_price?: number;
  min_rent_days?: number;
  photos: string[];

  // Свойства детальной страницы
  count_seat?: number;
  dop_info?: string;
  address?: string | null;
  color?: {
    id: number;
    name: string;
  } | null;
  fuel_type?: {
    id: number;
    name: string;
  } | null;
  dop_options?: Array<{
    id: number;
    name: string;
  }>;
  deposit?: number;
  deposit_per_day?: number;
  tariffs?: Array<{
    id: number;
    duration_days: number;
    price: number;
    free_weekend_day: number;
    deposit?: number;
    deposit_per_day?: number;
  }>;
  // Тариф аренды под такси (с 25.09.2026) — заменяет tariffs у новых объявлений
  taxi_tariff?: {
    min_months: number;
    off_days_per_month: number;
    price_per_day: number;
    monthly_total: number;
  } | null;
  performer_id?: number | null;

  // Гараж 2.0 — детальная карточка
  description?: string | null;
  max_rent_days?: number | null;
  customs_cleared?: boolean | null;
  engine_volume?: number | null;
  mileage?: number | null;
  drive_type?: CarDriveType | null;
  has_taxi_license?: boolean;
  has_turbo?: boolean;
  vin_verified?: boolean;
  owner?: {
    display_name?: string | null;
    owner_type?: string | null;
  } | null;
  unavailable_periods?: Array<{
    date_from: string | null;
    date_to: string | null;
  }>;
  terms?: {
    deposit_amount?: number;
    deposit_return_policy?: DepositReturnPolicy;
    deposit_daily_return?: number | null;
    mileage_limit_per_day?: number | null;
    overmileage_price?: number | null;
    fuel_policy?: FuelPolicy | null;
    min_driver_age?: number | null;
    min_driver_experience?: number | null;
    documents_pledge?: string | null;
    require_clean_record?: boolean;
    allow_taxi?: boolean;
    allow_intercity?: boolean;
    allow_abroad?: boolean;
    allow_smoking?: boolean;
    allow_pets?: boolean;
    delivery_available?: boolean;
    delivery_price?: number | null;
    additional_terms?: string | null;
  } | null;
}

function mapTerms(raw: NonNullable<ApiCarData['terms']>): CarTerms {
  const num = (v: number | null | undefined) =>
    v === null || v === undefined ? null : Number(v);

  return {
    depositAmount: Number(raw.deposit_amount) || 0,
    depositReturnPolicy: raw.deposit_return_policy ?? 'none',
    depositDailyReturn: num(raw.deposit_daily_return),

    mileageLimitPerDay: num(raw.mileage_limit_per_day),
    overmileagePrice: num(raw.overmileage_price),

    fuelPolicy: raw.fuel_policy ?? null,

    minDriverAge: num(raw.min_driver_age),
    minDriverExperience: num(raw.min_driver_experience),
    documentsPledge: raw.documents_pledge ?? null,
    requireCleanRecord: Boolean(raw.require_clean_record),

    allowTaxi: Boolean(raw.allow_taxi),
    allowIntercity: Boolean(raw.allow_intercity),
    allowAbroad: Boolean(raw.allow_abroad),
    allowSmoking: Boolean(raw.allow_smoking),
    allowPets: Boolean(raw.allow_pets),

    deliveryAvailable: Boolean(raw.delivery_available),
    deliveryPrice: num(raw.delivery_price),

    additionalTerms: raw.additional_terms ?? null,
  };
}

const PLACEHOLDER_IMAGE = PHOTO_PLACEHOLDER;

export function mapCar(apiData: ApiCarData): Car {
  const photos =
    Array.isArray(apiData.photos) && apiData.photos.length > 0
      ? apiData.photos.map(formatPhotoUrl)
      : [PLACEHOLDER_IMAGE];

  // Цены (на бэкенде в сомони, без масштабирования)
  let pricePerDay = Number(apiData.min_price) || 0;
  if (!pricePerDay && Array.isArray(apiData.tariffs) && apiData.tariffs.length > 0) {
    pricePerDay = Number(apiData.tariffs[0].price) || 0;
  }
  if (!pricePerDay) {
    pricePerDay = 150;
  }

  // Расчет схемы работы
  let workDays = 7;
  let weekendDays = 0;
  if (Array.isArray(apiData.tariffs) && apiData.tariffs.length > 0) {
    const firstTariff = apiData.tariffs[0];
    workDays = Number(firstTariff.duration_days) || 7;
    weekendDays = Number(firstTariff.free_weekend_day) || 0;
  }

  // Депозит берется из первого тарифа или из свойств машины (если переданы бэкендом)
  const firstTariffDeposit = apiData.tariffs?.[0]?.deposit ?? apiData.deposit;
  const firstTariffDepositPerDay =
    apiData.tariffs?.[0]?.deposit_per_day ?? apiData.deposit_per_day;

  const deposit =
    firstTariffDeposit !== undefined && firstTariffDeposit !== null
      ? Number(firstTariffDeposit)
      : undefined;
  const depositPerDay =
    firstTariffDepositPerDay !== undefined && firstTariffDepositPerDay !== null
      ? Number(firstTariffDepositPerDay)
      : undefined;

  return {
    id: String(apiData.id),
    brand: apiData.brand || '',
    model: apiData.model || '',
    year: Number(apiData.year) || new Date().getFullYear(),
    listingType: apiData.listing_type === 'general' ? 'general' : 'taxi',
    transmission: apiData.gearbox?.name || 'Автомат',
    fuelType: apiData.fuel_type?.name || 'Бензин',
    carClass: apiData.body_type?.name || 'Эконом',
    pricePerDay,
    currency: 'сомони',
    deposit,
    depositPerDay,
    minRentDays: Number(apiData.min_rent_days) || 3,
    workDays,
    weekendDays,
    images: photos,

    // Дополнительные свойства
    countSeat: apiData.count_seat,
    dopInfo: apiData.dop_info,
    address: apiData.address || undefined,
    performerId: apiData.performer_id || undefined,
    city: apiData.city ? { id: apiData.city.id || 0, name: apiData.city.name || '' } : undefined,
    gearbox: apiData.gearbox
      ? { id: apiData.gearbox.id || 0, name: apiData.gearbox.name || '' }
      : undefined,
    bodyType: apiData.body_type,
    color: apiData.color || undefined,
    fuelTypeObj: apiData.fuel_type || undefined,
    dopOptions: apiData.dop_options,
    priceTiers: apiData.price_tiers?.map((t) => ({
      id: t.id,
      minDays: Number(t.min_days),
      maxDays: t.max_days !== null && t.max_days !== undefined ? Number(t.max_days) : null,
      pricePerDay: Number(t.price_per_day),
    })),
    // Тариф под такси с 25.09.2026 — заменяет tariffs у новых объявлений,
    // старая связь остаётся ниже для записей до этой даты.
    taxiTariff: apiData.taxi_tariff
      ? {
          minMonths: apiData.taxi_tariff.min_months,
          offDaysPerMonth: apiData.taxi_tariff.off_days_per_month,
          pricePerDay: Number(apiData.taxi_tariff.price_per_day),
          monthlyTotal: Number(apiData.taxi_tariff.monthly_total),
        }
      : undefined,
    tariffs: apiData.tariffs?.map((t) => ({
      id: t.id,
      durationDays: t.duration_days,
      price: t.price,
      freeWeekendDay: t.free_weekend_day,
      deposit: t.deposit !== undefined && t.deposit !== null ? Number(t.deposit) : undefined,
      depositPerDay:
        t.deposit_per_day !== undefined && t.deposit_per_day !== null
          ? Number(t.deposit_per_day)
          : undefined,
    })),

    description: apiData.description || undefined,
    maxRentDays:
      apiData.max_rent_days !== null && apiData.max_rent_days !== undefined
        ? Number(apiData.max_rent_days)
        : undefined,
    terms: apiData.terms ? mapTerms(apiData.terms) : undefined,

    // Интервалы с пустыми границами отбрасываем: рисовать «занято с null» нечем
    unavailablePeriods: apiData.unavailable_periods
      ?.filter((p) => p.date_from && p.date_to)
      .map((p) => ({ dateFrom: p.date_from as string, dateTo: p.date_to as string })),

    owner: apiData.owner?.display_name
      ? {
          displayName: apiData.owner.display_name,
          ownerType: apiData.owner.owner_type || 'individual',
        }
      : undefined,

    customsCleared: apiData.customs_cleared ?? null,
    engineVolume:
      apiData.engine_volume !== null && apiData.engine_volume !== undefined
        ? Number(apiData.engine_volume)
        : null,
    mileage:
      apiData.mileage !== null && apiData.mileage !== undefined ? Number(apiData.mileage) : null,
    driveType: apiData.drive_type ?? null,
    hasTaxiLicense: Boolean(apiData.has_taxi_license),
    hasTurbo: Boolean(apiData.has_turbo),
    vinVerified: Boolean(apiData.vin_verified),
  };
}
