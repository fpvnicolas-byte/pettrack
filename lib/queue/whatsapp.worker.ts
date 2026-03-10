import { WhatsAppProvider } from '@/lib/whatsapp/provider';
import { buildTemplateVariables, STAGE_MESSAGES } from '@/lib/whatsapp/templates';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { WhatsAppJobData } from '@/types';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500; // espera entre tentativas

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SendResult =
  | { success: true; messageId: string }
  | { success: false; error: string };

export async function sendWhatsAppNow(job: WhatsAppJobData): Promise<SendResult> {
  const atendimento = await prisma.atendimento.findUnique({
    where: { id: job.atendimentoId },
    include: {
      pet: { include: { tutor: true } },
      servico: true,
      clinica: true,
    },
  });

  if (!atendimento) {
    return { success: false, error: 'Atendimento não encontrado' };
  }

  const stageMessage = STAGE_MESSAGES[atendimento.servico.tipo]?.[job.stageId];
  if (!stageMessage) {
    return { success: false, error: `Stage message não configurada: ${job.stageId}` };
  }

  const variables = buildTemplateVariables({ petNome: atendimento.pet.nome, stageMessage });
  const phoneId = atendimento.clinica.whatsappPhoneId || process.env.WHATSAPP_PHONE_ID!;
  const token = atendimento.clinica.whatsappToken || process.env.WHATSAPP_TOKEN!;
  const provider = new WhatsAppProvider(phoneId, token);
  const templateName = job.mediaUrl ? 'pet_status_media' : 'pet_status_update';

  let lastError = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
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

      // Sucesso — salva notificação com status ENVIADO
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

      return { success: true, messageId: result.messageId };
    } catch (err: any) {
      lastError = err?.message ?? 'Erro desconhecido';
      console.warn(`[WhatsApp] Tentativa ${attempt}/${MAX_ATTEMPTS} falhou:`, lastError);

      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt); // backoff: 1.5s, 3s
      }
    }
  }

  // Todas as tentativas falharam — salva notificação com status ERRO
  await prisma.notificacao.create({
    data: {
      atendimentoId: job.atendimentoId,
      tipo: job.mediaUrl ? 'STATUS_MEDIA' : 'STATUS_UPDATE',
      canal: 'WHATSAPP',
      templateName,
      variaveis: variables as unknown as Prisma.InputJsonValue,
      midiaUrl: job.mediaUrl,
      status: 'ERRO',
      erroMsg: lastError,
    },
  });

  return { success: false, error: lastError };
}
