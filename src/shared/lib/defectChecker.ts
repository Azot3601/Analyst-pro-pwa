import type { DefectCategory, DefectExercise } from '../../data/cases/reservationCase/defects';

// Проверка ответа по дефекту: верно ли выбрана категория и назвал ли ученик
// суть проблемы (совпадение по ключевым словам, не точная формулировка).

export type DefectCheck = {
  ok: boolean;
  categoryOk: boolean;
  keywordOk: boolean;
  message: string;
};

export function checkDefect(
  exercise: DefectExercise,
  selectedCategory: DefectCategory | null,
  answerText: string
): DefectCheck {
  const categoryOk = selectedCategory === exercise.category;
  const text = answerText.trim().toLowerCase();
  const keywordOk = text.length > 0 && exercise.keywords.some((kw) => text.includes(kw.toLowerCase()));

  let message: string;
  if (categoryOk && keywordOk) message = 'Верно: категория и суть дефекта названы.';
  else if (!categoryOk && keywordOk) message = 'Суть уловлена, но категория дефекта выбрана неверно.';
  else if (categoryOk && !keywordOk) message = 'Категория верна, но опиши суть проблемы конкретнее.';
  else message = 'Пока мимо: перечитай артефакт и определи тип дефекта.';

  return { ok: categoryOk && keywordOk, categoryOk, keywordOk, message };
}
