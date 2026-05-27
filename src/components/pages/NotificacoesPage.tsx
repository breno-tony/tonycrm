import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, AlertTriangle, MessageSquare, Info } from 'lucide-react';
import { Notification } from '../../types';
import { base44 } from '../../lib/base44';
import DeleteConfirmModal from '../DeleteConfirmModal';

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllNotifications = () => {
    localStorage.removeItem('tony_crm_notifications');
    loadNotifications();
  };

  const loadNotifications = () => {
    setNotifications(base44.db.notifications.list());
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = (id: string) => {
    base44.db.notifications.markRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    base44.db.notifications.markAllRead();
    loadNotifications();
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs max-w-2xl mx-auto">
      <div className="flex justify-between items-center bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-900">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-white text-sm">Central de Avisos e Pendências</h3>
            <p className="text-zinc-500 text-[11px]">Alertas automáticos de follow-ups atrasados ou novos contatos urgentes</p>
          </div>
        </div>

        <div className="flex gap-2">
          {notifications.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg bg-red-950/15 hover:bg-red-900/15 border border-red-950/40 text-red-400 px-3 py-1.5 font-semibold transition flex items-center gap-1"
              title="Excluir Todos os Alertas"
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpar</span>
            </button>
          )}

          {notifications.some(n => !n.lida) && (
            <button
              onClick={handleMarkAllRead}
              className="rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 hover:text-white px-3 py-1.5 font-semibold text-neutral-300 transition"
            >
              Marcar lidas
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map(item => (
            <div 
              key={item.id} 
              className={`rounded-xl border p-4 flex gap-3.5 items-start transition ${
                item.lida ? 'border-neutral-900 bg-neutral-900/10 opacity-70' : 'border-red-500/30 bg-red-500/5 shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-full border ${
                item.tipo === 'atraso_followup' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                item.tipo === 'orcamento_vencendo' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {item.tipo === 'atraso_followup' ? (
                  <AlertTriangle className="h-4.5 w-4.5" />
                ) : item.tipo === 'orcamento_vencendo' ? (
                  <Calendar className="h-4.5 w-4.5" />
                ) : (
                  <Info className="h-4.5 w-4.5" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-white text-xs">{item.titulo}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(item.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <p className="text-neutral-400 text-[11.5px] leading-relaxed mb-2">"{item.mensagem}"</p>

                {!item.lida && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className="rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 hover:text-white text-[10.5px] font-semibold px-2.5 py-1 text-neutral-300 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Concluir e arquivar
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-neutral-900 p-12 text-center bg-neutral-950/20 text-zinc-500">
            <Bell className="mx-auto mb-2 h-8 w-8 text-neutral-700" />
            <p>Nenhuma notificação ou aviso para exibir.</p>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllNotifications}
          title="Limpar Histórico de Alertas"
          description={`Essa operação é irreversível e removerá permanentemente todos os ${notifications.length} registros de notificações/avisos do sistema.`}
        />
      )}

    </div>
  );
}
