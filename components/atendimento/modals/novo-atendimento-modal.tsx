import { useState, useTransition } from "react";
import { createAtendimento } from "@/app/(dashboard)/atendimentos/actions";
import { X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ESPECIES_EMOJI: Record<string, string> = {
    CANINO: '🐶', FELINO: '🐱', AVE: '🐦', ROEDOR: '🐹', REPTIL: '🦎', OUTRO: '🐾',
};

interface PetForSelect {
    id: string;
    nome: string;
    especie: string;
    raca: string | null;
    tutor: { id: string; nome: string; telefone: string };
}

interface NovoAtendimentoModalProps {
    onClose: () => void;
    onSuccess: (msg: string) => void;
    pets: PetForSelect[];
    servicos: any[];
}

export function NovoAtendimentoModal({ onClose, onSuccess, pets, servicos }: NovoAtendimentoModalProps) {
    const [isPending, startTransition] = useTransition();
    const [novoError, setNovoError] = useState<string | null>(null);
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [petSearch, setPetSearch] = useState('');

    const filteredPets = petSearch.trim() === ''
        ? pets
        : pets.filter(
            (p) =>
                p.nome.toLowerCase().includes(petSearch.toLowerCase()) ||
                (p.tutor?.nome ?? '').toLowerCase().includes(petSearch.toLowerCase())
        );

    function handleNovoSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selectedPetId) { setNovoError('Selecione um pet na lista acima.'); return; }

        const formData = new FormData(e.currentTarget);
        setNovoError(null);

        startTransition(async () => {
            try {
                await createAtendimento(formData);
                onSuccess('Atendimento criado com sucesso! 🐾');
                onClose();
            } catch (err: any) {
                setNovoError(err.message);
            }
        });
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-vettrack-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 bg-white z-10">
                    <h2 className="text-xl font-bold text-vettrack-dark">Novo Atendimento</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-vettrack-dark hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleNovoSubmit} className="p-6 overflow-y-auto space-y-6">
                    <input type="hidden" name="petId" value={selectedPetId ?? ''} />

                    <div>
                        <label className="block text-sm font-bold text-vettrack-dark mb-2">Quem chegou? *</label>
                        {selectedPetId ? (
                            // Pet selecionado
                            (() => {
                                const pet = pets.find((p) => p.id === selectedPetId)!;
                                return (
                                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-vettrack-accent bg-vettrack-accent/5 transition-all">
                                        <span className="text-2xl">{ESPECIES_EMOJI[pet.especie] ?? '🐾'}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-vettrack-dark truncate">{pet.nome}</div>
                                            <div className="text-[11px] font-medium text-gray-500 truncate">{pet.tutor?.nome} • {pet.raca || 'SRD'}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedPetId(null); setPetSearch(''); }}
                                            className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-vettrack-error hover:border-vettrack-error hover:bg-vettrack-error/10 flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })()
                        ) : (
                            // Busca + lista
                            <div>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar paciente ou tutor..."
                                        value={petSearch}
                                        onChange={(e) => setPetSearch(e.target.value)}
                                        autoFocus
                                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-medium focus:outline-none focus:border-vettrack-accent transition-colors placeholder:font-normal"
                                    />
                                </div>

                                <div className="mt-2 max-h-48 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-inner">
                                    {filteredPets.length === 0 ? (
                                        <div className="px-5 py-6 text-center text-sm text-gray-400 font-medium">
                                            {pets.length === 0 ? (
                                                <span>Nenhum paciente cadastrado. <a href="/pets" className="text-vettrack-accent hover:underline font-bold">Cadastrar Paciente</a></span>
                                            ) : 'Nenhum resultado encontrado'}
                                        </div>
                                    ) : (
                                        filteredPets.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setSelectedPetId(p.id)}
                                                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-vettrack-accent/5 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <span className="text-xl bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center">{ESPECIES_EMOJI[p.especie] ?? '🐾'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-vettrack-dark truncate">
                                                        {p.nome}
                                                    </div>
                                                    <div className="text-[11px] font-medium text-gray-400 truncate">Tutor: {p.tutor?.nome}</div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-vettrack-dark mb-2">Para qual serviço? *</label>
                        <div className="relative">
                            <select
                                name="servicoId"
                                required
                                className="w-full pl-4 pr-10 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-medium focus:outline-none focus:border-vettrack-accent appearance-none bg-white cursor-pointer hover:border-gray-300 transition-colors"
                            >
                                <option value="" disabled selected>Selecione o procedimento...</option>
                                {servicos.map((s) => (
                                    <option key={s.id} value={s.id}>{s.nome}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-vettrack-dark mb-2">Observações Internas</label>
                        <textarea
                            name="observacoes"
                            placeholder="Ex: Alérgico a clorexidina, animal arisco..."
                            rows={3}
                            className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 text-sm focus:outline-none focus:border-vettrack-accent resize-none placeholder:text-gray-400 transition-colors"
                        />
                    </div>

                    {novoError && (
                        <div className="p-3.5 bg-vettrack-error/10 border border-vettrack-error/20 rounded-xl text-sm font-semibold text-vettrack-error flex items-center gap-2">
                            <span className="text-lg">⚠️</span> {novoError}
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 rounded-2xl text-base bg-vettrack-accent hover:bg-[#3d8e82] shadow-md hover:shadow-lg transition-all"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Registrando...
                                </>
                            ) : (
                                'Iniciar Atendimento'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
