import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, User, CheckCircle, Clock, Calendar, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';
import { Atendimento, Lead, AtendimentoCanal, AtendimentoTipoInteracao } from '../../types';
import { base44 } from '../../lib/base44';

const CANAIS: AtendimentoCanal[] = ['WhatsApp', 'Ligação', 'E-mail', 'Presencial Showroom', 'Instagram DM'];
const INTERACOES: AtendimentoTipoInteracao[] = ['Primeiro contato', 'Dúvida', 'Envio de medidas', 'Negociação', 'Pós-Venda'];

export default function AtendimentosPage() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [newLeadId, setNewLeadId] = useState('');
  const [newCanal, setNewCanal] = useState<AtendimentoCanal>('WhatsApp');
  const [newTipo, setNewTipo] = useState<AtendimentoTipoInteracao>('Dúvida');
  const [newResumo, setNewResumo] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllAtendimentos = () => {
    localStorage.removeItem('tony_crm_atendimentos');
    loadData();
  };

  const loadData = () => {
    setAtendimentos(base44.db.atendimentos.list());
    setLeads(base44.db.leads.list());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetLead = leads.find(l => l.id === newLeadId);
    if (!targetLead) return;

    const ticket: Atendimento = {
      id: `atend-${Date.now()}`,
      lead_id: targetLead.id,
      lead_nome: targetLead.nome,
      data: new Date().toISOString(),
      canal: newCanal,
      tipo_interacao: newTipo,
      resumo: newResumo
    };

    base44.db.atendimentos.save(ticket);
    setNewResumo('');
    setShowAddForm(false);
    loadData();
  };

  const filteredAtendimentos = atendimentos.filter(a => {
    const matchesLead = selectedLeadId === 'todos' || a.lead_id === selectedLeadId;
    const matchesSearch = a.lead_nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (a.resumo && a.resumo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesLead && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-white text-sm">Controle de Atendimentos</h3>
            <p className="text-zinc-500 text-[11px]">Registro de interações por WhatsApp, Instagram, Showroom e E-mail</p>
          </div>
        </div>

        <div className="flex gap-2">
          {atendimentos.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg bg-red-950/15 hover:bg-red-900/15 border border-red-950/40 text-red-400 px-3 py-2 font-semibold transition flex items-center gap-1"
              title="Excluir Todos os Atendimentos"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir Tudo</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-red-650 hover:bg-red-600 px-4 py-2 font-semibold text-white transition"
          >
            {showAddForm ? 'Cancelar' : 'Registrar Interação'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-5 space-y-4">
          <h4 className="font-semibold text-white text-xs">Registrar Nova Interação</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Selecione o Lead *</label>
              <select
                value={newLeadId}
                onChange={(e) => setNewLeadId(e.target.value)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              >
                <option value="">Selecione...</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Canal</label>
              <select
                value={newCanal}
                onChange={(e) => setNewCanal(e.target.value as AtendimentoCanal)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
              >
                {CANAIS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Tipo de Interação</label>
              <select
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value as AtendimentoTipoInteracao)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
              >
                {INTERACOES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Notas / Detalhamento do Atendimento</label>
            <textarea
              value={newResumo}
              onChange={(e) => setNewResumo(e.target.value)}
              placeholder="Descreva as especificações do material, dúvidas levantadas ou ajustes acordados..."
              className="h-16 w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-4 py-2 text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="rounded bg-red-650 hover:bg-red-600 px-4 py-2 font-semibold text-white"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      )}

      {/* Filters block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-950/20 p-4 rounded-xl border border-neutral-900">
        <div>
          <label className="text-neutral-400 text-[10px] block mb-1">Filtrar por Lead</label>
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
          >
            <option value="todos">Todos os Leads</option>
            {leads.map(l => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-neutral-400 text-[10px] block mb-1">Pesquisar por Notas</label>
          <div className="flex items-center rounded border border-neutral-850 bg-neutral-950 px-2.5 py-1.5 focus-within:border-red-500">
            <Search className="h-4 w-4 text-neutral-500 mr-2" />
            <input
              type="text"
              placeholder="Procurar termos nos históricos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Feed timelines */}
      <div className="space-y-3">
        {filteredAtendimentos.length > 0 ? (
          filteredAtendimentos
            .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .map(item => (
              <div key={item.id} className="rounded-xl border border-neutral-900 bg-neutral-900/10 p-4.5 flex items-start gap-4">
                <div className="p-2.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                
                <div className="flex-1 space-y-1 text-zinc-300">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                      {item.lead_nome}
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border bg-neutral-800 text-neutral-300 border-neutral-700">
                        {item.canal}
                      </span>
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border bg-neutral-800 text-red-400 border-neutral-700">
                        {item.tipo_interacao}
                      </span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(item.data).toLocaleDateString('pt-BR')} {new Date(item.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>

                  {item.resumo && <p className="text-neutral-400 leading-relaxed text-xs">"{item.resumo}"</p>}
                </div>
              </div>
            ))
        ) : (
          <div className="rounded-xl border border-neutral-900 p-12 text-center bg-neutral-950/20 text-zinc-500">
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-neutral-700" />
            <p>Nenhuma interação registrada para esta busca.</p>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllAtendimentos}
          title="Excluir Todos os Atendimentos"
          description={`Essa operação é irreversível e removerá permanentemente todos os ${atendimentos.length} atendimentos cadastrados em sua base.`}
        />
      )}

    </div>
  );
}
