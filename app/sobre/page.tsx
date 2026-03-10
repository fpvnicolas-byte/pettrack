import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/public-navbar';

export const metadata = {
    title: 'Sobre Nós | VetTrack',
    description: 'Conheça mais sobre o VetTrack, a plataforma que conecta clínicas veterinárias e tutores.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#f5f3ef] font-sans">
            {/* ── NAVBAR ── */}
            <PublicNavbar />

            {/* ── HERO ── */}
            <section className="bg-[#1a1a2e] pt-16 pb-20 px-5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-vettrack-accent/15 blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[30rem] h-[30rem] rounded-full bg-vettrack-accent/5 blur-[100px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <span className="inline-block bg-vettrack-accent/15 text-vettrack-accent text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase border border-vettrack-accent/20">
                        Muito Prazer
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
                        Conectando cuidado com <span className="text-vettrack-accent">transparência</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Nascemos para resolver uma das maiores dores do mercado pet: a ansiedade do tutor durante o atendimento.
                    </p>
                </div>
            </section>

            {/* ── HISTÓRIA E MISSÃO ── */}
            <section className="py-16 md:py-24 px-5">
                <div className="max-w-4xl mx-auto space-y-16">

                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-vettrack-dark mb-4">Nossa História</h2>
                            <p className="text-gray-600 leading-relaxed text-lg mb-4">
                                O VetTrack surgiu da observação diária em clínicas veterinárias e pet shops. Percebemos que
                                grande parte do tempo da recepção era gasto acalmando tutores e informando o status dos banhos
                                ou cirurgias.
                            </p>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Decidimos criar uma solução que não exigisse o download de um novo aplicativo pelos clientes,
                                utilizando o canal que todo mundo já ama: o WhatsApp.
                            </p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-center transform rotate-1">
                            <div className="text-center">
                                <div className="text-6xl mb-4">💡</div>
                                <h3 className="text-xl font-bold text-vettrack-dark">A Ideia</h3>
                                <p className="text-gray-500 mt-2 text-sm">"Como informar sem interromper o trabalho do clínico?" <br />A resposta virou o VetTrack.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div className="bg-vettrack-accent text-white rounded-3xl p-8 shadow-lg shadow-vettrack-accent/20 order-2 md:order-1 transform -rotate-1">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🎯</div>
                                    <h3 className="text-2xl font-bold">Nossa Missão</h3>
                                </div>
                                <p className="text-white/90 leading-relaxed text-lg font-medium">
                                    Trazer paz mental para os tutores e eficiência operacional brutal para as clínicas veterinárias e pet shops do Brasil.
                                </p>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-3xl font-bold text-vettrack-dark mb-4">O que defendemos</h2>
                            <ul className="space-y-4 mt-6">
                                {[
                                    { title: "Simplicidade", desc: "A tecnologia deve ajudar, não atrapalhar. Tudo precisa funcionar com 2 toques." },
                                    { title: "Transparência", desc: "O tutor tem o direito de saber o que está acontecendo com o seu melhor amigo." },
                                    { title: "Foco no Profissional", desc: "O banhista e o veterinário devem focar no pet, não no telefone." }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-vettrack-dark">{item.title}</h4>
                                            <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── CTA FINAL ── */}
            <section className="py-20 px-5 bg-white border-t border-gray-100">
                <div className="max-w-3xl mx-auto text-center bg-[#f8f9fc] rounded-[3rem] p-12 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-vettrack-accent via-emerald-400 to-vettrack-accent"></div>
                    <h2 className="text-3xl font-bold text-vettrack-dark mb-4">Transforme o atendimento da sua clínica</h2>
                    <p className="text-gray-500 text-lg mb-8">
                        Junte-se às clínicas que já abandonaram as ligações e fardos na recepção. O futuro do relacionamento pet é em tempo real.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="bg-vettrack-accent hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-vettrack-accent/20"
                        >
                            Iniciar Teste Grátis
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
                    <Link href="/sobre" className="hover:text-gray-400 transition-colors">Sobre</Link>
                    <Link href="/planos" className="hover:text-gray-400 transition-colors">Planos</Link>
                    <Link href="/login" className="hover:text-gray-400 transition-colors">Entrar</Link>
                    <Link href="/register" className="hover:text-gray-400 transition-colors">Criar conta</Link>
                    <Link href="/privacidade" className="hover:text-gray-400 transition-colors">Privacidade</Link>
                    <Link href="/termos" className="hover:text-gray-400 transition-colors">Termos de Uso</Link>
                </div>
                <p className="text-xs text-gray-700">© {new Date().getFullYear()} VetTrack. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
