import { apiQuestTasks } from '../../data/apiQuest';
import { knowledgeNodes } from '../../data/knowledge';
import { requirementsTasks } from '../../data/requirementsQuest';
import { sqlQuestLessons } from '../../data/sqlQuest';

// Глобальный индекс для командной палитры (Ctrl/⌘+K): страницы, статьи базы
// знаний и задачи всех тренажёров. Всё офлайн, без внешнего поиска.

export type SearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  to: string;
};

const pages: SearchItem[] = [
  { id: 'p-home', title: 'Главная', category: 'Навигация', to: '/' },
  { id: 'p-profession', title: 'Профессия', subtitle: 'обзор профессии аналитика', category: 'Навигация', to: '/profession' },
  { id: 'p-trainer', title: 'Тренажёр', subtitle: 'SQL, API, требования', category: 'Навигация', to: '/trainer' },
  { id: 'p-capstone', title: 'Капстоун', subtitle: 'сквозной кейс: бриф → требования → контракт → SQL', category: 'Навигация', to: '/capstone' },
  { id: 'p-erd', title: 'ERD-конструктор', subtitle: 'проектирование модели данных кейса', category: 'Навигация', to: '/trainer?domain=erd' },
  { id: 'p-bpmn', title: 'BPMN-конструктор', subtitle: 'моделирование процесса с ветками-исключениями', category: 'Навигация', to: '/trainer?domain=bpmn' },
  { id: 'p-usecase', title: 'Use Case', subtitle: 'сценарий: актор, потоки, пред/постусловия', category: 'Навигация', to: '/trainer?domain=usecase' },
  { id: 'p-interview', title: 'Интервью со стейкхолдером', subtitle: 'симуляция элиситации: выбор вопросов', category: 'Навигация', to: '/trainer?domain=interview' },
  { id: 'p-defects', title: 'Диагностика дефектов', subtitle: 'найди дефект требования: неатомарность, неполнота, противоречивость', category: 'Навигация', to: '/trainer?domain=defects' },
  { id: 'p-practice', title: 'Практика', subtitle: 'интервальное повторение', category: 'Навигация', to: '/practice' },
  { id: 'p-knowledge', title: 'База знаний', subtitle: 'статьи и термины', category: 'Навигация', to: '/knowledge' },
  { id: 'p-toolkit', title: 'Инструментарий', subtitle: 'шаблоны и чек-листы', category: 'Навигация', to: '/toolkit' },
  { id: 'p-progress', title: 'Прогресс', subtitle: 'навыки и слабые зоны', category: 'Навигация', to: '/progress' },
  { id: 'p-settings', title: 'Настройки', category: 'Навигация', to: '/settings' }
];

export const searchIndex: SearchItem[] = [
  ...pages,
  ...knowledgeNodes.map((node) => ({
    id: `k-${node.id}`,
    title: node.title,
    subtitle: node.summary,
    category: 'База знаний',
    to: `/knowledge?node=${node.id}`
  })),
  ...sqlQuestLessons.map((lesson) => ({
    id: `sql-${lesson.id}`,
    title: lesson.title,
    subtitle: `SQL · ${lesson.sqlConcept}`,
    category: 'SQL',
    to: `/trainer?domain=sql&lesson=${lesson.id}`
  })),
  ...apiQuestTasks.map((task) => ({
    id: `api-${task.id}`,
    title: task.title,
    subtitle: task.domain.toUpperCase(),
    category: 'API',
    to: `/trainer?domain=${task.domain}`
  })),
  ...requirementsTasks.map((task) => ({
    id: `req-${task.id}`,
    title: task.title,
    subtitle: `Требования · ${task.domain}`,
    category: 'Требования',
    to: '/trainer?domain=requirements'
  }))
];

/** Простой офлайн-поиск: все слова запроса должны встретиться; ранжируем по совпадению заголовка. */
export function searchItems(query: string, limit = 24): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);

  const scored: Array<{ item: SearchItem; score: number }> = [];
  for (const item of searchIndex) {
    const title = item.title.toLowerCase();
    const hay = `${title} ${item.subtitle?.toLowerCase() ?? ''} ${item.category.toLowerCase()}`;
    if (!terms.every((term) => hay.includes(term))) continue;

    let score = 0;
    if (title === q) score += 100;
    else if (title.startsWith(q)) score += 50;
    else if (title.includes(q)) score += 25;
    if (item.category === 'Навигация') score += 5; // страницы чуть выше при равенстве
    scored.push({ item, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((entry) => entry.item);
}
