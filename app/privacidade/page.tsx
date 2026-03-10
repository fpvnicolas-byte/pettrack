import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/public-navbar';

export const metadata = {
    title: 'Política de Privacidade | VetTrack',
    description: 'Política de Privacidade do VetTrack.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#f5f3ef] font-sans">
            {/* ── NAVBAR ── */}
            <PublicNavbar />

            {/* ── HERO ── */}
            <section className="bg-[#1a1a2e] pt-16 pb-20 px-5 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Política de Privacidade</h1>
                    <p className="text-lg text-gray-300">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            </section>

            {/* ── CONTEÚDO ── */}
            <section className="py-16 md:py-24 px-5">
                <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8 text-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">1. Introdução</h2>
                        <p className="leading-relaxed">
                            Bem-vindo à Política de Privacidade do VetTrack. Nós respeitamos a sua privacidade e estamos
                            comprometidos em proteger os seus dados pessoais. Esta política explica como coletamos,
                            usamos, divulgamos e protegemos as informações de nossos clientes (clínicas veterinárias) e
                            seus respectivos clientes (tutores de pets).
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">2. Coleta de Dados</h2>
                        <p className="leading-relaxed mb-4">
                            Coletamos os seguintes tipos de informações:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Informações da Clínica:</strong> Nome, email, senha, dados de faturamento.</li>
                            <li><strong>Informações dos Tutores:</strong> Nome, número de telefone (WhatsApp) e nome do pet, fornecidos pela Clínica.</li>
                            <li><strong>Dados de Uso:</strong> Interações com nossa plataforma, logs de erro e métricas de desempenho.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">3. Uso das Informações</h2>
                        <p className="leading-relaxed mb-4">
                            O VetTrack utiliza os dados coletados exclusivamente para a prestação dos serviços contratados, o que inclui:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Disparo de notificações automáticas via WhatsApp sobre o status dos pets.</li>
                            <li>Gerenciamento do painel de controle das clínicas.</li>
                            <li>Melhorias na plataforma e suporte técnico.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">4. WhatsApp e LGPD</h2>
                        <p className="leading-relaxed">
                            Atuamos como <strong>Operadores de Dados</strong> segundo a LGPD. O envio de mensagens via
                            WhatsApp aos tutores é feito sob a autorização e responsabilidade da Clínica
                            (<strong>Controladora de Dados</strong>). Os números de telefone informados não são
                            utilizados pelo VetTrack para envio de marketing ou cedidos a terceiros.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">5. Segurança</h2>
                        <p className="leading-relaxed">
                            Empregamos medidas de segurança técnicas e organizacionais para proteger os dados pessoais
                            contra acessos não autorizados, perdas ou alterações. Todos os dados são isolados
                            logicamente em nosso banco de dados.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">6. Seus Direitos</h2>
                        <p className="leading-relaxed">
                            Você tem o direito de solicitar o acesso, correção, anonimização ou exclusão de seus dados
                            pessoais. Para exercer esses direitos, entre em contato através de nossos canais de
                            atendimento.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-vettrack-dark mb-4">7. Contato</h2>
                        <p className="leading-relaxed">
                            Em caso de dúvidas sobre esta Política de Privacidade, entre em contato conosco em
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
