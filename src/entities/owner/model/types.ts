export type OwnerType = 'individual' | 'company';

export interface Owner {
  id: number;
  phone: string;
  login: string;
  firstName: string;
  lastName: string | null;
  middleName: string | null;
  displayName: string;
  ownerType: OwnerType;
  companyName: string | null;
  tin: string | null;
  email: string | null;
  status: 'active' | 'blocked';
  /** Пароль всё ещё тот, что пришёл при регистрации — предлагаем сменить */
  hasGeneratedPassword: boolean;
  createdAt: string | null;
}

export type ListingStatus = 'pending' | 'published' | 'rejected' | 'paused' | 'archived';

export interface OwnerListing {
  id: number;
  title: string | null;
  brand: string;
  model: string;
  year: number;
  carNumber: string;
  status: ListingStatus;
  rejectionReason: string | null;
  vinVerified: boolean;
  viewsCount: number;
  applicationsCount: number;
  minPrice: number;
  minRentDays: number;
  city: string;
  gearbox: string;
  fuel: string;
  body: string;
  mileage: number;
  engineVolume: number;
  submittedAt: string | null;
}

export interface ApplicationStatus {
  id: number;
  code: 'new' | 'contacted' | 'deal' | 'rejected' | 'spam';
  name: string;
}

export interface OwnerApplication {
  id: number;
  name: string;
  phone: string;
  comment: string | null;
  desiredStartDate: string | null;
  desiredEndDate: string | null;
  calculatedTotal: number | null;
  status: ApplicationStatus | null;
  listing: { id: number; brand: string; model: string; year: number } | null;
  createdAt: string | null;
}
