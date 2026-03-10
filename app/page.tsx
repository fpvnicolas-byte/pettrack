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
              className="text-sm bg-vettrack-accent hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-opacity"
            >
              Ver planos
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ASSIMÉTRICO ── */}
      <section className="relative overflow-hidden bg-[#1a1a2e] text-white pt-16 pb-20 md:pt-24 md:pb-32 px-5">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-vettrack-accent/15 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[30rem] h-[30rem] rounded-full bg-vettrack-accent/5 blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-12 items-center relative z-10">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <span className="inline-block bg-vettrack-accent/15 text-vettrack-accent text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase border border-vettrack-accent/20">
              🐾 Especial para clínicas e petshops
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              Seu cliente sabe{' '}
              <span className="relative">
                <span className="relative z-10 text-vettrack-accent">em tempo real</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-vettrack-accent/20 -z-10 rounded-full transform -rotate-1"></span>
              </span>
              {' '}o que está acontecendo.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl font-medium">
              Avançe o status do pet com 2 toques. O tutor recebe a notificação no WhatsApp automaticamente — sem baixar nada e sem ligar para a recepção.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-vettrack-accent hover:opacity-90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-vettrack-accent/20 text-center"
              >
                Testar sem compromisso
              </Link>
              <Link
                href="/planos"
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors border border-white/10 text-center"
              >
                Ver preços
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-5 font-semibold">7 dias grátis. Cancela se não gostar.</p>
          </div>

          <div className="relative w-full h-[350px] md:h-[450px] mt-10 md:mt-0 flex items-center justify-center">
            {/* Mock Dashboard Card */}
            <div className="absolute top-0 right-0 md:top-4 md:-right-8 w-4/5 md:w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 transform rotate-3 hover:rotate-1 transition-transform duration-500 z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-2xl border border-amber-100">🐕</div>
                  <div className="text-left">
                    <div className="font-bold text-vettrack-dark text-sm md:text-base">Max (Golden)</div>
                    <div className="text-xs text-gray-400 font-medium">Banho & Tosa</div>
                  </div>
                </div>
                <div className="bg-vettrack-accent/10 text-vettrack-accent text-[10px] md:text-xs uppercase font-bold px-3 py-1 rounded-full hidden sm:block">
                  Em progresso
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-vettrack-success flex items-center justify-center text-white text-[10px] flex-shrink-0">✓</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="w-full h-full bg-vettrack-success"></div></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-vettrack-accent flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-vettrack-accent animate-pulse"></div></div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden relative"><div className="w-[45%] h-full bg-vettrack-accent"></div></div>
                </div>
                <div className="flex items-center gap-3 opacity-30">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Mock WhatsApp Overlay */}
            <div className="absolute -bottom-8 left-0 md:-bottom-12 md:-left-12 w-[85%] md:w-[90%] bg-[#efeae2] rounded-3xl shadow-2xl border-[6px] border-white p-3 transform -rotate-3 hover:rotate-0 transition-transform duration-500 z-20 overflow-hidden">
              <div className="bg-[#075e54] absolute top-0 left-0 w-full px-4 py-3 flex items-center gap-2 shadow-sm z-30">
                <div className="w-8 h-8 rounded-full bg-white/20 flex flex-shrink-0 items-center justify-center text-sm">🏥</div>
                <div className="text-left">
                  <div className="text-white text-xs font-bold leading-tight">Clínica VetTrack</div>
                  <div className="text-[#25d366] text-[9px] font-medium leading-tight tracking-wide">Comercial</div>
                </div>
              </div>
              <div className="mt-14 space-y-3 pb-2 relative z-20">
                <div className="bg-white rounded-xl rounded-tl-sm p-3 w-[90%] shadow-sm">
                  <div className="text-[10px] text-gray-800 leading-relaxed font-semibold">Olá! O Max acabou de dar entrada para o banho. Avisaremos no próximo passo! 🛁</div>
                  <div className="text-[8px] text-gray-400 text-right mt-1.5 font-bold">09:12</div>
                </div>
                <div className="bg-[#dcf8c6] rounded-xl rounded-tr-sm p-3 w-[85%] ml-auto shadow-sm">
                  <div className="text-[10px] text-gray-800 leading-relaxed font-semibold">Fico no aguardo, obrigado equipe! ❤️</div>
                  <div className="text-[8px] text-[#55b991] text-right mt-1.5 font-bold">09:15 ✓✓</div>
                </div>
              </div>
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'cover' }}></div>
            </div>
          </div>
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

      {/* ── COMO FUNCIONA (ORGÂNICO) ── */}
      <section className="py-16 md:py-24 px-5 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f8f9fc] rounded-l-[5rem] -z-10 transform translate-x-1/2"></div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-vettrack-dark mb-4">Como funciona?</h2>
            <p className="text-gray-500 text-xl font-medium">Tudo através de passos extremamente simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {[
              {
                step: '1',
                title: 'O Pet dá entrada',
                desc: 'O profissional abre o atendimento. O Tutor é notificado confirmando a chegada em segurança.',
                icon: '🏥',
                rotate: 'md:-rotate-2',
                color: 'bg-indigo-50 text-indigo-500'
              },
              {
                step: '2',
                title: 'Avanço Cadenciável',
                desc: 'A cada etapa do processo (Banho, Exames), avança-se com 2 toques. Notificação transparente e amigável.',
                icon: '📲',
                rotate: 'md:translate-y-8',
                color: 'bg-vettrack-accent/10 text-vettrack-accent'
              },
              {
                step: '3',
                title: 'Pronto e Feliz',
                desc: 'Ao finalizar, dispara um recado para a busca. Fim das ligações desesperadas na recepção!',
                icon: '🥳',
                rotate: 'md:rotate-2',
                color: 'bg-green-50 text-green-500'
              },
            ].map((item) => (
              <div key={item.step} className={`bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 transition-transform duration-300 hover:-translate-y-2 ${item.rotate}`}>
                <div className={`w-20 h-20 ${item.color} rounded-[1.5rem] flex items-center justify-center text-4xl mb-6 shadow-inner transform -rotate-3`}>
                  {item.icon}
                </div>
                <div className="inline-block bg-vettrack-dark text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Passo {item.step}</div>
                <h3 className="text-2xl font-bold text-vettrack-dark mb-3">{item.title}</h3>
                <p className="text-gray-500 text-base leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS SUPORTADOS (BENTO GRID) ── */}
      <section className="py-16 md:py-24 px-5 bg-[#f8f9fc] rounded-[2rem] md:rounded-[3rem] mx-2 md:mx-6 my-10 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#00b09b 3px, transparent 3px)", backgroundSize: "32px 32px" }}></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-vettrack-dark mb-4">
              Nasceu para ser versátil
            </h2>
            <p className="text-gray-500 text-xl font-medium">Configurável nativamente para a realidade da sua clínica.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 md:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-8xl opacity-10 group-hover:scale-110 transition-transform">🛁</div>
              <div className="text-5xl mb-4">🛁</div>
              <div className="text-2xl font-bold text-vettrack-dark mb-2">Banho & Tosa</div>
              <p className="text-gray-500 mb-6 max-w-sm text-lg">Notifique a entrada prévia, o banho, a tosa, secagem e a liberação de forma altamente personalizada.</p>
              <div className="inline-block bg-vettrack-accent/10 text-vettrack-accent text-xs font-bold px-3 py-1.5 rounded-full">Até 8 etapas configuráveis</div>
            </div>

            <div className="bg-[#1a1a2e] text-white rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
              <div className="text-5xl mb-4">🔬</div>
              <div className="text-xl font-bold mb-2">Cirurgias</div>
              <p className="text-white/60 text-sm leading-relaxed">Traga paz mental ao tutor enviando fotos reais do pós-cirúrgico com 1 toque na tela logo após a cirurgia.</p>
            </div>

            <div className="bg-vettrack-accent text-white rounded-[2.5rem] p-8 shadow-lg shadow-vettrack-accent/20 relative overflow-hidden">
              <div className="text-5xl mb-4">🩺</div>
              <div className="text-xl font-bold mb-2">Consultas Custom</div>
              <p className="text-white/80 text-sm leading-relaxed">Ideal para aquelas baterias de exames longos em que o animal precisa permanecer na clínica pela manhã.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 md:col-span-2 relative">
              <div className="text-5xl mb-4">🏠</div>
              <div className="text-2xl font-bold text-vettrack-dark mb-2">Internamento / UTI</div>
              <p className="text-gray-500 text-lg max-w-md">Dispare boletins médicos diários no celular do tutor sem a necessidade de uma chamada telefônica delicada e invasiva.</p>
            </div>
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
            Comece hoje, é grátis por 7 dias
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Sem cartão de crédito. Configure em minutos e já use no primeiro atendimento.
          </p>
          <Link
            href="/register"
            className="inline-block bg-vettrack-accent hover:opacity-90 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-opacity shadow-lg shadow-vettrack-accent/25"
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
