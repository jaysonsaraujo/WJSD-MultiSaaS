---
name: do-review
description: >-
  Author-side answer to a PR review: triages each finding with the user, fixes what is accepted, justifies what is contested, and replies on every thread. Use when the user asks for do-review, /do-review, or to address/answer the review comments on a PR.
argument-hint: "[número-do-PR]"
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git *), Bash(bun *), Bash(jq *), Bash(printf *), Bash(read *), Read, Grep, Glob, Edit, Write, AskUserQuestion
---

# Do-review

Leia completamente e siga a skill canônica em
`.agents/skills/do-review/SKILL.md`. Argumento = número do PR; vazio = PR da
branch atual.
