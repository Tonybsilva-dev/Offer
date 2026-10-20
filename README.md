# Bazar

Catálogo simples de itens à venda (Next.js 16: front-end + API), com painel e contato via WhatsApp.
Spec: [specs/001-bazar-catalogo/spec.md](specs/001-bazar-catalogo/spec.md).

## Rodar

```bash
cp .env.example .env.local   # preencha ADMIN_PASSWORD, SESSION_SECRET e WHATSAPP_NUMBER
pnpm install
pnpm dev                     # http://localhost:3000
```

- Vitrine: `/` · Item: `/item/<id>` · Painel: `/admin` (login em `/admin/login`) · Health: `/api/health`
- **Banco:** `DATABASE_URL` aponta para o database `bazar` (mesmo servidor Postgres do TrinketOS). Sem ela, em dev, usa Postgres embutido (PGlite) em `./data/pglite`. Migrações em `src/shared/server/migrations`, aplicadas na primeira conexão.
- **Fotos:** com `R2_*` preenchido, vão para o R2 (prefixo `R2_PREFIX`, padrão `bazar/`); sem, em dev, para `./data/uploads`. Em produção, banco e R2 são obrigatórios.

## Deploy (modelo do Learn)

Push em `main` → `pnpm qa` → imagem no GHCR → SSH na VPS → `docker compose up` → espera `healthy` → smoke test em `/api/health`. Container `bazar-production` em `127.0.0.1:3000`.

Configurar no GitHub (repositório → Settings):
- Secrets: `BAZAR_ENV_PRODUCTION` (conteúdo completo do .env de produção), `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`, `SSH_PASSWORD`
- Variables: `BAZAR_PUBLIC_URL` (ex.: `https://bazar.seudominio.com.br`)
- Environment: `Production`

Na VPS: Nginx/DNS/Certbot iguais ao Learn, com `proxy_pass http://127.0.0.1:3000`.

## Scripts

`pnpm qa` (lint + typecheck + testes) · `pnpm test` · `pnpm build` · `pnpm start`

## Estrutura

```
src/features/items     domínio (schema, preço, WhatsApp), repositórios Postgres/in-memory, UI pública e admin
src/features/uploads   validação por magic bytes; armazenamento R2 ou disco local
src/features/auth      sessão por cookie assinado (HMAC)
src/shared/server      conexão Postgres, migrações, env
src/app                páginas e route handlers (/api/items, /api/uploads, /api/images, /api/auth, /api/health)
```
