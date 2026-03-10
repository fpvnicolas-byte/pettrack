import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/public-navbar';

export const metadata = {
    title: 'Termos de Uso | VetTrack',
    description: 'Termos de Uso do VetTrack.',
};

export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen bg-[#f5f3ef] font-sans">
            {/* ── NAVBAR ── */}
            <PublicNavbar />

            {/* ── HERO ── */}
            <section className="bg-[#1a1a2e] pt-16 pb-20 px-5 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Termos de Uso</h1>
                    <p className="text-lg text-gray-300">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            </section>

            {/* ── CONTEÚDO ── */}
            <section className="py-16 md:py-24 px-5">
                <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8 text-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">1. Aceitação dos Termos</h2>
                        <p className="leading-relaxed">
                            Ao acessar e usar a plataforma VetTrack, você concorda em cumprir e ser regido pelos
                            presentes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá
                            utilizar nossos serviços.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">2. Descrição do Serviço</h2>
                        <p className="leading-relaxed">
                            O VetTrack é uma plataforma de software como serviço (SaaS) projetada para clínicas
                            veterinárias e pet shops. Nosso sistema permite o acompanhamento em tempo real do status de
                            pets em atendimento e o disparo de notificações automáticas via WhatsApp para os tutores.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">3. Responsabilidades do Cliente (Clínica)</h2>
                        <p className="leading-relaxed mb-4">
                            Ao utilizar o VetTrack, a Clínica concorda em:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Fornecer informações verdadeiras e atualizadas.</li>
                            <li>Obter o consentimento prévio dos tutores para o envio de mensagens informativas via WhatsApp.</li>
                            <li>Utilizar a plataforma em conformidade com as leis vigentes e, em especial, a Lei Geral de Proteção de Dados (LGPD).</li>
                            <li>Manter o sigilo de suas credenciais de acesso.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">4. Planos e Pagamentos</h2>
                        <p className="leading-relaxed">
                            O acesso ao sistema dá-se mediante contratação de um plano de assinatura recorrente. Oferecemos
                            um período de testes de 7 dias grátis. Encerrado este período, a continuação do uso requer
                            escolha e pagamento do plano adequado às necessidades da clínica, sob pena de suspensão do serviço.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">5. Propriedade Intelectual</h2>
                        <p className="leading-relaxed">
                            Todo o conteúdo, layout, logotipos, código e tecnologia empregados no VetTrack são de nossa
                            propriedade exclusiva. É proibida a cópia, engenharia reversa, redistribuição ou uso
                            não autorizado da plataforma.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">6. Limitação de Responsabilidade</h2>
                        <p className="leading-relaxed">
                            O VetTrack envidará os melhores esforços para manter o sistema online e a entrega das mensagens
                            via WhatsApp, cujas taxas de sucesso dependem de serviços de terceiros (como a Meta). Não nos
                            responsabilizamos por interrupções temporárias ou eventuais instabilidades nas integrações.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">7. Alterações nestes Termos</h2>
                        <p className="leading-relaxed">
                            Podemos modificar estes Termos de Uso a qualquer momento. Em caso de mudanças significativas,
                            informaremos nossos clientes pelos canais oficiais de contato.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">8. Contato</h2>
                        <p className="leading-relaxed">
                            Para suporte ou dúvidas referentes a estes Termos, fale com a gente:
                            <a href="mailto:contato@vettrack.com.br" className="text-vettrack-accent hover:underline ml-1">contato@vettrack.com.br</a>.
                        </p>
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
