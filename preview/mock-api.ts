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

const toDataUri = (svg: string) =>
  `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;

/**
 * Кадр 1 — экстерьер, вид сбоку.
 * `hue` задаёт цвет кузова, поэтому карточки в выдаче не выглядят клонами.
 */
function photoExterior(hue: number) {
  const body = `hsl(${hue} 38% 52%)`;
  const bodyDark = `hsl(${hue} 40% 41%)`;
  const bodyLight = `hsl(${hue} 42% 62%)`;
  const glass = `hsl(${hue} 22% 78%)`;

  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#EDF0F5"/><stop offset="1" stop-color="#DDE2EA"/>
    </linearGradient>
    <linearGradient id="paint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${bodyLight}"/>
      <stop offset="0.55" stop-color="${body}"/>
      <stop offset="1" stop-color="${bodyDark}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${glass}"/><stop offset="1" stop-color="hsl(${hue} 18% 58%)"/>
    </linearGradient>
    <radialGradient id="shade" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#000" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="800" height="600" fill="url(#sky)"/>
  <rect y="436" width="800" height="164" fill="#D2D7DF"/>
  <rect y="436" width="800" height="3" fill="#C3C9D3"/>
  <ellipse cx="400" cy="470" rx="300" ry="34" fill="url(#shade)"/>

  <!-- кузов -->
  <path d="M104 424c0-30 7-52 34-62l108-22c46-40 96-58 158-58 60 0 110 18 152 56l114 24c26 6 34 26 34 56v12c0 12-8 18-20 18H122c-12 0-18-6-18-18v-6z" fill="url(#paint)"/>
  <path d="M104 420h592v10c0 12-8 18-20 18H122c-12 0-18-6-18-18v-10z" fill="#000" opacity="0.14"/>

  <!-- остекление -->
  <path d="M268 332c40-34 82-50 132-50 48 0 90 16 128 48l-12 6H280l-12-4z" fill="url(#glass)"/>
  <path d="M292 330c34-28 70-40 110-40v40H292z" fill="#fff" opacity="0.2"/>
  <rect x="392" y="288" width="5" height="44" fill="${bodyDark}" opacity="0.75"/>

  <!-- линии дверей и ручки -->
  <path d="M300 342v76M470 340v78" stroke="${bodyDark}" stroke-width="3" opacity="0.5"/>
  <rect x="330" y="366" width="34" height="7" rx="3.5" fill="${bodyDark}" opacity="0.7"/>
  <rect x="500" y="366" width="34" height="7" rx="3.5" fill="${bodyDark}" opacity="0.7"/>

  <!-- фары -->
  <path d="M660 366h30c9 0 14 5 14 13s-5 13-14 13h-30z" fill="#F4F7FA" opacity="0.92"/>
  <path d="M140 368h26v22h-26c-8 0-12-4-12-11s4-11 12-11z" fill="#D3564F" opacity="0.88"/>

  <!-- блик -->
  <path d="M150 350l180-14h160l176 16-2 7-176-14H332l-180 12z" fill="#fff" opacity="0.3"/>

  <!-- колёса -->
  <g>
    <circle cx="246" cy="442" r="64" fill="#1B1F26"/>
    <circle cx="246" cy="442" r="38" fill="#B9C0CA"/>
    <circle cx="246" cy="442" r="30" fill="#D7DCE3"/>
    <circle cx="246" cy="442" r="10" fill="#8A929E"/>
    <g stroke="#9AA2AE" stroke-width="5" stroke-linecap="round">
      <path d="M246 416v12M246 456v12M222 442h12M258 442h12M229 425l8 8M255 447l8 8M263 425l-8 8M237 447l-8 8"/>
    </g>
  </g>
  <g>
    <circle cx="566" cy="442" r="64" fill="#1B1F26"/>
    <circle cx="566" cy="442" r="38" fill="#B9C0CA"/>
    <circle cx="566" cy="442" r="30" fill="#D7DCE3"/>
    <circle cx="566" cy="442" r="10" fill="#8A929E"/>
    <g stroke="#9AA2AE" stroke-width="5" stroke-linecap="round">
      <path d="M566 416v12M566 456v12M542 442h12M578 442h12M549 425l8 8M575 447l8 8M583 425l-8 8M557 447l-8 8"/>
    </g>
  </g>
</svg>`);
}

/** Кадр 2 — интерьер. Намеренно непохож на первый: переключение видно сразу. */
function photoInterior(hue: number) {
  const trim = `hsl(${hue} 14% 30%)`;
  const trimLight = `hsl(${hue} 12% 40%)`;

  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="cabin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 10% 24%)"/>
      <stop offset="1" stop-color="hsl(${hue} 12% 17%)"/>
    </linearGradient>
    <linearGradient id="wind" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C9D4E2"/><stop offset="1" stop-color="#93A3B8"/>
    </linearGradient>
  </defs>

  <rect width="800" height="600" fill="url(#cabin)"/>

  <!-- лобовое стекло -->
  <path d="M96 40h608c16 0 26 10 24 26l-16 122H88L72 66c-2-16 8-26 24-26z" fill="url(#wind)"/>
  <path d="M120 60h280l-18 118H136z" fill="#fff" opacity="0.14"/>

  <!-- торпедо -->
  <path d="M40 210h720c22 0 36 16 36 38v96H4v-96c0-22 14-38 36-38z" fill="${trim}"/>
  <rect y="336" width="800" height="264" fill="hsl(${hue} 12% 20%)"/>

  <!-- центральный экран -->
  <rect x="300" y="228" width="200" height="118" rx="12" fill="#0C0F14"/>
  <rect x="312" y="240" width="176" height="94" rx="7" fill="#1B2430"/>
  <rect x="326" y="256" width="64" height="8" rx="4" fill="#4E6377"/>
  <rect x="326" y="276" width="104" height="8" rx="4" fill="#3C4C5C"/>
  <rect x="326" y="296" width="82" height="8" rx="4" fill="#3C4C5C"/>

  <!-- дефлекторы -->
  <rect x="150" y="248" width="104" height="44" rx="10" fill="#141920"/>
  <g stroke="${trimLight}" stroke-width="4" stroke-linecap="round">
    <path d="M164 260h76M164 272h76M164 284h76"/>
  </g>
  <rect x="546" y="248" width="104" height="44" rx="10" fill="#141920"/>
  <g stroke="${trimLight}" stroke-width="4" stroke-linecap="round">
    <path d="M560 260h76M560 272h76M560 284h76"/>
  </g>

  <!-- приборная панель -->
  <rect x="104" y="330" width="216" height="96" rx="18" fill="#10141A"/>
  <circle cx="162" cy="378" r="34" fill="#1A222C" stroke="#38485A" stroke-width="3"/>
  <circle cx="262" cy="378" r="34" fill="#1A222C" stroke="#38485A" stroke-width="3"/>
  <path d="M162 378l18-20M262 378l-16-22" stroke="#7FA8E8" stroke-width="4" stroke-linecap="round"/>

  <!-- руль: вписан целиком, не уезжает за нижний край кадра -->
  <g transform="translate(214 452)">
    <circle r="108" fill="none" stroke="#0E1218" stroke-width="26"/>
    <circle r="108" fill="none" stroke="${trimLight}" stroke-width="5" opacity="0.45"/>
    <path d="M-96 -46h192" stroke="#111720" stroke-width="22" stroke-linecap="round"/>
    <path d="M-78 34c24 18 50 26 78 26s54-8 78-26" fill="none" stroke="#111720" stroke-width="22" stroke-linecap="round"/>
    <rect x="-48" y="-26" width="96" height="58" rx="17" fill="#181F28"/>
    <circle r="13" fill="${trimLight}" opacity="0.65"/>
  </g>

  <!-- селектор передач -->
  <rect x="486" y="416" width="132" height="146" rx="22" fill="#141A22"/>
  <rect x="532" y="438" width="40" height="84" rx="20" fill="#232C38"/>
  <circle cx="552" cy="456" r="13" fill="#4E6377"/>

  <!-- зеркало заднего вида -->
  <rect x="352" y="34" width="112" height="34" rx="14" fill="#10151C"/>
  <rect x="360" y="40" width="96" height="20" rx="9" fill="#2B3644"/>
</svg>`);
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
    // Два кадра на объявление: экстерьер и интерьер. Нужны разными, чтобы
    // переключение фото в карточке было видно глазом при проверке.
    photos: [photoExterior((o.id * 47) % 360), photoInterior((o.id * 47) % 360)],
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
