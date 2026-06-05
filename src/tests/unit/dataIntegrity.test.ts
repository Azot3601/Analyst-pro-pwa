import { describe, expect, it } from 'vitest';
import { knowledgeNodes } from '../../data/knowledge';
import { tasks } from '../../data/tasks';
import { toolkitItems } from '../../data/toolkit';

describe('seed data integrity', () => {
  it('has representative content volume', () => {
    expect(tasks.length).toBeGreaterThanOrEqual(90);
    expect(knowledgeNodes.length).toBeGreaterThanOrEqual(80);
    expect(toolkitItems.length).toBeGreaterThanOrEqual(20);
  });

  it('does not contain broken knowledge relations', () => {
    const ids = new Set(knowledgeNodes.map((node) => node.id));
    const broken = knowledgeNodes.flatMap((node) => node.related.filter((relation) => !ids.has(relation.id)));
    expect(broken).toEqual([]);
  });

  it('tasks reference existing knowledge or documented backlog ids', () => {
    const ids = new Set(knowledgeNodes.map((node) => node.id));
    const missing = tasks.flatMap((task) => task.relatedKnowledgeIds.filter((id) => !ids.has(id)));
    expect(missing).toEqual([]);
  });
});
