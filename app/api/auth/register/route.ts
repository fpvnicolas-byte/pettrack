import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';
import { DEFAULT_STAGES } from '@/lib/stages/stage.config';

export async function POST(request: Request) {
  try {
    const { nome, clinicaNome, email, password } = await request.json();

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, role: 'ADMIN' },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Criar clínica
    const clinica = await prisma.clinica.create({
      data: { nome: clinicaNome },
    });

    // 3. Criar usuário vinculado
    await prisma.usuario.create({
      data: {
        id: authData.user.id,
        nome,
        email,
        role: 'ADMIN',
        clinicaId: clinica.id,
      },
    });

    // 4. Criar serviços padrão
    const servicosPadrao = [
      { nome: 'Banho & Tosa', tipo: 'BANHO_TOSA' as const },
      { nome: 'Cirurgia', tipo: 'CIRURGIA' as const },
      { nome: 'Consulta', tipo: 'CONSULTA' as const },
      { nome: 'Internamento', tipo: 'INTERNAMENTO' as const },
    ];

    await prisma.servico.createMany({
      data: servicosPadrao.map((s) => ({
        nome: s.nome,
        tipo: s.tipo,
        stages: DEFAULT_STAGES[s.tipo] as never,
        clinicaId: clinica.id,
      })),
    });

    // 5. Setar app_metadata com clinica_id (para RLS)
    await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
      app_metadata: { clinica_id: clinica.id, role: 'ADMIN' },
    });

    return NextResponse.json({ success: true, clinicaId: clinica.id });
  } catch (error: any) {
    console.error('[Register]', error);
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 });
  }
}
