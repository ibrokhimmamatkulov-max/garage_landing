import { apiInstance } from '@/shared/api';
import type { Tariff } from '../model/types';
import { formatTariffSchedule } from '../lib/formatTariff';

interface ApiTariff {
  id: number;
  duration_days: number;
  price: number;
  free_weekend_day: number;
  deposit?: number;
  deposit_per_day?: number;
  created_at?: string;
  updated_at?: string;
}

interface ApiTariffResponse {
  success?: boolean;
  data?: ApiTariff[];
}

function mapTariff(raw: ApiTariff): Tariff {
  return {
    id: raw.id,
    name: formatTariffSchedule(raw.duration_days, raw.free_weekend_day),
    durationDays: raw.duration_days,
    price: raw.price,
    freeWeekendDay: raw.free_weekend_day,
    deposit: raw.deposit !== undefined && raw.deposit !== null ? Number(raw.deposit) : undefined,
    depositPerDay:
      raw.deposit_per_day !== undefined && raw.deposit_per_day !== null
        ? Number(raw.deposit_per_day)
        : undefined,
  };
}

export async function getTariffs(): Promise<Tariff[]> {
  const response = await apiInstance.get<ApiTariffResponse>('/landing/rental-tariffs');
  const responseData = response.data;

  if (responseData?.success && Array.isArray(responseData.data)) {
    return responseData.data.map(mapTariff);
  }

  return [];
}

