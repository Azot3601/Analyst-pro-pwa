# KNOWLEDGE_GRAPH_MODEL

## Node

```ts
type KnowledgeNode = {
  id: string
  title: string
  type: 'term' | 'concept' | 'case' | 'checklist' | 'anti-pattern' | 'practice'
  level: 'basic' | 'intermediate' | 'advanced'
  summary: string
  fullText: string
  examples: string[]
  antiExamples: string[]
  related: {
    id: string
    relation:
      | 'prerequisite'
      | 'related'
      | 'used_in'
      | 'common_mistake'
      | 'example'
      | 'contrasts_with'
  }[]
  tags: string[]
}
```

## Правила

- Каждый node должен иметь минимум одну связь, кроме стартовых корневых понятий.
- Связи проверяются тестами на битые `id`.
- Задачи ссылаются на знания через `relatedKnowledgeIds`.
