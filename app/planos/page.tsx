import Link from 'next/link';
import { CheckoutButton } from '@/components/planos/checkout-button';
import { PLANOS } from '@/lib/planos';

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

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
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
            <Link href="/register" className="text-sm bg-vettrack-accent hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-opacity">
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-[#1a1a2e] text-white pt-16 pb-20 md:pt-24 md:pb-32 px-5 text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-vettrack-accent/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-block bg-white/10 text-white/80 text-[10px] font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase border border-white/10">
            Preço único, sem surpresas
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Simples de entender.<br />Difícil de largar.
          </h1>
          <p className="text-gray-300 text-xl font-medium">
            7 dias grátis para sentir a diferença. Sem cartão de crédito.
          </p>
        </div>
      </section>

      {/* CARDS */}
      <section className="py-24 px-5 -mt-20 relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 items-end">
            {PLANOS.map((plano) => (
              <div
                key={plano.id}
                className={`relative bg-white rounded-[2.5rem] shadow-sm border flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  plano.destaque
                    ? 'border-vettrack-accent ring-[4px] ring-vettrack-accent/20 shadow-xl shadow-vettrack-accent/10 transform scale-105 z-10'
                    : 'border-gray-100'
                }`}
              >
                {plano.destaque && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-vettrack-accent text-white text-[10px] uppercase tracking-widest font-bold px-5 py-2 rounded-full shadow-lg shadow-vettrack-accent/30 flex items-center gap-1.5">
                      ⭐ Mais escolhido
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
                  ) : plano.preco === -1 ? (
                    <div>
                      <span className="text-3xl font-bold text-[#1a1a2e]">Sob consulta</span>
                      <div className="mt-1 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
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
                      target={plano.id === 'ENTERPRISE' ? '_blank' : undefined}
                      rel={plano.id === 'ENTERPRISE' ? 'noopener noreferrer' : undefined}
                      className={`w-full text-center py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                        plano.destaque
                          ? 'bg-vettrack-accent hover:opacity-90 text-white'
                          : plano.id === 'ENTERPRISE'
                          ? 'bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-[#1a1a2e]'
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
      <section className="bg-[#1a1a2e] py-20 px-5 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para transformar seu atendimento?</h2>
          <p className="text-gray-400 mb-8">7 dias grátis. Sem cartão. Cancele quando quiser.</p>
          <Link
            href="/register"
            className="inline-block bg-vettrack-accent hover:opacity-90 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-opacity"
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
