import Link from 'next/link';
import { CheckoutButton } from '@/components/planos/checkout-button';

export const metadata = {
  title: 'Planos — VetTrack',
  description: 'Escolha o plano ideal para sua clínica ou petshop.',
};

export const PLANOS = [
  {
    id: 'TRIAL' as const,
    nome: 'Trial',
    preco: 0,
    periodo: '14 dias grátis',
    descricao: 'Para experimentar sem compromisso',
    stripePriceId: null,
    destaque: false,
    features: [
      '1 profissional',
      'Até 30 atendimentos/mês',
      'Notificações WhatsApp',
      'Todos os tipos de serviço',
      'Suporte por e-mail',
    ],
    limitacoes: [
      'Sem upload de fotos/vídeos',
      'Sem relatórios',
    ],
    cta: 'Começar grátis',
    ctaHref: '/register',
  },
  {
    id: 'BASICO' as const,
    nome: 'Básico',
    preco: 7900,
    periodo: '/mês',
    descricao: 'Para petshops e clínicas pequenas',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASICO ?? '',
    destaque: false,
    features: [
      'Até 3 profissionais',
      'Até 200 atendimentos/mês',
      'Notificações WhatsApp',
      'Todos os tipos de serviço',
      'Upload de fotos nos estágios',
      'Histórico de atendimentos',
      'Suporte por e-mail',
    ],
    limitacoes: [],
    cta: 'Assinar Básico',
    ctaHref: null,
  },
  {
    id: 'PROFISSIONAL' as const,
    nome: 'Profissional',
    preco: 14900,
    periodo: '/mês',
    descricao: 'Para clínicas em crescimento',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFISSIONAL ?? '',
    destaque: true,
    features: [
      'Até 10 profissionais',
      'Atendimentos ilimitados',
      'Notificações WhatsApp',
      'Todos os tipos de serviço',
      'Upload de fotos e vídeos',
      'Histórico completo',
      'Relatórios básicos',
      'Suporte prioritário',
    ],
    limitacoes: [],
    cta: 'Assinar Profissional',
    ctaHref: null,
  },
  {
    id: 'PREMIUM' as const,
    nome: 'Premium',
    preco: 29900,
    periodo: '/mês',
    descricao: 'Para redes e clínicas de alto volume',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM ?? '',
    destaque: false,
    features: [
      'Profissionais ilimitados',
      'Atendimentos ilimitados',
      'Notificações WhatsApp',
      'Todos os tipos de serviço',
      'Upload de fotos e vídeos',
      'Histórico completo',
      'Relatórios avançados',
      'Multi-unidade (em breve)',
      'Suporte dedicado via WhatsApp',
      'Onboarding personalizado',
    ],
    limitacoes: [],
    cta: 'Assinar Premium',
    ctaHref: null,
  },
];

function formatPreco(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  });
}

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef] font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-white text-lg tracking-tight">VetTrack</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
              Entrar
            </Link>
            <Link href="/register" className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-[#1a1a2e] text-white py-16 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Planos e Preços</h1>
          <p className="text-gray-400 text-lg">
            Comece grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* CARDS */}
      <section className="py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANOS.map((plano) => (
              <div
                key={plano.id}
                className={`relative bg-white rounded-2xl shadow-sm border flex flex-col ${
                  plano.destaque
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-100'
                    : 'border-gray-100'
                }`}
              >
                {plano.destaque && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Mais popular
                    </span>
                  </div>
                )}

                <div className="p-6 border-b border-gray-100">
                  <div className="font-bold text-[#1a1a2e] text-xl mb-1">{plano.nome}</div>
                  <div className="text-gray-400 text-xs mb-4">{plano.descricao}</div>
                  {plano.preco === 0 ? (
                    <div>
                      <span className="text-3xl font-bold text-[#1a1a2e]">Grátis</span>
                      <span className="text-gray-400 text-sm ml-2">{plano.periodo}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-[#1a1a2e]">{formatPreco(plano.preco)}</span>
                      <span className="text-gray-400 text-sm">{plano.periodo}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col gap-5">
                  <ul className="space-y-2.5 flex-1">
                    {plano.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                    {plano.limitacoes.map((l) => (
                      <li key={l} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-gray-300 mt-0.5 flex-shrink-0">✗</span>
                        {l}
                      </li>
                    ))}
                  </ul>

                  {plano.ctaHref ? (
                    <Link
                      href={plano.ctaHref}
                      className={`w-full text-center py-3 px-4 rounded-xl font-semibold text-sm transition-colors ${
                        plano.destaque
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white'
                      }`}
                    >
                      {plano.cta}
                    </Link>
                  ) : (
                    <CheckoutButton
                      planoId={plano.id}
                      stripePriceId={plano.stripePriceId}
                      label={plano.cta}
                      destaque={plano.destaque}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-5 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a1a2e] text-center mb-10">Perguntas frequentes</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Preciso de conta WhatsApp Business para usar o VetTrack?',
                a: 'Sim, você precisa de uma conta na Meta Cloud API (WhatsApp Business API). Ajudamos você a configurar no onboarding. O processo leva cerca de 2 dias úteis.',
              },
              {
                q: 'O que acontece quando o trial de 14 dias termina?',
                a: 'Sua conta fica em modo restrito — você ainda acessa os dados, mas não consegue registrar novos atendimentos. Para continuar, basta escolher um plano.',
              },
              {
                q: 'Posso mudar de plano depois?',
                a: 'Sim, a qualquer momento. Se você fizer upgrade, o valor é proporcional ao período restante do mês. No downgrade, aplica a partir da próxima renovação.',
              },
              {
                q: 'Os atendimentos e histórico ficam salvos ao cancelar?',
                a: 'Sim. Seus dados ficam armazenados por 90 dias após o cancelamento. Você pode exportar a qualquer momento.',
              },
              {
                q: 'Qual forma de pagamento é aceita?',
                a: 'Cartão de crédito e débito via Stripe. PIX em breve.',
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-[#1a1a2e] mb-2">{item.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a1a2e] py-20 px-5 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-gray-400 mb-8">14 dias grátis, sem compromisso.</p>
          <Link
            href="/register"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111120] py-10 px-5 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl">🐾</span>
          <span className="font-bold text-gray-400">VetTrack</span>
        </div>
        <p className="text-xs text-gray-700">© {new Date().getFullYear()} VetTrack. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
