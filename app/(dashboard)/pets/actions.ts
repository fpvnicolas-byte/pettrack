'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const petSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  especie: z.enum(['CANINO', 'FELINO', 'AVE', 'ROEDOR', 'REPTIL', 'OUTRO']),
  raca: z.string().optional().or(z.literal('')),
  sexo: z.enum(['MACHO', 'FEMEA']).optional().or(z.literal('')),
  peso: z.string().optional().or(z.literal('')),
  dataNasc: z.string().optional().or(z.literal('')),
  tutorId: z.string().min(1, 'Tutor é obrigatório'),
});

async function getClinicaId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const clinicaId = user.app_metadata?.clinica_id;
  if (!clinicaId) throw new Error('Clínica não encontrada');
  return { user, clinicaId };
}

export async function createPet(formData: FormData) {
  const { clinicaId } = await getClinicaId();

  const raw = {
    nome: formData.get('nome') as string,
    especie: formData.get('especie') as string,
    raca: (formData.get('raca') as string) || undefined,
    sexo: (formData.get('sexo') as string) || undefined,
    peso: (formData.get('peso') as string) || undefined,
    dataNasc: (formData.get('dataNasc') as string) || undefined,
    tutorId: formData.get('tutorId') as string,
  };

  const parsed = petSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await prisma.pet.create({
    data: {
      nome: parsed.data.nome,
      especie: parsed.data.especie,
      raca: parsed.data.raca || null,
      sexo: (parsed.data.sexo as 'MACHO' | 'FEMEA') || null,
      peso: parsed.data.peso ? parseFloat(parsed.data.peso) : null,
      dataNasc: parsed.data.dataNasc ? new Date(parsed.data.dataNasc) : null,
      tutorId: parsed.data.tutorId,
      clinicaId,
    },
  });

  revalidatePath('/pets');
  return { success: true };
}

export async function updatePet(id: string, formData: FormData) {
  const { clinicaId } = await getClinicaId();

  const raw = {
    nome: formData.get('nome') as string,
    especie: formData.get('especie') as string,
    raca: (formData.get('raca') as string) || undefined,
    sexo: (formData.get('sexo') as string) || undefined,
    peso: (formData.get('peso') as string) || undefined,
    dataNasc: (formData.get('dataNasc') as string) || undefined,
    tutorId: formData.get('tutorId') as string,
  };

  const parsed = petSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await prisma.pet.update({
    where: { id, clinicaId },
    data: {
      nome: parsed.data.nome,
      especie: parsed.data.especie,
      raca: parsed.data.raca || null,
      sexo: (parsed.data.sexo as 'MACHO' | 'FEMEA') || null,
      peso: parsed.data.peso ? parseFloat(parsed.data.peso) : null,
      dataNasc: parsed.data.dataNasc ? new Date(parsed.data.dataNasc) : null,
      tutorId: parsed.data.tutorId,
    },
  });

  revalidatePath('/pets');
  return { success: true };
}

export async function deletePet(id: string) {
  const { clinicaId } = await getClinicaId();

  const atendimentosCount = await prisma.atendimento.count({
    where: { petId: id, clinicaId, status: { in: ['AGUARDANDO', 'EM_ANDAMENTO'] } },
  });
  if (atendimentosCount > 0) {
    return { error: 'Este pet possui atendimentos em aberto.' };
  }

  await prisma.pet.delete({ where: { id, clinicaId } });

  revalidatePath('/pets');
  return { success: true };
}
