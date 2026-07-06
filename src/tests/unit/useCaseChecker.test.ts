import { describe, expect, it } from 'vitest';
import { checkUseCaseCompleteness, type UseCaseDraft } from '../../shared/lib/graphCheckers';
import { reservationUseCase } from '../../data/cases/reservationCase/referenceUseCase';

const clone = (d: UseCaseDraft): UseCaseDraft => JSON.parse(JSON.stringify(d));

describe('checkUseCaseCompleteness', () => {
  it('accepts the complete reference use case', () => {
    expect(checkUseCaseCompleteness(reservationUseCase).ok).toBe(true);
  });

  it('flags a missing precondition', () => {
    const draft = clone(reservationUseCase);
    draft.precondition = '';
    const result = checkUseCaseCompleteness(draft);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((d) => d.code)).toContain('uc-no-precondition');
  });

  it('flags a missing alternate flow', () => {
    const draft = clone(reservationUseCase);
    draft.alternateFlows = [];
    expect(checkUseCaseCompleteness(draft).diagnostics.map((d) => d.code)).toContain('uc-no-alternate');
  });

  it('warns (without failing) on a non-atomic step', () => {
    const draft = clone(reservationUseCase);
    draft.mainFlow = [
      'Гость выбирает столик и подтверждает бронь.',
      'Система резервирует столик.',
      'Система показывает подтверждение.'
    ];
    const result = checkUseCaseCompleteness(draft);
    expect(result.ok).toBe(true);
    expect(result.diagnostics.find((d) => d.code === 'uc-non-atomic-step')?.severity).toBe('warning');
  });
});
