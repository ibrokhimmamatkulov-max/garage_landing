import { apiInstance } from '@/shared/api';
import type { Gearbox } from '../model/types';

interface ApiGearboxResponse {
  success?: boolean;
  data?: Gearbox[];
}

export async function getGearboxes(): Promise<Gearbox[]> {
  const response = await apiInstance.get<ApiGearboxResponse | Gearbox[]>('/gearboxes');
  const responseData = response.data;

  if (
    responseData &&
    'success' in responseData &&
    responseData.success &&
    Array.isArray(responseData.data)
  ) {
    return responseData.data;
  }

  if (Array.isArray(responseData)) {
    return responseData;
  }

  return [];
}
