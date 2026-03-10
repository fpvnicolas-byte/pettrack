'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function RegisterForm() {
  const [nome, setNome] = useState('');
  const [clinicaNome, setClinicaNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const planoId = searchParams.get('plano');
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, clinicaNome, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar conta');
        setLoading(false);
        return;
      }

      // Login automático
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError('Conta criada! Faça login.');
        setLoading(false);
        return;
      }

      // Se veio de um plano pago, dispara o checkout direto
      if (planoId) {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planoId }),
        });
        const checkout = await res.json();
        if (checkout.url) {
          window.location.href = checkout.url;
          return;
        }
      }

      router.push('/atendimentos');
      router.refresh();
    } catch {
      setError('Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] p-5">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-start">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-vettrack-accent flex items-center gap-2 transition-colors">
            <span>←</span> Voltar para a Home
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🐾</div>
          <h1 className="text-2xl font-bold text-vettrack-dark">Criar Conta</h1>
          <p className="text-sm text-gray-500 mt-1">Cadastre sua clínica no VetTrack</p>
        </div>

        {planoId && (
          <div className="mb-4 flex items-start gap-3 bg-vettrack-accent/8 border border-vettrack-accent/20 text-vettrack-accent text-sm px-4 py-3 rounded-xl">
            <span className="text-base mt-0.5">🔒</span>
            <span>Após criar sua conta você será redirecionado para o pagamento do plano <strong>Profissional</strong>.</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div>
              <label htmlFor="clinicaNome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Clínica
              </label>
              <input
                id="clinicaNome"
                type="text"
                value={clinicaNome}
                onChange={(e) => setClinicaNome(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-vettrack-accent focus:ring-2 focus:ring-vettrack-accent/20 outline-none transition-all text-sm"
                placeholder="PetVida Veterinária"
                required
              />
            </div>

            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Seu Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-vettrack-accent focus:ring-2 focus:ring-vettrack-accent/20 outline-none transition-all text-sm"
                placeholder="Dr. Carlos Silva"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-vettrack-accent focus:ring-2 focus:ring-vettrack-accent/20 outline-none transition-all text-sm"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-vettrack-accent focus:ring-2 focus:ring-vettrack-accent/20 outline-none transition-all text-sm"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
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
              className="w-full py-2.5 px-4 bg-vettrack-dark text-white rounded-lg font-medium text-sm hover:bg-vettrack-dark/90 transition-colors disabled:opacity-50"
            >
              {loading
                ? planoId ? 'Criando conta...' : 'Criando...'
                : planoId ? 'Criar conta e ir para pagamento' : 'Criar Clínica'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-vettrack-accent hover:underline">
              Já tenho conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
