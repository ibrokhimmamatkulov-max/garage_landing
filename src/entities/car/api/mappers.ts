import type { Car } from '../model/types';

export interface ApiCarData {
  id: number;
  brand: string;
  model: string;
  year: number;
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
  tariffs?: Array<{
    id: number;
    duration_days: number;
    price: number;
    free_weekend_day: boolean;
  }>;
  performer_id?: number | null;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/e5e7eb/6b7280?text=Car+Photo';

const formatPhotoUrl = (url: string) => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Очищаем от ведущего слэша
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

  // Если бэкенд возвращает путь с storage/ в начале, то добавляем только домен
  if (cleanUrl.startsWith('storage/')) {
    return `https://auto-baza.gram.tj/${cleanUrl}`;
  }

  // Иначе (например, если возвращается cars/image.png) добавляем storage/
  return `https://auto-baza.gram.tj/storage/${cleanUrl}`;
};

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
    const hasFreeWeekend = apiData.tariffs.some((t) => t.free_weekend_day);
    if (hasFreeWeekend) {
      workDays = 6;
      weekendDays = 1;
    }
  }

  const idNum = Number(apiData.id) || 1;
  const rating = 4.2 + (idNum % 8) * 0.1;

  const deposit = pricePerDay > 200 ? 1500 : 1000;
  const depositPerDay = pricePerDay > 200 ? 250 : 200;

  return {
    id: String(apiData.id),
    brand: apiData.brand || '',
    model: apiData.model || '',
    year: Number(apiData.year) || new Date().getFullYear(),
    rating: Number(rating.toFixed(1)),
    transmission: apiData.gearbox?.name || 'Автомат',
    fuelType: apiData.fuel_type?.name || 'Бензин',
    carClass: apiData.body_type?.name || 'Эконом',
    taxiPark: apiData.performer_id ? `Партнёр #${apiData.performer_id}` : 'Gram Гараж',
    pricePerDay,
    currency: 'сомон',
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
    tariffs: apiData.tariffs,
  };
}
