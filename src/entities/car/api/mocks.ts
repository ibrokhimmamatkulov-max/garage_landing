import type { Car } from '../model/types';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/e5e7eb/6b7280?text=Car+Photo';

function createMockCar(overrides: Partial<Car> = {}): Car {
  return {
    id: '1',
    brand: 'BYD',
    model: 'E2',
    year: 2018,
    rating: 4.5,
    transmission: 'Автомат',
    fuelType: 'Электромобиль',
    carClass: 'Эконом',
    taxiPark: 'Олуча',
    pricePerDay: 150,
    currency: 'tjs',
    deposit: 1000,
    depositPerDay: 200,
    minRentDays: 20,
    workDays: 7,
    weekendDays: 0,
    images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
    ...overrides,
  };
}

export const mockCars: Car[] = [
  createMockCar({ id: '1' }),
  createMockCar({ id: '2', brand: 'BYD', model: 'E2', pricePerDay: 150 }),
  createMockCar({ id: '3', brand: 'BYD', model: 'E2', pricePerDay: 150 }),
  createMockCar({
    id: '4',
    brand: 'Changan',
    model: 'Alsvin',
    year: 2022,
    rating: 4.7,
    transmission: 'Механика',
    fuelType: 'Бензин',
    carClass: 'Комфорт',
    taxiPark: 'Олуча',
    pricePerDay: 200,
    deposit: 1500,
    depositPerDay: 250,
    minRentDays: 15,
  }),
  createMockCar({
    id: '5',
    brand: 'Geely',
    model: 'Emgrand',
    year: 2021,
    rating: 4.3,
    fuelType: 'Бензин',
    carClass: 'Комфорт',
    pricePerDay: 180,
    deposit: 1200,
    depositPerDay: 220,
  }),
  createMockCar({
    id: '6',
    brand: 'Chery',
    model: 'Tiggo 4',
    year: 2023,
    rating: 4.8,
    fuelType: 'Бензин',
    carClass: 'Бизнес',
    taxiPark: 'Сафар',
    pricePerDay: 250,
    deposit: 2000,
    depositPerDay: 300,
    minRentDays: 10,
  }),
];
