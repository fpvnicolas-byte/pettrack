import { cn } from "@/lib/utils";
import { Check, ArrowRight, Loader2, ImagePlus, X } from "lucide-react";
import type { StageDefinition } from "@/types";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface StageTrackerProps {
    stages: StageDefinition[];
    currentStageIdx: number;
    nextStageAllowsMedia: boolean;
    mediaPreview: string | null;
    mediaFile: File | null;
    onMediaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearMedia: () => void;
    onAdvance: () => void;
    isLoading: boolean;
    isCompleted: boolean;
}

export function StageTracker({
    stages,
    currentStageIdx,
    nextStageAllowsMedia,
    mediaPreview,
    mediaFile,
    onMediaChange,
    onClearMedia,
    onAdvance,
    isLoading,
    isCompleted
}: StageTrackerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nextStage = stages[currentStageIdx + 1];

    function triggerFileSelect() {
        fileInputRef.current?.click();
    }

    return (
        <>
            <h3 className="text-sm font-bold text-vettrack-dark mb-4 px-1">Status do Paciente</h3>

            {/* Container Principal dos Statuses */}
            <div className="relative">
                {/* Linha vertical conectora */}
                <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gray-100 z-0" />

                <div className="space-y-4 relative z-10">
                    {stages.map((stage, idx) => {
                        const isActive = idx === currentStageIdx;
                        const isDone = idx < currentStageIdx;
                        const isPending = idx > currentStageIdx;

                        return (
                            <div
                                key={stage.id}
                                className={cn(
                                    "flex items-center gap-4 group transition-all duration-300",
                                    isPending ? "opacity-40" : "opacity-100"
                                )}
                            >
                                {/* Círculo do status */}
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-[3px] shadow-sm transition-all duration-300",
                                        isDone ? `bg-vettrack-success border-vettrack-success text-white` :
                                            isActive ? `bg-white text-vettrack-dark shadow-md z-10 scale-110` :
                                                `bg-gray-50 border-gray-200 text-gray-400`
                                    )}
                                    style={isActive ? { borderColor: stage.color } : undefined}
                                >
                                    {isDone ? <Check className="w-5 h-5" /> : (idx + 1)}
                                </div>

                                {/* Detalhes do status */}
                                <div className={cn(
                                    "flex-1 p-4 rounded-2xl border transition-all duration-300",
                                    isActive ? "bg-white shadow-md" : "bg-transparent border-transparent",
                                    isDone ? "border-gray-100 bg-gray-50/50" : ""
                                )}
                                    style={isActive ? { borderColor: `${stage.color}40`, boxShadow: `0 4px 20px -5px ${stage.color}20` } : undefined}
                                >
                                    <div className="font-bold text-base" style={{ color: isActive ? stage.color : isDone ? '#10B981' : '#9ca3af' }}>
                                        {stage.label}
                                    </div>
                                    {stage.mediaAllowed && (
                                        <div className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5 mt-1">
                                            <ImagePlus className="w-3.5 h-3.5" /> Estágio permite fotos
                                        </div>
                                    )}
                                    {isActive && (
                                        <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: stage.color }} />
                                            Em Andamento
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Upload de Mídia e Botão Avançar */}
            {!isCompleted && (
                <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden p-1">
                    {nextStageAllowsMedia && (
                        <div className="p-4 bg-gray-50/50 rounded-[1.5rem] mb-1">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-sm font-bold text-gray-600 block flex items-center gap-2">
                                    <ImagePlus className="w-4 h-4" /> Anexar Mídia (Opcional)
                                </span>
                                <span className="text-[10px] font-bold text-vettrack-accent uppercase tracking-wider bg-vettrack-accent/10 px-2 py-0.5 rounded">Tutor Ama ver!</span>
                            </div>

                            {mediaPreview ? (
                                <div className="relative rounded-2xl overflow-hidden border-2 border-vettrack-accent/20 group">
                                    {mediaFile?.type.startsWith('video') ? (
                                        <video src={mediaPreview} className="w-full h-40 object-cover" controls />
                                    ) : (
                                        <img src={mediaPreview} alt="preview" className="w-full h-40 object-cover" />
                                    )}
                                    <button
                                        onClick={onClearMedia}
                                        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md transition-all scale-95 hover:scale-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={triggerFileSelect}
                                    className="w-full border-2 border-dashed border-gray-300 hover:border-vettrack-accent hover:bg-vettrack-accent/5 rounded-2xl py-6 flex flex-col items-center justify-center text-gray-500 hover:text-vettrack-accent transition-all active:scale-[0.98]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm mb-2 flex items-center justify-center">
                                        <ImagePlus className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold">Toque para câmera/galeria</span>
                                    <span className="text-[11px] opacity-70 mt-1">Imagens ou vídeos curtos</span>
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => {
                                    onMediaChange(e);
                                    // Clear the input value so the same file can be selected again if removed
                                    if (e.target) e.target.value = '';
                                }}
                                className="hidden"
                            />
                        </div>
                    )}

                    <Button
                        onClick={onAdvance}
                        disabled={isLoading}
                        className="w-full h-16 rounded-[1.25rem] text-base gap-2 bg-vettrack-accent hover:bg-[#3d8e82] shadow-md hover:shadow-lg transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Atualizando & Enviando...
                            </>
                        ) : (
                            <>
                                <span className="font-bold tracking-wide">
                                    {currentStageIdx === 0
                                        ? `Iniciar: ${nextStage?.label}`
                                        : currentStageIdx >= stages.length - 2
                                        ? `Concluir: ${nextStage?.label}`
                                        : `Avançar para: ${nextStage?.label}`}
                                </span>
                                <ArrowRight className="w-5 h-5 opacity-90" />
                            </>
                        )}
                    </Button>
                    <p className="text-center text-[11px] text-gray-400 font-medium py-3 px-4">
                        O avanço disparará automaticamente uma mensagem no WhatsApp do tutor.
                    </p>
                </div>
            )}

            {isCompleted && (
                <div className="mt-8 bg-vettrack-success/10 border-2 border-vettrack-success/20 rounded-3xl p-6 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-vettrack-success mb-3">
                        <Check className="w-8 h-8 font-bold" />
                    </div>
                    <h4 className="text-vettrack-success font-bold text-lg mb-1">Pronto para retirar!</h4>
                    <p className="text-sm text-vettrack-success/80 font-medium">O atendimento foi concluído e o tutor notificado.</p>
                </div>
            )}
        </>
    )
}
