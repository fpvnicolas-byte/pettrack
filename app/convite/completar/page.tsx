'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CompletarConvitePage() {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Verificar se o usuário está autenticado e é um convidado válido
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      // Se já tem clinica_id no app_metadata, já completou o onboarding
      if (user.app_metadata?.clinica_id) {
        router.replace('/atendimentos');
        return;
      }
      // Se não tem clinica_id_convite no user_metadata, convite inválido
      if (!user.user_metadata?.clinica_id_convite) {
        router.replace('/login?error=convite-invalido');
        return;
      }
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) { setError('Nome é obrigatório'); return; }
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada');

      const clinicaId = user.user_metadata?.clinica_id_convite;
      const role = user.user_metadata?.role_convite ?? 'PROFISSIONAL';

      const res = await fetch('/api/convite/completar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), clinicaId, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao completar cadastro');

      // Refresh session para pegar app_metadata atualizado
      await supabase.auth.refreshSession();
      router.push('/atendimentos');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <div className="text-gray-400 text-sm">Verificando convite...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🐾</div>
          <h1 className="text-2xl font-bold text-vettrack-dark">Bem-vindo ao VetTrack!</h1>
          <p className="text-sm text-gray-500 mt-1">Você foi convidado para fazer parte de uma equipe. Complete seu cadastro para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seu nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-vettrack-accent focus:ring-2 focus:ring-vettrack-accent/20 outline-none transition-all text-sm"
                placeholder="Como você quer ser chamado?"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-vettrack-accent text-white rounded-xl font-medium text-sm hover:bg-vettrack-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Finalizando cadastro...' : 'Entrar na equipe →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
