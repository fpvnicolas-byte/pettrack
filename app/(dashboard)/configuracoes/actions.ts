'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

async function getAdminClinica() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const role = user.app_metadata?.role;
  if (role !== 'ADMIN') throw new Error('Apenas ADMINs podem alterar configurações');

  const clinicaId = user.app_metadata?.clinica_id;
  if (!clinicaId) throw new Error('Clínica não encontrada');

  return { user, clinicaId };
}

const clinicaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().optional().or(z.literal('')),
  endereco: z.string().optional().or(z.literal('')),
});

export async function updateClinica(formData: FormData) {
  const { clinicaId } = await getAdminClinica();

  const raw = {
    nome: formData.get('nome') as string,
    telefone: (formData.get('telefone') as string) || undefined,
    endereco: (formData.get('endereco') as string) || undefined,
  };

  const parsed = clinicaSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await prisma.clinica.update({
    where: { id: clinicaId },
    data: {
      nome: parsed.data.nome,
      telefone: parsed.data.telefone || null,
      endereco: parsed.data.endereco || null,
    },
  });

  revalidatePath('/configuracoes');
  return { success: true };
}

const whatsappSchema = z.object({
  whatsappPhoneId: z.string().min(1, 'Phone ID é obrigatório').or(z.literal('')),
  whatsappToken: z.string().min(1, 'Token é obrigatório').or(z.literal('')),
});

export async function updateWhatsapp(formData: FormData) {
  const { clinicaId } = await getAdminClinica();

  const raw = {
    whatsappPhoneId: (formData.get('whatsappPhoneId') as string) || '',
    whatsappToken: (formData.get('whatsappToken') as string) || '',
  };

  const parsed = whatsappSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await prisma.clinica.update({
    where: { id: clinicaId },
    data: {
      whatsappPhoneId: parsed.data.whatsappPhoneId || null,
      whatsappToken: parsed.data.whatsappToken || null,
    },
  });

  revalidatePath('/configuracoes');
  return { success: true };
}

// ===== Billing / Stripe =====

async function getClinicaAutenticada() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const clinicaId = user.app_metadata?.clinica_id;
  if (!clinicaId) throw new Error('Clínica não encontrada');
  return { user, clinicaId };
}

export async function createPortalSession(): Promise<{ url?: string; error?: string }> {
  try {
    const { clinicaId } = await getClinicaAutenticada();

    const clinica = await prisma.clinica.findUnique({
      where: { id: clinicaId },
      select: { stripeCustomerId: true },
    });

    if (!clinica?.stripeCustomerId) {
      return { error: 'Assinatura Stripe não encontrada. Entre em contato com o suporte.' };
    }

    const headersList = await headers();
    const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: clinica.stripeCustomerId,
      return_url: `${origin}/configuracoes`,
    });

    return { url: session.url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao acessar portal da Stripe';
    return { error: msg };
  }
}
