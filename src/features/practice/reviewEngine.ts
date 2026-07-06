import { sqlQuestLessons } from '../../data/sqlQuest';
import type { UserProgress } from '../../entities/schemas';

// Движок интервального повторения (упрощённый SM-2/HLR):
// лесенка интервалов по микроконцептам. Успех поднимает ступень и отодвигает
// dueAt; провал сбрасывает на 2 ступени вниз и возвращает концепт через 10 минут.

export type ReviewState = NonNullable<UserProgress['reviews']>[string];
export type Reviews = NonNullable<UserProgress['reviews']>;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/** 10 мин → 1д → 3д → 7д → 16д → 35д */
export const REVIEW_INTERVALS_MS = [10 * MINUTE, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
export const MAX_STRENGTH = REVIEW_INTERVALS_MS.length - 1;

/** Концепт считается «слабой зоной», пока по нему были провалы и ступень низкая. */
const isWeak = (state: ReviewState) => state.lapses > 0 && state.strength <= 1;

export function applyReviewResult(reviews: Reviews, conceptId: string, pass: boolean, now = new Date()): Reviews {
  const prev = reviews[conceptId];
  const strength = pass ? Math.min((prev?.strength ?? -1) + 1, MAX_STRENGTH) : Math.max((prev?.strength ?? 0) - 2, 0);
  const interval = pass ? REVIEW_INTERVALS_MS[strength] : 10 * MINUTE;

  return {
    ...reviews,
    [conceptId]: {
      strength,
      dueAt: new Date(now.getTime() + interval).toISOString(),
      lapses: (prev?.lapses ?? 0) + (pass ? 0 : 1),
      lastResult: pass ? 'pass' : 'fail'
    }
  };
}

export function weakZonesFrom(reviews: Reviews): string[] {
  return Object.entries(reviews)
    .filter(([, state]) => isWeak(state))
    .map(([conceptId]) => conceptId)
    .sort();
}

export type DueConcept = { conceptId: string; state: ReviewState; weak: boolean };

/** Что пора повторить: сначала слабые зоны, затем по возрастанию ступени. */
export function dueConcepts(reviews: Reviews, now = new Date()): DueConcept[] {
  return Object.entries(reviews)
    .filter(([, state]) => new Date(state.dueAt).getTime() <= now.getTime())
    .map(([conceptId, state]) => ({ conceptId, state, weak: isWeak(state) }))
    .sort((a, b) => Number(b.weak) - Number(a.weak) || a.state.strength - b.state.strength);
}

export function nextDueAt(reviews: Reviews): string | null {
  const all = Object.values(reviews);
  if (!all.length) return null;
  return all.map((s) => s.dueAt).sort()[0];
}

// ── Идентификаторы концептов ────────────────────────────────────────────────

export const sqlConceptId = (sqlConcept: string) =>
  'sql:' +
  sqlConcept
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');

export const apiConceptId = (domain: string) => `api:${domain}`;
export const requirementsConceptId = (kind: string) => `req:${kind}`;

const apiConceptLabels: Record<string, string> = {
  'api:rest': 'REST API — контракт запроса',
  'api:json': 'JSON Schema — контракт данных',
  'api:openapi': 'OpenAPI — карта договора',
  'api:integration': 'Интеграции — устойчивый обмен'
};

const reqConceptLabels: Record<string, string> = {
  'req:classification': 'Требования — разбор брифа',
  'req:questions': 'Требования — уточняющие вопросы',
  'req:story': 'Требования — user story и критерии'
};

/** Человеческая подпись микроконцепта по его id (для «Практики» и «Прогресса»). */
export function conceptLabel(conceptId: string): string {
  if (conceptId.startsWith('sql:')) {
    const lesson = sqlQuestLessons.find((l) => sqlConceptId(l.sqlConcept) === conceptId);
    return `SQL — ${lesson?.sqlConcept ?? conceptId.slice(4)}`;
  }
  if (conceptId.startsWith('api:')) return apiConceptLabels[conceptId] ?? conceptId;
  if (conceptId.startsWith('req:')) return reqConceptLabels[conceptId] ?? conceptId;
  if (conceptId.startsWith('erd:')) return 'ERD — модель данных кейса';
  if (conceptId.startsWith('bpmn:')) return 'BPMN — процесс кейса';
  if (conceptId.startsWith('usecase:')) return 'Use Case — сценарий кейса';
  return conceptId;
}
