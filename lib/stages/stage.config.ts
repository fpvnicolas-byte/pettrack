import type { StageDefinition } from '@/types';

// Tipos de serviço que permitem inserção de estágios extras pelo profissional
export const CUSTOM_STAGE_ALLOWED_TYPES: string[] = ['CIRURGIA', 'INTERNAMENTO'];

export function canInsertCustomStage(tipoServico: string): boolean {
  return CUSTOM_STAGE_ALLOWED_TYPES.includes(tipoServico);
}

/**
 * Retorna os estágios efetivos de um atendimento.
 * Se o atendimento possui customStages (estágios inseridos em runtime),
 * eles têm precedência sobre os estágios padrão do serviço.
 */
export function getEffectiveStages(atendimento: {
  customStages?: unknown;
  servico: { stages: unknown };
}): StageDefinition[] {
  if (atendimento.customStages != null) {
    return atendimento.customStages as StageDefinition[];
  }
  return atendimento.servico.stages as StageDefinition[];
}

export const DEFAULT_STAGES: Record<string, StageDefinition[]> = {
  BANHO_TOSA: [
    { id: 'checkin', label: 'Check-in', whatsappMsg: 'foi recebido na clínica para Banho & Tosa', color: '#6B7280', mediaAllowed: false, autoNotify: true },
    { id: 'banho', label: 'Banho', whatsappMsg: 'iniciou o banho', color: '#3B82F6', mediaAllowed: false, autoNotify: true },
    { id: 'tosa', label: 'Tosa', whatsappMsg: 'está na tosa', color: '#8B5CF6', mediaAllowed: false, autoNotify: true },
    { id: 'secagem', label: 'Secagem', whatsappMsg: 'está na secagem, quase pronto', color: '#F59E0B', mediaAllowed: false, autoNotify: true },
    { id: 'finalizado', label: 'Pronto p/ Retirada', whatsappMsg: 'está pronto e lindo esperando você! 🐾', color: '#10B981', mediaAllowed: true, autoNotify: true },
  ],
  CIRURGIA: [
    { id: 'checkin', label: 'Check-in', whatsappMsg: 'deu entrada para o procedimento cirúrgico', color: '#6B7280', mediaAllowed: false, autoNotify: true },
    { id: 'preparo', label: 'Em Preparo', whatsappMsg: 'está sendo preparado para a cirurgia', color: '#3B82F6', mediaAllowed: false, autoNotify: true },
    { id: 'procedimento', label: 'Em Cirurgia', whatsappMsg: 'está em procedimento cirúrgico. A equipe está cuidando com todo carinho', color: '#EF4444', mediaAllowed: false, autoNotify: true },
    { id: 'recuperacao', label: 'Recuperação', whatsappMsg: 'saiu da cirurgia e está em recuperação. Tudo ocorreu bem', color: '#F59E0B', mediaAllowed: true, autoNotify: true },
    { id: 'observacao', label: 'Em Observação', whatsappMsg: 'está estável e em observação pós-cirúrgica', color: '#8B5CF6', mediaAllowed: true, autoNotify: true },
    { id: 'alta', label: 'Alta', whatsappMsg: 'recebeu alta! Você já pode vir buscá-lo', color: '#10B981', mediaAllowed: true, autoNotify: true },
  ],
  CONSULTA: [
    { id: 'checkin', label: 'Check-in', whatsappMsg: 'chegou para a consulta', color: '#6B7280', mediaAllowed: false, autoNotify: true },
    { id: 'atendimento', label: 'Em Atendimento', whatsappMsg: 'está sendo atendido pelo veterinário', color: '#3B82F6', mediaAllowed: false, autoNotify: true },
    { id: 'exames', label: 'Exames Solicitados', whatsappMsg: 'teve exames solicitados. Enviaremos os resultados assim que disponíveis', color: '#F59E0B', mediaAllowed: false, autoNotify: true },
    { id: 'resultado', label: 'Resultado Disponível', whatsappMsg: 'já tem os resultados dos exames disponíveis', color: '#8B5CF6', mediaAllowed: true, autoNotify: true },
    { id: 'concluido', label: 'Concluído', whatsappMsg: 'finalizou a consulta', color: '#10B981', mediaAllowed: false, autoNotify: true },
  ],
  INTERNAMENTO: [
    { id: 'checkin', label: 'Internado', whatsappMsg: 'foi internado e está sob cuidados da nossa equipe', color: '#6B7280', mediaAllowed: false, autoNotify: true },
    { id: 'estavel', label: 'Estável', whatsappMsg: 'está estável. Seguimos monitorando', color: '#3B82F6', mediaAllowed: true, autoNotify: true },
    { id: 'melhora', label: 'Em Melhora', whatsappMsg: 'está apresentando melhora clínica', color: '#F59E0B', mediaAllowed: true, autoNotify: true },
    { id: 'prealta', label: 'Pré-Alta', whatsappMsg: 'está em fase de pré-alta. Em breve poderá ir para casa', color: '#8B5CF6', mediaAllowed: false, autoNotify: true },
    { id: 'alta', label: 'Alta', whatsappMsg: 'recebeu alta! Você já pode vir buscá-lo', color: '#10B981', mediaAllowed: true, autoNotify: true },
  ],
};

export function getDefaultStagesForType(tipo: string): StageDefinition[] {
  return DEFAULT_STAGES[tipo] || DEFAULT_STAGES.CONSULTA;
}
