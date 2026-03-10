import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { ConfiguracoesPainel } from '@/components/configuracoes/configuracoes-painel';

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const clinicaId = user?.app_metadata?.clinica_id;
  const role = user?.app_metadata?.role;

  if (!clinicaId || !user) return <div>Erro: clínica não encontrada</div>;

  const [clinica, membros] = await Promise.all([
    prisma.clinica.findUnique({
      where: { id: clinicaId },
      select: {
        id: true,
        nome: true,
        telefone: true,
        endereco: true,
        whatsappPhoneId: true,
        whatsappToken: true,
        plano: true,
      },
    }),
    prisma.usuario.findMany({
      where: { clinicaId },
      select: { id: true, nome: true, email: true, role: true, ativo: true },
      orderBy: [{ role: 'asc' }, { nome: 'asc' }],
    }),
  ]);

  if (!clinica) return <div>Erro: clínica não encontrada</div>;

  return (
    <ConfiguracoesPainel
      clinica={clinica}
      isAdmin={role === 'ADMIN'}
      membros={membros}
      currentUserId={user.id}
    />
  );
}
