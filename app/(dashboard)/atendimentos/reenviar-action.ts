'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppNow } from '@/lib/queue/whatsapp.worker';
import { getEffectiveStages } from '@/lib/stages/stage.config';
import { revalidatePath } from 'next/cache';

export async function reenviarWhatsApp(atendimentoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const atendimento = await prisma.atendimento.findUnique({
    where: { id: atendimentoId },
    include: { servico: true },
  });
  if (!atendimento) throw new Error('Atendimento não encontrado');

  const stages = getEffectiveStages(atendimento);
  const stage = stages[atendimento.currentStage];

  const result = await sendWhatsAppNow({
    atendimentoId,
    stageId: stage.id,
    whatsappMsg: stage.whatsappMsg,
  });

  revalidatePath('/atendimentos');
  return result;
}
