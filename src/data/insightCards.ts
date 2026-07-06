// Микроконтент: карточки-контрасты между путаемыми понятиями. 2-3 предложения
// + маленькая инлайн-SVG-схема. Формулировки свои (по мотивам разбора понятий).

export type InsightCard = {
  id: string;
  title: string;
  contrast: string;
  svg: string;
  // Ключевые слова урока/концепта, к которому карточка релевантна.
  triggers: string[];
};

export const insightCards: InsightCard[] = [
  {
    id: 'join-left-vs-inner',
    title: 'LEFT JOIN vs INNER JOIN',
    contrast:
      'INNER JOIN оставляет только строки, у которых есть пара в обеих таблицах — несовпавшие теряются. ' +
      'LEFT JOIN сохраняет все строки левой таблицы, а для отсутствующих пар подставляет NULL. ' +
      'Ищешь «потерянные» факты (заказы без доставки)? Нужен LEFT JOIN и проверка IS NULL.',
    svg:
      '<svg viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg"><circle cx="80" cy="35" r="28" fill="none" stroke="#6ea8fe" stroke-width="2"/><circle cx="120" cy="35" r="28" fill="none" stroke="#57d9a3" stroke-width="2"/><rect x="52" y="7" width="68" height="56" fill="#6ea8fe" opacity="0.18"/><text x="66" y="39" fill="#c7d2fe" font-size="9">LEFT</text><text x="104" y="39" fill="#bbf7d0" font-size="8">INNER</text></svg>',
    triggers: ['join', 'left join', 'inner join', 'связ']
  },
  {
    id: 'usecase-vs-userstory',
    title: 'Use Case vs User Story',
    contrast:
      'User Story — короткая формулировка ценности («как гость, я хочу…») для планирования и диалога. ' +
      'Use Case — подробный сценарий с актором, потоками и пред/постусловиями, включая альтернативы и ошибки. ' +
      'Story отвечает «зачем и что», use case — «как именно пошагово, включая исключения».',
    svg:
      '<svg viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="18" width="80" height="34" rx="6" fill="#312e81" opacity="0.5" stroke="#818cf8" stroke-width="1.5"/><text x="20" y="38" fill="#c7d2fe" font-size="9">Story: ценность</text><rect x="104" y="10" width="88" height="50" rx="6" fill="#064e3b" opacity="0.5" stroke="#34d399" stroke-width="1.5"/><text x="112" y="26" fill="#bbf7d0" font-size="8">Use Case:</text><text x="112" y="40" fill="#bbf7d0" font-size="8">потоки+исключ.</text></svg>',
    triggers: ['use case', 'user story', 'история', 'сценарий', 'критери']
  },
  {
    id: 'idempotency-vs-atomicity',
    title: 'Идемпотентность vs Атомарность',
    contrast:
      'Идемпотентность: повтор одной и той же операции даёт тот же результат — повторный POST платежа не спишет дважды. ' +
      'Атомарность: операция либо выполняется целиком, либо не выполняется вовсе — без «половинчатых» состояний. ' +
      'Идемпотентность защищает от повторов (retry), атомарность — от частичного применения внутри одной операции.',
    svg:
      '<svg viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg"><text x="6" y="20" fill="#c7d2fe" font-size="9">Идемпот.: f(f(x))=f(x)</text><path d="M10 34 h70" stroke="#6ea8fe" stroke-width="2" marker-end="url(#a)"/><path d="M10 46 h70" stroke="#6ea8fe" stroke-width="2"/><text x="110" y="20" fill="#bbf7d0" font-size="9">Атом.: всё/ничего</text><rect x="112" y="30" width="70" height="22" rx="4" fill="none" stroke="#34d399" stroke-width="1.5"/><text x="126" y="45" fill="#bbf7d0" font-size="8">commit｜rollback</text></svg>',
    triggers: ['идемпотент', 'атомарн', 'платеж', 'retry', 'дубл']
  }
];

export const findInsightCard = (text: string) =>
  insightCards.find((card) => card.triggers.some((t) => text.toLowerCase().includes(t)));
