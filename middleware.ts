import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas protegidas: redirecionar para login se não autenticado
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/atendimentos') ||
    request.nextUrl.pathname.startsWith('/pets') ||
    request.nextUrl.pathname.startsWith('/tutores') ||
    request.nextUrl.pathname.startsWith('/configuracoes') ||
    request.nextUrl.pathname.startsWith('/financeiro');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Se logado e tentando acessar login/register, redirecionar para dashboard
  // Exceto se for um convidado sem clinica_id ainda (precisa completar cadastro)
  const isAuthRoute = request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register';

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/atendimentos';
    return NextResponse.redirect(url);
  }

  // Convidado autenticado sem clínica: forçar para completar cadastro
  const isConvitePage = request.nextUrl.pathname.startsWith('/convite');
  if (user && !user.app_metadata?.clinica_id && !isConvitePage && !isAuthRoute) {
    // Verificar se tem convite pendente no user_metadata
    if (user.user_metadata?.clinica_id_convite) {
      const url = request.nextUrl.clone();
      url.pathname = '/convite/completar';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
  ],
};
