import type { SqlTablePreview } from '../sqlSeed';
import { entityToPreview, entityToSql, type Entity } from './types';
import { guest, penalty, reservation, reservationEntities, restaurantTable } from './reservationCase/entities';
import { guests, penalties, reservations, restaurantTables } from './reservationCase/seedData';
import { reservationContract } from './reservationCase/apiContract';

// Единый реестр кейсов. SQL-схема и превью генерируются из сущностей+сида —
// один источник истины для всех инструментов тренажёра.

export type CaseId = 'reservation';

export interface CaseDef {
  id: CaseId;
  title: string;
  brief: string;
  entities: readonly Entity[];
  schemaSql: string;
  previews: SqlTablePreview[];
  contract: typeof reservationContract;
}

const reservationSchemaSql = [
  entityToSql(guest, guests),
  entityToSql(restaurantTable, restaurantTables),
  entityToSql(reservation, reservations),
  entityToSql(penalty, penalties)
].join('\n\n');

const reservationPreviews: SqlTablePreview[] = [
  entityToPreview(guest, 'Гости', 'Гости ресторана и их уровень лояльности.', guests),
  entityToPreview(restaurantTable, 'Столики', 'Посадочные места по зонам зала.', restaurantTables),
  entityToPreview(reservation, 'Брони', 'Брони столиков со статусом, включая неявки (no_show).', reservations),
  entityToPreview(penalty, 'Штрафы', 'Штрафы за неявку, привязанные к конкретной броне.', penalties)
];

export const reservationCase: CaseDef = {
  id: 'reservation',
  title: 'Бронирование столиков',
  brief:
    'Ресторан бронирует столики для гостей. За неявку (статус брони no_show) гостю выставляется штраф. ' +
    'Одни и те же сущности — Guest, Table, Reservation, Penalty — проходят через SQL, API и модели.',
  entities: reservationEntities,
  schemaSql: reservationSchemaSql,
  previews: reservationPreviews,
  contract: reservationContract
};

export const cases: CaseDef[] = [reservationCase];

/** DDL+DML всех кейсов — добавляется в БД поверх базовой схемы SQL Quest. */
export const caseSchemaSql = cases.map((item) => item.schemaSql).join('\n\n');

/** Превью таблиц всех кейсов — для панели данных в SQL-редакторе. */
export const casePreviews = cases.flatMap((item) => item.previews);

export const getCase = (id: CaseId) => cases.find((item) => item.id === id);
