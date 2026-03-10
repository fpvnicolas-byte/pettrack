import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { TutoresPainel } from '@/components/tutores/tutores-painel';

export default async function TutoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const clinicaId = user?.app_metadata?.clinica_id;
  if (!clinicaId) return <div>Erro: clínica não encontrada</div>;

  const tutores = await prisma.tutor.findMany({
    where: { clinicaId },
    include: { _count: { select: { pets: true } } },
    orderBy: { nome: 'asc' },
  });

  return <TutoresPainel initialData={tutores} />;
}
