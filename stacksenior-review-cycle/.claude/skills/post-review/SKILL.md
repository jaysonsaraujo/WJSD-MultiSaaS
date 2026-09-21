---
name: post-review
description: >-
  Adversarial senior PR review against the PR base: ultracode lenses via subagents, devil's-advocate filter, then GitHub inline and general comments. Use when the user asks for post-review, adversarial review, deep PR review, or /post-review.
argument-hint: "[número-do-PR]"
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git *), Bash(bun *), Bash(jq *), Read, Grep, Glob, Workflow, AskUserQuestion
---

# Post-review

Leia completamente e siga a skill canônica em
`.agents/skills/post-review/SKILL.md`. Argumento = número do PR; vazio = PR da
branch atual.

Específico deste host: ultracode = tool **Workflow** num único workflow, modelo **Opus** (`model: "opus"` nos agentes); nunca o tool Agent/Task para as lentes.
