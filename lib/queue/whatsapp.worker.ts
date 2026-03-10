import { dequeueWhatsApp } from '@/lib/queue/whatsapp.queue';
import { WhatsAppProvider } from '@/lib/whatsapp/provider';
import { buildTemplateVariables, STAGE_MESSAGES } from '@/lib/whatsapp/templates';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function processWhatsAppQueue(): Promise<{ processed: number; errors: number }> {
  let processed = 0;
  let errors = 0;

  // Processar até 10 jobs por execução
  for (let i = 0; i < 10; i++) {
    const job = await dequeueWhatsApp();
    if (!job) break;

    try {
      const atendimento = await prisma.atendimento.findUnique({
        where: { id: job.atendimentoId },
        include: {
          pet: { include: { tutor: true } },
          servico: true,
          clinica: true,
        },
      });

      if (!atendimento) {
        console.error(`[WhatsApp Worker] Atendimento ${job.atendimentoId} não encontrado`);
        errors++;
        continue;
      }

      // Montar variáveis
      const stageMessage = STAGE_MESSAGES[atendimento.servico.tipo]?.[job.stageId];
      if (!stageMessage) {
        console.error(`[WhatsApp Worker] Stage message não encontrada: ${atendimento.servico.tipo}/${job.stageId}`);
        errors++;
        continue;
      }

      const variables = buildTemplateVariables({
        petNome: atendimento.pet.nome,
        stageMessage,
      });

      // Determinar provider (clínica pode ter WhatsApp próprio)
      const phoneId = atendimento.clinica.whatsappPhoneId || process.env.WHATSAPP_PHONE_ID!;
      const token = atendimento.clinica.whatsappToken || process.env.WHATSAPP_TOKEN!;
      const provider = new WhatsAppProvider(phoneId, token);

      const templateName = job.mediaUrl ? 'pet_status_media' : 'pet_status_update';

      const result = await provider.sendTemplate({
        to: atendimento.pet.tutor.telefone,
        templateName,
        languageCode: 'pt_BR',
        bodyVariables: variables,
        // pet_status_update: header de texto com nome do pet
        // pet_status_media: header de imagem/vídeo
        ...(job.mediaUrl
          ? { headerMediaUrl: job.mediaUrl, headerMediaType: job.mediaType }
          : { headerText: atendimento.pet.nome }
        ),
      });

      // Registrar notificação
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

      processed++;
    } catch (error) {
      console.error('[WhatsApp Worker] Erro:', error);
      errors++;
    }
  }

  return { processed, errors };
}
