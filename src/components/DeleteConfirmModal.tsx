import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}: DeleteConfirmModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '4028') {
      onConfirm();
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Senha incorreta! Digite a senha correta para prosseguir.');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div 
      id="delete-confirm-modal-overlay" 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-fade-in"
    >
      <div 
        id="delete-confirm-modal-container" 
        className="relative w-full max-w-md rounded-xl border border-red-500/30 bg-neutral-950 p-6 shadow-2xl space-y-4"
      >
        {/* Close Button */}
        <button 
          id="delete-confirm-modal-close-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition"
          type="button"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-500/15 p-2.5 text-red-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 id="delete-confirm-modal-title" className="font-bold text-red-500 text-sm tracking-wide">
              {title}
            </h3>
            <span className="text-[10px] text-neutral-500 uppercase font-bold font-mono">Autorização Requerida</span>
          </div>
        </div>

        {/* Description */}
        <p id="delete-confirm-modal-desc" className="text-neutral-400 leading-relaxed text-xs">
          {description}
        </p>

        {/* Password input form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-neutral-300 font-semibold text-[11px] block">
              Senha de Segurança *
            </label>
            <input
              id="delete-confirm-password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Digite a senha..."
              autoFocus
              required
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-white font-medium focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs placeholder:text-neutral-600 text-center tracking-widest"
            />
          </div>

          {error && (
            <p id="delete-confirm-error" className="text-red-500 text-[11px] font-semibold">
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-900">
            <button
              id="delete-confirm-cancel-btn"
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition"
            >
              Cancelar
            </button>
            <button
              id="delete-confirm-submit-btn"
              type="submit"
              className="rounded-lg bg-red-600 hover:bg-red-500 px-5 py-2 text-xs font-bold text-white transition shadow-lg shadow-red-950/40"
            >
              Confirmar Exclusão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
