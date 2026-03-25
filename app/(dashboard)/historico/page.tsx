import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HistoricoPainel } from '@/components/historico/historico-painel';

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: { q?: string; servico?: string; de?: string; ate?: string; page?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const clinicaId = user.app_metadata?.clinica_id;
  if (!clinicaId) redirect('/login');

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const perPage = 20;

  // Build where clause
  const where: any = {
    clinicaId,
    status: 'CONCLUIDO',
  };

  if (searchParams.q) {
    where.OR = [
      { pet: { nome: { contains: searchParams.q, mode: 'insensitive' } } },
      { pet: { tutor: { nome: { contains: searchParams.q, mode: 'insensitive' } } } },
      { pet: { tutor: { telefone: { contains: searchParams.q } } } },
    ];
  }

  if (searchParams.servico) {
    where.servico = { tipo: searchParams.servico };
  }

  if (searchParams.de || searchParams.ate) {
    where.conclusaoAt = {};
    if (searchParams.de) where.conclusaoAt.gte = new Date(searchParams.de);
    if (searchParams.ate) {
      const ate = new Date(searchParams.ate);
      ate.setHours(23, 59, 59, 999);
      where.conclusaoAt.lte = ate;
    }
  }

  const [atendimentos, total, servicos] = await Promise.all([
    prisma.atendimento.findMany({
      where,
      include: {
        pet: { include: { tutor: true } },
        servico: true,
        profissional: true,
        historico: { orderBy: { createdAt: 'asc' } },
        notificacoes: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { conclusaoAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.atendimento.count({ where }),
    prisma.servico.findMany({
      where: { clinicaId },
      select: { id: true, nome: true, tipo: true },
      orderBy: { nome: 'asc' },
    }),
  ]);

  return (
    <HistoricoPainel
      atendimentos={JSON.parse(JSON.stringify(atendimentos))}
      total={total}
      page={page}
      perPage={perPage}
      servicos={JSON.parse(JSON.stringify(servicos))}
      filters={{
        q: searchParams.q || '',
        servico: searchParams.servico || '',
        de: searchParams.de || '',
        ate: searchParams.ate || '',
      }}
    />
  );
}
