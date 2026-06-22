import { describe, expect, it } from 'vitest';
import { knowledgeNodes } from '../../data/knowledge';
import { tasks } from '../../data/tasks';
import { toolkitItems } from '../../data/toolkit';

describe('seed data integrity', () => {
  it('has representative content volume', () => {
    expect(tasks.length).toBeGreaterThanOrEqual(58);
    expect(tasks.filter((task) => task.domain === 'rest')).toHaveLength(8);
    expect(tasks.filter((task) => task.domain === 'json')).toHaveLength(8);
    expect(tasks.filter((task) => task.domain === 'openapi')).toHaveLength(6);
    expect(tasks.filter((task) => task.domain === 'integration')).toHaveLength(6);
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
