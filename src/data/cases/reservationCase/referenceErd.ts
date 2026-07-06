import type { ErdGraph, ErdRelation } from '../../../shared/lib/graphCheckers';
import { reservationEntities } from './entities';

// Эталонный ERD кейса. Сущности и поля берём из entities.ts (источник истины),
// связи и кардинальности объявляем здесь.

const relations: ErdRelation[] = [
  // Один гость — много броней (в разное время).
  { from: 'guests', to: 'reservations', cardinality: '1-N' },
  // Один столик — много броней.
  { from: 'restaurant_tables', to: 'reservations', cardinality: '1-N' },
  // Одна бронь — до нескольких штрафов (за неявку).
  { from: 'reservations', to: 'penalties', cardinality: '1-N' }
];

export const reservationErd: ErdGraph = {
  entities: reservationEntities.map((entity) => ({
    name: entity.table,
    fields: entity.fields.map((field) => ({ name: field.name, type: field.type }))
  })),
  relations
};

export const reservationErdTask =
  'Спроектируй ERD для кейса «Бронирование столиков»: сущности guests, restaurant_tables, ' +
  'reservations, penalties с их полями (имя: тип) и связями. Учти: один гость может ' +
  'забронировать несколько столиков в разное время, а за неявку выставляется штраф.';
