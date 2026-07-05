import type { RowOf } from '../types';
import { guest, reservation } from './entities';

// Эталонный API-контракт кейса. Форма ответа выведена ИЗ сущностей (RowOf) —
// это те же поля, что в SQL-таблицах и превью. Никакого безликого «Order».

export type ReservationResponse = RowOf<typeof reservation> & {
  guest: Pick<RowOf<typeof guest>, 'id' | 'full_name' | 'loyalty_tier'>;
};

export const reservationContract = {
  method: 'GET' as const,
  path: '/api/v1/reservations/{id}',
  // Обязательные поля тела ответа берём из определения сущности — не из головы.
  requiredFields: reservation.fields.map((f) => f.name),
  example: {
    id: 3,
    guest_id: 3,
    table_id: 4,
    reserved_for: '2026-06-02 19:30',
    party_size: 5,
    status: 'booked',
    guest: { id: 3, full_name: 'Вера Гущина', loyalty_tier: 'gold' }
  } satisfies ReservationResponse
};
