import type { Plugin } from 'vite';

/**
 * Отдаёт /api/landing/* из локальных моков, чтобы превью главного экрана
 * поднималось без бэкенда. Формат ответов — тот же, что у Laravel:
 * { success, code, message, data }.
 *
 * Только для vite.preview.config.ts. На обычную сборку не влияет.
 */

const CITIES = [
  { id: 1, name: 'Худжанд', sort: 1, is_default: true },
  { id: 2, name: 'Душанбе', sort: 2, is_default: false },
  { id: 3, name: 'Бохтар', sort: 3, is_default: false },
  { id: 4, name: 'Куляб', sort: 4, is_default: false },
];

const GEARBOXES = [
  { id: 1, name: 'Автомат' },
  { id: 2, name: 'Механика' },
  { id: 3, name: 'Робот' },
];

const FUEL_TYPES = [
  { id: 1, name: 'Бензин' },
  { id: 2, name: 'Дизель' },
  { id: 3, name: 'Гибрид' },
  { id: 4, name: 'Электро' },
  { id: 5, name: 'Газ / бензин' },
];

const TARIFFS = [
  { id: 1, name: '7 / 0', duration_days: 7, price: 150, free_weekend_day: 0 },
  { id: 2, name: '7 / 3', duration_days: 7, price: 165, free_weekend_day: 3 },
];

/** Изображение-заполнитель: SVG data-URI, без обращений в сеть */
function carPhoto(hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="hsl(${hue} 8% 88%)"/>
    <rect y="420" width="800" height="180" fill="hsl(${hue} 8% 83%)"/>
    <path d="M130 395h540l-30-104c-8-26-31-43-58-43H218c-27 0-50 17-58 43l-30 104z" fill="hsl(${hue} 10% 62%)"/>
    <rect x="112" y="388" width="576" height="70" rx="32" fill="hsl(${hue} 10% 52%)"/>
    <circle cx="240" cy="458" r="46" fill="hsl(${hue} 12% 28%)"/>
    <circle cx="240" cy="458" r="19" fill="hsl(${hue} 8% 78%)"/>
    <circle cx="560" cy="458" r="46" fill="hsl(${hue} 12% 28%)"/>
    <circle cx="560" cy="458" r="19" fill="hsl(${hue} 8% 78%)"/>
    <path d="M226 368l28-82c5-15 18-25 34-25h144c16 0 29 10 34 25l28 82H226z" fill="hsl(${hue} 10% 78%)"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

type Offer = {
  id: number;
  listing_type: 'taxi' | 'general';
  brand: string;
  model: string;
  year: number;
  seats: number;
  gearbox: number;
  fuel: number;
  body: string;
  price: number;
  deposit: number | null;
  minDays: number;
};

const OFFERS: Offer[] = [
  { id: 1, listing_type: 'general', brand: 'Chevrolet', model: 'Cobalt', year: 2022, seats: 5, gearbox: 1, fuel: 1, body: 'Седан', price: 190, deposit: 1500, minDays: 3 },
  { id: 2, listing_type: 'general', brand: 'Toyota', model: 'Camry', year: 2021, seats: 5, gearbox: 1, fuel: 3, body: 'Седан', price: 340, deposit: 3000, minDays: 2 },
  { id: 3, listing_type: 'general', brand: 'Hyundai', model: 'Tucson', year: 2023, seats: 5, gearbox: 1, fuel: 2, body: 'Кроссовер', price: 520, deposit: 0, minDays: 3 },
  { id: 4, listing_type: 'taxi', brand: 'Chevrolet', model: 'Nexia', year: 2020, seats: 5, gearbox: 2, fuel: 5, body: 'Седан', price: 150, deposit: null, minDays: 7 },
  { id: 5, listing_type: 'general', brand: 'Kia', model: 'Sportage', year: 2022, seats: 5, gearbox: 1, fuel: 1, body: 'Кроссовер', price: 430, deposit: 2500, minDays: 2 },
  { id: 6, listing_type: 'general', brand: 'Changan', model: 'Alsvin', year: 2022, seats: 5, gearbox: 2, fuel: 1, body: 'Седан', price: 200, deposit: 1500, minDays: 5 },
  { id: 7, listing_type: 'general', brand: 'Geely', model: 'Emgrand', year: 2021, seats: 5, gearbox: 1, fuel: 1, body: 'Седан', price: 180, deposit: 1200, minDays: 3 },
  { id: 8, listing_type: 'taxi', brand: 'Kia', model: 'Rio', year: 2020, seats: 5, gearbox: 1, fuel: 1, body: 'Седан', price: 165, deposit: null, minDays: 7 },
  { id: 9, listing_type: 'general', brand: 'Chery', model: 'Tiggo 4', year: 2023, seats: 5, gearbox: 1, fuel: 1, body: 'Кроссовер', price: 250, deposit: 2000, minDays: 2 },
  { id: 10, listing_type: 'general', brand: 'BYD', model: 'Song Plus', year: 2024, seats: 5, gearbox: 1, fuel: 4, body: 'Кроссовер', price: 610, deposit: 4000, minDays: 3 },
  { id: 11, listing_type: 'general', brand: 'Nissan', model: 'X-Trail', year: 2019, seats: 7, gearbox: 1, fuel: 1, body: 'Кроссовер', price: 390, deposit: 2200, minDays: 2 },
  { id: 12, listing_type: 'general', brand: 'Mercedes-Benz', model: 'E 200', year: 2018, seats: 5, gearbox: 1, fuel: 1, body: 'Седан', price: 740, deposit: 6000, minDays: 2 },
];

function serialize(o: Offer) {
  return {
    id: o.id,
    listing_type: o.listing_type,
    title: null,
    brand: o.brand,
    model: o.model,
    year: o.year,
    count_seat: o.seats,
    city: { id: 1, name: 'Худжанд' },
    gearbox: { id: o.gearbox, name: GEARBOXES.find((g) => g.id === o.gearbox)?.name ?? null },
    body_type: { id: 1, name: o.body },
    fuel_type: { id: o.fuel, name: FUEL_TYPES.find((f) => f.id === o.fuel)?.name ?? null },
    min_price: o.price,
    min_rent_days: o.minDays,
    max_rent_days: null,
    deposit: o.deposit,
    price_tiers:
      o.listing_type === 'general'
        ? [{ id: o.id * 10, min_days: o.minDays, max_days: null, price_per_day: o.price }]
        : [],
    tariffs:
      o.listing_type === 'taxi'
        ? [{ id: 1, duration_days: 7, price: o.price, free_weekend_day: o.id % 2 === 0 ? 1 : 3 }]
        : [],
    photos: [carPhoto((o.id * 37) % 360), carPhoto((o.id * 37 + 40) % 360)],
  };
}

const ok = (data: unknown) => ({ success: true, code: 200, message: 'OK', data });

export function mockApi(): Plugin {
  return {
    name: 'garage-preview-mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const p = url.pathname;

        if (!p.startsWith('/api/')) return next();

        const send = (payload: unknown) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(payload));
        };

        if (p === '/api/landing/cities') return send(ok(CITIES));
        if (p === '/api/landing/cities/default') return send(ok({ id: 1, name: 'Худжанд' }));
        if (p === '/api/landing/gearboxes') return send(ok(GEARBOXES));
        if (p === '/api/landing/fuel-types') return send(ok(FUEL_TYPES));
        if (p === '/api/landing/rental-tariffs') return send(ok(TARIFFS));

        if (p === '/api/landing/offers') {
          const perPage = Number(url.searchParams.get('per_page') ?? 12);
          const page = Number(url.searchParams.get('page') ?? 1);
          const type = url.searchParams.get('listing_type');
          const gearbox = url.searchParams.get('gearbox_id');

          let rows = OFFERS;
          if (type) rows = rows.filter((o) => o.listing_type === type);
          if (gearbox) rows = rows.filter((o) => o.gearbox === Number(gearbox));

          const sort = url.searchParams.get('sort');
          if (sort === 'price_desc') rows = [...rows].sort((a, b) => b.price - a.price);
          else if (sort === 'year_desc') rows = [...rows].sort((a, b) => b.year - a.year);
          else if (sort === 'year_asc') rows = [...rows].sort((a, b) => a.year - b.year);
          else rows = [...rows].sort((a, b) => a.price - b.price);

          const start = (page - 1) * perPage;
          return send(
            ok({
              data: rows.slice(start, start + perPage).map(serialize),
              meta: {
                total: rows.length,
                per_page: perPage,
                current_page: page,
                last_page: Math.max(1, Math.ceil(rows.length / perPage)),
              },
            }),
          );
        }

        const detail = p.match(/^\/api\/landing\/offers\/(\d+)$/);
        if (detail) {
          const offer = OFFERS.find((o) => o.id === Number(detail[1]));
          if (!offer) {
            res.statusCode = 404;
            return send({ success: false, code: 404, message: 'Объявление не найдено.' });
          }
          return send(ok(serialize(offer)));
        }

        if (p === '/api/landing/apply') {
          return send({ success: true, code: 201, message: 'Заявка принята.', data: { application_id: 1 } });
        }

        return send(ok([]));
      });
    },
  };
}
