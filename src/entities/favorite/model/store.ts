import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const FAVORITES_KEY = 'garage.favorites';

/**
 * Хранилище в браузере, а не на сервере: арендатор у нас анонимный, учётной
 * записи у него нет (решение по заявкам — только телефон). Избранное живёт
 * на устройстве; на другом телефоне или после очистки данных браузера его
 * не будет, и это сознательная плата за вход без регистрации.
 */
function read(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    // Приватное окно или битый JSON — начинаем с пустого списка
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    /* хранилище недоступно — избранное работает до перезагрузки страницы */
  }
}

export const useFavoriteStore = defineStore('favorite', () => {
  const ids = ref<string[]>(read());

  const count = computed(() => ids.value.length);

  function has(id: string | number): boolean {
    return ids.value.includes(String(id));
  }

  function add(id: string | number) {
    if (has(id)) return;
    // Новые — сверху: человек обычно возвращается к тому, что отметил последним
    ids.value = [String(id), ...ids.value];
    write(ids.value);
  }

  function remove(id: string | number) {
    ids.value = ids.value.filter((x) => x !== String(id));
    write(ids.value);
  }

  function toggle(id: string | number) {
    if (has(id)) remove(id);
    else add(id);
  }

  // Вторая вкладка отметила машину — первая должна увидеть это без перезагрузки
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === FAVORITES_KEY) ids.value = read();
    });
  }

  return { ids, count, has, add, remove, toggle };
});
