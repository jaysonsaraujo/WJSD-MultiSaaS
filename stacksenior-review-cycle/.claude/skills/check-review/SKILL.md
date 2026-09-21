---
name: check-review
description: >-
  Closes the review loop after the PR author answers a post-review: re-judges each justification or fix, resolves what holds, and approves with a human closing message when everything is settled. Use when the user asks for check-review, /check-review, or to verify/close the author's review replies.
argument-hint: "[número-do-PR]"
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git *), Bash(jq *), Bash(printf *), Bash(read *), Read, Grep, Glob, Write, AskUserQuestion
---

# Check-review

Leia completamente e siga a skill canônica em
`.agents/skills/check-review/SKILL.md`. Argumento = número do PR; vazio = PR da
branch atual.
