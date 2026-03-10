'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppNow } from '@/lib/queue/whatsapp.worker';
import { revalidatePath } from 'next/cache';
import type { StageDefinition } from '@/types';

export async function reenviarWhatsApp(atendimentoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const atendimento = await prisma.atendimento.findUnique({
    where: { id: atendimentoId },
    include: { servico: true },
  });
  if (!atendimento) throw new Error('Atendimento não encontrado');

  const stages = atendimento.servico.stages as unknown as StageDefinition[];
  const stage = stages[atendimento.currentStage];

  const result = await sendWhatsAppNow({
    atendimentoId,
    stageId: stage.id,
  });

  revalidatePath('/atendimentos');
  return result;
}
