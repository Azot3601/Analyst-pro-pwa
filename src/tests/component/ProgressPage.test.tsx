import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const questMock = vi.hoisted(() => ({
  firstLessonId: 'q01-select-ledger',
  firstLessonTitle: 'Открыть книгу заказов'
}));

vi.mock('../../features/progress/progressDb', async () => {
  const actual = await vi.importActual<typeof import('../../features/progress/progressDb')>(
    '../../features/progress/progressDb'
  );
  return {
    ...actual,
    getProgress: vi.fn().mockResolvedValue({
      ...actual.defaultProgress,
      sqlQuest: {
        ...actual.defaultProgress.sqlQuest,
        solvedSqlLessonIds: [questMock.firstLessonId],
        xp: 40,
        attemptsByLessonId: { [questMock.firstLessonId]: 2 },
        recentlySolvedLessonIds: [questMock.firstLessonId],
        lastSqlLessonId: questMock.firstLessonId
      }
    })
  };
});

import { ProgressPage } from '../../pages/ProgressPage';

describe('ProgressPage', () => {
  it('shows real SQL Quest progress fields', async () => {
    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('XP в SQL Quest')).toBeInTheDocument());
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('SQL-задач решено')).toBeInTheDocument();
    expect(screen.getAllByText(questMock.firstLessonTitle).length).toBeGreaterThan(0);
    expect(screen.getByText('2 попыток')).toBeInTheDocument();
  });
});
