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
