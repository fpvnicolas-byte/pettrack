import Link from 'next/link';
import { ScrollToTop } from '@/components/layout/scroll-to-top';

export function PublicNavbar() {
    return (
        <>
            <nav className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🐾</span>
                        <span className="font-bold text-white text-lg tracking-tight">VetTrack</span>
                    </Link>

                    {/* Central Links (Desktop only for now) */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/#como-funciona" className="text-sm text-gray-400 hover:text-white transition-colors">
                            Como funciona
                        </Link>
                        <Link href="/#recursos" className="text-sm text-gray-400 hover:text-white transition-colors">
                            Recursos
                        </Link>
                        <Link href="/#depoimentos" className="text-sm text-gray-400 hover:text-white transition-colors">
                            Depoimentos
                        </Link>
                    </div>

                    {/* Right Links */}
                    <div className="flex items-center gap-3">
                        <Link href="/sobre" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-2 py-1.5">
                            Sobre
                        </Link>
                        <Link href="/planos" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-2 py-1.5">
                            Planos
                        </Link>
                        <Link href="/login" className="text-sm md:text-base text-white hover:text-vettrack-accent transition-colors px-4 py-3 md:px-3 md:py-1.5 font-medium">
                            Entrar
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm md:text-base bg-vettrack-accent hover:opacity-90 text-white px-5 py-3 md:px-4 md:py-2 rounded-xl md:rounded-lg font-medium transition-opacity"
                        >
                            Iniciar Teste
                        </Link>
                    </div>
                </div>
            </nav>
            <ScrollToTop />
        </>
    );
}
