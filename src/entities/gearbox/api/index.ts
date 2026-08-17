import { apiInstance } from '@/shared/api';
import type { Gearbox } from '../model/types';

interface ApiGearboxResponse {
  success: boolean;
  data: Gearbox[];
}

export async function getGearboxes(): Promise<Gearbox[]> {
  const response = await apiInstance.get<ApiGearboxResponse>('/landing/gearboxes');
  const responseData = response.data;

  if (responseData?.success && Array.isArray(responseData.data)) {
    return responseData.data;
  }

  return [];
}

