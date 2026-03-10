'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { advanceStage, deleteAtendimento, insertCustomStage } from '@/app/(dashboard)/atendimentos/actions';
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
            if (updated.status === 'CONCLUIDO') {
              setAtendimentos((prev) => prev.filter((a) => a.id !== updated.id));
              setSelectedId((prev) => {
                if (prev === updated.id) setMobileView('fila');
                return prev === updated.id ? null : prev;
              });
            } else {
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

      if (isLast) {
        const concluido = { ...selected, currentStage: newStage, status: 'CONCLUIDO' as const };
        setAtendimentos((prev) => prev.filter((a) => a.id !== selected.id));
        setFinalizados((prev) => [concluido, ...prev]);
        setSelectedId(null);
        setMobileView('fila');
        if (result.whatsappStatus === 'error') {
          showToast(`✅ ${selected.pet.nome} concluído. WhatsApp falhou.`);
        } else {
          showToast(`✅ ${selected.pet.nome} concluído! Tutor notificado 📱`);
        }
      } else {
        setAtendimentos((prev) =>
          prev.map((a) =>
            a.id === selected.id ? { ...a, currentStage: newStage, status: 'EM_ANDAMENTO' } : a
          )
        );
        if (result.whatsappStatus === 'error') {
          setWhatsappError(selected.id);
          showToast(`⚠️ Avançado, mas o WhatsApp não foi enviado após 3 tentativas.`);
        } else if (result.whatsappStatus === 'sent') {
          showToast(`WhatsApp enviado para ${selected.pet.tutor.nome.split(' ')[0]}! 📱`);
        } else {
          showToast(`Estágio avançado!`);
        }
      }
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
