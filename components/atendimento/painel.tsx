'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { advanceStage, deleteAtendimento, insertCustomStage, confirmAndSendWhatsApp, revertStage } from '@/app/(dashboard)/atendimentos/actions';
import { reenviarWhatsApp } from '@/app/(dashboard)/atendimentos/reenviar-action';
import type { AtendimentoWithRelations, StageDefinition, CustomStageInput } from '@/types';
import { getEffectiveStages, canInsertCustomStage } from '@/lib/stages/stage.config';

// Novas Views Refatoradas
import { FilaList } from './views/fila-list';
import { DetalhesView } from './views/detalhes-view';

// Modais Refatorados
import { NovoAtendimentoModal } from './modals/novo-atendimento-modal';
import { ConfirmDeleteModal } from './modals/confirm-delete-modal';
import { InsertStageModal } from './modals/insert-stage-modal';

interface PetForSelect {
  id: string;
  petCode: number;
  nome: string;
  especie: string;
  raca: string | null;
  tutor: { id: string; nome: string; telefone: string };
}

interface PainelProps {
  initialData: AtendimentoWithRelations[];
  finalizados: AtendimentoWithRelations[];
  servicos: any[];
  pets: PetForSelect[];
  uploadMidiaPermitido?: boolean;
}

export function AtendimentosPainel({ initialData, finalizados: initialFinalizados, servicos, pets, uploadMidiaPermitido = false }: PainelProps) {
  const router = useRouter();

  // -- Estado Global do App --
  const [aba, setAba] = useState<'ativos' | 'finalizados'>('ativos');
  const [atendimentos, setAtendimentos] = useState(initialData);
  const [finalizados, setFinalizados] = useState(initialFinalizados);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'fila' | 'detalhe'>('fila');

  // -- Modais --
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showInsertStageModal, setShowInsertStageModal] = useState(false);

  // -- Estado Transacional (Formulários e Uploads) --
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingReenvio, setLoadingReenvio] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // -- Confirmation Flow (Undo before WhatsApp) --
  const [confirmBanner, setConfirmBanner] = useState<{
    atendimentoId: string;
    petName: string;
    tutorName: string;
    countdown: number;
    stageId: string;
    whatsappMsg: string;
    autoNotify: boolean;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  } | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // -- Sincronizações --
  useEffect(() => {
    setAtendimentos(initialData);
    setFinalizados(initialFinalizados);
  }, [initialData, initialFinalizados]);

  useEffect(() => {
    return () => { if (mediaPreview) URL.revokeObjectURL(mediaPreview); };
  }, [mediaPreview]);

  useEffect(() => {
    const channel = supabase
      .channel('atendimentos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'atendimentos' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            // Update local state (completed atendimentos stay visible briefly via handleAdvance timeout)
            setAtendimentos((prev) =>
              prev.map((a) =>
                a.id === updated.id
                  ? {
                      ...a,
                      currentStage: updated.current_stage,
                      status: updated.status,
                      customStages: updated.custom_stages ?? null,
                    }
                  : a
              )
            );
          }
          if (payload.eventType === 'INSERT') {
            router.refresh();
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router, supabase]);

  // -- Handlers Auxiliares --
  function showToast(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  }

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function clearMedia() {
    setMediaFile(null);
    setMediaPreview(null);
  }

  function clearConfirmBanner() {
    if (confirmTimerRef.current) clearInterval(confirmTimerRef.current);
    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    confirmTimerRef.current = null;
    confirmTimeoutRef.current = null;
    setConfirmBanner(null);
  }

  // Cleanup confirmation timers on unmount
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearInterval(confirmTimerRef.current);
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    };
  }, []);

  async function handleUndo() {
    if (!confirmBanner) return;
    clearConfirmBanner();
    try {
      await revertStage(confirmBanner.atendimentoId);
      // Revert local state
      setAtendimentos((prev) =>
        prev.map((a) =>
          a.id === confirmBanner.atendimentoId
            ? { ...a, currentStage: a.currentStage - 1, status: a.currentStage - 1 === 0 ? 'AGUARDANDO' as const : 'EM_ANDAMENTO' as const }
            : a
        )
      );
      // If it was completed, move it back from finalizados
      setFinalizados((prev) => {
        const reverted = prev.find((a) => a.id === confirmBanner.atendimentoId);
        if (reverted) {
          setAtendimentos((p) => [...p, { ...reverted, currentStage: reverted.currentStage - 1, status: 'EM_ANDAMENTO' as const }]);
          return prev.filter((a) => a.id !== confirmBanner.atendimentoId);
        }
        return prev;
      });
      showToast('↩️ Estágio revertido!');
      router.refresh();
    } catch (err: any) {
      showToast(`❌ Erro ao reverter: ${err.message}`);
    }
  }

  function startConfirmCountdown(data: {
    atendimentoId: string;
    petName: string;
    tutorName: string;
    stageId: string;
    whatsappMsg: string;
    autoNotify: boolean;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  }) {
    clearConfirmBanner();
    const COUNTDOWN_SECONDS = 5;
    setConfirmBanner({ ...data, countdown: COUNTDOWN_SECONDS });

    confirmTimerRef.current = setInterval(() => {
      setConfirmBanner((prev) => {
        if (!prev || prev.countdown <= 1) return prev;
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    confirmTimeoutRef.current = setTimeout(async () => {
      if (confirmTimerRef.current) clearInterval(confirmTimerRef.current);
      confirmTimerRef.current = null;

      if (data.autoNotify) {
        try {
          const result = await confirmAndSendWhatsApp({
            atendimentoId: data.atendimentoId,
            stageId: data.stageId,
            whatsappMsg: data.whatsappMsg,
            mediaUrl: data.mediaUrl,
            mediaType: data.mediaType,
          });
          if (result.success) {
            setConfirmBanner(null);
            showToast(`📱 WhatsApp enviado para ${data.tutorName}!`);
          } else {
            setWhatsappError(data.atendimentoId);
            setConfirmBanner(null);
            showToast(`⚠️ WhatsApp falhou após 3 tentativas.`);
          }
        } catch {
          setWhatsappError(data.atendimentoId);
          setConfirmBanner(null);
          showToast(`⚠️ Erro ao enviar WhatsApp.`);
        }
      } else {
        setConfirmBanner(null);
        showToast('Estágio avançado!');
      }
    }, COUNTDOWN_SECONDS * 1000);
  }

  function selectAtendimento(id: string) {
    setSelectedId(id);
    clearMedia();
    setMobileView('detalhe');
  }

  function voltarParaFila() {
    setSelectedId(null);
    setMobileView('fila');
    clearMedia();
  }

  // -- Handlers de Negócio (Actions) --
  async function handleAdvance() {
    if (!selected) return;
    setLoading(true);
    setWhatsappError(null);

    try {
      const formData = new FormData();
      if (mediaFile) formData.append('media', mediaFile);
      const result = await advanceStage(selected.id, mediaFile ? formData : undefined);
      clearMedia();

      const newStage = result.newStage;
      const isLast = newStage >= stages.length - 1;

      // Phase A: Update local UI state (DB already updated)
      if (isLast) {
        // Keep completed atendimento visible for 10s with CONCLUIDO status
        setAtendimentos((prev) =>
          prev.map((a) =>
            a.id === selected.id
              ? { ...a, currentStage: newStage, status: 'CONCLUIDO' as const }
              : a
          )
        );
        // Auto-move to finalizados after 10 seconds
        const selectedRef = { ...selected, currentStage: newStage, status: 'CONCLUIDO' as const };
        setTimeout(() => {
          setAtendimentos((prev) => prev.filter((a) => a.id !== selectedRef.id));
          setFinalizados((prev) => [selectedRef, ...prev]);
          setSelectedId((prev) => {
            if (prev === selectedRef.id) {
              setMobileView('fila');
              return null;
            }
            return prev;
          });
        }, 10_000);
      } else {
        setAtendimentos((prev) =>
          prev.map((a) =>
            a.id === selected.id ? { ...a, currentStage: newStage, status: 'EM_ANDAMENTO' } : a
          )
        );
      }

      // Phase B: Start confirmation countdown (WhatsApp sent after countdown)
      startConfirmCountdown({
        atendimentoId: selected.id,
        petName: selected.pet.nome,
        tutorName: selected.pet.tutor.nome.split(' ')[0],
        stageId: result.stageId,
        whatsappMsg: result.whatsappMsg,
        autoNotify: result.autoNotify,
        mediaUrl: result.mediaUrl,
        mediaType: result.mediaType,
      });

      router.refresh();
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    if (!selected) return;
    setLoadingReenvio(true);
    try {
      const result = await reenviarWhatsApp(selected.id);
      if (result.success) {
        setWhatsappError(null);
        showToast(`WhatsApp reenviado com sucesso! 📱`);
      } else {
        showToast(`⚠️ Reenvio falhou: ${result.error}`);
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    } finally {
      setLoadingReenvio(false);
    }
  }

  async function handleInsertStage(input: CustomStageInput) {
    if (!selected) return;
    try {
      const result = await insertCustomStage(selected.id, input);
      setAtendimentos((prev) =>
        prev.map((a) =>
          a.id === selected.id ? { ...a, customStages: result.effectiveStages } : a
        )
      );
      setShowInsertStageModal(false);
      showToast('Estágio extra inserido com sucesso');
      router.refresh();
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    }
  }

  async function handleDelete(id: string) {
    setConfirmDelete(null);
    setLoadingDelete(true);
    try {
      await deleteAtendimento(id);
      setAtendimentos((prev) => prev.filter((a) => a.id !== id));
      setFinalizados((prev) => prev.filter((a) => a.id !== id));
      if (selectedId === id) { setSelectedId(null); setMobileView('fila'); }
      showToast('Registro excluído');
      router.refresh();
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    } finally {
      setLoadingDelete(false);
    }
  }

  // -- Computed State --
  const selected = atendimentos.find((a) => a.id === selectedId) || finalizados.find((a) => a.id === selectedId);
  const stages: StageDefinition[] = selected ? getEffectiveStages(selected) : [];
  const currentStageIdx = selected ? selected.currentStage : 0;
  const nextStageAllowsMedia = selected ? (stages[currentStageIdx + 1]?.mediaAllowed ?? false) : false;
  const canAddStage = selected
    ? canInsertCustomStage(selected.servico.tipo) && selected.status !== 'CONCLUIDO'
    : false;

  const grouped = servicos.reduce((acc: any[], svc) => {
    const items = atendimentos.filter((a) => a.servicoId === svc.id);
    if (items.length > 0) acc.push({ servico: svc, items });
    return acc;
  }, []);

  return (
    <div className="flex h-full bg-[rgb(var(--background))] overflow-hidden">

      {/* Toast Notification (Aprimorado globalmente) */}
      {notification && (
        <div className="fixed top-6 right-6 z-[100] bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-lg">
            {notification.startsWith('❌') ? '🛑' : notification.startsWith('⚠️') ? '⚠️' : '✅'}
          </div>
          <span className="text-sm font-bold text-vettrack-dark pt-0.5">
            {notification.replace(/^[❌✅⚠️]\s*/, '')}
          </span>
        </div>
      )}

      {/* Confirmation Banner (Undo before WhatsApp) */}
      {confirmBanner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white rounded-2xl px-5 py-4 shadow-xl border border-gray-100 flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-md w-[calc(100%-2rem)]">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-lg flex-shrink-0">
            ✅
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-vettrack-dark">Estágio avançado!</p>
            {confirmBanner.autoNotify && (
              <p className="text-xs text-gray-500 mt-0.5">
                WhatsApp em {confirmBanner.countdown}s...
              </p>
            )}
          </div>
          <button
            onClick={handleUndo}
            className="text-sm font-bold text-vettrack-accent hover:text-[#3d8e82] bg-vettrack-accent/10 hover:bg-vettrack-accent/20 px-4 py-2 rounded-xl transition-all flex-shrink-0"
          >
            Desfazer
          </button>
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none" stroke="#4AABB3" strokeWidth="3"
                strokeDasharray={`${(confirmBanner.countdown / 5) * 94.25} 94.25`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          </div>
        </div>
      )}

      {/* ── DESKTOP: Layout Mestre-Detalhe Lado a Lado ── */}
      <div className="hidden md:flex h-full w-full max-w-[1600px] mx-auto">

        {/* Lado Esquerdo: Fila */}
        <div className="w-[380px] lg:w-[420px] bg-white/80 backdrop-blur-3xl overflow-y-auto p-6 flex flex-col flex-shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] border-r border-gray-100">
          <FilaList
            aba={aba}
            setAba={setAba}
            atendimentosLength={atendimentos.length}
            finalizadosLength={finalizados.length}
            grouped={grouped}
            finalizados={finalizados}
            selectedId={selectedId}
            whatsappError={whatsappError}
            onSelectAtendimento={selectAtendimento}
            onNovoClick={() => setShowNovoModal(true)}
          />
        </div>

        {/* Lado Direito: Detalhe */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
          <DetalhesView
            atendimento={selected}
            stages={stages}
            currentStageIdx={currentStageIdx}
            nextStageAllowsMedia={nextStageAllowsMedia}
            mediaPreview={mediaPreview}
            mediaFile={mediaFile}
            onMediaChange={handleMediaChange}
            onClearMedia={clearMedia}
            onAdvance={handleAdvance}
            isLoading={loading}
            whatsappError={whatsappError === selected?.id}
            onReenviar={handleReenviar}
            isLoadingReenvio={loadingReenvio}
            onDeleteRequest={() => setConfirmDelete(selected?.id || null)}
            onVoltarParaFila={voltarParaFila}
            canAddStage={canAddStage}
            onAddStageClick={() => setShowInsertStageModal(true)}
            uploadMidiaPermitido={uploadMidiaPermitido}
          />
        </div>
      </div>

      {/* ── MOBILE: Stack ── */}
      <div className="flex md:hidden h-full w-full flex-col">
        {mobileView === 'fila' ? (
          <div className="flex-1 overflow-y-auto p-5 bg-white/80 backdrop-blur-3xl">
            <FilaList
              aba={aba}
              setAba={setAba}
              atendimentosLength={atendimentos.length}
              finalizadosLength={finalizados.length}
              grouped={grouped}
              finalizados={finalizados}
              selectedId={selectedId}
              whatsappError={whatsappError}
              onSelectAtendimento={selectAtendimento}
              onNovoClick={() => setShowNovoModal(true)}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(var(--background))]">
            <div className="flex-1 overflow-y-auto p-5">
              <DetalhesView
                atendimento={selected}
                stages={stages}
                currentStageIdx={currentStageIdx}
                nextStageAllowsMedia={nextStageAllowsMedia}
                mediaPreview={mediaPreview}
                mediaFile={mediaFile}
                onMediaChange={handleMediaChange}
                onClearMedia={clearMedia}
                onAdvance={handleAdvance}
                isLoading={loading}
                whatsappError={whatsappError === selected?.id}
                onReenviar={handleReenviar}
                isLoadingReenvio={loadingReenvio}
                onDeleteRequest={() => setConfirmDelete(selected?.id || null)}
                onVoltarParaFila={voltarParaFila}
                uploadMidiaPermitido={uploadMidiaPermitido}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modais Refatorados */}
      {showNovoModal && (
        <NovoAtendimentoModal
          onClose={() => setShowNovoModal(false)}
          onSuccess={(msg) => showToast(msg)}
          pets={pets}
          servicos={servicos}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
          isLoading={loadingDelete}
        />
      )}

      {showInsertStageModal && selected && (
        <InsertStageModal
          onClose={() => setShowInsertStageModal(false)}
          onSubmit={handleInsertStage}
          currentStageName={stages[currentStageIdx]?.label ?? ''}
          nextStageName={stages[currentStageIdx + 1]?.label ?? 'Final'}
        />
      )}
    </div>
  );
}
