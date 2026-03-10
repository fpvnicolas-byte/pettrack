import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { AtendimentosPainel } from '@/components/atendimento/painel';
import type { AtendimentoWithRelations } from '@/types';

export default async function AtendimentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const clinicaId = user?.app_metadata?.clinica_id;
  if (!clinicaId) return <div>Erro: clínica não encontrada</div>;

  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);

  const [atendimentos, finalizados, servicos, pets] = await Promise.all([
    prisma.atendimento.findMany({
      where: { clinicaId, status: { in: ['AGUARDANDO', 'EM_ANDAMENTO'] } },
      include: { pet: { include: { tutor: true } }, servico: true, profissional: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.atendimento.findMany({
      where: { clinicaId, status: 'CONCLUIDO', conclusaoAt: { gte: inicioDia } },
      include: { pet: { include: { tutor: true } }, servico: true, profissional: true },
      orderBy: { conclusaoAt: 'desc' },
    }),
    prisma.servico.findMany({ where: { clinicaId, ativo: true } }),
    prisma.pet.findMany({
      where: { clinicaId },
      include: { tutor: { select: { id: true, nome: true, telefone: true } } },
      orderBy: { nome: 'asc' },
    }),
  ]);

  return (
    <div className="h-full">
      <AtendimentosPainel
        initialData={atendimentos as unknown as AtendimentoWithRelations[]}
        finalizados={finalizados as unknown as AtendimentoWithRelations[]}
        servicos={servicos}
        pets={pets}
      />
    </div>
  );
}
