/**
 * Моки кабинета арендодателя для превью-сборки.
 * Формы ответов повторяют контракты Laravel: { success, code, message, data }.
 *
 * Состояние живёт в памяти процесса: правки в кабинете видны до перезапуска
 * сервера — этого достаточно, чтобы проверить экраны.
 */

const ok = (data: unknown, message = 'OK') => ({ success: true, code: 200, message, data });
const fail = (message: string, code = 422, errors?: unknown) => ({
  success: false,
  code,
  message,
  errors,
});

export const OWNER = {
  id: 1,
  phone: '992928451207',
  login: 'g928451207',
  first_name: 'Фаррух',
  last_name: 'Раҳимов',
  middle_name: null,
  display_name: 'Фаррух Раҳимов',
  owner_type: 'individual',
  company_name: null,
  tin: null,
  email: null,
  status: 'active',
  has_generated_password: true,
  created_at: '2026-08-02T10:12:00+05:00',
};

type Listing = {
  id: number;
  title: string | null;
  brand: string;
  model: string;
  year: number;
  car_number: string;
  moderation_status: 'pending' | 'published' | 'rejected' | 'paused' | 'archived';
  rejection_reason: string | null;
  vin_verified: boolean;
  views_count: number;
  applications_count: number;
  min_price: number;
  min_rent_days: number;
  city: string;
  gearbox: string;
  fuel: string;
  body: string;
  mileage: number;
  engine_volume: number;
  submitted_at: string;
};

export const LISTINGS: Listing[] = [
  {
    id: 101,
    title: null,
    brand: 'Toyota',
    model: 'Camry',
    year: 2021,
    car_number: '01 AB 123 TJ',
    moderation_status: 'published',
    rejection_reason: null,
    vin_verified: true,
    views_count: 1284,
    applications_count: 7,
    min_price: 340,
    min_rent_days: 2,
    city: 'Худжанд',
    gearbox: 'Автомат',
    fuel: 'Гибрид',
    body: 'Седан',
    mileage: 86000,
    engine_volume: 2.5,
    submitted_at: '2026-09-02T09:40:00+05:00',
  },
  {
    id: 102,
    title: null,
    brand: 'Chevrolet',
    model: 'Cobalt',
    year: 2022,
    car_number: '01 CD 456 TJ',
    moderation_status: 'pending',
    rejection_reason: null,
    vin_verified: true,
    views_count: 0,
    applications_count: 0,
    min_price: 190,
    min_rent_days: 3,
    city: 'Худжанд',
    gearbox: 'Автомат',
    fuel: 'Бензин',
    body: 'Седан',
    mileage: 41000,
    engine_volume: 1.5,
    submitted_at: '2026-09-16T18:05:00+05:00',
  },
  {
    id: 103,
    title: null,
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2023,
    car_number: '01 EF 789 TJ',
    moderation_status: 'rejected',
    rejection_reason: 'Нужны фотографии салона — минимум два кадра. Загрузите и отправьте на проверку повторно.',
    vin_verified: false,
    views_count: 0,
    applications_count: 0,
    min_price: 520,
    min_rent_days: 3,
    city: 'Душанбе',
    gearbox: 'Автомат',
    fuel: 'Дизель',
    body: 'Кроссовер',
    mileage: 22000,
    engine_volume: 2.0,
    submitted_at: '2026-09-14T11:20:00+05:00',
  },
  {
    id: 104,
    title: null,
    brand: 'Kia',
    model: 'Rio',
    year: 2020,
    car_number: '01 GH 012 TJ',
    moderation_status: 'paused',
    rejection_reason: null,
    vin_verified: true,
    views_count: 612,
    applications_count: 3,
    min_price: 165,
    min_rent_days: 5,
    city: 'Худжанд',
    gearbox: 'Автомат',
    fuel: 'Бензин',
    body: 'Седан',
    mileage: 118000,
    engine_volume: 1.6,
    submitted_at: '2026-08-21T14:02:00+05:00',
  },
];

export const APPLICATION_STATUSES = [
  { id: 1, code: 'new', name: 'Новая' },
  { id: 2, code: 'contacted', name: 'Связались' },
  { id: 3, code: 'deal', name: 'Сделка' },
  { id: 4, code: 'rejected', name: 'Отказ' },
  { id: 5, code: 'spam', name: 'Спам' },
];

export const APPLICATIONS = [
  {
    id: 5001,
    name: 'Далер',
    phone: '992907112233',
    comment: 'Нужна машина на выходные, поедем в Истаравшан.',
    desired_start_date: '2026-09-20',
    desired_end_date: '2026-09-22',
    calculated_total: 1020,
    status_id: 1,
    listing_id: 101,
    created_at: '2026-09-17T08:14:00+05:00',
  },
  {
    id: 5002,
    name: 'Нигина',
    phone: '992935778899',
    comment: null,
    desired_start_date: '2026-09-25',
    desired_end_date: '2026-10-05',
    calculated_total: 3400,
    status_id: 1,
    listing_id: 101,
    created_at: '2026-09-16T19:41:00+05:00',
  },
  {
    id: 5003,
    name: 'Сухроб',
    phone: '992918445566',
    comment: 'Можно ли с выездом в Душанбе?',
    desired_start_date: '2026-09-18',
    desired_end_date: '2026-09-21',
    calculated_total: 1020,
    status_id: 2,
    listing_id: 101,
    created_at: '2026-09-15T12:03:00+05:00',
  },
  {
    id: 5004,
    name: 'Парвиз',
    phone: '992988220011',
    comment: null,
    desired_start_date: '2026-09-10',
    desired_end_date: '2026-09-15',
    calculated_total: 825,
    status_id: 3,
    listing_id: 104,
    created_at: '2026-09-08T16:22:00+05:00',
  },
  {
    id: 5005,
    name: 'Неизвестный',
    phone: '992000000000',
    comment: 'аренда???',
    desired_start_date: null,
    desired_end_date: null,
    calculated_total: null,
    status_id: 5,
    listing_id: 104,
    created_at: '2026-09-05T03:11:00+05:00',
  },
];

/** Справочники для формы создания объявления */
export const REFERENCE = {
  conditions: [
    { id: 1, name: 'Отличное' },
    { id: 2, name: 'Хорошее' },
    { id: 3, name: 'Удовлетворительное' },
  ],
  drive_types: [
    { id: 'fwd', name: 'Передний' },
    { id: 'rwd', name: 'Задний' },
    { id: 'awd', name: 'Полный' },
  ],
  engine_volumes: [
    1.0, 1.2, 1.4, 1.5, 1.6, 1.8, 2.0, 2.4, 2.5, 3.0, 3.5, 4.0,
  ].map((v) => ({ id: v, name: `${v.toFixed(1)} л` })),
  years: Array.from({ length: 30 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { id: y, name: String(y) };
  }),
};

export function ownerRoutes(pathname: string, url: URL, body: Record<string, unknown>) {
  // --- Авторизация ---
  if (pathname === '/api/owner/auth/request-otp') {
    return ok({
      is_new: false,
      expires_in: 300,
      delivery: 'stub',
      stub_code: '0000',
    }, 'Демо-режим: SMS не отправляется, код подставлен автоматически.');
  }

  if (pathname === '/api/owner/auth/verify-otp') {
    if (String(body.code ?? '') !== '0000') {
      return fail('Неверный код. Осталось попыток: 4.', 422, { code: ['Неверный код.'] });
    }
    return ok({
      token: 'preview-token',
      owner: OWNER,
      credentials_delivery: 'screen',
      credentials: null,
    });
  }

  if (pathname === '/api/owner/auth/login') {
    return ok({ token: 'preview-token', owner: OWNER });
  }

  if (pathname === '/api/owner/auth/logout') {
    return ok(null, 'Вы вышли из аккаунта.');
  }

  // --- Профиль ---
  if (pathname === '/api/owner/me') {
    return ok(OWNER);
  }

  // --- Объявления ---
  if (pathname === '/api/owner/listings') {
    const status = url.searchParams.get('status');
    const rows = status
      ? LISTINGS.filter((l) => l.moderation_status === status)
      : LISTINGS.filter((l) => l.moderation_status !== 'archived');

    return ok({
      data: rows,
      meta: { total: rows.length, per_page: 20, current_page: 1, last_page: 1 },
    });
  }

  const listingDetail = pathname.match(/^\/api\/owner\/listings\/(\d+)$/);
  if (listingDetail) {
    const listing = LISTINGS.find((l) => l.id === Number(listingDetail[1]));
    return listing ? ok(listing) : fail('Объявление не найдено.', 404);
  }

  // --- Заявки ---
  if (pathname === '/api/owner/applications/statuses') {
    return ok(APPLICATION_STATUSES);
  }

  if (pathname === '/api/owner/applications') {
    const statusId = url.searchParams.get('status_id');
    const listingId = url.searchParams.get('listing_id');

    let rows = APPLICATIONS;
    if (statusId) rows = rows.filter((a) => a.status_id === Number(statusId));
    if (listingId) rows = rows.filter((a) => a.listing_id === Number(listingId));

    return ok({
      data: rows.map((a) => {
        const listing = LISTINGS.find((l) => l.id === a.listing_id);
        return {
          ...a,
          status: APPLICATION_STATUSES.find((s) => s.id === a.status_id) ?? null,
          listing: listing
            ? { id: listing.id, brand: listing.brand, model: listing.model, year: listing.year }
            : null,
        };
      }),
      meta: { total: rows.length, per_page: 20, current_page: 1, last_page: 1 },
    });
  }

  const appPatch = pathname.match(/^\/api\/owner\/applications\/(\d+)$/);
  if (appPatch) {
    const app = APPLICATIONS.find((a) => a.id === Number(appPatch[1]));
    if (!app) return fail('Заявка не найдена.', 404);
    if (body.status_id) app.status_id = Number(body.status_id);
    return ok({ ...app, status: APPLICATION_STATUSES.find((s) => s.id === app.status_id) });
  }

  // --- Справочники формы ---
  if (pathname === '/api/owner/reference') {
    return ok(REFERENCE);
  }

  return null;
}
