-- ============================================================
-- VetTrack — Row Level Security (RLS)
-- ============================================================
-- Pré-requisito: o campo `clinica_id` deve estar em
-- auth.jwt() -> 'app_metadata' -> 'clinica_id'
-- Isso é setado no registro em api/auth/register/route.ts via
-- supabaseAdmin.auth.admin.updateUserById(..., { app_metadata: { clinica_id } })
-- ============================================================

-- Helper: extrai clinica_id do JWT do usuário autenticado
CREATE OR REPLACE FUNCTION auth.clinica_id() RETURNS text AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'clinica_id')
$$ LANGUAGE sql STABLE;

-- Helper: extrai role do JWT
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS text AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role')
$$ LANGUAGE sql STABLE;

-- ============================================================
-- CLINICAS
-- ============================================================
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;

-- Cada usuário vê apenas a própria clínica
CREATE POLICY "clinica_select" ON clinicas
  FOR SELECT USING (id = auth.clinica_id());

-- Apenas ADMIN pode atualizar dados da clínica
CREATE POLICY "clinica_update" ON clinicas
  FOR UPDATE USING (
    id = auth.clinica_id() AND auth.user_role() = 'ADMIN'
  );

-- ============================================================
-- USUARIOS
-- ============================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Ver usuários da própria clínica
CREATE POLICY "usuarios_select" ON usuarios
  FOR SELECT USING (clinica_id = auth.clinica_id());

-- INSERT é feito pelo service role (registro) — usuários normais não criam
CREATE POLICY "usuarios_insert" ON usuarios
  FOR INSERT WITH CHECK (clinica_id = auth.clinica_id() AND auth.user_role() = 'ADMIN');

-- ADMIN pode atualizar usuários da clínica; usuário pode atualizar a si mesmo
CREATE POLICY "usuarios_update" ON usuarios
  FOR UPDATE USING (
    clinica_id = auth.clinica_id()
    AND (auth.user_role() = 'ADMIN' OR id = auth.uid()::text)
  );

-- Apenas ADMIN pode desativar/remover usuários
CREATE POLICY "usuarios_delete" ON usuarios
  FOR DELETE USING (
    clinica_id = auth.clinica_id() AND auth.user_role() = 'ADMIN'
  );

-- ============================================================
-- TUTORES
-- ============================================================
ALTER TABLE tutores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutores_select" ON tutores
  FOR SELECT USING (clinica_id = auth.clinica_id());

CREATE POLICY "tutores_insert" ON tutores
  FOR INSERT WITH CHECK (clinica_id = auth.clinica_id());

CREATE POLICY "tutores_update" ON tutores
  FOR UPDATE USING (clinica_id = auth.clinica_id());

CREATE POLICY "tutores_delete" ON tutores
  FOR DELETE USING (clinica_id = auth.clinica_id());

-- ============================================================
-- PETS
-- ============================================================
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_select" ON pets
  FOR SELECT USING (clinica_id = auth.clinica_id());

CREATE POLICY "pets_insert" ON pets
  FOR INSERT WITH CHECK (clinica_id = auth.clinica_id());

CREATE POLICY "pets_update" ON pets
  FOR UPDATE USING (clinica_id = auth.clinica_id());

CREATE POLICY "pets_delete" ON pets
  FOR DELETE USING (clinica_id = auth.clinica_id());

-- ============================================================
-- SERVICOS
-- ============================================================
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servicos_select" ON servicos
  FOR SELECT USING (clinica_id = auth.clinica_id());

-- Apenas ADMIN configura serviços
CREATE POLICY "servicos_insert" ON servicos
  FOR INSERT WITH CHECK (
    clinica_id = auth.clinica_id() AND auth.user_role() = 'ADMIN'
  );

CREATE POLICY "servicos_update" ON servicos
  FOR UPDATE USING (
    clinica_id = auth.clinica_id() AND auth.user_role() = 'ADMIN'
  );

CREATE POLICY "servicos_delete" ON servicos
  FOR DELETE USING (
    clinica_id = auth.clinica_id() AND auth.user_role() = 'ADMIN'
  );

-- ============================================================
-- ATENDIMENTOS
-- ============================================================
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "atendimentos_select" ON atendimentos
  FOR SELECT USING (clinica_id = auth.clinica_id());

CREATE POLICY "atendimentos_insert" ON atendimentos
  FOR INSERT WITH CHECK (clinica_id = auth.clinica_id());

CREATE POLICY "atendimentos_update" ON atendimentos
  FOR UPDATE USING (clinica_id = auth.clinica_id());

-- Apenas ADMIN pode cancelar/deletar atendimentos
CREATE POLICY "atendimentos_delete" ON atendimentos
  FOR DELETE USING (
    clinica_id = auth.clinica_id() AND auth.user_role() = 'ADMIN'
  );

-- ============================================================
-- STAGE_LOGS
-- ============================================================
ALTER TABLE stage_logs ENABLE ROW LEVEL SECURITY;

-- stage_logs não tem clinica_id direto — acesso via atendimento
CREATE POLICY "stage_logs_select" ON stage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atendimentos a
      WHERE a.id = stage_logs.atendimento_id
        AND a.clinica_id = auth.clinica_id()
    )
  );

CREATE POLICY "stage_logs_insert" ON stage_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM atendimentos a
      WHERE a.id = stage_logs.atendimento_id
        AND a.clinica_id = auth.clinica_id()
    )
  );

-- Logs são imutáveis — sem UPDATE/DELETE

-- ============================================================
-- NOTIFICACOES
-- ============================================================
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificacoes_select" ON notificacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atendimentos a
      WHERE a.id = notificacoes.atendimento_id
        AND a.clinica_id = auth.clinica_id()
    )
  );

CREATE POLICY "notificacoes_insert" ON notificacoes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM atendimentos a
      WHERE a.id = notificacoes.atendimento_id
        AND a.clinica_id = auth.clinica_id()
    )
  );

-- Webhook de status atualiza via service role — não precisa de policy UPDATE para usuários
-- Se precisar que o app atualize status localmente:
CREATE POLICY "notificacoes_update" ON notificacoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM atendimentos a
      WHERE a.id = notificacoes.atendimento_id
        AND a.clinica_id = auth.clinica_id()
    )
  );

-- ============================================================
-- MIDIAS
-- ============================================================
ALTER TABLE midias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "midias_select" ON midias
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atendimentos a
      WHERE a.id = midias.atendimento_id
        AND a.clinica_id = auth.clinica_id()
    )
  );

CREATE POLICY "midias_insert" ON midias
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM atendimentos a
      WHERE a.id = midias.atendimento_id
        AND a.clinica_id = auth.clinica_id()
    )
  );

CREATE POLICY "midias_delete" ON midias
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM atendimentos a
      WHERE a.id = midias.atendimento_id
        AND a.clinica_id = auth.clinica_id()
    )
  );

-- ============================================================
-- SUPABASE STORAGE — bucket "atendimentos"
-- ============================================================
-- Executar no Supabase Dashboard > Storage > Policies
-- ou via SQL Editor:

-- Criar bucket (se ainda não existir):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('atendimentos', 'atendimentos', false);

-- Policy: usuário autenticado pode fazer upload na pasta da própria clínica
-- O path do arquivo deve ser: {clinica_id}/{atendimento_id}/...
CREATE POLICY "storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'atendimentos'
    AND (storage.foldername(name))[1] = auth.clinica_id()
  );

CREATE POLICY "storage_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'atendimentos'
    AND (storage.foldername(name))[1] = auth.clinica_id()
  );

CREATE POLICY "storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'atendimentos'
    AND (storage.foldername(name))[1] = auth.clinica_id()
  );
