# 001 · Bazar: catálogo com painel e contato via WhatsApp

- **Status:** aprovada (Antonio, 2026-10-20, "tudo está aprovado desde já")
- **Projeto:** bazar (Next.js 16 híbrido: front-end + API)
- **Revisão 2 (2026-10-20):** Postgres (banco `bazar` no mesmo servidor do TrinketOS), imagens no R2, porta 3000 e CI/CD no modelo do Learn. Pedido do Antonio.

## Objetivo

Cadastrar itens pessoais à venda (estilo bazar) num painel simples e exibi-los numa rota pública, com contato pelo WhatsApp.

## Escopo

### Painel (`/admin`)
- Acesso por senha única (`ADMIN_PASSWORD`), sessão em cookie assinado (HMAC, `SESSION_SECRET`), 7 dias.
- CRUD de itens com os campos:
  - título curto (ex.: "Bicicleta"), nome completo opcional, marca, estado (novo, seminovo, usado, com defeito);
  - descrição, valor de venda (BRL), flag "já é o menor valor", flag "aceita troca";
  - situação (disponível, reservado, vendido);
  - tags livres;
  - especificações em chave/valor (sem tipagem por categoria; bicicleta e headset têm chaves diferentes);
  - seções de informação (título + texto) exibidas como acordeão;
  - imagem principal obrigatória + até 10 imagens adicionais.
- Upload de imagens (JPEG, PNG, WebP, AVIF; até 5 MB cada).

### Público
- `/`: grade com imagem principal + título curto; busca por texto (`?q=`).
- `/item/[id]`: carrossel (principal + adicionais), descritivo, troca, valor, "menor valor", tags, acordeão, tabela de especificações e botão "Entrar em contato pelo WhatsApp" com mensagem padrão contendo título, ID e URL do item (base em `NEXT_PUBLIC_SITE_URL` ou host da requisição).

### API
| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/items?q=` | público |
| GET | `/api/items/[id]` | público |
| POST | `/api/items` | admin |
| PUT/DELETE | `/api/items/[id]` | admin |
| POST | `/api/uploads` | admin |
| GET | `/api/images/[name]` | público |
| GET | `/api/health` | público (healthcheck do container) |
| POST | `/api/auth/login`, `/api/auth/logout` | público |

## Fora de escopo
Design elaborado, múltiplos usuários, pagamentos, categorias tipadas, preview/sandbox (só produção, como o Learn).

## Regras de domínio (TDD)
1. Título curto: 1 a 40 caracteres. Marca obrigatória.
2. Valor > 0, informado em BRL ("1.250,00" ou "1250.5"), armazenado em centavos.
3. Imagem principal obrigatória; adicionais ≤ 10; nomes de arquivo validados (sem path traversal).
4. Especificações: chave e valor não vazios; chaves duplicadas (case-insensitive) rejeitadas.
5. Link do WhatsApp: número só com dígitos, mensagem codificada com título, ID e URL.

## Arquitetura
- Split feature em `src/features/{items,uploads,auth}`; domínio puro em `domain/`, infraestrutura em `server/`.
- `ItemRepository` (porta) com adapters Postgres (`pg`) e in-memory. O adapter Postgres é testado contra PGlite (Postgres em WASM), sem Docker.
- Banco: `DATABASE_URL` aponta para o database `bazar` no servidor Postgres do TrinketOS. Migrações SQL imutáveis em `migrations/`, aplicadas no boot (`instrumentation.ts`) com advisory lock e tabela `schema_migrations`.
- Imagens: porta `ImageStorage` com adapters R2 (S3 API; variáveis `R2_*` iguais às da API do Trinket, prefixo `R2_PREFIX`, padrão `bazar/`) e disco local (dev sem R2). `/api/images/[name]` serve o objeto com cache imutável, então o bucket pode continuar privado.
- Arquivos ≤ 200 linhas.

### Fluxo
```
Visitante → / (lista) → /item/[id] → wa.me/<número>?text=<mensagem com ID e URL>
Antonio → /admin/login → /admin (lista) → form → POST /api/uploads → R2
                                                              → POST|PUT /api/items → Postgres (bazar)
```
Diagrama Excalidraw: não aplicável neste MVP (fluxo linear descrito acima); criar se o escopo crescer.

### Entrega (CI/CD, modelo Learn)
- `.github/workflows/production.yml`: push em `main` → `pnpm qa` → build e push da imagem no GHCR (`ghcr.io/<owner>/<repo>`, tags `<sha>` e `production`) → SSH na VPS → `docker compose pull && up -d` → espera `healthy` → smoke test público em `/api/health`.
- Container `bazar-production`, Next standalone, `127.0.0.1:3000:3000`, 512 MB.
- Secrets: `BAZAR_ENV_PRODUCTION` (conteúdo do .env de produção), `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`, `SSH_PASSWORD`. Variável: `BAZAR_PUBLIC_URL`.
- Nginx/DNS/Certbot na VPS seguem o procedimento do Learn, apontando para a porta 3000.

## Critérios de aceite
- [ ] Sem sessão, `/admin` redireciona para login e APIs de escrita retornam 401.
- [ ] Cadastro rejeita item sem imagem principal, com > 10 adicionais ou valor inválido.
- [ ] Itens com especificações diferentes (bicicleta vs headset) exibem tabelas próprias.
- [ ] Busca filtra por título, nome, marca, tags e descrição.
- [ ] Botão do WhatsApp abre conversa com mensagem contendo ID e URL do item.
- [ ] `pnpm qa` e `pnpm build` passam.
- [ ] Repositório Postgres passa a mesma suíte do in-memory (PGlite).
- [ ] Upload grava no R2 quando `R2_*` está configurado; sem R2, grava em disco.
- [ ] `/api/health` retorna 200 com banco acessível e 503 sem banco.
- [ ] Imagem Docker sobe na porta 3000 e o workflow segue as etapas do Learn.
