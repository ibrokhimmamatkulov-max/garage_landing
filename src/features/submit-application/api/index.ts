import { apiInstance } from '@/shared/api';
import type { ApplicationPayload } from '../model/types';

interface ApiApplyResponse {
  success: boolean;
  message?: string;
  data?: {
    application_id: number;
  };
}

export async function submitApplication(
  payload: ApplicationPayload,
): Promise<{ success: boolean; message?: string }> {
  const response = await apiInstance.post<ApiApplyResponse>('/landing/apply', {
    name: payload.name,
    phone: payload.phone,
    city_id: payload.cityId,
    offer_id: payload.offerId,
    tariff_id: payload.tariffId,
    comment: payload.comment,
    desired_start_date: payload.desiredStartDate,
    desired_end_date: payload.desiredEndDate,
    allow_similar: payload.allowSimilar,
  });

  const responseData = response.data;
  return {
    success: responseData?.success ?? false,
    message: responseData?.message,
  };
}
