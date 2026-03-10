import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { planoId } = await req.json();

    if (!planoId || !STRIPE_PRICE_IDS[planoId]) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const priceId = STRIPE_PRICE_IDS[planoId];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID do Stripe não configurado para este plano.' },
        { status: 500 }
      );
    }

    // Pegar clínica do usuário autenticado (se houver)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let customerEmail: string | undefined;
    let clinicaId: string | undefined;
    let stripeCustomerId: string | undefined;

    if (user) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: user.id },
        include: { clinica: true },
      });

      if (usuario) {
        customerEmail = usuario.email;
        clinicaId = usuario.clinicaId;
        stripeCustomerId = usuario.clinica.stripeCustomerId ?? undefined;
      }
    }

    // Reutilizar customer Stripe existente ou criar novo
    let customerId = stripeCustomerId;
    if (!customerId && customerEmail) {
      const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: customerEmail });
        customerId = customer.id;
      }

      // Salvar stripeCustomerId na clínica
      if (clinicaId) {
        await prisma.clinica.update({
          where: { id: clinicaId },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/planos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/planos`,
      metadata: {
        planoId,
        clinicaId: clinicaId ?? '',
      },
      subscription_data: {
        metadata: {
          planoId,
          clinicaId: clinicaId ?? '',
        },
      },
      allow_promotion_codes: true,
      locale: 'pt-BR',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Erro ao criar sessão de checkout.' }, { status: 500 });
  }
}
