'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface SidebarProps {
  usuario: {
    nome: string;
    email: string;
    role: string;
    clinicaNome: string;
  };
}

const navItems = [
  { href: '/atendimentos', label: 'Atendimentos', icon: '📋' },
  { href: '/pets', label: 'Pets', icon: '🐾' },
  { href: '/tutores', label: 'Tutores', icon: '👤' },
  { href: '/configuracoes', label: 'Configurações', icon: '⚙️' },
];

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const NavContent = (
    <>
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐾</span>
          <div>
            <div className="font-bold text-sm">VetTrack</div>
            <div className="text-[11px] text-gray-400 truncate max-w-[140px]">{usuario.clinicaNome}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-vettrack-accent text-white font-medium'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-vettrack-accent/20 flex items-center justify-center text-xs font-bold text-vettrack-accent flex-shrink-0">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{usuario.nome}</div>
            <div className="text-[10px] text-gray-500 truncate">{usuario.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs text-gray-500 hover:text-white transition-colors text-left"
        >
          Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      <aside className="hidden md:flex w-64 bg-vettrack-dark text-white flex-col flex-shrink-0">
        {NavContent}
      </aside>

      {/* ── MOBILE: barra superior + drawer ── */}
      <div className="md:hidden">
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-vettrack-dark text-white flex items-center justify-between px-4 py-3 h-14">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-bold text-sm">VetTrack</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col gap-1 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Abrir menu"
          >
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>
        </div>

        {/* Spacer para o conteúdo não ficar embaixo da top bar */}
        <div className="h-14" />

        {/* Drawer overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-72 bg-vettrack-dark text-white flex flex-col transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Fechar */}
          <div className="flex justify-end p-3">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-400 hover:text-white text-2xl leading-none p-1"
            >
              ×
            </button>
          </div>
          {NavContent}
        </aside>
      </div>
    </>
  );
}
