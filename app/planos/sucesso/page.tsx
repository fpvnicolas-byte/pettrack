import Link from 'next/link';

export const metadata = {
  title: 'Pagamento confirmado — VetTrack',
};

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef] font-sans flex flex-col items-center justify-center px-5">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">
          ✅
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Pagamento confirmado!</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Seu plano foi ativado com sucesso. Acesse o dashboard para começar a usar o VetTrack.
        </p>
        <Link
          href="/atendimentos"
          className="block w-full bg-vettrack-accent hover:opacity-90 text-white py-3 rounded-xl font-semibold transition-opacity text-sm"
        >
          Ir para o dashboard
        </Link>
        <p className="text-xs text-gray-400 mt-4">
          Em caso de dúvidas, entre em contato pelo suporte.
        </p>
      </div>
    </div>
  );
}
