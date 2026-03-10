import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

// Necessário para ler o raw body do webhook no App Router
export const runtime = 'nodejs';

const PLANO_MAP: Record<string, 'PROFISSIONAL'> = {
  PROFISSIONAL: 'PROFISSIONAL',
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Sem assinatura Stripe' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[stripe/webhook] Assinatura inválida:', err);
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        // Evento não tratado — OK
        break;
    }
  } catch (err) {
    console.error('[stripe/webhook] Erro ao processar evento:', event.type, err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clinicaId = session.metadata?.clinicaId;
  const planoId = session.metadata?.planoId;

  if (!clinicaId || !planoId) {
    console.warn('[stripe/webhook] checkout.session.completed sem clinicaId/planoId:', session.id);
    return;
  }

  const plano = PLANO_MAP[planoId];
  if (!plano) return;

  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const stripeSubscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  await prisma.clinica.update({
    where: { id: clinicaId },
    data: {
      plano,
      stripeCustomerId: stripeCustomerId ?? undefined,
      stripeSubscriptionId: stripeSubscriptionId ?? undefined,
    },
  });

  console.log(`[stripe/webhook] Clínica ${clinicaId} → plano ${plano}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const clinicaId = subscription.metadata?.clinicaId;
  if (!clinicaId) return;

  const planoId = subscription.metadata?.planoId;
  const plano = planoId ? PLANO_MAP[planoId] : undefined;

  const isActive = ['active', 'trialing'].includes(subscription.status);

  if (plano && isActive) {
    await prisma.clinica.update({
      where: { id: clinicaId },
      data: { plano, stripeSubscriptionId: subscription.id },
    });
    console.log(`[stripe/webhook] Subscription updated → clínica ${clinicaId} plano ${plano}`);
  } else if (!isActive) {
    await prisma.clinica.update({
      where: { id: clinicaId },
      data: { plano: 'TRIAL' },
    });
    console.log(`[stripe/webhook] Subscription inativa → clínica ${clinicaId} voltou para TRIAL`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const clinicaId = subscription.metadata?.clinicaId;
  if (!clinicaId) return;

  await prisma.clinica.update({
    where: { id: clinicaId },
    data: { plano: 'TRIAL', stripeSubscriptionId: null },
  });

  console.log(`[stripe/webhook] Subscription cancelada → clínica ${clinicaId} voltou para TRIAL`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  console.warn(`[stripe/webhook] Pagamento falhou para customer ${customerId}`);
  // Aqui você pode enviar e-mail ou notificação ao admin da clínica
}
