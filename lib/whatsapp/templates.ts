interface TemplateData {
  petNome: string;
  stageMessage: string;
}

// pet_status_update: {{1}} = nome do pet, {{2}} = mensagem do estágio
// pet_status_media:  {{1}} = nome do pet, {{2}} = mensagem do estágio
export function buildTemplateVariables(data: TemplateData) {
  return [
    { type: 'text' as const, text: data.petNome },       // {{1}}
    { type: 'text' as const, text: data.stageMessage },  // {{2}}
  ];
}

// Mensagens pré-definidas por tipo e estágio
export const STAGE_MESSAGES: Record<string, Record<string, string>> = {
  BANHO_TOSA: {
    checkin: 'foi recebido na clínica para Banho & Tosa',
    banho: 'iniciou o banho',
    tosa: 'está na tosa',
    secagem: 'está na secagem, quase pronto',
    finalizado: 'está pronto e lindo esperando você! 🐾',
  },
  CIRURGIA: {
    checkin: 'deu entrada para o procedimento cirúrgico',
    preparo: 'está sendo preparado para a cirurgia',
    procedimento: 'está em procedimento cirúrgico. A equipe está cuidando com todo carinho',
    recuperacao: 'saiu da cirurgia e está em recuperação. Tudo ocorreu bem',
    observacao: 'está estável e em observação pós-cirúrgica',
    alta: 'recebeu alta! Você já pode vir buscá-lo',
  },
  CONSULTA: {
    checkin: 'chegou para a consulta',
    atendimento: 'está sendo atendido pelo veterinário',
    exames: 'teve exames solicitados. Enviaremos os resultados assim que disponíveis',
    resultado: 'já tem os resultados dos exames disponíveis',
    concluido: 'finalizou a consulta',
  },
  INTERNAMENTO: {
    checkin: 'foi internado e está sob cuidados da nossa equipe',
    estavel: 'está estável. Seguimos monitorando',
    melhora: 'está apresentando melhora clínica',
    prealta: 'está em fase de pré-alta. Em breve poderá ir para casa',
    alta: 'recebeu alta! Você já pode vir buscá-lo',
  },
};
