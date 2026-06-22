import { z } from 'zod';

export const artifactSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['table', 'json', 'openapi', 'text', 'erd', 'curl', 'log']),
  content: z.string()
});

export const hintSchema = z.object({
  id: z.string(),
  level: z.number().int().min(1).max(5),
  title: z.string(),
  text: z.string()
});

export const validationConfigSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('sql-result'),
    expectedRows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))),
    orderMatters: z.boolean().default(false)
  }),
  z.object({
    kind: z.literal('json-schema'),
    schema: z.record(z.string(), z.unknown())
  }),
  z.object({
    kind: z.literal('text-includes'),
    requiredPhrases: z.array(z.string())
  }),
  z.object({
    kind: z.literal('api-response'),
    method: z.string(),
    path: z.string(),
    expectedStatus: z.number().int(),
    requiredFields: z.array(z.string()).default([])
  })
]);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  domain: z.enum(['sql', 'rest', 'json', 'openapi', 'erd', 'integration', 'requirements', 'nfr']),
  level: z.enum(['junior', 'junior+', 'middle', 'middle+', 'senior-lite']),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  estimatedFocus: z.string(),
  skills: z.array(z.string()),
  caseContext: z.string(),
  businessGoal: z.string(),
  taskText: z.string(),
  inputArtifacts: z.array(artifactSchema),
  hints: z.array(hintSchema).min(1),
  expectedAnswer: z.unknown(),
  validation: validationConfigSchema,
  explanation: z.string(),
  commonMistakes: z.array(z.string()),
  relatedKnowledgeIds: z.array(z.string())
});

export const knowledgeNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['term', 'concept', 'case', 'checklist', 'anti-pattern', 'practice']),
  level: z.enum(['basic', 'intermediate', 'advanced']),
  summary: z.string(),
  fullText: z.string(),
  examples: z.array(z.string()),
  antiExamples: z.array(z.string()),
  related: z.array(
    z.object({
      id: z.string(),
      relation: z.enum([
        'prerequisite',
        'related',
        'used_in',
        'common_mistake',
        'example',
        'contrasts_with'
      ])
    })
  ),
  tags: z.array(z.string())
});

export const datasetCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.string(),
  license: z.string(),
  purpose: z.string(),
  taskIdeas: z.array(z.string()),
  restrictions: z.string(),
  status: z.enum(['used', 'evaluated', 'backlog', 'rejected'])
});

export const userProgressSchema = z.object({
  id: z.literal('local-user'),
  solvedTaskIds: z.array(z.string()),
  attempts: z.record(z.string(), z.number().int().nonnegative()),
  revealedHints: z.record(z.string(), z.array(z.string())),
  favoriteKnowledgeIds: z.array(z.string()),
  lastRoute: z.string(),
  lastTaskId: z.string().optional(),
  lastTaskIdsByDomain: z.record(z.string(), z.string()).optional(),
  skillLevels: z.record(z.string(), z.number().min(0).max(100)),
  weakZones: z.array(z.string()),
  streak: z.number().int().nonnegative(),
  notes: z.record(z.string(), z.string()),
  sqlQuest: z
    .object({
      solvedSqlLessonIds: z.array(z.string()),
      xp: z.number().int().nonnegative(),
      level: z.number().int().positive(),
      rankId: z.string(),
      unlockedRankIds: z.array(z.string()),
      attemptsByLessonId: z.record(z.string(), z.number().int().nonnegative()),
      revealedHintsByLessonId: z.record(z.string(), z.array(z.string())),
      currentChapterId: z.string(),
      lastSqlLessonId: z.string().optional(),
      recentlySolvedLessonIds: z.array(z.string())
    })
    .optional(),
  updatedAt: z.string()
});

export const toolkitItemSchema = z.object({
  id: z.string(),
  category: z.enum(['json', 'api', 'requirements', 'sql', 'integration', 'nfr', 'decision']),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  inputLabel: z.string().optional(),
  template: z.string(),
  checklist: z.array(z.string()),
  relatedKnowledgeIds: z.array(z.string())
});

export type Artifact = z.infer<typeof artifactSchema>;
export type Hint = z.infer<typeof hintSchema>;
export type ValidationConfig = z.infer<typeof validationConfigSchema>;
export type Task = z.infer<typeof taskSchema>;
export type KnowledgeNode = z.infer<typeof knowledgeNodeSchema>;
export type DatasetCard = z.infer<typeof datasetCardSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
export type ToolkitItem = z.infer<typeof toolkitItemSchema>;
