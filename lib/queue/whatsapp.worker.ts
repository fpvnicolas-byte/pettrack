import { WhatsAppProvider } from '@/lib/whatsapp/provider';
import { buildTemplateVariables, STAGE_MESSAGES } from '@/lib/whatsapp/templates';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { WhatsAppJobData } from '@/types';

export async function sendWhatsAppNow(job: WhatsAppJobData): Promise<void> {
  const atendimento = await prisma.atendimento.findUnique({
    where: { id: job.atendimentoId },
    include: {
      pet: { include: { tutor: true } },
      servico: true,
      clinica: true,
    },
  });

  if (!atendimento) {
    console.error(`[WhatsApp] Atendimento ${job.atendimentoId} não encontrado`);
    return;
  }

  const stageMessage = STAGE_MESSAGES[atendimento.servico.tipo]?.[job.stageId];
  if (!stageMessage) {
    console.error(`[WhatsApp] Stage message não encontrada: ${atendimento.servico.tipo}/${job.stageId}`);
    return;
  }

  const variables = buildTemplateVariables({ petNome: atendimento.pet.nome, stageMessage });

  const phoneId = atendimento.clinica.whatsappPhoneId || process.env.WHATSAPP_PHONE_ID!;
  const token = atendimento.clinica.whatsappToken || process.env.WHATSAPP_TOKEN!;
  const provider = new WhatsAppProvider(phoneId, token);

  const templateName = job.mediaUrl ? 'pet_status_media' : 'pet_status_update';

  const result = await provider.sendTemplate({
    to: atendimento.pet.tutor.telefone,
    templateName,
    languageCode: 'pt_BR',
    bodyVariables: variables,
    ...(job.mediaUrl
      ? { headerMediaUrl: job.mediaUrl, headerMediaType: job.mediaType }
      : { headerText: atendimento.pet.nome }
    ),
  });

  await prisma.notificacao.create({
    data: {
      atendimentoId: job.atendimentoId,
      tipo: job.mediaUrl ? 'STATUS_MEDIA' : 'STATUS_UPDATE',
      canal: 'WHATSAPP',
      templateName,
      variaveis: variables as unknown as Prisma.InputJsonValue,
      midiaUrl: job.mediaUrl,
      waMessageId: result.messageId,
      status: 'ENVIADO',
      enviadoAt: new Date(),
    },
  });
}
