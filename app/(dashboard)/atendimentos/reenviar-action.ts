'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppNow } from '@/lib/queue/whatsapp.worker';
import { revalidatePath } from 'next/cache';

export async function reenviarWhatsApp(atendimentoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  // Find the most recent FAILED notification for this atendimento
  const failedNotification = await prisma.notificacao.findFirst({
    where: { atendimentoId, status: 'ERRO' },
    orderBy: { createdAt: 'desc' },
  });

  if (!failedNotification) {
    return { success: false, error: 'Nenhuma notificação com erro encontrada' };
  }

  // Re-send using the stored data from the failed notification
  const result = await sendWhatsAppNow({
    atendimentoId,
    stageId: 'retry',
    whatsappMsg: (failedNotification.variaveis as any[])?.[1]?.text || '',
    mediaUrl: failedNotification.midiaUrl ?? undefined,
    mediaType: failedNotification.midiaUrl
      ? (failedNotification.templateName === 'pet_status_media' ? 'image' : undefined)
      : undefined,
  });

  // If successful, update the failed notification status
  if (result.success) {
    await prisma.notificacao.update({
      where: { id: failedNotification.id },
      data: { status: 'ENVIADO', enviadoAt: new Date(), waMessageId: result.messageId, erroMsg: null },
    });
  }

  revalidatePath('/atendimentos');
  return result;
}
