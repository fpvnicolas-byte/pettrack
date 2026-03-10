import { StageTracker } from "./stage-tracker";
import { WhatsAppPreview } from "./whatsapp-preview";
import { cn } from "@/lib/utils";
import type { AtendimentoWithRelations, StageDefinition } from "@/types";
import { RefreshCw, Trash2, ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const ESPECIES_EMOJI: Record<string, string> = {
    CANINO: '🐶', FELINO: '🐱', AVE: '🐦', ROEDOR: '🐹', REPTIL: '🦎', OUTRO: '🐾',
};

interface DetalhesViewProps {
    atendimento: AtendimentoWithRelations | undefined;
    stages: StageDefinition[];
    currentStageIdx: number;
    nextStageAllowsMedia: boolean;
    mediaPreview: string | null;
    mediaFile: File | null;
    onMediaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearMedia: () => void;
    onAdvance: () => void;
    isLoading: boolean;
    whatsappError: boolean;
    onReenviar: () => void;
    isLoadingReenvio: boolean;
    onDeleteRequest: () => void;
    onVoltarParaFila: () => void;
    canAddStage?: boolean;
    onAddStageClick?: () => void;
    uploadMidiaPermitido?: boolean;
}

export function DetalhesView({
    atendimento,
    stages,
    currentStageIdx,
    nextStageAllowsMedia,
    mediaPreview,
    mediaFile,
    onMediaChange,
    onClearMedia,
    onAdvance,
    isLoading,
    whatsappError,
    onReenviar,
    isLoadingReenvio,
    onDeleteRequest,
    onVoltarParaFila,
    canAddStage = false,
    onAddStageClick,
    uploadMidiaPermitido = false,
}: DetalhesViewProps) {

    if (!atendimento) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6 shadow-inner">
                    <span className="text-5xl opacity-40">🐾</span>
                </div>
                <div className="font-bold text-lg text-gray-500">Selecione um paciente</div>
                <div className="text-sm font-medium mt-1">A fila está na lateral esquerda</div>
            </div>
        );
    }

    const currentStage = stages[currentStageIdx];
    const nextStage = stages[currentStageIdx + 1];
    const isCompleted = currentStageIdx >= stages.length - 1;

    const previewStageMsg = nextStage
        ? nextStage.whatsappMsg
        : stages[stages.length - 1]?.whatsappMsg;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

            {/* Mobile Back Button */}
            <div className="md:hidden mb-4">
                <button onClick={onVoltarParaFila} className="flex items-center gap-2 text-sm font-bold text-gray-500 active:scale-95 transition-all w-fit py-3 pr-5 bg-white rounded-xl shadow-sm pl-4">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Fila
                </button>
            </div>

            {/* Header do pet premium */}
            <div className="bg-white rounded-[2rem] p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 shadow-sm border border-gray-100">
                <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-inner"
                    style={{ background: `${currentStage?.color}15`, color: currentStage?.color }}
                >
                    {ESPECIES_EMOJI[atendimento.pet.especie] ?? '🐾'}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="inline-block px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        {atendimento.servico.nome}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-vettrack-dark tracking-tight">{atendimento.pet.nome}</h2>
                    <p className="text-sm sm:text-base font-semibold text-gray-500 mt-0.5">
                        Raça {atendimento.pet.raca || "SRD"} • Peso: {(atendimento.pet as any).peso ? `${(atendimento.pet as any).peso}kg` : "N/I"}
                    </p>
                </div>

                <div className="w-full sm:w-auto p-4 sm:p-0 bg-gray-50 sm:bg-transparent rounded-2xl flex items-center justify-between sm:flex-col sm:items-end sm:text-right gap-1 sm:gap-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-0 sm:mb-1">
                        <Phone className="w-3.5 h-3.5" /> Tutor
                    </div>
                    <div>
                        <div className="text-base font-bold text-vettrack-dark">{atendimento.pet.tutor.nome.split(' ')[0]}</div>
                        <div className="text-[13px] font-bold text-vettrack-accent mt-0.5">{atendimento.pet.tutor.telefone}</div>
                    </div>
                </div>
            </div>

            {/* Grid Layout: Timeline + WhatsApp */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Coluna Central: Timeline e Ações */}
                <div className="col-span-1 lg:col-span-7 xl:col-span-7">

                    <StageTracker
                        stages={stages}
                        currentStageIdx={currentStageIdx}
                        nextStageAllowsMedia={nextStageAllowsMedia}
                        mediaPreview={mediaPreview}
                        mediaFile={mediaFile}
                        onMediaChange={onMediaChange}
                        onClearMedia={onClearMedia}
                        onAdvance={onAdvance}
                        isLoading={isLoading}
                        isCompleted={isCompleted}
                        canAddStage={canAddStage}
                        onAddStageClick={onAddStageClick}
                        uploadMidiaPermitido={uploadMidiaPermitido}
                    />

                    {/* Alerta de Falha no WhatsApp */}
                    {whatsappError && (
                        <div className="mt-6 p-5 bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-[#FCA5A5]">
                                <span className="text-xl">⚠️</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-vettrack-error">Mensagem não entregue</h4>
                                <p className="text-xs font-medium text-vettrack-error/80 mt-1 mb-3 sm:mb-0">A API do WhatsApp recusou. Tentamos 3 vezes. Verifique o número do tutor.</p>
                            </div>
                            <Button
                                onClick={onReenviar}
                                disabled={isLoadingReenvio}
                                className="w-full sm:w-auto shrink-0 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl shadow-sm gap-2"
                            >
                                <RefreshCw className={cn("w-4 h-4", isLoadingReenvio && "animate-spin")} />
                                Reenviar
                            </Button>
                        </div>
                    )}

                    {/* Área de Perigo */}
                    <div className="mt-10 pt-6 border-t border-gray-100 px-2 lg:hidden">
                        <button
                            onClick={onDeleteRequest}
                            className="flex items-center justify-center w-full gap-2 py-3.5 rounded-2xl text-sm font-semibold text-vettrack-error hover:bg-vettrack-error/10 border border-transparent hover:border-vettrack-error/20 transition-all active:scale-[0.98]"
                        >
                            <Trash2 className="w-4 h-4" /> Cancelar / Excluir Atendimento
                        </button>
                    </div>

                </div>

                {/* Coluna Direita: Preview (Desktop Only para não quebrar fluxo mental de tap-and-go no Mobile) */}
                <div className="hidden lg:block col-span-1 lg:col-span-5 xl:col-span-5 sticky top-6 pl-4 border-l border-gray-100/50">
                    <WhatsAppPreview
                        petName={atendimento.pet.nome}
                        stageMsg={previewStageMsg || ''}
                        mediaPreview={mediaPreview}
                        isVideo={mediaFile ? mediaFile.type.startsWith("video") : false}
                    />

                    <div className="mt-16 text-center">
                        <button
                            onClick={onDeleteRequest}
                            className="inline-flex items-center justify-center gap-2 py-2 px-6 rounded-full text-xs font-bold text-gray-400 hover:text-vettrack-error hover:bg-vettrack-error/10 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir Registro
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
