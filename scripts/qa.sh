#!/usr/bin/env bash
# QA completo antes de subir: o que o CI cobra, rodando na sua máquina.
#   1. pnpm qa     lint, tipos e testes
#   2. pnpm audit  dependências de produção com vulnerabilidade HIGH ou pior
#   3. actions     toda `uses:` dos workflows aponta para uma versão que existe
# Uso: pnpm qa:full   (também roda sozinho no git push, ver .githooks/pre-push)
set -euo pipefail
cd "$(dirname "$0")/.."

step() { printf '\n==> %s\n' "$1"; }

step "1/3 lint, tipos e testes"
pnpm qa

step "2/3 auditoria de dependências"
pnpm run audit

step "3/3 versões das actions dos workflows"
fail=0
while IFS= read -r ref; do
  repo=${ref%@*}; ver=${ref#*@}
  case "$repo" in ./*) continue ;; esac
  # SHA completo não aparece em ls-remote: é conferido pelo próprio GitHub no CI.
  if [[ "$ver" =~ ^[0-9a-f]{40}$ ]]; then continue; fi
  slug=$(cut -d/ -f1,2 <<<"$repo")
  if git ls-remote --exit-code "https://github.com/$slug" "refs/tags/$ver" "refs/heads/$ver" >/dev/null 2>&1; then
    echo "  ok     $ref"
  else
    echo "  FALTA  $ref (versão não existe)"; fail=1
  fi
done < <(grep -rhoE 'uses:[[:space:]]+[^[:space:]#]+@[^[:space:]#]+' .github/workflows | sed -E 's/uses:[[:space:]]+//' | sort -u)
[ "$fail" -eq 0 ] || { echo "QA falhou: corrija as actions acima"; exit 1; }

printf '\nQA completo: tudo passou.\n'
