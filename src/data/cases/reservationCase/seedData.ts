import type { RowOf } from '../types';
import { guest, penalty, reservation, restaurantTable } from './entities';

// Тестовые данные кейса. Типы строк выведены ИЗ сущностей (RowOf) — имена полей
// нельзя переврать: лишний/неверный ключ = ошибка компиляции.

export const guests: RowOf<typeof guest>[] = [
  { id: 1, full_name: 'Анна Котова', phone: '+7 900 111-01-01', loyalty_tier: 'bronze' },
  { id: 2, full_name: 'Борис Лан', phone: '+7 900 111-02-02', loyalty_tier: 'silver' },
  { id: 3, full_name: 'Вера Гущина', phone: '+7 900 111-03-03', loyalty_tier: 'gold' },
  { id: 4, full_name: 'Глеб Рой', phone: '+7 900 111-04-04', loyalty_tier: 'bronze' },
  { id: 5, full_name: 'Дина Соло', phone: '+7 900 111-05-05', loyalty_tier: 'silver' }
];

export const restaurantTables: RowOf<typeof restaurantTable>[] = [
  { id: 1, seats: 2, zone: 'hall' },
  { id: 2, seats: 4, zone: 'hall' },
  { id: 3, seats: 2, zone: 'veranda' },
  { id: 4, seats: 6, zone: 'vip' }
];

export const reservations: RowOf<typeof reservation>[] = [
  { id: 1, guest_id: 1, table_id: 2, reserved_for: '2026-06-01 19:00', party_size: 3, status: 'seated' },
  { id: 2, guest_id: 2, table_id: 1, reserved_for: '2026-06-01 20:00', party_size: 2, status: 'no_show' },
  { id: 3, guest_id: 3, table_id: 4, reserved_for: '2026-06-02 19:30', party_size: 5, status: 'booked' },
  { id: 4, guest_id: 4, table_id: 3, reserved_for: '2026-06-02 20:00', party_size: 2, status: 'no_show' },
  { id: 5, guest_id: 1, table_id: 2, reserved_for: '2026-06-03 18:00', party_size: 4, status: 'cancelled' },
  { id: 6, guest_id: 5, table_id: 1, reserved_for: '2026-06-03 19:00', party_size: 2, status: 'seated' }
];

// Штраф выставляется за неявку (no_show) — по броням 2 и 4.
export const penalties: RowOf<typeof penalty>[] = [
  { id: 1, reservation_id: 2, amount: 1000, reason: 'no_show', created_at: '2026-06-01' },
  { id: 2, reservation_id: 4, amount: 1000, reason: 'no_show', created_at: '2026-06-02' }
];
