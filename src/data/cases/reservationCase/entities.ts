import type { Entity } from '../types';

// Кейс A «Бронирование столиков» — ИСТОЧНИК ИСТИНЫ доменной модели.
// Эти имена полей — те же, что увидит ученик в SQL-таблицах, превью и API-контракте.

export const guest = {
  name: 'Guest',
  table: 'guests',
  fields: [
    { name: 'id', type: 'integer', pk: true },
    { name: 'full_name', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'loyalty_tier', type: 'text', enumValues: ['bronze', 'silver', 'gold'] }
  ]
} as const satisfies Entity;

export const restaurantTable = {
  name: 'Table',
  table: 'restaurant_tables',
  fields: [
    { name: 'id', type: 'integer', pk: true },
    { name: 'seats', type: 'integer' },
    { name: 'zone', type: 'text', enumValues: ['hall', 'veranda', 'vip'] }
  ]
} as const satisfies Entity;

export const reservation = {
  name: 'Reservation',
  table: 'reservations',
  fields: [
    { name: 'id', type: 'integer', pk: true },
    { name: 'guest_id', type: 'integer', fk: 'guests.id' },
    { name: 'table_id', type: 'integer', fk: 'restaurant_tables.id' },
    { name: 'reserved_for', type: 'timestamp' },
    { name: 'party_size', type: 'integer' },
    { name: 'status', type: 'text', enumValues: ['booked', 'seated', 'no_show', 'cancelled'] }
  ]
} as const satisfies Entity;

export const penalty = {
  name: 'Penalty',
  table: 'penalties',
  fields: [
    { name: 'id', type: 'integer', pk: true },
    { name: 'reservation_id', type: 'integer', fk: 'reservations.id' },
    { name: 'amount', type: 'money' },
    { name: 'reason', type: 'text' },
    { name: 'created_at', type: 'timestamp' }
  ]
} as const satisfies Entity;

// Порядок важен для DDL (сначала таблицы, на которые ссылаются FK).
export const reservationEntities = [guest, restaurantTable, reservation, penalty] as const;
