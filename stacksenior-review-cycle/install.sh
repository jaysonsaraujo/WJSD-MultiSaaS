#!/usr/bin/env bash
# Instala o Review Cycle num projeto criado a partir do Stack Sênior.
# Uso: ./install.sh /caminho/do/projeto
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:?uso: ./install.sh /caminho/do/projeto}"
[ -f "$DEST/.claude/docs/guardrails-catalog.md" ] \
  || { echo "Alvo não parece um projeto Stack Sênior (sem .claude/docs/guardrails-catalog.md)." >&2; exit 1; }
for s in post-review do-review check-review; do
  for dir in .agents .claude .codex .cursor; do
    mkdir -p "$DEST/$dir/skills"
    rm -rf "$DEST/$dir/skills/$s"
    cp -R "$SRC/$dir/skills/$s" "$DEST/$dir/skills/$s"
  done
done
echo "Instalado em $DEST: /post-review, /do-review, /check-review (Claude Code, Codex e Cursor)."
echo "Opcional: defina \$API_CONTRACT_PATH na seção 'Contrato de API' do CLAUDE.md para ativar a lente de contratos."
