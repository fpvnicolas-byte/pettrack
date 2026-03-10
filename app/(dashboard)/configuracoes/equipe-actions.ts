'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';
import { getLimites } from '@/lib/planos.limits';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function getAdminClinica() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  if (user.app_metadata?.role !== 'ADMIN') throw new Error('Apenas ADMINs podem gerenciar a equipe');
  const clinicaId = user.app_metadata?.clinica_id;
  if (!clinicaId) throw new Error('Clínica não encontrada');
  return { user, clinicaId };
}

const inviteSchema = z.object({
  email: z.string().email('E-mail inválido'),
  role: z.enum(['VETERINARIO', 'PROFISSIONAL'], { message: 'Role inválido' }),
});

export async function inviteMembro(formData: FormData) {
  const { clinicaId } = await getAdminClinica();

  const raw = {
    email: formData.get('email') as string,
    role: formData.get('role') as string,
  };

  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Verificar limite de profissionais do plano
  const clinica = await prisma.clinica.findUnique({ where: { id: clinicaId }, select: { plano: true } });
  if (clinica) {
    const limites = getLimites(clinica.plano);
    if (limites.maxProfissionais !== null) {
      const totalAtivos = await prisma.usuario.count({ where: { clinicaId, ativo: true } });
      if (totalAtivos >= limites.maxProfissionais) {
        return { error: `O plano Trial permite apenas ${limites.maxProfissionais} profissional. Faça upgrade para convidar mais membros.` };
      }
    }
  }

  // Verificar se já existe na clínica
  const existing = await prisma.usuario.findFirst({
    where: { email: parsed.data.email, clinicaId },
  });
  if (existing) return { error: 'Este e-mail já faz parte da equipe' };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/callback?next=/convite/completar`,
    data: {
      clinica_id_convite: clinicaId,
      role_convite: parsed.data.role,
    },
  });

  if (error) {
    // Se o usuário já existe no Supabase Auth mas não na clínica, tratar caso especial
    if (error.message.includes('already been registered')) {
      return { error: 'Este e-mail já possui uma conta VetTrack. Peça ao usuário para contatar o suporte.' };
    }
    return { error: `Erro ao enviar convite: ${error.message}` };
  }

  revalidatePath('/configuracoes');
  return { success: true };
}

export async function removeMembro(membroId: string) {
  const { clinicaId, user } = await getAdminClinica();

  if (membroId === user.id) return { error: 'Você não pode remover a si mesmo' };

  const membro = await prisma.usuario.findUnique({
    where: { id: membroId, clinicaId },
  });
  if (!membro) return { error: 'Membro não encontrado' };

  // Desativar ao invés de deletar para preservar histórico de atendimentos
  await prisma.usuario.update({
    where: { id: membroId },
    data: { ativo: false },
  });

  // Revogar sessões ativas do usuário removido
  await supabaseAdmin.auth.admin.deleteUser(membroId);

  revalidatePath('/configuracoes');
  return { success: true };
}
