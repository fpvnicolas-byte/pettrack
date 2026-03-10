'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Email ou senha incorretos');
      setLoading(false);
      return;
    }

    router.push('/atendimentos');
    router.refresh();
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
          <h1 className="text-2xl font-bold text-vettrack-dark">VetTrack</h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhamento em tempo real</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="space-y-4">
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
                placeholder="••••••••"
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
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/register" className="text-sm text-vettrack-accent hover:underline">
              Criar conta para minha clínica
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
