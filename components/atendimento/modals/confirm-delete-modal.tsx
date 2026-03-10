import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export function ConfirmDeleteModal({ onClose, onConfirm, isLoading }: ConfirmDeleteModalProps) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-vettrack-dark/60 backdrop-blur-md animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">

                <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-vettrack-error/10 text-vettrack-error flex items-center justify-center mx-auto mb-5">
                        <Trash2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-vettrack-dark mb-2">Excluir atendimento?</h3>
                    <p className="text-sm font-medium text-gray-500 mb-8">
                        Esta ação não pode ser desfeita. Todo o progresso e o histórico de envio para o WhatsApp serão apagados.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={onConfirm}
                            disabled={isLoading}
                            variant="destructive"
                            className="w-full h-12 rounded-xl text-base shadow-sm bg-vettrack-error hover:bg-[#DC2626]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Excluindo...
                                </>
                            ) : 'Sim, excluir permanentemente'}
                        </Button>

                        <Button
                            onClick={onClose}
                            disabled={isLoading}
                            variant="ghost"
                            className="w-full h-12 rounded-xl text-sm font-bold text-gray-500 hover:text-vettrack-dark"
                        >
                            Cancelar e Manter
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
