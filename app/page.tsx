import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'VetTrack — Acompanhamento em Tempo Real para Clínicas Veterinárias',
  description:
    'Notifique tutores automaticamente via WhatsApp a cada etapa do atendimento. Sem app, sem complicação.',
};

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/atendimentos');

  return (
    <div className="min-h-screen bg-[#f5f3ef] font-sans">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-white text-lg tracking-tight">VetTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Entrar
            </Link>
            <Link
              href="/planos"
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Ver planos
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-[#1a1a2e] text-white pt-20 pb-28 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-500/15 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Para clínicas e petshops
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Seu cliente sabe{' '}
            <span className="text-blue-400">em tempo real</span>
            {' '}o que está acontecendo com o pet
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            O profissional avança o status com 2 toques. O tutor recebe no WhatsApp automaticamente — sem baixar nenhum app.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-blue-500/25"
            >
              Começar grátis por 14 dias
            </Link>
            <Link
              href="/planos"
              className="bg-white/10 hover:bg-white/15 text-white px-8 py-4 rounded-xl font-semibold text-base transition-colors border border-white/10"
            >
              Ver planos e preços
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-4">Sem cartão de crédito no trial. Cancele quando quiser.</p>
        </div>
      </section>

      {/* ── WHATSAPP PREVIEW ── */}
      <section className="py-20 px-5 bg-[#f5f3ef]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4">
              O tutor recebe assim, no WhatsApp
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Mensagens automáticas a cada etapa — como se fosse você mandando
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            {/* Phone mockup */}
            <div className="relative w-72 flex-shrink-0">
              <div className="bg-[#075e54] rounded-t-3xl rounded-b-none px-4 pt-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🐾</div>
                  <div>
                    <div className="text-white text-sm font-semibold">Clínica VetPet</div>
                    <div className="text-[#25d366] text-xs">Online</div>
                  </div>
                </div>
              </div>
              <div className="bg-[#e5ddd5] p-4 rounded-b-3xl space-y-3 min-h-[320px]">
                <WaMessage
                  text="Olá, Maria! 👋 O Max acabou de dar entrada na clínica. Assim que tiver novidades, te avisamos por aqui!"
                  time="09:12"
                  stage="Check-in"
                />
                <WaMessage
                  text="Boa notícia! O Max já está no banho. Tudo indo bem por aqui 🛁"
                  time="10:05"
                  stage="Banho"
                />
                <WaMessage
                  text="Pronto! O Max foi tosado e ficou lindo ✂️✨ Pode vir buscar quando quiser!"
                  time="11:30"
                  stage="Pronto p/ retirada"
                  highlight
                />
              </div>
            </div>

            {/* Benefits list */}
            <div className="space-y-5 max-w-sm">
              {[
                { icon: '⚡', title: '2 toques', desc: 'O profissional avança o estágio direto do celular, sem atrapalhar o atendimento.' },
                { icon: '📲', title: 'WhatsApp automático', desc: 'O tutor recebe mensagem personalizada com o nome do pet e da clínica.' },
                { icon: '📷', title: 'Foto opcional', desc: 'Em estágios selecionados, envie uma foto do pet junto com a notificação.' },
                { icon: '📊', title: 'Histórico completo', desc: 'Todos os atendimentos e notificações ficam registrados no dashboard.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-[#1a1a2e] mb-0.5">{item.title}</div>
                    <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4">Como funciona</h2>
            <p className="text-gray-500 text-lg">Em 3 passos simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Pet dá entrada',
                desc: 'O profissional abre o atendimento no VetTrack. Tutor recebe confirmação no WhatsApp.',
                icon: '🏥',
              },
              {
                step: '2',
                title: 'Status é atualizado',
                desc: 'A cada etapa (banho, cirurgia, exame…), 2 toques e o tutor é notificado automaticamente.',
                icon: '🔔',
              },
              {
                step: '3',
                title: 'Pet está pronto',
                desc: 'Quando finalizar, o tutor recebe aviso de retirada. Sem ligações, sem mensagens manuais.',
                icon: '✅',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Passo {item.step}</div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS SUPORTADOS ── */}
      <section className="py-20 px-5 bg-[#f5f3ef]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4">
              Funciona para todos os serviços
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🛁', name: 'Banho & Tosa', stages: '5 etapas' },
              { icon: '🔬', name: 'Cirurgia', stages: '6 etapas' },
              { icon: '🩺', name: 'Consulta', stages: '5 etapas' },
              { icon: '🏠', name: 'Internamento', stages: '5 etapas' },
            ].map((s) => (
              <div key={s.name} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="font-semibold text-[#1a1a2e] mb-1">{s.name}</div>
                <div className="text-xs text-gray-400">{s.stages} configuráveis</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4">
              O que clínicas dizem
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Reduziu as ligações dos tutores perguntando sobre o pet em mais de 70%. A equipe consegue focar no atendimento.',
                author: 'Dra. Ana Luíza',
                role: 'Clínica VetCare SP',
              },
              {
                quote: 'Nossos clientes amam receber a foto do pet após a cirurgia. Diferencial enorme de satisfação.',
                author: 'Dr. Rafael Costa',
                role: 'Centro Cirúrgico Animal',
              },
              {
                quote: 'Implementamos em um dia. A interface é simples, qualquer banhista consegue usar.',
                author: 'Patrícia M.',
                role: 'PetShop Fofo & Limpo',
              },
            ].map((t) => (
              <div key={t.author} className="bg-[#f5f3ef] rounded-2xl p-6 border border-gray-100">
                <div className="text-yellow-400 text-sm mb-3">★★★★★</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-[#1a1a2e] text-sm">{t.author}</div>
                  <div className="text-gray-400 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-[#1a1a2e] py-24 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comece hoje, é grátis por 14 dias
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Sem cartão de crédito. Configure em minutos e já use no primeiro atendimento.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-blue-500/25"
          >
            Criar conta grátis
          </Link>
          <div className="mt-6">
            <Link href="/planos" className="text-gray-500 hover:text-gray-300 text-sm underline underline-offset-2 transition-colors">
              Ver todos os planos e preços
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111120] py-10 px-5 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl">🐾</span>
          <span className="font-bold text-gray-400">VetTrack</span>
        </div>
        <div className="flex flex-wrap justify-center gap-5 mb-6 text-xs">
          <Link href="/planos" className="hover:text-gray-400 transition-colors">Planos</Link>
          <Link href="/login" className="hover:text-gray-400 transition-colors">Entrar</Link>
          <Link href="/register" className="hover:text-gray-400 transition-colors">Criar conta</Link>
        </div>
        <p className="text-xs text-gray-700">© {new Date().getFullYear()} VetTrack. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function WaMessage({
  text,
  time,
  stage,
  highlight = false,
}: {
  text: string;
  time: string;
  stage: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${highlight ? 'items-end' : 'items-start'}`}>
      <span className="text-[9px] text-gray-500 font-medium px-1">{stage}</span>
      <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm">
        <p className="text-[11px] text-gray-800 leading-relaxed">{text}</p>
        <p className="text-[9px] text-gray-400 text-right mt-1">{time} ✓✓</p>
      </div>
    </div>
  );
}
