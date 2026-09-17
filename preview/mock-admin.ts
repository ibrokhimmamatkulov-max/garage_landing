/**
 * Моки админки менеджера для превью-сборки.
 * Повторяют контракты /api/rental-applications, /api/cars и /api/owners.
 */

const ok = (data: unknown, message = 'OK') => ({ success: true, code: 200, message, data });

const STATUSES = [
  { id: 1, code: 'new', name: 'Новая' },
  { id: 2, code: 'contacted', name: 'Связались' },
  { id: 3, code: 'deal', name: 'Сделка' },
  { id: 4, code: 'rejected', name: 'Отказ' },
  { id: 5, code: 'spam', name: 'Спам' },
];

const OWNERS = [
  { id: 1, name: 'Фаррух Раҳимов', phone: '992928451207' },
  { id: 2, name: 'Автопрокат «Сафар»', phone: '992900112233' },
  { id: 3, name: 'Нозим Ҷӯраев', phone: '992935004455' },
];

const LISTINGS = [
  { id: 101, brand: 'Toyota', model: 'Camry', year: 2021, car_number: '01 AB 123 TJ', owner_id: 1 },
  { id: 102, brand: 'Chevrolet', model: 'Cobalt', year: 2022, car_number: '01 CD 456 TJ', owner_id: 1 },
  { id: 103, brand: 'Hyundai', model: 'Tucson', year: 2023, car_number: '01 EF 789 TJ', owner_id: 2 },
  { id: 104, brand: 'Kia', model: 'Rio', year: 2020, car_number: '01 GH 012 TJ', owner_id: 3 },
  { id: 105, brand: 'BYD', model: 'Song Plus', year: 2024, car_number: '01 IJ 345 TJ', owner_id: 2 },
];

const CITIES = [
  { id: 1, name: 'Худжанд' },
  { id: 2, name: 'Душанбе' },
  { id: 3, name: 'Бохтар' },
];

const NAMES = [
  'Далер', 'Нигина', 'Сухроб', 'Парвиз', 'Мадина', 'Рустам', 'Зарина', 'Шахром',
  'Фируза', 'Бахтиёр', 'Мехрубон', 'Саида', 'Джамшед', 'Анора', 'Хуршед',
  'Малика', 'Умед', 'Гулнора', 'Комрон', 'Севара', 'Азиз', 'Дилрабо',
];

function iso(daysAgo: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, (daysAgo * 7) % 60, 0, 0);
  return d.toISOString();
}

function dateStr(daysAhead: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

/** Заявки с перекосом в «Новые» — так и выглядит рабочий день менеджера */
export const APPLICATIONS = Array.from({ length: 34 }, (_, i) => {
  const listing = LISTINGS[i % LISTINGS.length];
  const statusId = i < 9 ? 1 : i < 17 ? 2 : i < 24 ? 3 : i < 31 ? 4 : 5;
  const start = (i % 9) + 1;
  const days = (i % 5) + 2;
  const price = [190, 340, 520, 165, 610][i % 5];

  return {
    id: 5000 + i,
    name: NAMES[i % NAMES.length],
    phone: `9929${String(10000000 + i * 137913).slice(0, 8)}`,
    comment:
      i % 3 === 0
        ? ['Нужна на выходные, поедем в Истаравшан.', 'Можно ли с выездом в Душанбе?', 'Есть ли детское кресло?'][i % 3]
        : null,
    desired_start_date: statusId === 5 ? null : dateStr(start),
    desired_end_date: statusId === 5 ? null : dateStr(start + days),
    calculated_total: statusId === 5 ? null : price * days,
    status: STATUSES.find((s) => s.id === statusId) ?? null,
    status_changed_by: statusId === 1 ? null : 'manager',
    status_changed_at: statusId === 1 ? null : iso(i % 6, 14),
    source: i % 11 === 0 ? 'admin' : 'landing',
    city: CITIES[i % CITIES.length],
    listing: {
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      car_number: listing.car_number,
    },
    owner: OWNERS.find((o) => o.id === listing.owner_id) ?? null,
    created_at: iso(Math.floor(i / 3), 9 + (i % 9)),
  };
});

export function adminRoutes(pathname: string, url: URL, body: Record<string, unknown>) {
  if (pathname === '/api/rental-applications/summary') {
    return ok({
      total: APPLICATIONS.length,
      statuses: STATUSES.map((s) => ({
        ...s,
        count: APPLICATIONS.filter((a) => a.status?.id === s.id).length,
      })),
    });
  }

  if (pathname === '/api/rental-applications') {
    const statusId = url.searchParams.get('status_id');
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const cityId = url.searchParams.get('city_id');
    const sort = url.searchParams.get('sort') ?? 'new';

    let rows = [...APPLICATIONS];
    if (statusId) rows = rows.filter((a) => a.status?.id === Number(statusId));
    if (cityId) rows = rows.filter((a) => a.city?.id === Number(cityId));
    if (search) {
      const digits = search.replace(/\D/g, '');
      rows = rows.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          (digits !== '' && a.phone.includes(digits)) ||
          `${a.listing.brand} ${a.listing.model}`.toLowerCase().includes(search),
      );
    }

    rows.sort((a, b) =>
      sort === 'old'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return ok({
      data: rows,
      meta: { total: rows.length, per_page: 30, current_page: 1, last_page: 1 },
    });
  }

  const patch = pathname.match(/^\/api\/rental-applications\/(\d+)$/);
  if (patch) {
    const app = APPLICATIONS.find((a) => a.id === Number(patch[1]));
    if (!app) return { success: false, code: 404, message: 'Заявка не найдена' };

    if (body.status_id) {
      app.status = STATUSES.find((s) => s.id === Number(body.status_id)) ?? app.status;
      app.status_changed_by = 'manager';
      app.status_changed_at = new Date().toISOString();
    }
    if (typeof body.comment === 'string') app.comment = body.comment;

    return ok(app);
  }

  if (pathname === '/api/application-statuses') {
    return ok(STATUSES);
  }

  if (pathname === '/api/cities') {
    return ok(CITIES);
  }

  return null;
}
