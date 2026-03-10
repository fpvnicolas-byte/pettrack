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
    include: { clinica: true },
  });

  if (!usuario) redirect('/login');

  return (
    <div className="flex h-screen bg-[rgb(var(--background))]">
      <Sidebar
        usuario={{
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          clinicaNome: usuario.clinica.nome,
        }}
      />
      {/* No mobile, o sidebar é fixed (top bar de 56px) — main precisa de padding-top */}
      <main className="flex-1 overflow-y-auto md:overflow-y-auto h-full">
        {children}
      </main>
    </div>
  );
}
