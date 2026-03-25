'use client';

import { useState, useTransition } from 'react';
import { X, Loader2, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CustomStageInput } from '@/types';

interface InsertStageModalProps {
  onClose: () => void;
  onSubmit: (input: CustomStageInput) => Promise<void>;
  currentStageName: string;
  nextStageName: string;
}

export function InsertStageModal({
  onClose,
  onSubmit,
  currentStageName,
  nextStageName,
}: InsertStageModalProps) {
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState('');
  const [whatsappMsg, setWhatsappMsg] = useState('');
  const [color, setColor] = useState('#F59E0B');
  const [mediaAllowed, setMediaAllowed] = useState(false);
  const [autoNotify, setAutoNotify] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STAGE_COLORS = [
    { hex: '#F59E0B', label: 'Âmbar' },
    { hex: '#EF4444', label: 'Vermelho' },
    { hex: '#8B5CF6', label: 'Roxo' },
    { hex: '#3B82F6', label: 'Azul' },
    { hex: '#10B981', label: 'Verde' },
    { hex: '#EC4899', label: 'Rosa' },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) { setError('Informe o nome do estágio'); return; }
    if (!whatsappMsg.trim()) { setError('Informe a mensagem para o tutor'); return; }
    setError(null);
    startTransition(async () => {
      await onSubmit({ label, whatsappMsg, color, mediaAllowed, autoNotify });
    });
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-vettrack-dark">Inserir Estágio Extra</h2>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-gray-400">
              <span className="truncate max-w-[110px]">{currentStageName}</span>
              <ArrowRight className="w-3 h-3 flex-shrink-0" />
              <span className="font-bold text-amber-600 truncate max-w-[110px]">Novo estágio</span>
              <ArrowRight className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[110px]">{nextStageName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Context Banner */}
        <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-700 leading-relaxed">
          O novo estágio será inserido imediatamente após o estágio atual, empurrando os seguintes para a frente.
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* Stage Name */}
          <div>
            <label className="block text-sm font-bold text-vettrack-dark mb-2">
              Nome do Estágio <span className="text-vettrack-error">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Complicação pós-cirúrgica, Exame adicional…"
              autoFocus
              maxLength={60}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-medium focus:outline-none focus:border-amber-400 transition-colors placeholder:text-gray-400"
            />
          </div>

          {/* WhatsApp Message */}
          <div>
            <label className="block text-sm font-bold text-vettrack-dark mb-2">
              Mensagem para o Tutor <span className="text-vettrack-error">*</span>
            </label>
            <textarea
              value={whatsappMsg}
              onChange={(e) => setWhatsappMsg(e.target.value)}
              placeholder="Ex: está recebendo cuidados adicionais. Nossa equipe acompanha de perto"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-medium focus:outline-none focus:border-amber-400 resize-none placeholder:text-gray-400 transition-colors"
            />
            <p className="text-[11px] text-gray-400 mt-1.5 px-1">
              O nome do pet é adicionado automaticamente pela plataforma.
            </p>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-bold text-vettrack-dark mb-2">
              Cor do Estágio
            </label>
            <div className="flex gap-2.5">
              {STAGE_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.hex)}
                  className={`w-9 h-9 rounded-xl transition-all ${
                    color === c.hex
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={autoNotify}
                  onChange={(e) => setAutoNotify(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-amber-400 transition-colors" />
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-vettrack-dark">Notificar tutor ao entrar neste estágio</span>
                <p className="text-[11px] text-gray-400 mt-0.5">Envia WhatsApp automaticamente</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={mediaAllowed}
                  onChange={(e) => setMediaAllowed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-amber-400 transition-colors" />
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-vettrack-dark">Permitir upload de foto/vídeo</span>
                <p className="text-[11px] text-gray-400 mt-0.5">O tutor recebe a mídia pelo WhatsApp</p>
              </div>
            </label>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="pt-2 pb-1">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 rounded-2xl text-base bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Inserindo estágio…</>
              ) : (
                <><Plus className="w-5 h-5" /> Inserir Estágio</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
