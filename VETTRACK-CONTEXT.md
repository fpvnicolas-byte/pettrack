# VetTrack — Contexto Completo para Agente de Desenvolvimento

## O que é o VetTrack

VetTrack é um sistema SaaS B2B de acompanhamento em tempo real de atendimentos veterinários, com notificação automática via WhatsApp para tutores de pets.

**A dor que resolve:** Quando um tutor deixa o pet na clínica (banho, cirurgia, consulta, internamento), ele fica ansioso e manda várias mensagens no WhatsApp perguntando sobre o status. A recepcionista precisa parar, ir perguntar ao profissional, voltar e responder. Multiplica por 20 clientes/dia — é um dreno operacional enorme.

**A solução:** O profissional (tosador, veterinário, auxiliar) atualiza o status do atendimento com dois toques no celular. O tutor recebe automaticamente no WhatsApp uma mensagem com o status atualizado, incluindo foto/vídeo quando aplicável. É o "rastreamento de pedido" do mercado pet.

**Modelo de negócio:** SaaS com mensalidade por clínica (~R$297-497/mês). Custo do WhatsApp é operacional (templates Utility ~R$0,16/conversa) e pode ser repassado ou embutido no plano.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14+ (App Router) + TypeScript |
| Estilização | Tailwind CSS + DM Sans (fonte) |
| Backend | Next.js API Routes + Server Actions (monolito) |
| Banco de Dados | Supabase (PostgreSQL gerenciado) |
| ORM | Prisma 7 |
| Autenticação | Supabase Auth (email/senha, magic link, JWT) |
| Storage | Supabase Storage (fotos/vídeos dos pets) |
| Realtime | Supabase Realtime (WebSocket nativo) |
| Fila assíncrona | Upstash Redis (API REST, serverless) |
| WhatsApp | Meta Cloud API (templates Utility) |
| Deploy | Vercel (frontend + API) |

### Decisões técnicas importantes

- **TypeScript de ponta a ponta** — mesma linguagem front e back, tipos compartilhados.
- **Monolito no Next.js** — sem backend separado. Server Actions para mutações, API Routes para webhooks e cron. Quando precisar de backend separado (app mobile, integrações), extrair os services para Fastify.
- **Prisma 7** (atualizado do 5) — type-safe, migrations, conecta ao PostgreSQL do Supabase.
- **Upstash Redis** — API REST que funciona em serverless (Vercel). Usado para fila assíncrona de envio de WhatsApp. NÃO é Redis TCP tradicional.
- **Supabase Realtime** — quando um atendimento é atualizado no banco, todos os painéis abertos na mesma clínica atualizam automaticamente via WebSocket, sem polling.
- **Row Level Security (RLS)** — multi-tenancy automática. Cada clínica só vê seus dados, isolamento feito direto no banco via JWT do Supabase.
- **Templates Utility do WhatsApp** — categoria mais barata (~75% menos que Marketing). Dois templates cobrem todos os serviços:
  - `pet_status_update` (texto)
  - `pet_status_media` (com foto/vídeo no header)
  - A variável `{{3}}` muda dinamicamente conforme o estágio.

---

## Infraestrutura Configurada

- ✅ Supabase — projeto criado, credenciais no `.env.local`
- ✅ Upstash Redis — banco criado, credenciais no `.env.local`
- ✅ Prisma 7 — schema completo, tabelas criadas no Supabase via `db:push`
- ✅ Next.js rodando em `localhost:3000`
- ✅ Autenticação — login, registro, middleware de proteção, refresh de sessão

---

## Arquitetura de Slices (Vertical Slice Architecture)

Cada feature é independente com seus próprios arquivos. Isso permite evolução e escala por módulo.

```
vettrack/
├── app/
│   ├── (auth)/                    # Páginas públicas
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts      # Supabase Auth callback
│   ├── (dashboard)/               # Páginas protegidas (requer auth)
│   │   ├── layout.tsx             # Layout com sidebar
│   │   ├── atendimentos/
│   │   │   ├── page.tsx           # Server Component — busca dados
│   │   │   └── actions.ts         # Server Actions — advanceStage, createAtendimento
│   │   ├── pets/page.tsx          # ⚠️ PLACEHOLDER — precisa implementar
│   │   ├── tutores/page.tsx       # ⚠️ PLACEHOLDER — precisa implementar
│   │   └── configuracoes/page.tsx # ⚠️ PLACEHOLDER — precisa implementar
│   └── api/
│       ├── auth/register/route.ts # Registro (cria auth + clínica + serviços padrão)
│       ├── queue/process/route.ts # Cron: processa fila WhatsApp
│       └── webhooks/whatsapp/route.ts # Webhook Meta (status de entrega)
│
├── components/
│   ├── atendimento/
│   │   └── painel.tsx             # ⚠️ FUNCIONAL MAS UI PRECISA MELHORAR (ver seção abaixo)
│   └── layout/
│       └── sidebar.tsx            # Sidebar do dashboard
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client (cookies)
│   │   └── admin.ts               # Service role (operações privilegiadas)
│   ├── whatsapp/
│   │   ├── provider.ts            # Integração Cloud API Meta
│   │   └── templates.ts           # Builder de variáveis + mensagens por estágio
│   ├── stages/
│   │   ├── stage.config.ts        # Estágios padrão por tipo de serviço
│   │   └── stage.validator.ts     # Validação de transições
│   ├── queue/
│   │   ├── whatsapp.queue.ts      # Enqueue/dequeue com Upstash
│   │   └── whatsapp.worker.ts     # Processador da fila
│   ├── midia/
│   │   └── upload.ts              # Upload Supabase Storage
│   ├── prisma.ts                  # Prisma client singleton
│   └── utils.ts                   # cn() helper para classnames
│
├── prisma/
│   └── schema.prisma              # ✅ Schema completo (Prisma 7)
│
├── types/
│   └── index.ts                   # Tipos compartilhados
│
├── middleware.ts                   # Supabase Auth + proteção de rotas
├── .env.local                     # ✅ Configurado (Supabase + Upstash)
└── vercel.json                    # Cron para processar fila WhatsApp
```

---

## Modelagem de Dados (Prisma Schema)

### Entidades e relações

- **Clinica** — tenant principal. Cada clínica é isolada via RLS.
- **Usuario** — vinculado a uma clínica. Roles: ADMIN, VETERINARIO, PROFISSIONAL. O `id` é o mesmo do Supabase Auth.
- **Tutor** — dono do pet. Telefone é o destino do WhatsApp.
- **Pet** — vinculado a um tutor e uma clínica. Espécies: CANINO, FELINO, AVE, ROEDOR, REPTIL, OUTRO.
- **Servico** — tipo de atendimento (BANHO_TOSA, CIRURGIA, CONSULTA, INTERNAMENTO, etc). Campo `stages` é JSONB com array de `StageDefinition` — configurável por clínica.
- **Atendimento** — entidade central. Vincula pet + serviço + profissional + clínica. Tem `currentStage` (int) e `status` (AGUARDANDO, EM_ANDAMENTO, CONCLUIDO, CANCELADO).
- **StageLog** — histórico de transições de estágio (auditoria).
- **Notificacao** — registro de cada WhatsApp enviado. Tem `waMessageId` para rastrear status de entrega via webhook.
- **Midia** — fotos/vídeos anexados a um atendimento em um estágio específico.

### Fluxo principal: avançar estágio

```
Profissional toca "Avançar"
  → Server Action `advanceStage()`
    → Valida transição (stage N → N+1)
    → Upload mídia se tiver (Supabase Storage)
    → Transaction: UPDATE atendimento + INSERT stage_log
    → Enqueue WhatsApp job (Upstash Redis)
    → revalidatePath (atualiza UI)
    → Supabase Realtime notifica outros painéis abertos

Worker (cron a cada 1 min):
  → Dequeue job do Redis
  → Busca dados completos do atendimento
  → Monta variáveis do template
  → Envia via WhatsApp Cloud API
  → Salva Notificacao no banco
```

---

## Estágios por Tipo de Serviço

Cada serviço tem seus próprios estágios. São configuráveis por clínica (JSONB), mas os padrões são:

### Banho & Tosa
Check-in → Banho → Tosa → Secagem → Pronto p/ Retirada (📷)

### Cirurgia
Check-in → Em Preparo → Em Cirurgia → Recuperação (📷) → Em Observação (📷) → Alta (📷)

### Consulta
Check-in → Em Atendimento → Exames Solicitados → Resultado Disponível (📷) → Concluído

### Internamento
Internado → Estável (📷) → Em Melhora (📷) → Pré-Alta → Alta (📷)

(📷) = estágio permite envio de foto/vídeo

---

## WhatsApp — Templates para Meta

### Template 1: `pet_status_update` (Utility, pt_BR)
```
Olá, {{1}} 👋

Atualização sobre {{2}}:
{{2}} {{3}}.

{{4}}

{{5}}
```

### Template 2: `pet_status_media` (Utility, pt_BR, header: IMAGE | VIDEO)
```
Olá, {{1}} 👋

Olha como {{2}} está! 🐾
{{3}}.

{{4}}

{{5}}
```

**Variáveis:**
- `{{1}}` = primeiro nome do tutor
- `{{2}}` = nome do pet
- `{{3}}` = mensagem do estágio (dinâmica, vem do `stage.config.ts`)
- `{{4}}` = texto complementar (opcional)
- `{{5}}` = nome da clínica

---

## O que está pronto ✅

1. **Autenticação completa** — login, registro com criação automática de clínica + serviços padrão, middleware de proteção, refresh de sessão, logout.
2. **Registro cria tudo automaticamente** — clínica, usuário ADMIN, 4 serviços padrão com estágios configurados.
3. **Painel de atendimentos funcional** — fila agrupada por serviço, seleção de pet, visualização de estágios, botão avançar com Server Action, preview do WhatsApp, Supabase Realtime.
4. **Integração WhatsApp completa** — provider para Cloud API, builder de templates, fila assíncrona, worker, webhook de status.
5. **Upload de mídia** — Supabase Storage com geração de URL pública.
6. **Schema Prisma 7 completo** — todas as tabelas e relações.

## O que falta implementar ⚠️

### Prioridade Alta (MVP)
1. **Página de Pets** — CRUD completo. Cadastro de pet vinculado a um tutor. Listagem, busca, edição, foto.
2. **Página de Tutores** — CRUD completo. Cadastro com nome, telefone (obrigatório para WhatsApp), email, CPF. Listagem, busca.
3. **Criar novo atendimento** — Formulário/modal na página de atendimentos: selecionar pet (autocomplete), selecionar serviço, observações opcionais. O botão e form de criação não existem na UI atual.
4. **Upload de mídia no avanço de estágio** — O Server Action suporta, mas a UI não tem o campo de upload. Nos estágios com `mediaAllowed: true`, mostrar botão de câmera/upload.

### Prioridade Média
5. **Página de Configurações** — Configurar dados da clínica, WhatsApp (phoneId, token), convidar profissionais via magic link.
6. **RLS no Supabase** — As policies SQL de Row Level Security ainda precisam ser aplicadas no banco. Sem elas, o isolamento multi-tenant depende só do código (não é seguro para produção).
7. **Responsividade mobile** — O painel precisa funcionar bem no celular do profissional (tosador atualizando status durante o trabalho).

### Prioridade Baixa (pós-MVP)
8. **Dashboard financeiro** — Faturamento, ticket médio, métricas.
9. **Motor de lembretes** — Vacinas vencendo, retornos pendentes.
10. **Relatório de conclusão** — Resumo enviado ao tutor ao final do atendimento.

---

## IMPORTANTE: Qualidade de UI/UX

A UI atual do boilerplate está abaixo do padrão desejado. O projeto teve um protótipo visual de referência com qualidade muito superior que deve servir de norte.

### Diretrizes de design:
- **Fonte:** DM Sans (já importada)
- **Paleta:** Dark header (#1a1a2e), accent blue (#3b82f6), fundo warm (#f5f3ef), cards brancos com shadow sutil
- **Cards:** border-radius 12-14px, shadows suaves, bordas sutis
- **Estágios:** Indicadores coloridos por status, com animação pulse no estágio ativo
- **WhatsApp preview:** Fundo #E5DDD5, bolha verde #DCF8C6, visual fiel ao WhatsApp real
- **Interações:** Transitions suaves, toasts com slide-in animado, hover states claros
- **Mobile-first no painel do profissional:** Botões grandes, mínimo de toques, legível em tela pequena
- **Sem estética genérica de AI:** Evitar layouts óbvios, gradientes roxos, Inter/Roboto. Cada tela deve ter personalidade.
- **Componentes shadcn/ui:** Usar como base mas customizar para manter identidade visual.

### Princípios UX:
- O profissional (tosador, vet) está com as mãos ocupadas — **máximo 2 toques** para avançar um estágio
- O tutor recebe tudo passivamente no WhatsApp — **não baixa app nenhum**
- A recepcionista precisa ver a fila inteira de relance
- Toast de confirmação "WhatsApp enviado!" é feedback essencial

---

## Variáveis de Ambiente (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=         # ✅ Configurado
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # ✅ Configurado
SUPABASE_SERVICE_ROLE_KEY=        # ✅ Configurado
DATABASE_URL=                     # ✅ Configurado (PostgreSQL do Supabase)
UPSTASH_REDIS_REST_URL=           # ✅ Configurado
UPSTASH_REDIS_REST_TOKEN=         # ✅ Configurado
WHATSAPP_PHONE_ID=                # ❌ Configurar quando tiver conta Business
WHATSAPP_TOKEN=                   # ❌ Configurar quando tiver conta Business
WHATSAPP_VERIFY_TOKEN=            # ❌ Configurar quando tiver conta Business
WHATSAPP_APP_SECRET=              # ❌ Configurar quando tiver conta Business
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Comandos úteis

```bash
pnpm dev              # Rodar em desenvolvimento
pnpm build            # Build de produção
pnpm db:generate      # Gerar Prisma Client após alterar schema
pnpm db:push          # Sincronizar schema com banco (dev)
pnpm db:migrate       # Criar migration formal (produção)
pnpm db:studio        # Abrir Prisma Studio (visualizar dados)
```
