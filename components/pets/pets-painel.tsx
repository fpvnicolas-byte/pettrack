'use client';

import { useState, useTransition } from 'react';
import { createPet, updatePet, deletePet } from '@/app/(dashboard)/pets/actions';
import { cn } from '@/lib/utils';

interface Tutor {
  id: string;
  nome: string;
  telefone: string;
}

interface Pet {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: string | null;
  peso: number | null;
  dataNasc: Date | null;
  fotoUrl: string | null;
  tutor: Tutor;
  _count: { atendimentos: number };
}

interface PetsPainelProps {
  initialData: Pet[];
  tutores: Tutor[];
}

type ModalState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; pet: Pet }
  | { type: 'delete'; pet: Pet };

const ESPECIES: Record<string, { label: string; emoji: string }> = {
  CANINO: { label: 'Cachorro', emoji: '🐶' },
  FELINO: { label: 'Gato', emoji: '🐱' },
  AVE: { label: 'Ave', emoji: '🐦' },
  ROEDOR: { label: 'Roedor', emoji: '🐹' },
  REPTIL: { label: 'Réptil', emoji: '🦎' },
  OUTRO: { label: 'Outro', emoji: '🐾' },
};

export function PetsPainel({ initialData, tutores }: PetsPainelProps) {
  const [pets, setPets] = useState(initialData);
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

  const filtered = pets.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.tutor.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.raca?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      if (modal.type === 'create') {
        const result = await createPet(formData);
        if (result?.error) { setError(result.error); return; }
        showToast('Pet cadastrado com sucesso!');
        closeModal();
        window.location.reload();
      } else if (modal.type === 'edit') {
        const result = await updatePet(modal.pet.id, formData);
        if (result?.error) { setError(result.error); return; }
        showToast('Pet atualizado!');
        closeModal();
        window.location.reload();
      }
    });
  }

  function handleDelete() {
    if (modal.type !== 'delete') return;
    const pet = modal.pet;
    startTransition(async () => {
      const result = await deletePet(pet.id);
      if (result?.error) { setError(result.error); return; }
      setPets((prev) => prev.filter((p) => p.id !== pet.id));
      showToast('Pet removido.');
      closeModal();
    });
  }

  const isFormModal = modal.type === 'create' || modal.type === 'edit';
  const editingPet = modal.type === 'edit' ? modal.pet : null;

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
          <h1 className="text-xl font-bold text-vettrack-dark">Pets</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pets.length} pet{pets.length !== 1 ? 's' : ''} cadastrado{pets.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 bg-vettrack-accent text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-vettrack-accent/90 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Novo Pet
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Buscar por nome, raça ou tutor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent bg-white"
        />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🐾</div>
          <div className="text-sm">{search ? 'Nenhum pet encontrado' : 'Nenhum pet cadastrado'}</div>
          {!search && (
            <button
              onClick={() => setModal({ type: 'create' })}
              className="mt-3 text-vettrack-accent text-sm hover:underline"
            >
              Cadastrar primeiro pet
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Pet</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Espécie / Raça</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Tutor</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Atendimentos</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((pet, idx) => {
                const esp = ESPECIES[pet.especie] ?? ESPECIES.OUTRO;
                return (
                  <tr
                    key={pet.id}
                    className={cn('hover:bg-gray-50 transition-colors', idx !== filtered.length - 1 && 'border-b border-gray-50')}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-lg">
                          {esp.emoji}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-vettrack-dark">{pet.nome}</div>
                          <div className="text-[11px] text-gray-400">
                            {pet.sexo === 'MACHO' ? '♂ Macho' : pet.sexo === 'FEMEA' ? '♀ Fêmea' : ''}
                            {pet.peso ? ` · ${pet.peso}kg` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-gray-700">{esp.label}</div>
                      <div className="text-[11px] text-gray-400">{pet.raca || '—'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-gray-700">{pet.tutor.nome}</div>
                      <div className="text-[11px] text-vettrack-accent">{pet.tutor.telefone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-vettrack-accent/10 text-vettrack-accent px-2 py-0.5 rounded-full">
                        📋 {pet._count.atendimentos}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setModal({ type: 'edit', pet })}
                          className="text-xs text-gray-400 hover:text-vettrack-accent transition-colors px-2 py-1 rounded-lg hover:bg-vettrack-accent/10"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => { setError(null); setModal({ type: 'delete', pet }); }}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Criar / Editar */}
      {isFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-vettrack-dark">
                {modal.type === 'create' ? 'Novo Pet' : 'Editar Pet'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome *</label>
                <input
                  name="nome"
                  defaultValue={editingPet?.nome}
                  required
                  placeholder="Nome do pet"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tutor *</label>
                <select
                  name="tutorId"
                  defaultValue={editingPet?.tutor.id}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent bg-white"
                >
                  <option value="">Selecionar tutor...</option>
                  {tutores.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome} — {t.telefone}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Espécie *</label>
                  <select
                    name="especie"
                    defaultValue={editingPet?.especie ?? 'CANINO'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent bg-white"
                  >
                    {Object.entries(ESPECIES).map(([value, { label, emoji }]) => (
                      <option key={value} value={value}>{emoji} {label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sexo</label>
                  <select
                    name="sexo"
                    defaultValue={editingPet?.sexo ?? ''}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent bg-white"
                  >
                    <option value="">Não informado</option>
                    <option value="MACHO">♂ Macho</option>
                    <option value="FEMEA">♀ Fêmea</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Raça</label>
                <input
                  name="raca"
                  defaultValue={editingPet?.raca ?? ''}
                  placeholder="Ex: Golden Retriever"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Peso (kg)</label>
                  <input
                    name="peso"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={editingPet?.peso ?? ''}
                    placeholder="Ex: 12.5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Data de Nasc.</label>
                  <input
                    name="dataNasc"
                    type="date"
                    defaultValue={
                      editingPet?.dataNasc
                        ? new Date(editingPet.dataNasc).toISOString().split('T')[0]
                        : ''
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
                  />
                </div>
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
              <h2 className="font-bold text-vettrack-dark mb-1">Remover pet?</h2>
              <p className="text-sm text-gray-500">
                Tem certeza que deseja remover <strong>{modal.pet.nome}</strong>?
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
