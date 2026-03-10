import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Verificação do webhook (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Receber status de entrega (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const statuses = change.value?.statuses || [];

        for (const status of statuses) {
          const waMessageId = status.id;
          const waStatus = status.status;

          const statusMap: Record<string, string> = {
            sent: 'ENVIADO',
            delivered: 'ENTREGUE',
            read: 'LIDO',
            failed: 'ERRO',
          };

          await prisma.notificacao.updateMany({
            where: { waMessageId },
            data: {
              status: statusMap[waStatus] || 'ENVIADO',
              ...(waStatus === 'delivered' && { entregueAt: new Date() }),
              ...(waStatus === 'read' && { lidoAt: new Date() }),
              ...(waStatus === 'failed' && {
                erroMsg: status.errors?.[0]?.title || 'Erro desconhecido',
              }),
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WhatsApp Webhook]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
