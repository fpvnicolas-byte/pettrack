'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { validateStageTransition, isLastStage } from '@/lib/stages/stage.validator';
import { sendWhatsAppNow } from '@/lib/queue/whatsapp.worker';
import { uploadAtendimentoMedia } from '@/lib/midia/upload';
import type { StageDefinition } from '@/types';
import { revalidatePath } from 'next/cache';

export async function advanceStage(atendimentoId: string, formData?: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  // 1. Buscar atendimento
  const atendimento = await prisma.atendimento.findUnique({
    where: { id: atendimentoId },
    include: {
      servico: true,
      pet: { include: { tutor: true } },
      clinica: true,
    },
  });

  if (!atendimento) throw new Error('Atendimento não encontrado');

  const stages = atendimento.servico.stages as StageDefinition[];
  const nextStage = atendimento.currentStage + 1;

  // 2. Validar
  const validation = validateStageTransition(atendimento.currentStage, nextStage, stages);
  if (!validation.valid) throw new Error(validation.error);

  // 3. Upload de mídia (se tiver)
  let mediaUrl: string | undefined;
  let mediaType: 'image' | 'video' | undefined;

  const mediaFile = formData?.get('media') as File | null;
  if (mediaFile && mediaFile.size > 0) {
    const result = await uploadAtendimentoMedia(atendimentoId, mediaFile, atendimento.clinicaId);
    mediaUrl = result.url;
    mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';

    await prisma.midia.create({
      data: {
        atendimentoId,
        tipo: mediaType === 'video' ? 'VIDEO' : 'FOTO',
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        tamanho: result.size,
        stageName: stages[nextStage].id,
      },
    });
  }

  // 4. Atualizar banco
  const lastStage = isLastStage(nextStage, stages);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.atendimento.update({
      where: { id: atendimentoId },
      data: {
        currentStage: nextStage,
        status: lastStage ? 'CONCLUIDO' : 'EM_ANDAMENTO',
        ...(nextStage === 0 && { checkinAt: new Date() }),
        ...(lastStage && { conclusaoAt: new Date() }),
      },
    });
    await tx.stageLog.create({
      data: {
        atendimentoId,
        fromStage: atendimento.currentStage,
        toStage: nextStage,
        stageName: stages[nextStage].id,
        executadoPor: user.id,
      },
    });
  });

  // 5. Enviar WhatsApp com retry automático (3 tentativas)
  const stage = stages[nextStage];
  let whatsappStatus: 'sent' | 'error' | 'skipped' = 'skipped';

  if (stage.autoNotify) {
    const result = await sendWhatsAppNow({ atendimentoId, stageId: stage.id, mediaUrl, mediaType });
    whatsappStatus = result.success ? 'sent' : 'error';
  }

  revalidatePath('/atendimentos');
  return { success: true, newStage: nextStage, whatsappStatus };
}

export async function deleteAtendimento(atendimentoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const clinicaId = user.app_metadata.clinica_id;

  // Garante que pertence à clínica
  const atendimento = await prisma.atendimento.findUnique({
    where: { id: atendimentoId },
    select: { clinicaId: true },
  });
  if (!atendimento || atendimento.clinicaId !== clinicaId) {
    throw new Error('Atendimento não encontrado');
  }

  await prisma.$transaction([
    prisma.notificacao.deleteMany({ where: { atendimentoId } }),
    prisma.stageLog.deleteMany({ where: { atendimentoId } }),
    prisma.midia.deleteMany({ where: { atendimentoId } }),
    prisma.atendimento.delete({ where: { id: atendimentoId } }),
  ]);
  revalidatePath('/atendimentos');
}

export async function createAtendimento(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const clinicaId = user.app_metadata.clinica_id;
  const petId = formData.get('petId') as string;
  const servicoId = formData.get('servicoId') as string;
  const observacoes = formData.get('observacoes') as string || null;

  const atendimento = await prisma.atendimento.create({
    data: {
      petId,
      servicoId,
      clinicaId,
      profissionalId: user.id,
      observacoes,
      status: 'AGUARDANDO',
      currentStage: 0,
      checkinAt: new Date(),
    },
  });

  revalidatePath('/atendimentos');
  return { success: true, id: atendimento.id };
}
