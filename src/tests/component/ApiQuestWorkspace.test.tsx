import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultProgress } from '../../features/progress/progressDb';
import { ApiQuestWorkspace } from '../../features/trainer/api/ApiQuestWorkspace';
import * as apiSimulator from '../../shared/lib/apiSimulator';

vi.mock('../../features/progress/progressDb', async () => {
  const actual = await vi.importActual<typeof import('../../features/progress/progressDb')>(
    '../../features/progress/progressDb'
  );
  return {
    ...actual,
    getProgress: vi.fn(async () => defaultProgress),
    recordApiTaskAttempt: vi.fn(async () => defaultProgress),
    revealApiTaskHint: vi.fn(async () => defaultProgress),
    solveApiTask: vi.fn(async () => defaultProgress),
    setLastApiTask: vi.fn(async () => defaultProgress)
  };
});

describe('ApiQuestWorkspace', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lets the learner assemble and validate a REST request', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ApiQuestWorkspace domain="rest" />
      </MemoryRouter>
    );

    expect(await screen.findByText('Введение: как гонец API несёт приказ')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Мини-практика: значение orderId'), 'ORD-1001');
    expect(screen.getByText('/api/v1/orders/ORD-1001')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Перейти к первой задаче' }));
    expect(screen.queryByLabelText('Мини-практика: значение orderId')).not.toBeVisible();

    await user.type(screen.getByTestId('rest-path-param-orderId'), 'ORD-1001');
    expect(screen.getByTestId('computed-rest-url')).toHaveTextContent('/api/v1/orders/ORD-1001');
    await user.click(screen.getByRole('button', { name: 'Отправить / Проверить' }));

    expect(await screen.findByText('Контракт выполнен')).toBeInTheDocument();
    expect(screen.getAllByText(/HTTP 200/).length).toBeGreaterThan(0);
  });

  it('sends the computed Final URL to the local API simulator', async () => {
    const user = userEvent.setup();
    const simulatorSpy = vi.spyOn(apiSimulator, 'simulateApiRequest');
    render(<MemoryRouter><ApiQuestWorkspace domain="rest" /></MemoryRouter>);

    await user.type(await screen.findByTestId('rest-path-param-orderId'), 'ORD-1001');
    await user.click(screen.getByRole('button', { name: 'Отправить / Проверить' }));

    expect(simulatorSpy).toHaveBeenCalledWith(expect.objectContaining({ path: '/api/v1/orders/ORD-1001' }));
    simulatorSpy.mockRestore();
  });

  it('shows beginner guidance, test values and a non-mutating example', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ApiQuestWorkspace domain="rest" /></MemoryRouter>);

    expect(await screen.findByText('Перед решением')).toBeInTheDocument();
    expect(screen.getAllByText('Где это в жизни')).toHaveLength(1);
    expect(screen.getByText(/orderId: ORD-1001/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Показать пример заполнения' }));
    expect(screen.getByTestId('rest-example-panel')).toHaveTextContent('/api/v1/orders/ORD-1001');
    expect(screen.getByTestId('rest-path-param-orderId')).toHaveValue('');
  });

  it('shows a body contract and one grouped error for an empty POST request', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ApiQuestWorkspace domain="rest" /></MemoryRouter>);

    await user.selectOptions(await screen.findByLabelText('Учебная задача'), 'api-quest-rest-2');
    expect(screen.queryByText('Введение: как гонец API несёт приказ')).not.toBeInTheDocument();
    expect(await screen.findByText('Контракт JSON body')).toBeInTheDocument();
    expect(screen.getByText(/customerId: string/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Путь endpoint'), '/api/v1/orders');
    await user.click(screen.getByRole('button', { name: 'Отправить / Проверить' }));

    expect(await screen.findByText('rest-request-incomplete')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getAllByText(/Content-Type/i).length).toBeGreaterThan(0);
  });

  it('explains when the parameter name is entered instead of its value', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ApiQuestWorkspace domain="rest" />
      </MemoryRouter>
    );

    await user.type(await screen.findByTestId('rest-path-param-orderId'), 'orderId');
    await user.click(screen.getByRole('button', { name: 'Отправить / Проверить' }));

    expect(await screen.findByText('rest-path-param-not-substituted')).toBeInTheDocument();
    expect(screen.getByText(/имя параметра.*конкретное значение/i)).toBeInTheDocument();
    expect(screen.queryByText('rest-status')).not.toBeInTheDocument();
    expect(screen.queryByText('rest-response-field')).not.toBeInTheDocument();
  });

  it('explains a missing required JSON field', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ApiQuestWorkspace domain="json" />
      </MemoryRouter>
    );

    await user.click(await screen.findByRole('button', { name: 'Проверить JSON' }));

    expect((await screen.findAllByText('missing-required')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/обязательн/i).length).toBeGreaterThan(0);
  });

  it('finds missing OpenAPI responses', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ApiQuestWorkspace domain="openapi" />
      </MemoryRouter>
    );

    await user.selectOptions(await screen.findByLabelText('Учебная задача'), 'api-quest-openapi-3');
    await user.click(screen.getByRole('button', { name: 'Проверить контракт' }));

    expect((await screen.findAllByText('openapi-response')).length).toBeGreaterThan(0);
  });

  it('checks idempotency and retry concepts in an integration scenario', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ApiQuestWorkspace domain="integration" />
      </MemoryRouter>
    );

    for (const concept of ['eventId', 'идемпотентность', 'retry', 'подпись']) {
      await user.click(await screen.findByRole('checkbox', { name: concept }));
    }
    await user.click(screen.getByRole('button', { name: 'Проверить решение' }));

    expect(await screen.findByText('Контракт выполнен')).toBeInTheDocument();
  });
});
