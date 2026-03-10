# 🐾 VetTrack

Sistema de acompanhamento de atendimentos veterinários com notificação automática via WhatsApp.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Server Actions
- **Banco:** Supabase (PostgreSQL) + Prisma ORM
- **Auth:** Supabase Auth (email/senha, magic link)
- **Storage:** Supabase Storage (fotos/vídeos dos pets)
- **Realtime:** Supabase Realtime (atualização do painel em tempo real)
- **Fila:** Upstash Redis (envio assíncrono de WhatsApp)
- **WhatsApp:** Cloud API (Meta) com templates Utility

## Setup Rápido

### 1. Clonar e instalar

```bash
git clone <repo>
cd vettrack
pnpm install
```

### 2. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Copie as credenciais (Settings → API):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Copie a connection string do banco (Settings → Database):
   - `DATABASE_URL`

### 3. Criar conta no Upstash

1. Acesse [upstash.com](https://upstash.com) e crie um banco Redis
2. Copie:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
# Preencher todas as variáveis
```

### 5. Configurar banco de dados

```bash
pnpm db:generate    # Gerar Prisma Client
pnpm db:push        # Criar tabelas no Supabase
```

### 6. Configurar RLS no Supabase

No SQL Editor do Supabase, executar as policies de Row Level Security.
(Ver arquivo de arquitetura para o SQL completo)

### 7. Configurar Storage no Supabase

No dashboard do Supabase:
1. Storage → New Bucket → `atendimentos-media`
2. Marcar como público
3. Configurar policies de upload

### 8. Rodar

```bash
pnpm dev
```

Acesse `http://localhost:3000`

## Estrutura

```
vettrack/
├── app/
│   ├── (auth)/          # Login, registro, callback
│   ├── (dashboard)/     # Painel protegido
│   │   ├── atendimentos/  # Fila + avanço de estágios
│   │   ├── pets/
│   │   ├── tutores/
│   │   └── configuracoes/
│   └── api/
│       ├── auth/register/     # Criação de conta + clínica
│       ├── queue/process/     # Processador da fila WhatsApp
│       └── webhooks/whatsapp/ # Webhook Meta (status entrega)
├── components/
│   ├── atendimento/     # Painel principal
│   └── layout/          # Sidebar, header
├── lib/
│   ├── supabase/        # Clients (browser, server, admin)
│   ├── whatsapp/        # Provider + templates
│   ├── stages/          # Config + validação de estágios
│   ├── queue/           # Redis + worker WhatsApp
│   └── midia/           # Upload Supabase Storage
├── prisma/
│   └── schema.prisma    # Modelagem completa
└── types/               # Tipos compartilhados
```

## WhatsApp Templates

Submeter na Meta (WhatsApp Manager):

**Template 1: `pet_status_update`** (Utility, pt_BR)
```
Olá, {{1}} 👋

Atualização sobre {{2}}:
{{2}} {{3}}.

{{4}}

{{5}}
```

**Template 2: `pet_status_media`** (Utility, pt_BR, header: IMAGE/VIDEO)
```
Olá, {{1}} 👋

Olha como {{2}} está! 🐾
{{3}}.

{{4}}

{{5}}
```

## Deploy

```bash
# Vercel (recomendado)
vercel deploy
```

O cron job (`vercel.json`) processa a fila de WhatsApp a cada minuto.
# pettrack
