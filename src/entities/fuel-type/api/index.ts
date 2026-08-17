import { apiInstance } from '@/shared/api';
import type { FuelType } from '../model/types';

interface ApiFuelTypeResponse {
  success: boolean;
  data: FuelType[];
}

export async function getFuelTypes(): Promise<FuelType[]> {
  const response = await apiInstance.get<ApiFuelTypeResponse>('/landing/fuel-types');
  const responseData = response.data;

  if (responseData?.success && Array.isArray(responseData.data)) {
    return responseData.data;
  }

  return [];
}

