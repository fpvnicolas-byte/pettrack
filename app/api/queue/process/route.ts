import { NextResponse } from 'next/server';
import { processWhatsAppQueue } from '@/lib/queue/whatsapp.worker';

// Endpoint para processar a fila de WhatsApp
// Chamar via cron (Vercel Cron ou external) a cada 10 segundos
// Ou usar Upstash QStash para trigger

export async function GET(request: Request) {
  // Validar token de segurança
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.WHATSAPP_VERIFY_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processWhatsAppQueue();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Queue Processor]', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
