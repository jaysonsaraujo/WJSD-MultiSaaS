#!/usr/bin/env bash
# Autoteste do pacote. Sai 1 no primeiro defeito.
set -euo pipefail
cd "$(dirname "$0")"
fail() { echo "FALHA: $*" >&2; exit 1; }

SKILLS=(post-review do-review check-review)
for s in "${SKILLS[@]}"; do
  [ -f ".agents/skills/$s/SKILL.md" ] || fail "canônico ausente: .agents/skills/$s/SKILL.md"
  for host in .claude .codex .cursor; do
    w="$host/skills/$s/SKILL.md"
    [ -f "$w" ] || fail "wrapper ausente: $w"
    grep -q "\.agents/skills/$s/SKILL\.md" "$w" || fail "$w não aponta pro canônico"
  done
done
for f in lenses.md project-catalog.md; do
  [ -f ".agents/skills/post-review/$f" ] || fail "post-review/$f ausente"
done

FORBIDDEN='avante|jira|rizzo|develop|ADR-031|domains/|fabr[ií]cio|grok|opencode|no-fragmentation|enforce-feature-api-modules|FRONTEND-'
if grep -rniE "$FORBIDDEN" .agents .claude .codex .cursor README.md; then
  fail "resíduo do projeto de origem encontrado acima"
fi

[ -x install.sh ] || fail "install.sh não é executável"
echo "OK"
