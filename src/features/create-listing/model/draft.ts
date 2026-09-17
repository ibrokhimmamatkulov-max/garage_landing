import type { Tier } from '../ui/PriceTiers/index.vue';

export interface ListingDraft {
  // Автомобиль
  cityId: string;
  brandId: string;
  modelId: string;
  year: string;
  conditionId: string;
  customsCleared: string;
  engineVolume: string;
  mileage: string;
  bodyTypeId: string;
  colorId: string;
  gearboxId: string;
  fuelTypeId: string;
  driveType: string;
  hasTaxiLicense: string;
  hasTurbo: string;
  carNumber: string;
  countSeat: string;

  // Условия аренды
  priceTiers: Tier[];
  minRentDays: string;
  maxRentDays: string;
  depositAmount: string;
  depositReturnPolicy: string;
  mileageLimitPerDay: string;
  overmileagePrice: string;
  fuelPolicy: string;
  minDriverAge: string;
  minDriverExperience: string;
  documentsPledge: string;
  allowTaxi: boolean;
  allowIntercity: boolean;
  allowAbroad: boolean;
  allowSmoking: boolean;
  allowPets: boolean;
  deliveryAvailable: boolean;
  deliveryPrice: string;

  // Описание
  address: string;
  description: string;
  additionalTerms: string;
}

export function emptyDraft(): ListingDraft {
  return {
    cityId: '',
    brandId: '',
    modelId: '',
    year: '',
    conditionId: '',
    customsCleared: '',
    engineVolume: '',
    mileage: '',
    bodyTypeId: '',
    colorId: '',
    gearboxId: '',
    fuelTypeId: '',
    driveType: '',
    hasTaxiLicense: '',
    hasTurbo: '',
    carNumber: '',
    countSeat: '',

    priceTiers: [{ minDays: '1', maxDays: null, pricePerDay: '' }],
    minRentDays: '1',
    maxRentDays: '',
    depositAmount: '',
    depositReturnPolicy: 'on_return',
    mileageLimitPerDay: '',
    overmileagePrice: '',
    fuelPolicy: 'full_to_full',
    minDriverAge: '',
    minDriverExperience: '',
    documentsPledge: 'none',
    allowTaxi: false,
    allowIntercity: true,
    allowAbroad: false,
    allowSmoking: false,
    allowPets: false,
    deliveryAvailable: false,
    deliveryPrice: '',

    address: '',
    description: '',
    additionalTerms: '',
  };
}

const KEY = 'garage.listing.draft';

/**
 * Черновик живёт в браузере, а не на сервере.
 *
 * Причина: весь путь проходится анонимно, авторизация — последним шагом.
 * Серверный черновик до входа означал бы неаутентифицированную запись в базу,
 * то есть готовый вектор для спама и мусор, который надо чем-то подчищать.
 * Цена решения: черновик не переносится между устройствами.
 */
export function loadDraft(): ListingDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return { ...emptyDraft(), ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function saveDraft(draft: ListingDraft): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* приватное окно — работаем без сохранения */
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
