import Link from 'next/link';
import { CheckoutButton } from '@/components/planos/checkout-button';
import { PLANOS } from '@/lib/planos';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Planos — VetTrack',
  description: 'Escolha o plano ideal para sua clínica ou petshop.',
};

function formatPreco(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  });
}

export default async function PlanosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const planoAtual = user?.app_metadata?.plano as string | undefined;
  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🐾</span>
            <span className="font-bold text-white text-base sm:text-lg tracking-tight">VetTrack</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 min-h-[40px] flex items-center">
              Entrar
            </Link>
            <Link href="/register" className="text-sm bg-vettrack-accent hover:opacity-90 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-opacity min-h-[40px] flex items-center">
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-[#1a1a2e] text-white pt-12 pb-24 sm:pt-16 sm:pb-28 md:pt-24 md:pb-36 px-4 sm:px-5 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-vettrack-accent/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-block bg-white/10 text-white/80 text-[10px] font-bold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase border border-white/10">
            Preço único, sem surpresas
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-tight">
            Simples de entender.<br />Difícil de largar.
          </h1>
          <p className="text-gray-300 text-base sm:text-xl font-medium">
            7 dias grátis para sentir a diferença. Sem cartão de crédito.
          </p>
        </div>
      </section>

      {/* CARDS */}
      <section className="py-10 sm:py-16 md:py-24 px-4 sm:px-5 -mt-16 sm:-mt-20 relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 items-end">
            {PLANOS.map((plano) => (
              <div
                key={plano.id}
                className={`relative bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${plano.destaque
                    ? 'border-vettrack-accent ring-[3px] sm:ring-[4px] ring-vettrack-accent/20 shadow-xl shadow-vettrack-accent/10 sm:transform sm:scale-105 z-10 mt-6 sm:mt-0'
                    : 'border-gray-100'
                  }`}
              >
                {plano.destaque && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center">
                    <span className="bg-vettrack-accent text-white text-[10px] uppercase tracking-widest font-bold px-5 py-2 rounded-full shadow-lg shadow-vettrack-accent/30 flex items-center gap-1.5 whitespace-nowrap">
                      ⭐ Mais escolhido
                    </span>
                  </div>
                )}

                <div className="p-5 sm:p-6 border-b border-gray-100">
                  <div className="font-bold text-[#1a1a2e] text-xl mb-1">{plano.nome}</div>
                  <div className="text-gray-400 text-xs mb-4">{plano.descricao}</div>

                  {plano.preco === 0 ? (
                    <div>
                      <span className="text-3xl font-bold text-[#1a1a2e]">Grátis</span>
                      <span className="text-gray-400 text-sm ml-2">{plano.periodo}</span>
                    </div>
                  ) : plano.preco === -1 ? (
                    <div>
                      <span className="text-3xl font-bold text-[#1a1a2e]">Sob consulta</span>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                        SLA 99% garantido
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-[#1a1a2e]">{formatPreco(plano.preco)}</span>
                      <span className="text-gray-400 text-sm">{plano.periodo}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col gap-5">
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
                    plano.id === 'TRIAL' && planoAtual ? (
                      <div className="relative group">
                        <button
                          disabled
                          className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gray-100 text-gray-400 cursor-not-allowed min-h-[48px]"
                        >
                          {plano.cta}
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1a1a2e] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                          Plano já adquirido
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a2e]" />
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={plano.ctaHref}
                        target={plano.id === 'ENTERPRISE' ? '_blank' : undefined}
                        rel={plano.id === 'ENTERPRISE' ? 'noopener noreferrer' : undefined}
                        className={`w-full text-center py-3.5 px-4 rounded-xl font-semibold text-sm transition-all min-h-[48px] flex items-center justify-center ${plano.destaque
                            ? 'bg-vettrack-accent hover:opacity-90 text-white'
                            : plano.id === 'ENTERPRISE'
                              ? 'bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-[#1a1a2e]'
                          }`}
                      >
                        {plano.cta}
                      </Link>
                    )
                  ) : (
                    <CheckoutButton
                      planoId={plano.id}
                      stripePriceId={plano.stripePriceId}
                      label={plano.cta}
                      destaque={plano.destaque}
                      logado={!!planoAtual}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 px-4 sm:px-5 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1a1a2e] text-center mb-10">Perguntas frequentes</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Preciso de cartão de crédito para o trial?',
                a: 'Não. Os 7 dias gratuitos não exigem nenhuma forma de pagamento. Só pedimos cartão quando você decide assinar.',
              },
              {
                q: 'O que acontece quando o trial de 7 dias termina?',
                a: 'Sua conta fica em modo restrito — você ainda acessa os dados, mas não consegue registrar novos atendimentos. Para continuar, basta escolher um plano.',
              },
              {
                q: 'Preciso de conta WhatsApp Business para usar o VetTrack?',
                a: 'Sim, você precisa de uma conta na Meta Cloud API (WhatsApp Business API). Ajudamos você a configurar no onboarding. O processo leva cerca de 2 dias úteis.',
              },
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim, sem multa e sem burocracia. Se cancelar, seus dados ficam armazenados por 90 dias para exportação.',
              },
              {
                q: 'O que é o plano Enterprise?',
                a: 'É voltado para redes veterinárias, hospitais e operações com alto volume ou múltiplas unidades. Inclui SLA 99% em contrato, CSM dedicado e integrações customizadas. Entre em contato para uma proposta.',
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
      <section className="bg-[#1a1a2e] py-14 sm:py-20 px-4 sm:px-5 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Pronto para transformar seu atendimento?</h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">7 dias grátis. Sem cartão. Cancele quando quiser.</p>
          <Link
            href="/register"
            className="inline-block bg-vettrack-accent hover:opacity-90 text-white px-8 sm:px-10 py-4 rounded-xl font-semibold text-base sm:text-lg transition-opacity min-h-[52px] flex items-center justify-center max-w-xs mx-auto"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111120] py-8 sm:py-10 px-4 sm:px-5 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">🐾</span>
          <span className="font-bold text-gray-400">VetTrack</span>
        </div>
        <p className="text-xs text-gray-700">© {new Date().getFullYear()} VetTrack. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
