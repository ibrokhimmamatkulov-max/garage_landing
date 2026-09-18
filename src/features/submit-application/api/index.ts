import { apiInstance } from '@/shared/api';
import type { ApplicationPayload } from '../model/types';

interface ApiApplyResponse {
  success: boolean;
  message?: string;
  data?: { application_id: number };
}

export interface ApplyOtpResult {
  expiresIn: number;
  /** 'stub' — демо-режим: SMS не уходит, код приходит в ответе */
  delivery: 'sms' | 'stub';
  stubCode: string | null;
}

export async function requestApplyOtp(phone: string): Promise<ApplyOtpResult> {
  const { data } = await apiInstance.post('/landing/apply/request-otp', { phone });
  const d = data?.data ?? {};
  return {
    expiresIn: Number(d.expires_in) || 300,
    delivery: d.delivery === 'stub' ? 'stub' : 'sms',
    stubCode: d.stub_code ?? null,
  };
}

export async function submitApplication(
  payload: ApplicationPayload,
): Promise<{ success: boolean; message?: string }> {
  const response = await apiInstance.post<ApiApplyResponse>('/landing/apply', {
    phone: payload.phone,
    code: payload.code,
    city_id: payload.cityId,
    offer_id: payload.offerId,
  });

  return {
    success: response.data?.success ?? false,
    message: response.data?.message,
  };
}
