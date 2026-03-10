import { NextResponse } from 'next/server';

// Rota mantida para compatibilidade mas não é mais usada.
// O envio de WhatsApp agora é feito diretamente em advanceStage().
export async function GET() {
  return NextResponse.json({ message: 'Queue processing disabled — WhatsApp is sent directly on stage advance.' });
}
