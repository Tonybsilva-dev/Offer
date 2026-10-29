# Padrão de workflow (CI/CD em etapas)

Modelo: `design-trinketos` (etapas separadas, ramos em paralelo). Todo projeto novo segue o mesmo desenho; só a etapa de **qualidade** muda por linguagem.

```
quality ─┬─ build ─┬─ deploy ── smoke ─┐
         │         └─ scan ────────────┤
         ├─ audit ─────────────────────┤
         └─ (ramos do projeto: release npm, chromatic...) ─┤
                                       notify (sempre)
```

| Etapa | Onde mora | Bloqueia o deploy? | Observação |
|---|---|---|---|
| `quality` | `quality.yml` do próprio projeto (também roda em PR) | sim | específica da linguagem (`pnpm qa`, Maven, pytest) |
| `build` | `.github/workflows/build-image.yml` do próprio projeto | sim | tag imutável = sha; SBOM e *provenance*; cache GHA por serviço |
| `deploy` | `deploy-service.yml` | — | grava `.env.production`, espera *healthy*, **rollback automático**, ambiente `Production` |
| `smoke` | `smoke-test.yml` | não (roda depois) | consulta a URL pública; ligar com a variável `<PRODUTO>_SMOKE_ENABLED=true` depois da virada do DNS |
| `scan` | `image-scan.yml` | não (paralelo) | Trivy HIGH/CRITICAL; só informa no resumo |
| `audit` | job do projeto | não (`continue-on-error`) | `pnpm audit --prod` ou equivalente |
| ramos próprios | job do projeto, `needs: quality` | não | ex.: publicar pacote npm, Chromatic; nunca dentro de `deploy` |
| `notify` | `notify.yml` | — | **obrigatório**: roda com `if: always()`, resume todas as etapas e **falha** se o webhook não existir |

## Regras

1. Um arquivo por responsabilidade; o que é igual em todo projeto vive em `.github/workflows/` do projeto e é chamado por `uses: ./`. Nenhum projeto copia passos de build, SSH ou aviso.
2. `deploy` só roda em `main` e com `!cancelled() && !failure()`; assim o rollback manual (`image_tag` preenchido) pula `quality` e `build` e reimplanta uma tag antiga.
3. Etapa nova que não precisa travar o deploy vira **ramo**, não passo dentro de outro job.
4. `notify` lista todas as etapas em `needs`; ao criar um ramo novo, inclua-o ali.
5. Segredos: `SSH_*`, `<PRODUTO>_ENV_PRODUCTION` (vira `.env.production` na VPS), `DISCORD_WEBHOOK_PRODUCTION`. Variáveis: `<PRODUTO>_PUBLIC_URL`, `<PRODUTO>_SMOKE_ENABLED`.

## Exemplo completo

`bazar/.github/workflows/production-vps.yml` (Offer) e `quality.yml`.
