import { describe, expect, it } from 'vitest';
import {
  requirementsTasks,
  type ClassificationTask,
  type QuestionsTask,
  type StoryTask
} from '../../data/requirementsQuest';
import {
  checkClassification,
  checkQuestions,
  checkStory
} from '../../shared/lib/requirementsCheckers';

const classificationTask = requirementsTasks.find(
  (task): task is ClassificationTask => task.kind === 'classification'
)!;
const questionsTask = requirementsTasks.find(
  (task): task is QuestionsTask => task.kind === 'questions'
)!;
const storyTask = requirementsTasks.find((task): task is StoryTask => task.kind === 'story')!;

describe('requirementsQuest data is internally solvable', () => {
  it('covers every task kind across multiple domains', () => {
    const kinds = new Set(requirementsTasks.map((task) => task.kind));
    expect(kinds).toEqual(new Set(['classification', 'questions', 'story']));
    // Несколько доменов (возврат, онбординг, отмена, KYC, резерв…).
    expect(new Set(requirementsTasks.map((task) => task.domain)).size).toBeGreaterThanOrEqual(5);
  });

  it('every task id is unique', () => {
    const ids = requirementsTasks.map((task) => task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Ключевой инвариант: эталонное решение КАЖДОЙ задачи проходит свой чекер.
  // Ловит опечатки в id клауз/ролей/вопросов при добавлении новых доменов.
  it.each(requirementsTasks.map((task) => [task.id, task] as const))(
    'reference solution passes the checker for %s',
    (_id, task) => {
      if (task.kind === 'classification') {
        const key = Object.fromEntries(task.rule.statements.map((s) => [s.id, s.label]));
        expect(checkClassification(key, task.rule).ok).toBe(true);
      } else if (task.kind === 'questions') {
        const requiredIds = task.rule.options.filter((o) => o.required).map((o) => o.id);
        expect(checkQuestions(requiredIds, task.rule).ok).toBe(true);
      } else {
        const reference = {
          roleId: task.rule.roleId,
          clauseIds: task.rule.requiredClauseIds,
          edgeCaseIds: task.rule.edgeRequiredIds
        };
        expect(checkStory(reference, task.rule).ok).toBe(true);
      }
    }
  );
});

describe('checkClassification', () => {
  const key = Object.fromEntries(
    classificationTask.rule.statements.map((statement) => [statement.id, statement.label])
  );

  it('accepts the reference labelling', () => {
    expect(checkClassification(key, classificationTask.rule).ok).toBe(true);
  });

  it('flags an unclassified statement', () => {
    const { s1, ...rest } = key;
    void s1;
    const result = checkClassification(rest, classificationTask.rule);
    expect(result.ok).toBe(false);
    expect(result.diagnostics[0].code).toBe('requirements-unclassified');
  });

  it('flags a misclassified statement', () => {
    const result = checkClassification({ ...key, s4: 'functional' }, classificationTask.rule);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain('requirements-misclassified');
  });
});

describe('checkQuestions', () => {
  const requiredIds = questionsTask.rule.options
    .filter((option) => option.required)
    .map((option) => option.id);

  it('accepts exactly the required questions', () => {
    expect(checkQuestions(requiredIds, questionsTask.rule).ok).toBe(true);
  });

  it('flags missing required questions', () => {
    const result = checkQuestions(requiredIds.slice(1), questionsTask.rule);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((item) => item.code)).toContain('requirements-missing-questions');
  });

  it('warns (without erroring) when a noise question is picked', () => {
    const noiseId = questionsTask.rule.options.find((option) => !option.required)!.id;
    const result = checkQuestions([...requiredIds, noiseId], questionsTask.rule);
    expect(result.diagnostics.map((item) => item.code)).toContain('requirements-noise-questions');
    expect(result.diagnostics.find((item) => item.code === 'requirements-noise-questions')?.severity).toBe('warning');
  });
});

describe('checkStory', () => {
  const reference = {
    roleId: storyTask.rule.roleId,
    clauseIds: storyTask.rule.requiredClauseIds,
    edgeCaseIds: storyTask.rule.edgeRequiredIds
  };

  it('accepts the reference story', () => {
    expect(checkStory(reference, storyTask.rule).ok).toBe(true);
  });

  it('flags the wrong role', () => {
    const otherRole = storyTask.rule.roleOptions.find((option) => option.id !== storyTask.rule.roleId)!.id;
    const result = checkStory({ ...reference, roleId: otherRole }, storyTask.rule);
    expect(result.diagnostics.map((item) => item.code)).toContain('story-role');
  });

  it('flags a distractor acceptance criterion', () => {
    const distractor = storyTask.rule.clausePool.find(
      (clause) => !storyTask.rule.requiredClauseIds.includes(clause.id)
    )!.id;
    const result = checkStory(
      { ...reference, clauseIds: [...reference.clauseIds, distractor] },
      storyTask.rule
    );
    expect(result.diagnostics.map((item) => item.code)).toContain('story-acceptance-criteria');
  });

  it('flags missing edge cases', () => {
    const result = checkStory({ ...reference, edgeCaseIds: [] }, storyTask.rule);
    expect(result.diagnostics.map((item) => item.code)).toContain('story-edge-cases');
  });
});
