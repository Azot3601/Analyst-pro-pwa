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
  it('has one task of each kind', () => {
    const kinds = requirementsTasks.map((task) => task.kind).sort();
    expect(kinds).toEqual(['classification', 'questions', 'story']);
  });
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
