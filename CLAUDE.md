# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é o VetTrack

SaaS B2B de acompanhamento em tempo real de atendimentos veterinários com notificação automática via WhatsApp para tutores. O profissional atualiza o status com 2 toques; o tutor recebe no WhatsApp sem baixar nenhum app.

## Comandos

```bash
pnpm dev              # Desenvolvimento (localhost:3000)
pnpm build            # Build de produção
pnpm lint             # ESLint
pnpm db:generate      # Gerar Prisma Client após alterar schema
pnpm db:push          # Sincronizar schema com banco (dev, sem migration)
pnpm db:migrate       # Criar migration formal (produção)
pnpm db:studio        # Prisma Studio para visualizar dados
```

## Stack

- **Next.js 14** (App Router) + TypeScript — monolito, sem backend separado
- **Prisma 7** com PostgreSQL no Supabase
- **Supabase Auth** (JWT), **Supabase Storage** (fotos/vídeos), **Supabase Realtime** (WebSocket)
- **Upstash Redis** via API REST (serverless) — fila assíncrona de WhatsApp
- **Meta Cloud API** — templates Utility `pet_status_update` e `pet_status_media`
- **Tailwind CSS** + DM Sans font
- **Vercel** com cron job (`/api/queue/process`) a cada minuto

## Arquitetura

**Padrão:** Vertical Slice — cada feature tem seus próprios arquivos isolados.

**Fluxo principal (avançar estágio):**
```
Server Action advanceStage()
  → Valida transição de estágio
  → Upload mídia → Supabase Storage (se houver)
  → Transaction: UPDATE atendimento + INSERT stage_log
  → Enqueue job → Upstash Redis
  → revalidatePath + Supabase Realtime notifica outros painéis

Cron (1 min) → Worker dequeue → WhatsApp Cloud API → INSERT Notificacao
Webhook Meta → UPDATE Notificacao.status (ENVIADO → ENTREGUE → LIDO)
```

**Rotas protegidas:** `middleware.ts` usa Supabase Auth. Grupo `(dashboard)/` requer sessão.

**Multi-tenancy:** Cada `Clinica` é um tenant isolado. RLS no Supabase ainda precisa ser ativado (atualmente o isolamento é só por código).

## Estrutura de arquivos chave

```
app/
  (auth)/login, register, callback   # Páginas públicas
  (dashboard)/
    layout.tsx                        # Sidebar + header
    atendimentos/page.tsx             # Server Component — busca dados
    atendimentos/actions.ts           # advanceStage, createAtendimento
    pets/page.tsx                     # ⚠️ Placeholder — implementar CRUD
    tutores/page.tsx                  # ⚠️ Placeholder — implementar CRUD
    configuracoes/page.tsx            # ⚠️ Placeholder
  api/
    auth/register/route.ts            # Cria auth + clínica + serviços padrão
    queue/process/route.ts            # Cron: processa fila WhatsApp
    webhooks/whatsapp/route.ts        # Webhook Meta (status de entrega)

components/
  atendimento/painel.tsx              # Client Component — UI do painel (funcional, UI a melhorar)
  layout/sidebar.tsx

lib/
  supabase/{client,server,admin}.ts   # Browser / Server / Service Role
  whatsapp/{provider,templates}.ts    # Cloud API + builder de variáveis
  stages/{stage.config,stage.validator}.ts  # Estágios por serviço + validação
  queue/{whatsapp.queue,whatsapp.worker}.ts # Enqueue/dequeue + processador
  midia/upload.ts                     # Upload Supabase Storage
  prisma.ts                           # Singleton do Prisma Client
  utils.ts                            # cn() helper

prisma/schema.prisma                  # Schema completo
types/index.ts                        # Tipos compartilhados TypeScript
```

## Modelo de dados (entidades principais)

- **Clinica** — tenant. Campo `stages` nos Servicos é JSONB configurável por clínica.
- **Usuario** — roles: `ADMIN`, `VETERINARIO`, `PROFISSIONAL`. `id` = UUID do Supabase Auth.
- **Tutor** — dono do pet. `telefone` é o destino do WhatsApp (obrigatório).
- **Pet** — vinculado a tutor + clínica.
- **Servico** — tipo: `BANHO_TOSA`, `CIRURGIA`, `CONSULTA`, `INTERNAMENTO`. Contém `stages` JSONB.
- **Atendimento** — entidade central. `currentStage` (int) + `status` (AGUARDANDO → EM_ANDAMENTO → CONCLUIDO).
- **StageLog** — auditoria de transições.
- **Notificacao** — registro do WhatsApp enviado, com `waMessageId` para rastrear status via webhook.
- **Midia** — fotos/vídeos anexados a um estágio.

## Estágios padrão por serviço

- **Banho & Tosa:** Check-in → Banho → Tosa → Secagem → Pronto p/ Retirada (📷)
- **Cirurgia:** Check-in → Em Preparo → Em Cirurgia → Recuperação (📷) → Em Observação (📷) → Alta (📷)
- **Consulta:** Check-in → Em Atendimento → Exames Solicitados → Resultado Disponível (📷) → Concluído
- **Internamento:** Internado → Estável (📷) → Em Melhora (📷) → Pré-Alta → Alta (📷)

(📷) = `mediaAllowed: true` no stage.config — mostrar botão de upload na UI.

## WhatsApp Templates

Dois templates Utility em pt_BR registrados no Meta:
- `pet_status_update` — só texto
- `pet_status_media` — com header IMAGE/VIDEO

Variáveis: `{{1}}` = nome tutor, `{{2}}` = nome pet, `{{3}}` = mensagem do estágio (de `stage.config.ts`), `{{4}}` = texto complementar, `{{5}}` = nome da clínica.

## Diretrizes de UI/UX

- **Paleta:** dark header `#1a1a2e`, accent blue `#3b82f6`, fundo `#f5f3ef`, cards brancos
- **Cards:** border-radius 12-14px, shadows suaves
- **WhatsApp preview:** fundo `#E5DDD5`, bolha `#DCF8C6`
- **Mobile-first no painel:** máximo 2 toques para avançar estágio, botões grandes
- **Fonte:** DM Sans (já importada)
- Toast "WhatsApp enviado!" é feedback essencial após avançar estágio

## O que falta implementar (MVP)

1. CRUD de **Tutores** — nome, telefone (obrigatório), email, CPF
2. CRUD de **Pets** — vinculado a tutor, foto, espécie
3. **Criar novo Atendimento** — modal na página de atendimentos (selecionar pet + serviço)
4. **Upload de mídia na UI** — campo de câmera/upload nos estágios com `mediaAllowed: true`
5. **Página de Configurações** — dados da clínica, WhatsApp credentials, convite de profissionais
6. **RLS no Supabase** — policies SQL para isolamento real multi-tenant
7. **Responsividade mobile** do painel do profissional

## Variáveis de ambiente

Supabase e Upstash já configurados em `.env.local`. WhatsApp ainda não configurado (aguardando conta Business):
```
WHATSAPP_PHONE_ID, WHATSAPP_TOKEN, WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET
```
