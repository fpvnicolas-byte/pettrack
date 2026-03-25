'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, Phone, CheckCircle2 } from 'lucide-react';

interface StageLog {
  id: string;
  fromStage: number;
  toStage: number;
  stageName: string;
  executadoPor: string | null;
  createdAt: string;
}

interface Notificacao {
  id: string;
  status: string;
  templateName: string | null;
  createdAt: string;
  enviadoAt: string | null;
}

interface Atendimento {
  id: string;
  currentStage: number;
  status: string;
  observacoes: string | null;
  checkinAt: string;
  conclusaoAt: string | null;
  customStages: any;
  pet: {
    id: string;
    petCode: number;
    nome: string;
    especie: string;
    raca: string | null;
    tutor: { id: string; nome: string; telefone: string };
  };
  servico: { id: string; nome: string; tipo: string; stages: any };
  profissional: { id: string; nome: string } | null;
  historico: StageLog[];
  notificacoes: Notificacao[];
}

interface Servico {
  id: string;
  nome: string;
  tipo: string;
}

interface Props {
  atendimentos: Atendimento[];
  total: number;
  page: number;
  perPage: number;
  servicos: Servico[];
  filters: { q: string; servico: string; de: string; ate: string };
}

const ESPECIE_EMOJI: Record<string, string> = {
  CANINO: '🐕',
  FELINO: '🐈',
  AVE: '🐦',
  ROEDOR: '🐹',
  REPTIL: '🦎',
  OUTRO: '🐾',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(start: string, end: string | null) {
  if (!end) return '—';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (hours < 24) return `${hours}h${remainMins > 0 ? `${remainMins}min` : ''}`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function HistoricoPainel({ atendimentos, total, page, perPage, servicos, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState(filters.q);
  const [selectedServico, setSelectedServico] = useState(filters.servico);
  const [dateFrom, setDateFrom] = useState(filters.de);
  const [dateTo, setDateTo] = useState(filters.ate);
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(total / perPage);

  function applyFilters(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams();
    const q = overrides.q ?? searchText;
    const servico = overrides.servico ?? selectedServico;
    const de = overrides.de ?? dateFrom;
    const ate = overrides.ate ?? dateTo;

    if (q) params.set('q', q);
    if (servico) params.set('servico', servico);
    if (de) params.set('de', de);
    if (ate) params.set('ate', ate);
    if (overrides.page) params.set('page', overrides.page);

    router.push(`/historico?${params.toString()}`);
  }

  function goToPage(p: number) {
    applyFilters({ page: String(p) });
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-vettrack-dark tracking-tight flex items-center gap-2">
          <Clock className="w-7 h-7 text-vettrack-accent" />
          Histórico
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {total} atendimento{total !== 1 ? 's' : ''} concluído{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por pet, tutor ou telefone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            showFilters || selectedServico || dateFrom || dateTo
              ? 'bg-vettrack-accent text-white border-vettrack-accent'
              : 'bg-white text-gray-600 border-gray-200 hover:border-vettrack-accent'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Serviço</label>
            <select
              value={selectedServico}
              onChange={(e) => {
                setSelectedServico(e.target.value);
                applyFilters({ servico: e.target.value });
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30"
            >
              <option value="">Todos</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.tipo}>{s.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                applyFilters({ de: e.target.value });
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                applyFilters({ ate: e.target.value });
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              onClick={() => {
                setSearchText('');
                setSelectedServico('');
                setDateFrom('');
                setDateTo('');
                router.push('/historico');
              }}
              className="text-xs text-gray-400 hover:text-vettrack-accent font-medium"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {atendimentos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            📋
          </div>
          <h3 className="text-lg font-bold text-vettrack-dark mb-1">Nenhum resultado</h3>
          <p className="text-sm text-gray-500">Tente ajustar os filtros ou busca.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {atendimentos.map((a) => {
            const isExpanded = expandedId === a.id;
            const stages = (a.customStages || a.servico.stages || []) as any[];
            return (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all"
              >
                {/* Row Summary */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-vettrack-accent/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {ESPECIE_EMOJI[a.pet.especie] || '🐾'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-vettrack-dark truncate">{a.pet.nome}</span>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{String(a.pet.petCode).padStart(3, '0')}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                      {a.pet.tutor.nome.split(' ')[0]} • {a.servico.nome}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-xs text-gray-500">{formatDate(a.conclusaoAt)}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Duração: {formatDuration(a.checkinAt, a.conclusaoAt)}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-gray-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/30">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Check-in</div>
                        <div className="text-xs text-vettrack-dark font-medium">{formatDate(a.checkinAt)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Conclusão</div>
                        <div className="text-xs text-vettrack-dark font-medium">{formatDate(a.conclusaoAt)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Tutor</div>
                        <div className="text-xs text-vettrack-dark font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {a.pet.tutor.telefone}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Profissional</div>
                        <div className="text-xs text-vettrack-dark font-medium">
                          {a.profissional?.nome || '—'}
                        </div>
                      </div>
                    </div>

                    {a.observacoes && (
                      <div className="mb-4 bg-white rounded-xl border border-gray-100 p-3">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Observações</div>
                        <p className="text-xs text-gray-600">{a.observacoes}</p>
                      </div>
                    )}

                    {/* Stage Timeline */}
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Timeline de Estágios</div>
                    <div className="relative pl-5">
                      <div className="absolute left-2 top-1 bottom-1 w-px bg-gray-200" />
                      {stages.map((stage: any, idx: number) => {
                        const log = a.historico.find((l) => l.toStage === idx);
                        const isComplete = idx <= a.currentStage;
                        return (
                          <div key={idx} className="relative flex items-start gap-3 pb-3 last:pb-0">
                            <div
                              className={`absolute left-[-13px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isComplete
                                  ? 'bg-vettrack-success border-vettrack-success'
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              {isComplete && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isComplete ? 'text-vettrack-dark' : 'text-gray-400'}`}>
                                  {stage.label}
                                </span>
                                {stage.isCustom && (
                                  <span className="text-[9px] bg-purple-100 text-purple-600 font-bold px-1.5 py-0.5 rounded">
                                    CUSTOM
                                  </span>
                                )}
                              </div>
                              {log && (
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                  {formatDate(log.createdAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* WhatsApp Notifications */}
                    {a.notificacoes.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Notificações WhatsApp</div>
                        <div className="flex flex-wrap gap-2">
                          {a.notificacoes.map((n) => (
                            <div
                              key={n.id}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                n.status === 'ENVIADO' || n.status === 'ENTREGUE' || n.status === 'LIDO'
                                  ? 'bg-green-50 text-green-600'
                                  : n.status === 'ERRO'
                                  ? 'bg-red-50 text-red-500'
                                  : 'bg-yellow-50 text-yellow-600'
                              }`}
                            >
                              {n.status} {n.enviadoAt ? formatDate(n.enviadoAt) : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-vettrack-accent hover:text-white hover:border-vettrack-accent disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-600 px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-vettrack-accent hover:text-white hover:border-vettrack-accent disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
