import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../../app/App';

describe('App', () => {
  it('renders Russian app shell', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Permalith')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Тренажёр').length).toBeGreaterThan(0);
  });
});
