# AGENTS

This project uses role prompts in `agents/` as operational review instructions for real Codex subagents.

## How To Use

When a change touches product quality, content, SQL lessons, UI/UX, PWA behavior, or tests, spawn real subagents and pass the relevant `agents/*.md` role prompt as task context.

Recommended review set:

- `agents/product-architect-agent.md`
- `agents/system-analyst-mentor-agent.md`
- `agents/curriculum-designer-agent.md`
- `agents/sql-challenge-agent.md`
- `agents/api-integration-agent.md`
- `agents/knowledge-graph-agent.md`
- `agents/toolkit-agent.md`
- `agents/ui-ux-motion-agent.md`
- `agents/pwa-offline-agent.md`
- `agents/qa-test-agent.md`
- `agents/data-security-agent.md`
- `agents/documentation-keeper-agent.md`

## Output Rule

Agents must return concise review reports, not hidden reasoning:

- scope checked;
- files inspected;
- pass/fail checklist;
- findings ordered by severity;
- concrete recommendations;
- residual risks.

Review summaries are recorded in `docs/AGENT_REVIEW_LOG.md`.

## Mandatory Security Review

Spawn `agents/data-security-agent.md` before:

- adding environment variables;
- changing authentication, storage, PWA caching, build/deploy scripts, or external integrations;
- committing a large dependency/config change;
- publishing or sharing the repository.

Run `npm run security:scan` as a local baseline check.
