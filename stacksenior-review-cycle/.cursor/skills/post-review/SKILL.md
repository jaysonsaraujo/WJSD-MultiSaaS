---
name: post-review
description: >-
  Adversarial senior PR review against the PR base: ultracode lenses via subagents, devil's-advocate filter, then GitHub inline and general comments. Use when the user asks for post-review, adversarial review, deep PR review, or /post-review.
argument-hint: "[número-do-PR]"
disable-model-invocation: true
---

# Post-review

Leia completamente e siga a skill canônica em
`.agents/skills/post-review/SKILL.md`. Argumento = número do PR; vazio = PR da
branch atual.

Específico deste host: lentes via subagentes do próprio host, modelo e reasoning herdados da sessão (registre isso no relatório). Estrutura e ordem das lentes: §2 do canônico.
