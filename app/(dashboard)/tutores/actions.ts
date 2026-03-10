'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const tutorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone inválido').regex(/^\d+$/, 'Use apenas números'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cpf: z.string().optional().or(z.literal('')),
});

async function getClinicaId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const clinicaId = user.app_metadata?.clinica_id;
  if (!clinicaId) throw new Error('Clínica não encontrada');
  return { user, clinicaId };
}

export async function createTutor(formData: FormData) {
  const { clinicaId } = await getClinicaId();

  const raw = {
    nome: formData.get('nome') as string,
    telefone: formData.get('telefone') as string,
    email: (formData.get('email') as string) || undefined,
    cpf: (formData.get('cpf') as string) || undefined,
  };

  const parsed = tutorSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const existing = await prisma.tutor.findUnique({
    where: { telefone_clinicaId: { telefone: parsed.data.telefone, clinicaId } },
  });
  if (existing) return { error: 'Já existe um tutor com este telefone' };

  await prisma.tutor.create({
    data: {
      nome: parsed.data.nome,
      telefone: parsed.data.telefone,
      email: parsed.data.email || null,
      cpf: parsed.data.cpf || null,
      clinicaId,
    },
  });

  revalidatePath('/tutores');
  return { success: true };
}

export async function updateTutor(id: string, formData: FormData) {
  const { clinicaId } = await getClinicaId();

  const raw = {
    nome: formData.get('nome') as string,
    telefone: formData.get('telefone') as string,
    email: (formData.get('email') as string) || undefined,
    cpf: (formData.get('cpf') as string) || undefined,
  };

  const parsed = tutorSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const existing = await prisma.tutor.findUnique({
    where: { telefone_clinicaId: { telefone: parsed.data.telefone, clinicaId } },
  });
  if (existing && existing.id !== id) return { error: 'Já existe um tutor com este telefone' };

  await prisma.tutor.update({
    where: { id, clinicaId },
    data: {
      nome: parsed.data.nome,
      telefone: parsed.data.telefone,
      email: parsed.data.email || null,
      cpf: parsed.data.cpf || null,
    },
  });

  revalidatePath('/tutores');
  return { success: true };
}

export async function deleteTutor(id: string) {
  const { clinicaId } = await getClinicaId();

  const petsCount = await prisma.pet.count({ where: { tutorId: id, clinicaId } });
  if (petsCount > 0) {
    return { error: `Este tutor possui ${petsCount} pet(s) cadastrado(s). Remova os pets primeiro.` };
  }

  await prisma.tutor.delete({ where: { id, clinicaId } });

  revalidatePath('/tutores');
  return { success: true };
}
