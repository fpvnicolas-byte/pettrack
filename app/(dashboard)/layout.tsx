import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { clinica: { select: { nome: true, plano: true, createdAt: true } } },
  });

  if (!usuario) redirect('/login');

  const diasRestantesTrial = usuario.clinica.plano === 'TRIAL'
    ? Math.max(0, 7 - Math.floor((Date.now() - new Date(usuario.clinica.createdAt).getTime()) / 86_400_000))
    : null;

  return (
    <div className="flex h-screen bg-[rgb(var(--background))]">
      <Sidebar
        usuario={{
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          clinicaNome: usuario.clinica.nome,
        }}
        diasRestantesTrial={diasRestantesTrial}
      />
      {/* No mobile, o sidebar é fixed (top bar de 56px) — main precisa de padding-top */}
      <main className="flex-1 overflow-y-auto md:overflow-y-auto h-full">
        {children}
      </main>
    </div>
  );
}
