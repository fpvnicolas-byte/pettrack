'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  planoId: string;
  stripePriceId: string | null;
  label: string;
  destaque?: boolean;
}

export function CheckoutButton({ planoId, stripePriceId, label, destaque }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!stripePriceId) {
      // Price ID não configurado — redireciona para registro
      router.push('/register');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planoId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert(data.error ?? 'Erro ao iniciar checkout. Tente novamente.');
        return;
      }

      window.location.href = data.url;
    } catch {
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${destaque
          ? 'bg-vettrack-accent hover:opacity-90 text-white'
          : 'bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white'
        }`}
    >
      {loading ? 'Aguarde...' : label}
    </button>
  );
}
