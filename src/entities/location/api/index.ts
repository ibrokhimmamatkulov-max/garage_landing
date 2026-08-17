import { apiInstance } from '@/shared/api';
import type { City } from '../model/types';

interface ApiCityResponse {
  success: boolean;
  data: City[];
}

export async function getCities(): Promise<City[]> {
  const response = await apiInstance.get<ApiCityResponse>('/landing/cities');
  const responseData = response.data;

  if (responseData?.success && Array.isArray(responseData.data)) {
    return responseData.data;
  }

  return [];
}

