import type { City } from '../model/types';

export async function getCities(): Promise<City[]> {
  // Заглушка: возвращает список с одним городом (Душанбе с id 6)
  return [
    {
      id: 6,
      name: 'Душанбе',
      lat: 38.559772,
      lng: 68.773716,
    },
  ];
}
