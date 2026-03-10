import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Garantir que é de fato um convite (sem clinica_id no app_metadata ainda)
    if (user.app_metadata?.clinica_id) {
      return NextResponse.json({ error: 'Usuário já possui uma clínica vinculada' }, { status: 400 });
    }

    const { nome, clinicaId, role } = await request.json();

    if (!nome || !clinicaId || !role) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Verificar se a clínica existe
    const clinica = await prisma.clinica.findUnique({ where: { id: clinicaId } });
    if (!clinica) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 });
    }

    // Verificar se já existe um Usuario com esse id ou email nessa clínica
    const existing = await prisma.usuario.findFirst({
      where: { OR: [{ id: user.id }, { email: user.email!, clinicaId }] },
    });
    if (existing) {
      return NextResponse.json({ error: 'Usuário já cadastrado nesta clínica' }, { status: 400 });
    }

    // Criar Usuario no Prisma
    await prisma.usuario.create({
      data: {
        id: user.id,
        nome,
        email: user.email!,
        role: role as 'VETERINARIO' | 'PROFISSIONAL',
        clinicaId,
        ativo: true,
      },
    });

    // Setar app_metadata para RLS e middleware
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        clinica_id: clinicaId,
        role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Convite Completar]', error);
    return NextResponse.json({ error: 'Erro ao completar cadastro' }, { status: 500 });
  }
}
