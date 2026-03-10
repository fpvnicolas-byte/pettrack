import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2 } from "lucide-react";
import type { AtendimentoWithRelations } from "@/types";
import { getEffectiveStages } from "@/lib/stages/stage.config";

const ESPECIES_EMOJI: Record<string, string> = {
    CANINO: '🐶', FELINO: '🐱', AVE: '🐦', ROEDOR: '🐹', REPTIL: '🦎', OUTRO: '🐾',
};

interface FilaListProps {
    aba: 'ativos' | 'finalizados';
    setAba: (aba: 'ativos' | 'finalizados') => void;
    atendimentosLength: number;
    finalizadosLength: number;
    grouped: any[];
    finalizados: AtendimentoWithRelations[];
    selectedId: string | null;
    whatsappError: string | null;
    onSelectAtendimento: (id: string) => void;
    onNovoClick: () => void;
}

export function FilaList({
    aba,
    setAba,
    atendimentosLength,
    finalizadosLength,
    grouped,
    finalizados,
    selectedId,
    whatsappError,
    onSelectAtendimento,
    onNovoClick
}: FilaListProps) {
    return (
        <>
            {/* Abas */}
            <div className="flex items-center gap-1 mb-6 p-1 bg-gray-100 rounded-xl">
                <button
                    onClick={() => setAba('ativos')}
                    className={cn(
                        'flex-1 py-2.5 md:py-2 text-xs font-bold rounded-lg transition-all',
                        aba === 'ativos' ? 'bg-white text-vettrack-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    )}
                >
                    Ativos
                    <span className={cn('ml-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold', aba === 'ativos' ? 'bg-vettrack-accent/10 text-vettrack-accent' : 'bg-gray-200')}>
                        {atendimentosLength}
                    </span>
                </button>
                <button
                    onClick={() => setAba('finalizados')}
                    className={cn(
                        'flex-1 py-2.5 md:py-2 text-xs font-bold rounded-lg transition-all',
                        aba === 'finalizados' ? 'bg-white text-vettrack-success shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    )}
                >
                    Finalizados
                    <span className={cn('ml-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold', aba === 'finalizados' ? 'bg-vettrack-success/10 text-vettrack-success' : 'bg-gray-200')}>
                        {finalizadosLength}
                    </span>
                </button>
            </div>

            {/* Lista de ativos */}
            {aba === 'ativos' && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Em Andamento</h3>
                        <button
                            onClick={onNovoClick}
                            className="flex items-center gap-1.5 text-xs bg-vettrack-accent/10 text-vettrack-accent px-3.5 py-2.5 md:px-2.5 md:py-1.5 rounded-lg hover:bg-vettrack-accent hover:text-white transition-colors font-bold"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Novo
                        </button>
                    </div>

                    {grouped.length === 0 && (
                        <div className="text-center py-16 text-gray-400 text-sm flex-1 flex flex-col items-center justify-center">
                            <div className="text-4xl mb-3 opacity-50">📋</div>
                            <div className="font-medium text-gray-500">A fila está limpa</div>
                            <button
                                onClick={onNovoClick}
                                className="mt-4 text-vettrack-accent font-bold text-xs hover:underline flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> Começar o dia
                            </button>
                        </div>
                    )}
                    {grouped.map(({ servico, items }: any) => (
                        <div key={servico.id} className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {servico.nome}
                                </div>
                            </div>
                            <div className="space-y-2">
                                {items.map((atendimento: AtendimentoWithRelations) => {
                                    const stgs = getEffectiveStages(atendimento);
                                    const stg = stgs[atendimento.currentStage];
                                    const isSelected = selectedId === atendimento.id;

                                    return (
                                        <button
                                            key={atendimento.id}
                                            onClick={() => onSelectAtendimento(atendimento.id)}
                                            className={cn(
                                                'flex flex-col gap-2.5 w-full p-4 rounded-xl text-left transition-all active:scale-[0.98] border',
                                                isSelected
                                                    ? 'bg-white border-vettrack-accent shadow-md ring-1 ring-vettrack-accent/20'
                                                    : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                                            )}
                                        >
                                            <div className="flex items-start gap-3 w-full">
                                                <div
                                                    className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-colors",
                                                        isSelected ? "bg-vettrack-accent/10" : "bg-gray-50"
                                                    )}
                                                >
                                                    {ESPECIES_EMOJI[atendimento.pet.especie] ?? '🐾'}
                                                </div>
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <div className="text-sm font-bold text-vettrack-dark truncate">
                                                        {atendimento.pet.nome}
                                                    </div>
                                                    <div className="text-[11px] font-medium text-gray-500 truncate mt-0.5 flex items-center gap-1">
                                                        <span className="truncate max-w-[80px]">{atendimento.pet.raca || "Raça SRD"}</span>
                                                        <span>•</span>
                                                        <span className="truncate">{atendimento.pet.tutor.nome.split(' ')[0]}</span>
                                                    </div>
                                                </div>
                                                {whatsappError === atendimento.id && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-vettrack-error flex-shrink-0 animate-pulse" title="WhatsApp não enviado" />
                                                )}
                                            </div>

                                            {/* Sub-status bar */}
                                            <div className="flex items-center gap-2 w-full pl-[60px]">
                                                <div
                                                    className="px-2 py-0.5 rounded text-[10px] font-bold truncate max-w-full"
                                                    style={{ background: stg?.color ? `${stg.color}15` : '#f3f4f6', color: stg?.color || '#6b7280' }}
                                                >
                                                    {stg?.label || 'Em Andamento'}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </>
            )}

            {/* Lista de finalizados */}
            {aba === 'finalizados' && (
                <>
                    {finalizados.length === 0 && (
                        <div className="text-center py-16 text-gray-400 text-sm">
                            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            <div className="font-medium">Nenhum atendimento finalizado</div>
                        </div>
                    )}
                    <div className="space-y-2 mt-4">
                        {finalizados.map((atendimento) => {
                            const isSelected = selectedId === atendimento.id;

                            return (
                                <button
                                    key={atendimento.id}
                                    onClick={() => onSelectAtendimento(atendimento.id)}
                                    className={cn(
                                        'flex items-center gap-3 w-full p-4 rounded-xl text-left transition-all active:scale-[0.98] border',
                                        isSelected
                                            ? 'bg-white border-vettrack-success shadow-md ring-1 ring-vettrack-success/20'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-full bg-vettrack-success/10 flex items-center justify-center text-lg flex-shrink-0">
                                        {ESPECIES_EMOJI[atendimento.pet.especie] ?? '🐾'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-vettrack-dark truncate">{atendimento.pet.nome}</div>
                                        <div className="text-[11px] text-gray-500 truncate font-medium">
                                            {atendimento.servico.nome} • {atendimento.pet.tutor.nome.split(' ')[0]}
                                        </div>
                                    </div>
                                    <Badge variant="success" className="bg-vettrack-success/10 text-vettrack-success shadow-none">
                                        Pronto
                                    </Badge>
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </>
    );
}
