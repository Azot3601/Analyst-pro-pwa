// Патчноут: что нового в приложении. Новые записи — сверху.
export type ChangeTag = 'Новое' | 'Улучшено' | 'Исправлено';

export type Change = { tag: ChangeTag; text: string; to?: string };
export type Release = { version: string; title: string; changes: Change[] };

export const changelog: Release[] = [
  {
    version: 'v0.9',
    title: 'Обучение с нуля и повторение',
    changes: [
      { tag: 'Новое', text: 'Экран «Практика» — интервальное повторение решённых тем, чтобы навык не утекал', to: '/practice' },
      { tag: 'Улучшено', text: 'SQL-задачи теперь с каркасом вместо готового ответа + эталон Софи после решения', to: '/trainer' },
      { tag: 'Новое', text: 'REST: разбор запроса по частям и режим «Кратко/Подробно»', to: '/trainer' },
      { tag: 'Новое', text: 'Самопроверка (квиз) в конце статей базы знаний', to: '/knowledge?node=agile' },
      { tag: 'Новое', text: 'Кластер процессов: SDLC, Agile, Scrum, Kanban, спринт, бэклог', to: '/knowledge?node=sdlc' }
    ]
  },
  {
    version: 'v0.8',
    title: 'Профессия и целостный взгляд',
    changes: [
      { tag: 'Новое', text: 'Большая статья «Профессия»: этапы, стейкхолдеры, «Как системы общаются», разбор кейсов', to: '/profession' },
      { tag: 'Улучшено', text: 'База знаний: статьи с диаграммами и подсветкой терминов (превью при наведении)', to: '/knowledge' },
      { tag: 'Новое', text: 'Термины требований: валидация/верификация, элиситация, MoSCoW, прослеживаемость', to: '/knowledge?node=валидация' }
    ]
  },
  {
    version: 'v0.7',
    title: 'Атмосфера и вайб',
    changes: [
      { tag: 'Новое', text: 'Permalith с анимированным названием, наставница Софи и фон с деревнями' },
      { tag: 'Новое', text: 'Мягкие звуки успеха/ошибки — включаются в настройках', to: '/settings' },
      { tag: 'Исправлено', text: 'Светлая тема стала читаемой', to: '/settings' }
    ]
  },
  {
    version: 'v0.6',
    title: 'Карта знаний',
    changes: [
      { tag: 'Улучшено', text: 'Граф знаний переделан в аккуратный mindmap — без запутанных линий', to: '/knowledge' }
    ]
  }
];
