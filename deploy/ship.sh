#!/usr/bin/env bash
# Build local da imagem e envio por SSH à VPS, sem GHCR nem Actions (mesma estratégia do alfa-academia).
# Caminho alternativo ao workflow production-vps.yml, para quando o Actions não roda.
# A imagem leva o mesmo nome do GHCR, então o compose da VPS (infra-vps) serve sem alteração:
# com a imagem já carregada, o `up` não tenta baixar nada.
# Uso: deploy/ship.sh            roda o QA, constrói e envia; não sobe nada
#      deploy/ship.sh --up       também troca o container, espera ficar healthy e volta à tag anterior se falhar
# O .env.production da VPS não é tocado: variável nova de runtime precisa ser gravada lá antes.
set -euo pipefail
cd "$(dirname "$0")/.."

host=${DEPLOY_HOST:-hostinger}
dir=/srv/infra-vps/apps/offer/production/web
image=ghcr.io/tonybsilva-dev/offer
site_url=${NEXT_PUBLIC_SITE_URL:-https://offer.antoniobsilva.com.br}
tag=$(git rev-parse HEAD)
[ -z "$(git status --porcelain)" ] || { tag="$tag-wip$(date +%Y%m%d%H%M)"; echo "aviso: working tree com alterações; tag $tag."; }

# O Actions rodava o QA antes do build; aqui ele roda na estação.
[ "${SKIP_QA:-}" = "1" ] || bash scripts/qa.sh

docker build --build-arg "NEXT_PUBLIC_SITE_URL=$site_url" -t "$image:$tag" .
docker save "$image:$tag" | gzip | ssh "$host" 'gunzip | docker load'
echo "imagem $image:$tag enviada"

[ "${1:-}" = "--up" ] || { echo "para subir: deploy/ship.sh --up"; exit 0; }

# Roda na VPS: troca só a linha IMAGE_TAG do .env, sobe e registra no mesmo deploy.log do deploy-service.sh.
ssh "$host" "bash -s -- '$dir' '$tag'" <<'REMOTE'
set -euo pipefail
dir=$1; tag=$2
cd "$dir"
exec 9>.deploy.lock
flock -w 300 9 || { echo "outro deploy de offer/web ainda está em andamento"; exit 1; }
say() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a deploy.log; }
set_tag() {
  local tmp; tmp=$(mktemp .env.XXXXXX)
  { grep -v '^IMAGE_TAG=' .env 2>/dev/null || true; printf 'IMAGE_TAG=%s\n' "$1"; } > "$tmp"
  chmod 600 "$tmp"; mv "$tmp" .env
}
apply() { docker compose up -d --wait --wait-timeout 180; }

previous=$(sed -nE 's/^IMAGE_TAG=(.+)$/\1/p' .env 2>/dev/null | tail -1 || true)
say "deploy offer/web tag=$tag (anterior: ${previous:-nenhuma}) [ship.sh, imagem local]"
set_tag "$tag"
if apply; then
  cp .env.production .env.production.ok && chmod 600 .env.production.ok
  say "ok offer/web tag=$tag healthy"
  exit 0
fi

say "FALHOU offer/web tag=$tag"
if [ -n "$previous" ] && [ "$previous" != "$tag" ]; then
  say "rollback para tag=$previous"
  set_tag "$previous"
  if apply; then say "rollback ok tag=$previous"; else say "rollback FALHOU tag=$previous"; fi
else
  say "sem tag anterior para voltar"
fi
exit 1
REMOTE
echo "offer-web-production no ar com a tag $tag"
