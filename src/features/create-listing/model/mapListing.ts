import { emptyDraft, type ListingDraft } from './draft';

/**
 * Объявление с сервера — в черновик формы и обратно.
 *
 * Форма хранит всё строками: у неё родные `<select>` и `<input>`, а они
 * работают со строками. Поэтому на входе приводим к строкам, на выходе —
 * обратно к числам и булевым, как ждёт ListingRequest.
 */

export interface ApiOwnerListing {
  id: number;
  title?: string | null;
  description?: string | null;
  listing_type?: string;
  moderation_status?: string;
  rejection_reason?: string | null;

  car_model_id?: number | null;
  brand_id?: number | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  car_number?: string | null;
  count_seat?: number | null;
  address?: string | null;
  dop_info?: string | null;
  min_rent_days?: number | null;
  max_rent_days?: number | null;

  city?: { id: number; name: string } | null;
  gearbox?: { id: number; name: string } | null;
  body_type?: { id: number; name: string } | null;
  color?: { id: number; name: string } | null;
  fuel_type?: { id: number; name: string } | null;

  condition_id?: number | null;
  customs_cleared?: boolean | null;
  engine_volume?: number | null;
  mileage?: number | null;
  drive_type?: string | null;
  has_taxi_license?: boolean;
  has_turbo?: boolean;
  vin_verified?: boolean;

  price_tiers?: Array<{
    id?: number;
    min_days: number;
    max_days: number | null;
    price_per_day: number;
  }>;

  terms?: {
    deposit_amount?: number | null;
    deposit_return_policy?: string | null;
    mileage_limit_per_day?: number | null;
    overmileage_price?: number | null;
    fuel_policy?: string | null;
    min_driver_age?: number | null;
    min_driver_experience?: number | null;
    documents_pledge?: string | null;
    allow_taxi?: boolean;
    allow_intercity?: boolean;
    allow_abroad?: boolean;
    allow_smoking?: boolean;
    allow_pets?: boolean;
    delivery_available?: boolean;
    delivery_price?: number | null;
    additional_terms?: string | null;
  } | null;

  photos?: Array<{ id: number; url: string }>;
}

/** null и undefined → пустая строка, иначе `<select>` выберет вариант «0» */
const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

/** Булево поле формы — строка '1'/'0', потому что это родной `<select>` */
const flag = (v: boolean | null | undefined): string =>
  v === null || v === undefined ? '' : v ? '1' : '0';

export function listingToDraft(api: ApiOwnerListing): ListingDraft {
  const base = emptyDraft();
  const t = api.terms;

  return {
    ...base,

    cityId: str(api.city?.id),
    brandId: str(api.brand_id),
    modelId: str(api.car_model_id),
    year: str(api.year),
    conditionId: str(api.condition_id),
    customsCleared: flag(api.customs_cleared),
    engineVolume: str(api.engine_volume),
    mileage: str(api.mileage),
    bodyTypeId: str(api.body_type?.id),
    colorId: str(api.color?.id),
    gearboxId: str(api.gearbox?.id),
    fuelTypeId: str(api.fuel_type?.id),
    driveType: str(api.drive_type),
    hasTaxiLicense: flag(api.has_taxi_license),
    hasTurbo: flag(api.has_turbo),
    carNumber: str(api.car_number),
    countSeat: str(api.count_seat),

    priceTiers: api.price_tiers?.length
      ? api.price_tiers.map((p) => ({
          minDays: str(p.min_days),
          maxDays: p.max_days === null || p.max_days === undefined ? null : str(p.max_days),
          pricePerDay: str(p.price_per_day),
        }))
      : base.priceTiers,

    minRentDays: str(api.min_rent_days) || base.minRentDays,
    maxRentDays: str(api.max_rent_days),

    depositAmount: t?.deposit_amount ? str(t.deposit_amount) : '',
    depositReturnPolicy: t?.deposit_return_policy || base.depositReturnPolicy,
    mileageLimitPerDay: str(t?.mileage_limit_per_day),
    overmileagePrice: str(t?.overmileage_price),
    fuelPolicy: t?.fuel_policy || base.fuelPolicy,
    minDriverAge: str(t?.min_driver_age),
    minDriverExperience: str(t?.min_driver_experience),
    documentsPledge: t?.documents_pledge || base.documentsPledge,

    // Флажки берём как есть: у сохранённого объявления «false» — это
    // осознанный запрет владельца, а не незаполненное поле, и подставлять
    // вместо него значение по умолчанию нельзя.
    allowTaxi: Boolean(t?.allow_taxi),
    allowIntercity: Boolean(t?.allow_intercity),
    allowAbroad: Boolean(t?.allow_abroad),
    allowSmoking: Boolean(t?.allow_smoking),
    allowPets: Boolean(t?.allow_pets),
    deliveryAvailable: Boolean(t?.delivery_available),
    deliveryPrice: str(t?.delivery_price),

    address: str(api.address),
    description: str(api.description),
    additionalTerms: str(t?.additional_terms),
  };
}

/** Пустая строка → null: сервер ждёт отсутствие значения, а не '' */
const numOrNull = (v: string): number | null => {
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export function draftToPayload(draft: ListingDraft): Record<string, unknown> {
  return {
    city_id: numOrNull(draft.cityId),
    car_model_id: numOrNull(draft.modelId),
    year_of_issue: numOrNull(draft.year),
    body_type_id: numOrNull(draft.bodyTypeId),
    gearbox_id: numOrNull(draft.gearboxId),
    fuel_type_id: numOrNull(draft.fuelTypeId),
    color_id: numOrNull(draft.colorId),
    condition_id: numOrNull(draft.conditionId),
    car_number: draft.carNumber.trim(),
    count_seat: numOrNull(draft.countSeat),

    customs_cleared: draft.customsCleared === '' ? null : draft.customsCleared === '1',
    engine_volume: numOrNull(draft.engineVolume),
    mileage: numOrNull(draft.mileage),
    drive_type: draft.driveType || null,
    has_taxi_license: draft.hasTaxiLicense === '1',
    has_turbo: draft.hasTurbo === '1',

    description: draft.description.trim() || null,
    address: draft.address.trim() || null,
    min_rent_days: numOrNull(draft.minRentDays),
    max_rent_days: numOrNull(draft.maxRentDays),

    // Пустые ступени отбрасываем: владелец мог добавить строку и не заполнить
    price_tiers: draft.priceTiers
      .filter((t) => Number(t.pricePerDay) > 0)
      .map((t) => ({
        min_days: Number(t.minDays),
        max_days: t.maxDays === null || t.maxDays === '' ? null : Number(t.maxDays),
        price_per_day: Number(t.pricePerDay),
      })),

    terms: {
      deposit_amount: numOrNull(draft.depositAmount) ?? 0,
      deposit_return_policy: draft.depositReturnPolicy,
      mileage_limit_per_day: numOrNull(draft.mileageLimitPerDay),
      overmileage_price: numOrNull(draft.overmileagePrice),
      fuel_policy: draft.fuelPolicy,
      min_driver_age: numOrNull(draft.minDriverAge),
      min_driver_experience: numOrNull(draft.minDriverExperience),
      documents_pledge: draft.documentsPledge,
      allow_taxi: draft.allowTaxi,
      allow_intercity: draft.allowIntercity,
      allow_abroad: draft.allowAbroad,
      allow_smoking: draft.allowSmoking,
      allow_pets: draft.allowPets,
      delivery_available: draft.deliveryAvailable,
      delivery_price: draft.deliveryAvailable ? numOrNull(draft.deliveryPrice) : null,
      additional_terms: draft.additionalTerms.trim() || null,
    },
  };
}
