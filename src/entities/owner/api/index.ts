import { apiInstance } from '@/shared/api';
import type {
  ApplicationStatus,
  Owner,
  OwnerApplication,
  OwnerListing,
} from '../model/types';

interface Envelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/* ------------------------------------------------------------------ */
/* Мапперы: бэк отдаёт snake_case, внутри работаем в camelCase          */
/* ------------------------------------------------------------------ */

export function mapOwner(raw: Record<string, any>): Owner {
  return {
    id: raw.id,
    phone: raw.phone,
    login: raw.login,
    firstName: raw.first_name ?? '',
    lastName: raw.last_name ?? null,
    middleName: raw.middle_name ?? null,
    displayName: raw.display_name ?? raw.first_name ?? '',
    ownerType: raw.owner_type === 'company' ? 'company' : 'individual',
    companyName: raw.company_name ?? null,
    tin: raw.tin ?? null,
    email: raw.email ?? null,
    status: raw.status === 'blocked' ? 'blocked' : 'active',
    hasGeneratedPassword: Boolean(raw.has_generated_password),
    createdAt: raw.created_at ?? null,
  };
}

function mapListing(raw: Record<string, any>): OwnerListing {
  return {
    id: raw.id,
    title: raw.title ?? null,
    brand: raw.brand ?? '',
    model: raw.model ?? '',
    year: Number(raw.year) || 0,
    carNumber: raw.car_number ?? '',
    status: raw.moderation_status,
    rejectionReason: raw.rejection_reason ?? null,
    vinVerified: Boolean(raw.vin_verified),
    viewsCount: Number(raw.views_count) || 0,
    applicationsCount: Number(raw.applications_count) || 0,
    minPrice: Number(raw.min_price) || 0,
    minRentDays: Number(raw.min_rent_days) || 1,
    city: raw.city?.name ?? raw.city ?? '',
    gearbox: raw.gearbox?.name ?? raw.gearbox ?? '',
    fuel: raw.fuel_type?.name ?? raw.fuel ?? '',
    body: raw.body_type?.name ?? raw.body ?? '',
    mileage: Number(raw.mileage) || 0,
    engineVolume: Number(raw.engine_volume) || 0,
    submittedAt: raw.submitted_at ?? null,
  };
}

function mapApplication(raw: Record<string, any>): OwnerApplication {
  return {
    id: raw.id,
    name: raw.name ?? '',
    phone: raw.phone ?? '',
    comment: raw.comment ?? null,
    desiredStartDate: raw.desired_start_date ?? null,
    desiredEndDate: raw.desired_end_date ?? null,
    calculatedTotal: raw.calculated_total !== null && raw.calculated_total !== undefined
      ? Number(raw.calculated_total)
      : null,
    status: raw.status ?? null,
    listing: raw.listing ?? null,
    createdAt: raw.created_at ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Авторизация                                                         */
/* ------------------------------------------------------------------ */

export interface OtpRequestResult {
  isNew: boolean;
  expiresIn: number;
  /** 'stub' — демо-режим: SMS не уходит, код приходит в ответе */
  delivery: 'sms' | 'stub';
  stubCode: string | null;
}

export async function requestOtp(phone: string): Promise<OtpRequestResult> {
  const { data } = await apiInstance.post<Envelope<any>>('/owner/auth/request-otp', { phone });
  const d = data.data ?? {};
  return {
    isNew: Boolean(d.is_new),
    expiresIn: Number(d.expires_in) || 300,
    delivery: d.delivery === 'stub' ? 'stub' : 'sms',
    stubCode: d.stub_code ?? null,
  };
}

export interface VerifyResult {
  token: string;
  owner: Owner;
  /** В демо-режиме учётка не уходит в SMS, её показывают на экране */
  credentials: { login: string; password: string } | null;
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
  const { data } = await apiInstance.post<Envelope<any>>('/owner/auth/verify-otp', { phone, code });
  const d = data.data ?? {};
  return {
    token: d.token,
    owner: mapOwner(d.owner ?? {}),
    credentials: d.credentials ?? null,
  };
}

export async function loginWithPassword(login: string, password: string) {
  const { data } = await apiInstance.post<Envelope<any>>('/owner/auth/login', { login, password });
  const d = data.data ?? {};
  return { token: d.token as string, owner: mapOwner(d.owner ?? {}) };
}

export async function logout(): Promise<void> {
  await apiInstance.post('/owner/auth/logout');
}

/* ------------------------------------------------------------------ */
/* Кабинет                                                             */
/* ------------------------------------------------------------------ */

export async function fetchMe(): Promise<Owner> {
  const { data } = await apiInstance.get<Envelope<any>>('/owner/me');
  return mapOwner(data.data ?? {});
}

export async function fetchListings(status?: string): Promise<OwnerListing[]> {
  const { data } = await apiInstance.get<Envelope<any>>('/owner/listings', {
    params: status ? { status } : {},
  });
  return (data.data?.data ?? []).map(mapListing);
}

export async function fetchApplications(params: {
  statusId?: number | null;
  listingId?: number | null;
} = {}): Promise<OwnerApplication[]> {
  const { data } = await apiInstance.get<Envelope<any>>('/owner/applications', {
    params: {
      ...(params.statusId ? { status_id: params.statusId } : {}),
      ...(params.listingId ? { listing_id: params.listingId } : {}),
    },
  });
  return (data.data?.data ?? []).map(mapApplication);
}

export async function fetchApplicationStatuses(): Promise<ApplicationStatus[]> {
  const { data } = await apiInstance.get<Envelope<ApplicationStatus[]>>(
    '/owner/applications/statuses',
  );
  return data.data ?? [];
}

export async function updateApplicationStatus(id: number, statusId: number) {
  await apiInstance.patch(`/owner/applications/${id}`, { status_id: statusId });
}

export async function pauseListing(id: number) {
  await apiInstance.post(`/owner/listings/${id}/pause`);
}

export async function publishListing(id: number) {
  await apiInstance.post(`/owner/listings/${id}/publish`);
}

export async function resubmitListing(id: number) {
  await apiInstance.post(`/owner/listings/${id}/resubmit`);
}

/* ------------------------------------------------------------------ */
/* Профиль                                                             */
/* ------------------------------------------------------------------ */

export interface ProfilePatch {
  firstName: string;
  lastName: string;
  middleName: string;
  ownerType: 'individual' | 'company';
  companyName: string;
  tin: string;
  email: string;
}

/** Пустые строки шлём как null: сервер ждёт отсутствие значения, а не '' */
const orNull = (v: string) => (v.trim() === '' ? null : v.trim());

export async function updateProfile(patch: ProfilePatch): Promise<Owner> {
  const { data } = await apiInstance.patch<Envelope<any>>('/owner/me', {
    first_name: patch.firstName.trim(),
    last_name: orNull(patch.lastName),
    middle_name: orNull(patch.middleName),
    owner_type: patch.ownerType,
    // Название компании сервер требует только для юрлица; для частного
    // лица шлём null, иначе старое название осталось бы висеть в базе.
    company_name: patch.ownerType === 'company' ? orNull(patch.companyName) : null,
    tin: orNull(patch.tin),
    email: orNull(patch.email),
  });

  return mapOwner(data.data ?? {});
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiInstance.post('/owner/me/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

/* ------------------------------------------------------------------ */
/* Документы на машину                                                 */
/* ------------------------------------------------------------------ */

export interface ListingDocument {
  id: number;
  originalName: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
}

export async function fetchListingDocuments(listingId: number): Promise<ListingDocument[]> {
  const { data } = await apiInstance.get<Envelope<any[]>>(`/owner/listings/${listingId}/documents`);
  return (data.data ?? []).map((d) => ({
    id: Number(d.id),
    originalName: String(d.original_name ?? ''),
    status: d.status === 'approved' || d.status === 'rejected' ? d.status : 'pending',
    comment: d.comment ?? null,
  }));
}
