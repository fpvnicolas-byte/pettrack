'use client';

import { useState, useEffect, useRef, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { advanceStage, createAtendimento, deleteAtendimento } from '@/app/(dashboard)/atendimentos/actions';
import { reenviarWhatsApp } from '@/app/(dashboard)/atendimentos/reenviar-action';
import type { AtendimentoWithRelations, StageDefinition } from '@/types';
import { cn } from '@/lib/utils';

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
}

const ESPECIES_EMOJI: Record<string, string> = {
  CANINO: '🐶', FELINO: '🐱', AVE: '🐦', ROEDOR: '🐹', REPTIL: '🦎', OUTRO: '🐾',
};

export function AtendimentosPainel({ initialData, finalizados: initialFinalizados, servicos, pets }: PainelProps) {
  const router = useRouter();
  const [aba, setAba] = useState<'ativos' | 'finalizados'>('ativos');
  const [atendimentos, setAtendimentos] = useState(initialData);
  const [finalizados, setFinalizados] = useState(initialFinalizados);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [novoError, setNovoError] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [petSearch, setPetSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  // Mobile: controla se está mostrando o detalhe ou a fila
  const [mobileView, setMobileView] = useState<'fila' | 'detalhe'>('fila');
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null); // id do atendimento com erro
  const [loadingReenvio, setLoadingReenvio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => createClient(), []);

  // Sincroniza estado local quando o servidor retorna novos dados (após router.refresh)
  useEffect(() => {
    setAtendimentos(initialData);
    setFinalizados(initialFinalizados);
  }, [initialData, initialFinalizados]);

  useEffect(() => {
    const channel = supabase
      .channel('atendimentos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'atendimentos' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            // Se virou CONCLUIDO, remove da lista e navega de volta
            if (updated.status === 'CONCLUIDO') {
              setAtendimentos((prev) => prev.filter((a) => a.id !== updated.id));
              setSelectedId((prev) => {
                if (prev === updated.id) setMobileView('fila');
                return prev === updated.id ? null : prev;
              });
            } else {
              // Atualiza apenas campos escalares, preserva relações carregadas
              setAtendimentos((prev) =>
                prev.map((a) =>
                  a.id === updated.id
                    ? { ...a, currentStage: updated.current_stage, status: updated.status }
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
  }, [router]);

  function showToast(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  }

  const selected = atendimentos.find((a) => a.id === selectedId);
  const stages: StageDefinition[] = selected
    ? (selected.servico.stages as unknown as StageDefinition[])
    : [];
  const currentStage = selected ? stages[selected.currentStage] : null;
  const nextStage = selected ? stages[selected.currentStage + 1] : null;
  const nextStageAllowsMedia = nextStage?.mediaAllowed ?? false;

  const grouped = servicos.reduce((acc: any[], svc) => {
    const items = atendimentos.filter((a) => a.servicoId === svc.id);
    if (items.length > 0) acc.push({ servico: svc, items });
    return acc;
  }, []);

  // Revoga URL anterior para evitar vazamento de memória
  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function clearMedia() {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          showToast(`✅ ${selected.pet.nome} concluído — mas WhatsApp falhou. Verifique as configurações.`);
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
          showToast(`⚠️ Estágio avançado, mas o WhatsApp não foi enviado após 3 tentativas.`);
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

  async function handleDelete(id: string) {
    setConfirmDelete(null);
    setLoadingDelete(true);
    try {
      await deleteAtendimento(id);
      setAtendimentos((prev) => prev.filter((a) => a.id !== id));
      setFinalizados((prev) => prev.filter((a) => a.id !== id));
      if (selectedId === id) { setSelectedId(null); setMobileView('fila'); }
      showToast('Atendimento excluído');
      router.refresh();
    } catch (err: any) {
      showToast(`❌ ${err.message}`);
    } finally {
      setLoadingDelete(false);
    }
  }

  function handleNovoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedPetId) { setNovoError('Selecione um pet'); return; }
    const formData = new FormData(e.currentTarget);
    setNovoError(null);
    startTransition(async () => {
      try {
        await createAtendimento(formData);
        setShowNovoModal(false);
        setPetSearch('');
        setSelectedPetId(null);
        showToast('Atendimento criado!');
        router.refresh();
      } catch (err: any) {
        setNovoError(err.message);
      }
    });
  }

  const filteredPets = petSearch.trim() === ''
    ? pets
    : pets.filter(
        (p) =>
          p.nome.toLowerCase().includes(petSearch.toLowerCase()) ||
          (p.tutor?.nome ?? '').toLowerCase().includes(petSearch.toLowerCase())
      );

  // ── Painel da fila (compartilhado entre mobile e desktop) ──
  const FilaContent = (
    <>
      {/* Abas */}
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => setAba('ativos')}
          className={cn(
            'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors',
            aba === 'ativos' ? 'bg-vettrack-accent text-white' : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          Ativos
          <span className={cn('ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full', aba === 'ativos' ? 'bg-white/20' : 'bg-gray-200')}>
            {atendimentos.length}
          </span>
        </button>
        <button
          onClick={() => setAba('finalizados')}
          className={cn(
            'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors',
            aba === 'finalizados' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          Finalizados
          <span className={cn('ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full', aba === 'finalizados' ? 'bg-white/20' : 'bg-gray-200')}>
            {finalizados.length}
          </span>
        </button>
        {aba === 'ativos' && (
          <button
            onClick={() => { setShowNovoModal(true); setNovoError(null); setPetSearch(''); setSelectedPetId(null); }}
            className="text-xs bg-vettrack-accent text-white px-3 py-1.5 rounded-lg hover:bg-vettrack-accent/90 transition-colors font-medium ml-1"
          >
            + Novo
          </button>
        )}
      </div>

      {/* Lista de ativos */}
      {aba === 'ativos' && (
        <>
          {grouped.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm flex-1 flex flex-col items-center justify-center">
              <div className="text-4xl mb-2">🐾</div>
              <div>Nenhum atendimento ativo</div>
              <button
                onClick={() => { setShowNovoModal(true); setNovoError(null); setPetSearch(''); setSelectedPetId(null); }}
                className="mt-3 text-vettrack-accent text-xs hover:underline"
              >
                Criar primeiro atendimento
              </button>
            </div>
          )}
          {grouped.map(({ servico, items }: any) => (
            <div key={servico.id} className="mb-4">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {servico.nome}
              </div>
              {items.map((atendimento: AtendimentoWithRelations) => {
                const stgs = atendimento.servico.stages as unknown as StageDefinition[];
                const stg = stgs[atendimento.currentStage];
                return (
                  <button
                    key={atendimento.id}
                    onClick={() => selectAtendimento(atendimento.id)}
                    className={cn(
                      'flex items-center gap-3 w-full p-3 rounded-xl mb-1.5 text-left transition-all active:scale-[0.98]',
                      selectedId === atendimento.id
                        ? 'bg-blue-50 border-2 border-vettrack-accent'
                        : 'bg-gray-50 border border-transparent hover:border-gray-200'
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: `${stg?.color}18` }}
                    >
                      {ESPECIES_EMOJI[atendimento.pet.especie] ?? '🐾'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-vettrack-dark truncate">
                        {atendimento.pet.nome}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {atendimento.pet.raca} • {atendimento.pet.tutor.nome}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {whatsappError === atendimento.id && (
                        <span title="WhatsApp não enviado" className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                      )}
                      <div
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap"
                        style={{ background: `${stg?.color}18`, color: stg?.color }}
                      >
                        {stg?.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </>
      )}

      {/* Lista de finalizados */}
      {aba === 'finalizados' && (
        <>
          {finalizados.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              <div className="text-4xl mb-2">✅</div>
              <div>Nenhum atendimento finalizado hoje</div>
            </div>
          )}
          {finalizados.map((atendimento) => (
            <button
              key={atendimento.id}
              onClick={() => selectAtendimento(atendimento.id)}
              className={cn(
                'flex items-center gap-3 w-full p-3 rounded-xl mb-1.5 text-left transition-all active:scale-[0.98]',
                selectedId === atendimento.id
                  ? 'bg-green-50 border-2 border-green-500'
                  : 'bg-gray-50 border border-transparent hover:border-gray-200'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-base flex-shrink-0">
                {ESPECIES_EMOJI[atendimento.pet.especie] ?? '🐾'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-vettrack-dark truncate">{atendimento.pet.nome}</div>
                <div className="text-[11px] text-gray-500 truncate">
                  {atendimento.servico.nome} • {atendimento.pet.tutor.nome}
                </div>
              </div>
              <div className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-600 whitespace-nowrap">
                Concluído
              </div>
            </button>
          ))}
        </>
      )}
    </>
  );

  // ── Conteúdo do detalhe (compartilhado entre mobile e desktop) ──
  const DetalheContent = selected ? (
    <div>
      {/* Header do pet */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex items-center gap-4 shadow-sm border border-gray-100">
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${currentStage?.color}15` }}
        >
          {ESPECIES_EMOJI[selected.pet.especie] ?? '🐾'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-vettrack-dark">{selected.pet.nome}</h2>
          <p className="text-sm text-gray-500 truncate">
            {selected.pet.raca} • {selected.servico.nome}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-gray-400">Tutor</div>
          <div className="text-sm font-semibold">{selected.pet.tutor.nome.split(' ')[0]}</div>
          <div className="text-xs text-vettrack-accent">{selected.pet.tutor.telefone}</div>
        </div>
      </div>

      {/* Grid: em mobile vira coluna única; desktop duas colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {/* Estágios + upload + botão avançar */}
        <div>
          <h3 className="text-sm font-bold text-vettrack-dark mb-3">Atualizar Status</h3>
          <div className="space-y-2">
            {stages.map((stage, idx) => {
              const isActive = idx === selected.currentStage;
              const isDone = idx < selected.currentStage;
              return (
                <div
                  key={stage.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    isActive && 'border-2',
                    isDone && 'bg-green-50/50 border-green-100',
                    !isDone && !isActive && 'border-gray-100 opacity-50'
                  )}
                  style={isActive ? { borderColor: stage.color, background: `${stage.color}08` } : {}}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: isDone ? '#10B981' : isActive ? stage.color : '#e5e7eb' }}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-sm font-medium"
                      style={{ color: isActive ? stage.color : isDone ? '#10B981' : '#9ca3af' }}
                    >
                      {stage.label}
                    </div>
                    {stage.mediaAllowed && (
                      <div className="text-[10px] text-gray-400 mt-0.5">📷 Permite foto/vídeo</div>
                    )}
                  </div>
                  {isActive && (
                    <div
                      className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                      style={{ background: stage.color, boxShadow: `0 0 0 3px ${stage.color}33` }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload de mídia */}
          {selected.currentStage < stages.length - 1 && nextStageAllowsMedia && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                📷 Foto/vídeo para o próximo estágio (opcional)
              </p>
              {mediaPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  {mediaFile?.type.startsWith('video') ? (
                    <video src={mediaPreview} className="w-full h-36 object-cover" controls />
                  ) : (
                    <img src={mediaPreview} alt="preview" className="w-full h-36 object-cover" />
                  )}
                  <button
                    onClick={clearMedia}
                    className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full py-4 px-4 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-vettrack-accent hover:text-vettrack-accent transition-colors cursor-pointer active:scale-[0.98]">
                  <span>📎</span>
                  <span>Adicionar foto ou vídeo</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Botão avançar — grande para toque fácil no mobile */}
          {selected.currentStage < stages.length - 1 && (
            <button
              onClick={handleAdvance}
              disabled={loading}
              className="w-full mt-4 py-4 md:py-3 px-4 bg-vettrack-accent text-white rounded-xl font-semibold text-base md:text-sm hover:bg-vettrack-accent/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Avançando...
                </span>
              ) : (
                <>
                  Avançar: {nextStage?.label}
                  <span className="text-xs md:text-[11px] opacity-70 hidden sm:inline">→ WhatsApp automático</span>
                </>
              )}
            </button>
          )}

          {selected.currentStage === stages.length - 1 && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl text-center">
              <span className="text-sm font-medium text-green-600">✅ Atendimento concluído</span>
            </div>
          )}

          {/* Alerta de falha no WhatsApp + botão reenviar */}
          {whatsappError === selected.id && (
            <div className="mt-3 p-3.5 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
              <span className="text-orange-500 text-lg flex-shrink-0">⚠️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-orange-700">WhatsApp não enviado</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Tentamos 3 vezes e não conseguimos. O tutor ainda não foi notificado.
                </p>
              </div>
              <button
                onClick={handleReenviar}
                disabled={loadingReenvio}
                className="flex-shrink-0 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {loadingReenvio ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : '↺'}
                {loadingReenvio ? 'Reenviando...' : 'Reenviar'}
              </button>
            </div>
          )}

          {/* Botão excluir */}
          <button
            onClick={() => setConfirmDelete(selected.id)}
            className="w-full mt-3 py-2.5 px-4 border border-red-100 text-red-400 rounded-xl text-xs font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
          >
            Excluir atendimento
          </button>
        </div>

        {/* Preview WhatsApp — oculto no mobile para não poluir */}
        <div className="hidden md:block">
          <h3 className="text-sm font-bold text-vettrack-dark mb-3">
            Preview da mensagem
          </h3>

          {/* Simulação de tela de celular */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-white">
            {/* Barra de status do celular */}
            <div className="bg-[#075E54] px-3 py-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🐾</div>
              <div>
                <div className="text-white text-xs font-semibold leading-tight">VetTrack</div>
                <div className="text-white/70 text-[10px]">online</div>
              </div>
            </div>

            {/* Área de conversa */}
            <div className="p-3 min-h-[160px] flex flex-col justify-end gap-1 bg-[#ECE5DD]">
              <div className="self-start max-w-[88%]">
                <div className="bg-white rounded-lg rounded-tl-none shadow-sm overflow-hidden">
                  {/* Imagem (se houver mídia) */}
                  {mediaPreview && !mediaFile?.type.startsWith('video') && (
                    <img src={mediaPreview} alt="mídia" className="w-full h-28 object-cover" />
                  )}
                  <div className="px-3 py-2">
                    <p className="text-[13px] text-gray-800 leading-snug whitespace-pre-line">
                      <span className="font-bold">Novidades sobre {nextStage ? selected.pet.nome : selected.pet.nome}</span>{'\n'}
                      {'Olá! Passando para te contar que '}{selected.pet.nome}{' está bem e teve uma atualização agora.\n\n  '}
                      {nextStage ? nextStage.whatsappMsg : stages[stages.length - 1]?.whatsappMsg}
                      {'\n\n  Qualquer dúvida, estamos por aqui. 🩺'}
                    </p>
                    <p className="text-right text-[10px] text-gray-400 mt-1">
                      {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 ml-1">Test Number</div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-2 text-center">
            💡 Enviado automaticamente ao avançar a etapa
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="text-center">
        <div className="text-5xl mb-3">🐾</div>
        <div className="text-sm">Selecione um pet da fila</div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-xl px-5 py-3 shadow-lg border border-gray-100 flex items-center gap-3 animate-in slide-in-from-top">
          <span className={`text-sm font-medium ${notification.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}>
            {notification}
          </span>
        </div>
      )}

      {/* ── DESKTOP: layout lado a lado ── */}
      <div className="hidden md:flex h-full w-full">
        {/* Fila lateral */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto p-4 flex flex-col flex-shrink-0">
          {FilaContent}
        </div>
        {/* Detalhe */}
        <div className="flex-1 overflow-y-auto p-6">
          {DetalheContent}
        </div>
      </div>

      {/* ── MOBILE: uma tela por vez ── */}
      <div className="flex md:hidden h-full w-full flex-col">
        {mobileView === 'fila' ? (
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {FilaContent}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Barra de navegação mobile */}
            <div className="bg-vettrack-dark text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={voltarParaFila}
                className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white active:opacity-70"
              >
                ← Voltar
              </button>
              {selected && (
                <span className="text-sm font-semibold truncate">
                  {selected.pet.nome} — {selected.servico.nome}
                </span>
              )}
            </div>
            {/* Detalhe scrollável */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#f5f3ef]">
              {DetalheContent}
            </div>
          </div>
        )}
      </div>

      {/* Modal Confirmar Exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-vettrack-dark mb-2">Excluir atendimento?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Esta ação não pode ser desfeita. O histórico de notificações será removido.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={loadingDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingDelete ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Excluindo...
                  </>
                ) : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Atendimento */}
      {showNovoModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-vettrack-dark">Novo Atendimento</h2>
              <button
                onClick={() => { setShowNovoModal(false); setSelectedPetId(null); setPetSearch(''); }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleNovoSubmit} className="p-6 space-y-4">
              {/* Campo hidden para submit */}
              <input type="hidden" name="petId" value={selectedPetId ?? ''} />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pet *</label>
                {selectedPetId ? (
                  // Pet selecionado — mostra chip com opção de trocar
                  (() => {
                    const pet = pets.find((p) => p.id === selectedPetId)!;
                    return (
                      <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border-2 border-vettrack-accent bg-blue-50">
                        <span>{ESPECIES_EMOJI[pet.especie] ?? '🐾'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-vettrack-dark truncate">{pet.nome}</div>
                          <div className="text-[11px] text-gray-500 truncate">{pet.tutor?.nome}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSelectedPetId(null); setPetSearch(''); }}
                          className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  // Busca + lista
                  <div>
                    <input
                      type="text"
                      placeholder="Buscar pet por nome ou tutor..."
                      value={petSearch}
                      onChange={(e) => setPetSearch(e.target.value)}
                      autoFocus
                      className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
                    />
                    <div className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                      {filteredPets.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          {pets.length === 0 ? (
                            <span>Nenhum pet cadastrado. <a href="/pets" className="text-vettrack-accent underline">Cadastrar</a></span>
                          ) : 'Nenhum resultado'}
                        </div>
                      ) : (
                        filteredPets.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPetId(p.id)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <span className="text-base">{ESPECIES_EMOJI[p.especie] ?? '🐾'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-vettrack-dark truncate">
                                {p.nome}{p.raca ? ` (${p.raca})` : ''}
                              </div>
                              <div className="text-[11px] text-gray-400 truncate">{p.tutor?.nome}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Serviço *</label>
                <select
                  name="servicoId"
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent bg-white"
                >
                  <option value="">Selecionar serviço...</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observações</label>
                <textarea
                  name="observacoes"
                  rows={2}
                  placeholder="Informações adicionais (opcional)"
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent resize-none"
                />
              </div>

              {novoError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                  {novoError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNovoModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-vettrack-accent text-white text-sm font-medium hover:bg-vettrack-accent/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Criando...' : 'Criar Atendimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
