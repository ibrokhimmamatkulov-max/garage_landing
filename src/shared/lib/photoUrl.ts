/**
 * Адрес фотографии из ответа API.
 *
 * Жил в маппере витрины, но нужен и в кабинете: объявление редактируется
 * теми же снимками, что показывает карточка. Второй копии быть не должно —
 * в ней однажды уже потерялась проверка на data:/blob:, и превью ломались.
 */

export const PHOTO_PLACEHOLDER = 'https://placehold.co/800x600/f2f2ef/8c8c86?text=%20';

/** Домен не зашит в код — см. .env.example */
const STORAGE_BASE = (
  import.meta.env.VITE_STORAGE_BASE_URL || 'https://auto-baza.gram.tj'
).replace(/\/+$/, '');

export function formatPhotoUrl(url: string): string {
  if (!url) return PHOTO_PLACEHOLDER;

  // Абсолютные адреса и data/blob отдаём как есть — приклеивать к ним домен нельзя
  if (/^(https?:|data:|blob:)/.test(url)) return url;

  const clean = url.startsWith('/') ? url.slice(1) : url;

  return clean.startsWith('storage/')
    ? `${STORAGE_BASE}/${clean}`
    : `${STORAGE_BASE}/storage/${clean}`;
}
