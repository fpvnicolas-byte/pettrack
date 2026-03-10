import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { ConfiguracoesPainel } from '@/components/configuracoes/configuracoes-painel';

export interface AssinaturaInfo {
  status: string | null;         // 'active' | 'trialing' | 'canceled' | null
  planoNome: string | null;      // nome do produto no Stripe
  renovacaoEm: string | null;    // ISO date
  cancelamentoEm: string | null; // ISO date (se cancelado mas ainda vigente)
  temStripe: boolean;
}

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const clinicaId = user?.app_metadata?.clinica_id;
  const role = user?.app_metadata?.role;

  if (!clinicaId || !user) return <div>Erro: clínica não encontrada</div>;

  const [clinica, membros] = await Promise.all([
    prisma.clinica.findUnique({
      where: { id: clinicaId },
      select: {
        id: true,
        nome: true,
        telefone: true,
        endereco: true,
        whatsappPhoneId: true,
        whatsappToken: true,
        plano: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    }),
    prisma.usuario.findMany({
      where: { clinicaId },
      select: { id: true, nome: true, email: true, role: true, ativo: true },
      orderBy: [{ role: 'asc' }, { nome: 'asc' }],
    }),
  ]);

  if (!clinica) return <div>Erro: clínica não encontrada</div>;

  // Busca dados reais da assinatura no Stripe (se configurado)
  let assinatura: AssinaturaInfo = { status: null, planoNome: null, renovacaoEm: null, cancelamentoEm: null, temStripe: false };

  const stripeConfigurado = !!process.env.STRIPE_SECRET_KEY;

  if (stripeConfigurado && clinica.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(clinica.stripeSubscriptionId, {
        expand: ['items.data.price.product'],
      });

      const item = sub.items.data[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = (item?.price as any)?.product;
      const planoNome = product && typeof product === 'object' && 'name' in product
        ? (product as { name: string }).name
        : null;

      // Na API 2026-02-25 o campo de fim do período foi reorganizado
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subAny = sub as any;
      const periodEnd: number | null =
        subAny.current_period_end ??
        subAny.billing_cycle_anchor ??
        null;

      assinatura = {
        temStripe: true,
        status: sub.status,
        planoNome,
        renovacaoEm: periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null,
        cancelamentoEm: subAny.cancel_at
          ? new Date(subAny.cancel_at * 1000).toISOString()
          : null,
      };
    } catch {
      // Stripe não configurado ou erro — exibe estado neutro
      assinatura = { status: null, planoNome: null, renovacaoEm: null, cancelamentoEm: null, temStripe: false };
    }
  }

  const { stripeCustomerId: _c, stripeSubscriptionId: _s, ...clinicaSemStripe } = clinica;

  return (
    <ConfiguracoesPainel
      clinica={clinicaSemStripe}
      isAdmin={role === 'ADMIN'}
      membros={membros}
      currentUserId={user.id}
      assinatura={assinatura}
    />
  );
}
