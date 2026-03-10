'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, HeartPulse, Settings, LogOut, Menu, X, Stethoscope } from 'lucide-react';

interface SidebarProps {
  usuario: {
    nome: string;
    email: string;
    role: string;
    clinicaNome: string;
  };
}

const navItems = [
  { href: '/atendimentos', label: 'Atendimentos', icon: LayoutDashboard },
  { href: '/pets', label: 'Pets', icon: HeartPulse },
  { href: '/tutores', label: 'Tutores', icon: Users },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
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
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-vettrack-accent flex items-center justify-center shadow-sm">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg text-white">VetTrack</div>
            <div className="text-[11px] font-medium text-white/60 truncate max-w-[140px] tracking-wide uppercase">
              {usuario.clinicaNome}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/60")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{usuario.nome}</div>
            <div className="text-[11px] text-white/60 truncate uppercase">{usuario.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair do sistema
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      <aside className="hidden md:flex w-72 bg-vettrack-dark text-white flex-col flex-shrink-0 border-r border-vettrack-dark/10">
        {NavContent}
      </aside>

      {/* ── MOBILE: barra superior + drawer ── */}
      <div className="md:hidden">
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-vettrack-dark text-white flex items-center justify-between px-4 py-3 h-16 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-vettrack-accent flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base">VetTrack</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Spacer para o conteúdo não ficar embaixo da top bar */}
        <div className="h-16" />

        {/* Drawer overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-4/5 max-w-sm bg-vettrack-dark text-white flex flex-col transition-transform duration-300 shadow-2xl',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Fechar */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {NavContent}
        </aside>
      </div>
    </>
  );
}
