import { cn } from "@/lib/utils";

interface WhatsAppPreviewProps {
    petName: string;
    stageMsg: string;
    mediaPreview: string | null;
    isVideo: boolean;
    time?: string;
}

export function WhatsAppPreview({ petName, stageMsg, mediaPreview, isVideo, time }: WhatsAppPreviewProps) {
    const displayTime = time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div>
            <h3 className="text-sm font-bold text-vettrack-dark mb-4 px-1">
                Preview da mensagem
            </h3>

            {/* Simulação de tela de celular */}
            <div className="rounded-[2rem] overflow-hidden border-[6px] border-gray-900 shadow-xl bg-white max-w-[320px] mx-auto relative">
                {/* Notch simulation */}
                <div className="absolute top-0 inset-x-0 h-4 bg-gray-900 rounded-b-xl w-32 mx-auto z-20" />

                {/* Barra de status do app WhatsApp */}
                <div className="bg-[#008069] px-4 pt-8 pb-3 flex items-center gap-3 relative z-10">
                    <button className="text-white hover:bg-white/10 rounded-full p-1 -ml-2 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm ring-1 ring-white/30">🐾</div>
                    <div className="flex-1 min-w-0">
                        <div className="text-white text-[15px] font-semibold leading-tight tracking-wide">VetTrack AI</div>
                        <div className="text-white/80 text-[11px] font-medium">Conta comercial</div>
                    </div>
                </div>

                {/* Área de conversa */}
                <div
                    className="p-4 min-h-[250px] flex flex-col justify-end gap-1"
                    style={{
                        backgroundColor: '#efeae2',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2v-20h2v20h2v-20h2v20h2v-20h2v20h2v-20h2v20h2v-20h2v20h2v-20h2v20h2v-20h2v20h2v-20h2v22H20z' fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`
                    }}
                >
                    {/* Bolha de mensagem */}
                    <div className="self-start max-w-[90%] relative">
                        <div className="absolute top-0 -left-2 w-4 h-4 bg-white" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

                        <div className="bg-white rounded-xl rounded-tl-none shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] overflow-hidden relative z-10 w-full">
                            {/* Imagem (se houver mídia) */}
                            {mediaPreview && (
                                <div className="p-1 pb-0">
                                    <div className="relative rounded-lg overflow-hidden">
                                        {isVideo ? (
                                            <div className="relative">
                                                <video src={mediaPreview} className="w-full h-36 object-cover" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                                        <div className="w-0 h-0 border-t-6 border-b-6 border-l-[10px] border-transparent border-l-white ml-1"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={mediaPreview} alt="mídia" className="w-full h-36 object-cover" />
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={cn("px-2.5 pt-2 pb-1.5", mediaPreview ? "px-3" : "")}>
                                <p className="text-[14px] text-[#111b21] leading-[19px] whitespace-pre-wrap font-sans">
                                    Olá! 👋{'\n\n'}
                                    Atualização sobre o status de <span className="font-bold">{petName}</span>: {'\n\n'}
                                    {stageMsg}{'\n\n'}
                                    Qualquer dúvida, estamos por aqui. 🩺
                                </p>

                                <div className="flex justify-end items-center gap-1 mt-1 -mb-1">
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {displayTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[12px] text-gray-400 mt-4 text-center font-medium flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                Enviado automaticamente no WhatsApp
            </p>
        </div>
    );
}
