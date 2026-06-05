import { describe, expect, it } from 'vitest';
import { defaultProgress } from '../../features/progress/progressDb';

describe('progress defaults', () => {
  it('starts with local user and skill levels', () => {
    expect(defaultProgress.id).toBe('local-user');
    expect(defaultProgress.skillLevels.SQL).toBeGreaterThan(0);
  });
});
