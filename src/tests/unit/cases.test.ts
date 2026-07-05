import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';
import { caseSchemaSql, reservationCase } from '../../data/cases/caseRegistry';
import { reservation } from '../../data/cases/reservationCase/entities';
import { guests, penalties, reservations } from '../../data/cases/reservationCase/seedData';
import { reservationContract } from '../../data/cases/reservationCase/apiContract';

async function countRows(table: string): Promise<number> {
  const SQL = await initSqlJs({ locateFile: (file) => `node_modules/sql.js/dist/${file}` });
  const db = new SQL.Database();
  db.run(caseSchemaSql);
  const result = db.exec(`SELECT COUNT(*) AS n FROM ${table}`);
  db.close();
  return result[0].values[0][0] as number;
}

describe('reservation case foundation', () => {
  it('generates DDL+DML that loads the seed rows', async () => {
    expect(await countRows('guests')).toBe(guests.length);
    expect(await countRows('reservations')).toBe(reservations.length);
    expect(await countRows('penalties')).toBe(penalties.length);
  });

  it('api contract fields stay in sync with the reservation entity', () => {
    // Контракт выводит поля из сущности — не из ручного списка.
    expect(reservationContract.requiredFields).toEqual(reservation.fields.map((f) => f.name));
  });

  it('exposes case previews for the SQL data panel', () => {
    expect(reservationCase.previews.map((p) => p.name)).toEqual([
      'guests',
      'restaurant_tables',
      'reservations',
      'penalties'
    ]);
  });
});
