'use client';

import { useState, useTransition } from 'react';
import { updateClinica, updateWhatsapp, createPortalSession } from '@/app/(dashboard)/configuracoes/actions';
import { inviteMembro, removeMembro } from '@/app/(dashboard)/configuracoes/equipe-actions';
import type { AssinaturaInfo } from '@/app/(dashboard)/configuracoes/page';

interface Clinica {
  id: string;
  nome: string;
  telefone: string | null;
  endereco: string | null;
  whatsappPhoneId: string | null;
  whatsappToken: string | null;
  plano: string;
}

interface Membro {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
}

interface ConfiguracoesPainelProps {
  clinica: Clinica;
  isAdmin: boolean;
  membros: Membro[];
  currentUserId: string;
  assinatura: AssinaturaInfo;
}

export function ConfiguracoesPainel({ clinica, isAdmin, membros: initialMembros, currentUserId, assinatura }: ConfiguracoesPainelProps) {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [clinicaError, setClinicaError] = useState<string | null>(null);
  const [waError, setWaError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [membros, setMembros] = useState(initialMembros);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPendingClinica, startClinica] = useTransition();
  const [isPendingWa, startWa] = useTransition();
  const [isPendingInvite, startInvite] = useTransition();
  const [isPendingPortal, startPortal] = useTransition();

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleClinicaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setClinicaError(null);
    startClinica(async () => {
      const result = await updateClinica(formData);
      if (result?.error) { setClinicaError(result.error); return; }
      showToast('Dados da clínica atualizados!');
    });
  }

  function handleWaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setWaError(null);
    startWa(async () => {
      const result = await updateWhatsapp(formData);
      if (result?.error) { setWaError(result.error); return; }
      showToast('Configurações do WhatsApp salvas!');
    });
  }

  function handleInviteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setInviteError(null);
    startInvite(async () => {
      const result = await inviteMembro(formData);
      if (result?.error) { setInviteError(result.error); return; }
      showToast('Convite enviado por e-mail!');
      form.reset();
    });
  }

  function handleRemove(membro: Membro) {
    if (!confirm(`Remover ${membro.nome} da equipe?`)) return;
    setRemovingId(membro.id);
    removeMembro(membro.id).then((result) => {
      if (result?.error) {
        showToast(result.error, 'error');
      } else {
        setMembros((prev) => prev.filter((m) => m.id !== membro.id));
        showToast(`${membro.nome} removido da equipe.`);
      }
      setRemovingId(null);
    });
  }

  function handlePortal() {
    setPortalError(null);
    startPortal(async () => {
      const result = await createPortalSession();
      if (result.error) {
        setPortalError(result.error);
        return;
      }
      if (result.url) window.location.href = result.url;
    });
  }

  const PLANO_LABEL: Record<string, string> = {
    TRIAL: 'Trial (gratuito)',
    BASICO: 'Básico',
    PROFISSIONAL: 'Profissional',
    PREMIUM: 'Premium',
  };

  const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    active:    { label: 'Ativa', color: 'bg-green-50 text-green-700 border-green-100' },
    trialing:  { label: 'Em trial', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    past_due:  { label: 'Pagamento pendente', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    canceled:  { label: 'Cancelada', color: 'bg-red-50 text-red-700 border-red-100' },
    unpaid:    { label: 'Não paga', color: 'bg-red-50 text-red-700 border-red-100' },
    incomplete: { label: 'Incompleta', color: 'bg-gray-50 text-gray-600 border-gray-100' },
  };

  function formatarData(iso: string | null) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl px-5 py-3 shadow-lg border flex items-center gap-3 animate-in slide-in-from-top ${
            toast.type === 'success'
              ? 'bg-white border-gray-100 text-green-600'
              : 'bg-red-50 border-red-100 text-red-600'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-vettrack-dark">Configurações</h1>
      </div>

      {!isAdmin && (
        <div className="mb-6 bg-amber-50 border border-amber-100 text-amber-700 text-sm px-4 py-3 rounded-xl">
          Apenas administradores podem alterar configurações.
        </div>
      )}

      {/* Seção: Assinatura */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-vettrack-dark text-sm">Plano e Assinatura</h2>
          <p className="text-xs text-gray-400 mt-0.5">Detalhes do seu plano e cobrança</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {/* Plano atual */}
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Plano atual</span>
              <span className="text-base font-bold text-vettrack-dark">
                {assinatura.planoNome ?? PLANO_LABEL[clinica.plano] ?? clinica.plano}
              </span>
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</span>
              {assinatura.status ? (
                <span className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_LABEL[assinatura.status]?.color ?? 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                  {STATUS_LABEL[assinatura.status]?.label ?? assinatura.status}
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  {clinica.plano === 'TRIAL' ? 'Trial gratuito' : 'Ativo'}
                </span>
              )}
            </div>

            {/* Renovação / Cancelamento */}
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                {assinatura.cancelamentoEm ? 'Acesso até' : 'Renovação em'}
              </span>
              <span className="text-sm font-medium text-vettrack-dark">
                {assinatura.cancelamentoEm
                  ? formatarData(assinatura.cancelamentoEm)
                  : assinatura.renovacaoEm
                  ? formatarData(assinatura.renovacaoEm)
                  : <span className="text-gray-400">—</span>
                }
              </span>
            </div>
          </div>

          {/* Aviso trial */}
          {clinica.plano === 'TRIAL' && !assinatura.temStripe && (
            <div className="mb-4 bg-blue-50 border border-blue-100 text-blue-700 text-xs px-4 py-3 rounded-xl">
              Você está no plano Trial. Para continuar usando o VetTrack após o período gratuito, assine um plano.
            </div>
          )}

          {/* Botão portal Stripe */}
          {portalError && (
            <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-2.5 rounded-xl">
              {portalError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {assinatura.temStripe ? (
              <button
                onClick={handlePortal}
                disabled={isPendingPortal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vettrack-dark text-white text-sm font-medium hover:bg-vettrack-dark/90 transition-colors disabled:opacity-50"
              >
                {isPendingPortal ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Abrindo portal...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Gerenciar assinatura
                  </>
                )}
              </button>
            ) : (
              <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                Gerenciamento de assinatura disponível em breve. Entre em contato pelo suporte para alterações no plano.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Seção: Dados da Clínica */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-vettrack-dark text-sm">Dados da Clínica</h2>
          <p className="text-xs text-gray-400 mt-0.5">Nome, telefone e endereço exibidos nas mensagens</p>
        </div>

        <form onSubmit={handleClinicaSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome da Clínica *</label>
            <input
              name="nome"
              defaultValue={clinica.nome}
              required
              disabled={!isAdmin}
              placeholder="Nome da sua clínica"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Telefone</label>
              <input
                name="telefone"
                defaultValue={clinica.telefone ?? ''}
                disabled={!isAdmin}
                placeholder="(11) 99999-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Endereço</label>
              <input
                name="endereco"
                defaultValue={clinica.endereco ?? ''}
                disabled={!isAdmin}
                placeholder="Rua, número, bairro"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          {clinicaError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              {clinicaError}
            </div>
          )}

          {isAdmin && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isPendingClinica}
                className="px-5 py-2.5 rounded-xl bg-vettrack-accent text-white text-sm font-medium hover:bg-vettrack-accent/90 transition-colors disabled:opacity-50"
              >
                {isPendingClinica ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Seção: WhatsApp */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-vettrack-dark text-sm">WhatsApp Business</h2>
          <p className="text-xs text-gray-400 mt-0.5">Credenciais da Meta Cloud API para envio de notificações</p>
        </div>

        {!clinica.whatsappPhoneId && (
          <div className="mx-6 mt-4 bg-amber-50 border border-amber-100 text-amber-700 text-xs px-4 py-3 rounded-xl">
            ⚠️ WhatsApp não configurado. As notificações automáticas estão desativadas.
            Configure as credenciais abaixo após criar sua conta no{' '}
            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Meta for Developers
            </a>.
          </div>
        )}

        {clinica.whatsappPhoneId && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-100 text-green-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <span>✅</span>
            <span>WhatsApp configurado e ativo</span>
          </div>
        )}

        <form onSubmit={handleWaSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone ID</label>
            <input
              name="whatsappPhoneId"
              defaultValue={clinica.whatsappPhoneId ?? ''}
              disabled={!isAdmin}
              placeholder="Ex: 123456789012345"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p className="text-[11px] text-gray-400 mt-1">Encontrado em Meta for Developers → WhatsApp → Primeiros Passos</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Access Token</label>
            <div className="relative">
              <input
                name="whatsappToken"
                type={showToken ? 'text' : 'password'}
                defaultValue={clinica.whatsappToken ?? ''}
                disabled={!isAdmin}
                placeholder="EAAxxxxxxx..."
                className="w-full px-3.5 py-2.5 pr-20 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent disabled:bg-gray-50 disabled:text-gray-400"
              />
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  {showToken ? 'Ocultar' : 'Mostrar'}
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Token permanente gerado no painel de desenvolvedores da Meta</p>
          </div>

          {waError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              {waError}
            </div>
          )}

          {isAdmin && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isPendingWa}
                className="px-5 py-2.5 rounded-xl bg-vettrack-accent text-white text-sm font-medium hover:bg-vettrack-accent/90 transition-colors disabled:opacity-50"
              >
                {isPendingWa ? 'Salvando...' : 'Salvar credenciais'}
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Seção: Equipe */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-vettrack-dark text-sm">Equipe</h2>
          <p className="text-xs text-gray-400 mt-0.5">Profissionais com acesso ao VetTrack desta clínica</p>
        </div>

        {/* Lista de membros */}
        <div className="divide-y divide-gray-50">
          {membros.filter((m) => m.ativo).map((membro) => (
            <div key={membro.id} className="flex items-center gap-3 px-6 py-3.5">
              <div className="w-8 h-8 rounded-full bg-vettrack-accent/10 flex items-center justify-center text-xs font-bold text-vettrack-accent flex-shrink-0">
                {membro.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-vettrack-dark truncate">
                  {membro.nome}
                  {membro.id === currentUserId && (
                    <span className="ml-2 text-[10px] text-gray-400">(você)</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 truncate">{membro.email}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  membro.role === 'ADMIN'
                    ? 'bg-vettrack-accent/10 text-vettrack-accent'
                    : membro.role === 'VETERINARIO'
                    ? 'bg-purple-50 text-purple-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {membro.role === 'ADMIN' ? 'Admin' : membro.role === 'VETERINARIO' ? 'Veterinário' : 'Profissional'}
                </span>
                {isAdmin && membro.id !== currentUserId && (
                  <button
                    onClick={() => handleRemove(membro)}
                    disabled={removingId === membro.id}
                    className="text-xs text-gray-300 hover:text-red-400 transition-colors px-1 disabled:opacity-50"
                    title="Remover da equipe"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Formulário de convite */}
        {isAdmin && (
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-600 mb-3">Convidar novo membro</p>
            <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                name="email"
                type="email"
                required
                placeholder="email@clinica.com"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent bg-white"
              />
              <select
                name="role"
                required
                className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-vettrack-accent/30 focus:border-vettrack-accent bg-white"
              >
                <option value="PROFISSIONAL">Profissional</option>
                <option value="VETERINARIO">Veterinário</option>
              </select>
              <button
                type="submit"
                disabled={isPendingInvite}
                className="px-4 py-2.5 rounded-xl bg-vettrack-accent text-white text-sm font-medium hover:bg-vettrack-accent/90 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isPendingInvite ? 'Enviando...' : 'Enviar convite'}
              </button>
            </form>
            {inviteError && (
              <div className="mt-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                {inviteError}
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-2">
              O convidado receberá um e-mail com link para criar sua senha e entrar na equipe.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
