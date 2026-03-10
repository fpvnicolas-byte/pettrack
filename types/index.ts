// types/index.ts — Tipos compartilhados

export interface StageDefinition {
  id: string;
  label: string;
  whatsappMsg: string;
  color: string;
  mediaAllowed: boolean;
  autoNotify: boolean;
  isCustom?: boolean;
}

export interface CustomStageInput {
  label: string;
  whatsappMsg: string;
  mediaAllowed: boolean;
  autoNotify: boolean;
}

export interface AtendimentoWithRelations {
  id: string;
  petId: string;
  servicoId: string;
  profissionalId: string | null;
  clinicaId: string;
  status: 'AGUARDANDO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  currentStage: number;
  customStages: StageDefinition[] | null;
  observacoes: string | null;
  checkinAt: string | null;
  conclusaoAt: string | null;
  createdAt: string;
  updatedAt: string;
  pet: PetWithTutor;
  servico: ServicoWithStages;
  profissional: UsuarioBasic | null;
}

export interface PetWithTutor {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  fotoUrl: string | null;
  tutor: TutorBasic;
}

export interface TutorBasic {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
}

export interface ServicoWithStages {
  id: string;
  nome: string;
  tipo: string;
  stages: StageDefinition[];
}

export interface UsuarioBasic {
  id: string;
  nome: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export interface WhatsAppJobData {
  atendimentoId: string;
  stageId: string;
  whatsappMsg: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}
