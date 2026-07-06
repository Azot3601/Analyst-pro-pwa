import { describe, expect, it } from 'vitest';
import { compareErdGraph, type ErdGraph } from '../../shared/lib/graphCheckers';
import { reservationErd } from '../../data/cases/reservationCase/referenceErd';

const clone = (g: ErdGraph): ErdGraph => JSON.parse(JSON.stringify(g));

describe('compareErdGraph', () => {
  it('accepts the reference ERD (built from entities)', () => {
    expect(compareErdGraph(reservationErd, reservationErd).ok).toBe(true);
  });

  it('flags a missing entity', () => {
    const sub = clone(reservationErd);
    sub.entities = sub.entities.filter((e) => e.name !== 'penalties');
    const result = compareErdGraph(sub, reservationErd);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((d) => d.code)).toContain('erd-missing-entity');
  });

  it('flags a missing field', () => {
    const sub = clone(reservationErd);
    const guests = sub.entities.find((e) => e.name === 'guests')!;
    guests.fields = guests.fields.filter((f) => f.name !== 'phone');
    expect(compareErdGraph(sub, reservationErd).diagnostics.map((d) => d.code)).toContain('erd-missing-field');
  });

  it('flags wrong cardinality', () => {
    const sub = clone(reservationErd);
    sub.relations[0].cardinality = 'N-N';
    expect(compareErdGraph(sub, reservationErd).diagnostics.map((d) => d.code)).toContain('erd-wrong-cardinality');
  });

  it('flags wrong 1-N direction', () => {
    const sub = clone(reservationErd);
    const rel = sub.relations[0]; // guests 1-N reservations
    [rel.from, rel.to] = [rel.to, rel.from];
    expect(compareErdGraph(sub, reservationErd).diagnostics.map((d) => d.code)).toContain('erd-wrong-direction');
  });

  it('warns (without failing) on an extra relation', () => {
    const sub = clone(reservationErd);
    sub.relations.push({ from: 'guests', to: 'penalties', cardinality: '1-N' });
    const result = compareErdGraph(sub, reservationErd);
    expect(result.ok).toBe(true);
    expect(result.diagnostics.find((d) => d.code === 'erd-extra-relation')?.severity).toBe('warning');
  });
});
