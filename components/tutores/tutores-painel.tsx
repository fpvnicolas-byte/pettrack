'use client';

import { useState, useTransition } from 'react';
import { createTutor, updateTutor, deleteTutor } from '@/app/(dashboard)/tutores/actions';
import { cn } from '@/lib/utils';

interface Tutor {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  cpf: string | null;
  _count: { pets: number };
}

interface TutoresPainelProps {
  initialData: Tutor[];
}

type ModalState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; tutor: Tutor }
  | { type: 'delete'; tutor: Tutor };

export function TutoresPainel({ initialData }: TutoresPainelProps) {
  const [tutores, setTutores] = useState(initialData);
  const [modal, setModal] = useState<ModalState>({ type: 'closed' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function closeModal() {
    setModal({ type: 'closed' });
    setError(null);
  }

  const filtered = tutores.filter(
    (t) =>
      t.nome.toLowerCase().includes(search.toLowerCase()) ||
      t.telefone.includes(search) ||
      (t.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      if (modal.type === 'create') {
        const result = await createTutor(formData);
        if (result?.error) { setError(result.error); return; }
        // Optimistic: reload from server via revalidatePath will update
        showToast('Tutor cadastrado com sucesso!');
        closeModal();
        // Fetch updated list
        window.location.reload();
      } else if (modal.type === 'edit') {
        const result = await updateTutor(modal.tutor.id, formData);
        if (result?.error) { setError(result.error); return; }
        showToast('Tutor atualizado!');
        closeModal();
        window.location.reload();
      }
    });
  }

  function handleDelete() {
    if (modal.type !== 'delete') return;
    const tutor = modal.tutor;
    startTransition(async () => {
      const result = await deleteTutor(tutor.id);
      if (result?.error) { setError(result.error); return; }
      setTutores((prev) => prev.filter((t) => t.id !== tutor.id));
      showToast('Tutor removido.');
      closeModal();
    });
  }

  const isFormModal = modal.type === 'create' || modal.type === 'edit';
  const editingTutor = modal.type === 'edit' ? modal.tutor : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-xl px-5 py-3 shadow-lg border border-gray-100 flex items-center gap-3 animate-in slide-in-from-top">
          <span className="text-green-500 text-lg">✓</span>
          <span className="text-sm font-medium text-gray-700">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-vettrack-dark">Tutores</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tutores.length} tutor{tutores.length !== 1 ? 'es' : ''} cadastrado{tutores.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 bg-vettrack-accent text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-vettrack-accent/90 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Novo Tutor
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent bg-white"
        />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">👤</div>
          <div className="text-sm">{search ? 'Nenhum tutor encontrado' : 'Nenhum tutor cadastrado'}</div>
          {!search && (
            <button
              onClick={() => setModal({ type: 'create' })}
              className="mt-3 text-vettrack-accent text-sm hover:underline"
            >
              Cadastrar primeiro tutor
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Nome</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Telefone</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">E-mail</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Pets</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((tutor, idx) => (
                <tr
                  key={tutor.id}
                  className={cn('hover:bg-gray-50 transition-colors', idx !== filtered.length - 1 && 'border-b border-gray-50')}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-vettrack-accent/10 flex items-center justify-center text-xs font-bold text-vettrack-accent">
                        {tutor.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-vettrack-dark">{tutor.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{tutor.telefone}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{tutor.email || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-vettrack-accent/10 text-vettrack-accent px-2 py-0.5 rounded-full">
                      🐾 {tutor._count.pets}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setModal({ type: 'edit', tutor })}
                        className="text-xs text-gray-400 hover:text-vettrack-accent transition-colors px-2 py-1 rounded-lg hover:bg-vettrack-accent/10"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => { setError(null); setModal({ type: 'delete', tutor }); }}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Criar / Editar */}
      {isFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-vettrack-dark">
                {modal.type === 'create' ? 'Novo Tutor' : 'Editar Tutor'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome *</label>
                <input
                  name="nome"
                  defaultValue={editingTutor?.nome}
                  required
                  placeholder="Nome completo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Telefone / WhatsApp *
                </label>
                <input
                  name="telefone"
                  defaultValue={editingTutor?.telefone}
                  required
                  placeholder="Ex: 11999887766 (só números)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
                />
                <p className="text-[11px] text-gray-400 mt-1">Este número receberá as notificações via WhatsApp</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">E-mail</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingTutor?.email ?? ''}
                  placeholder="email@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">CPF</label>
                <input
                  name="cpf"
                  defaultValue={editingTutor?.cpf ?? ''}
                  placeholder="000.000.000-00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-vettrack-accent text-white text-sm font-medium hover:bg-vettrack-accent/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Salvando...' : modal.type === 'create' ? 'Cadastrar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {modal.type === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="font-bold text-vettrack-dark mb-1">Remover tutor?</h2>
              <p className="text-sm text-gray-500">
                Tem certeza que deseja remover <strong>{modal.tutor.nome}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
