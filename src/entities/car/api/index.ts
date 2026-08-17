import { apiInstance } from '@/shared/api';
import type { Car, CarFilters } from '../model/types';
import { mapCar, type ApiCarData } from './mappers';

export interface PaginatedCars {
  data: Car[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

interface ApiListResponse {
  success: boolean;
  data: {
    data: unknown[];
    meta: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
}

interface ApiDetailResponse {
  success: boolean;
  data: unknown;
}

export async function getCars(filters?: CarFilters): Promise<PaginatedCars> {
  const params: Record<string, string | number> = {};

  if (filters) {
    if (filters.cityId !== null && filters.cityId !== undefined) params.city_id = filters.cityId;
    if (filters.gearboxId !== null && filters.gearboxId !== undefined) params.gearbox_id = filters.gearboxId;
    if (filters.fuelTypeId !== null && filters.fuelTypeId !== undefined) params.fuel_type_id = filters.fuelTypeId;
    if (filters.tariffId !== null && filters.tariffId !== undefined) params.tariff_id = filters.tariffId;
    if (filters.durationDays !== null && filters.durationDays !== undefined) params.duration_days = filters.durationDays;
    if (filters.sort !== null && filters.sort !== undefined) params.sort = filters.sort;
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.perPage !== undefined) params.per_page = filters.perPage;
  }

  const response = await apiInstance.get<ApiListResponse>('/landing/offers', { params });

  const responseData = response.data;
  if (responseData?.success && responseData?.data) {
    const apiCars = (responseData.data.data || []) as ApiCarData[];
    const meta = responseData.data.meta || {
      total: 0,
      per_page: 12,
      current_page: 1,
      last_page: 1,
    };

    return {
      data: apiCars.map(mapCar),
      meta: {
        total: meta.total,
        perPage: meta.per_page,
        currentPage: meta.current_page,
        lastPage: meta.last_page,
      },
    };
  }

  return {
    data: [],
    meta: { total: 0, perPage: 12, currentPage: 1, lastPage: 1 },
  };
}

export async function getCarById(id: string): Promise<Car | undefined> {
  const response = await apiInstance.get<ApiDetailResponse>(`/landing/offers/${id}`);
  const responseData = response.data;
  if (responseData?.success && responseData?.data) {
    return mapCar(responseData.data as ApiCarData);
  }
  return undefined;
}
