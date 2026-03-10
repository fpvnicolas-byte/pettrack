import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { PetsPainel } from '@/components/pets/pets-painel';

export default async function PetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const clinicaId = user?.app_metadata?.clinica_id;
  if (!clinicaId) return <div>Erro: clínica não encontrada</div>;

  const [pets, tutores] = await Promise.all([
    prisma.pet.findMany({
      where: { clinicaId },
      include: {
        tutor: { select: { id: true, nome: true, telefone: true } },
        _count: { select: { atendimentos: true } },
      },
      orderBy: { nome: 'asc' },
    }),
    prisma.tutor.findMany({
      where: { clinicaId },
      select: { id: true, nome: true, telefone: true },
      orderBy: { nome: 'asc' },
    }),
  ]);

  return <PetsPainel initialData={pets} tutores={tutores} />;
}
