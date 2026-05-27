import React, { useState, useEffect } from 'react';
import { Phone, Search, SlidersHorizontal, User, Clock, Calendar, CheckCircle, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';
import { Ligacao, Lead } from '../../types';
import { base44 } from '../../lib/base44';

export default function LigacoesPage() {
  const [ligacoes, setLigacoes] = useState<Ligacao[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [newCallLeadId, setNewCallLeadId] = useState('');
  const [newCallResult, setNewCallResult] = useState<'Sucesso' | 'Não Atendeu' | 'Caixa Postal' | 'Ocupado' | 'Ligar mais tarde'>('Sucesso');
  const [newCallResumo, setNewCallResumo] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllLigacoes = () => {
    localStorage.removeItem('tony_crm_ligacoes');
    loadData();
  };

  const loadData = () => {
    setLigacoes(base44.db.ligacoes.list());
    setLeads(base44.db.leads.list());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCall = (e: React.FormEvent) => {
    e.preventDefault();
    const targetedLead = leads.find(l => l.id === newCallLeadId);
    if (!targetedLead) return;

    const entry: Ligacao = {
      id: `call-${Date.now()}`,
      lead_id: targetedLead.id,
      lead_nome: targetedLead.nome,
      data: new Date().toISOString(),
      duracao_min: newCallResult === 'Sucesso' ? 3 : 0,
      direcao: 'Ativa',
      atendeu: newCallResult === 'Sucesso',
      resultado: newCallResult,
      resumo: newCallResumo
    };

    base44.db.ligacoes.save(entry);
    setNewCallResumo('');
    setShowAddForm(false);
    loadData();
  };

  // Filtered Calls:
  const filteredCalls = ligacoes.filter(c => {
    const matchesLead = selectedLeadId === 'todos' || c.lead_id === selectedLeadId;
    const matchesSearch = c.lead_nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.resumo && c.resumo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesLead && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Quick Add Form trigger */}
      <div className="flex justify-between items-center bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-white text-sm">Histórico e Controle de Ligações</h3>
            <p className="text-zinc-500 text-[11px]">Registro e agendamento de chamadas ativas e receptivas do Tony CRM</p>
          </div>
        </div>

        <div className="flex gap-2">
          {ligacoes.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg bg-red-950/15 hover:bg-red-900/15 border border-red-950/40 text-red-400 px-3 py-2 font-semibold transition flex items-center gap-1"
              title="Excluir Todas as Ligações"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir Tudo</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-red-650 hover:bg-red-600 px-4 py-2 font-semibold text-white transition"
          >
            {showAddForm ? 'Cancelar' : 'Registrar Chamada'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSaveCall} className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-5 space-y-4">
          <h4 className="font-semibold text-white text-xs">Registrar Nova Ligação Ativa</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Selecione o Lead *</label>
              <select
                value={newCallLeadId}
                onChange={(e) => setNewCallLeadId(e.target.value)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              >
                <option value="">Selecione...</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.nome} ({l.cidade})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Resultado Comercial</label>
              <select
                value={newCallResult}
                onChange={(e) => setNewCallResult(e.target.value as any)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
              >
                <option value="Sucesso">Atendeu (Sucesso)</option>
                <option value="Não Atendeu">Não Atendeu</option>
                <option value="Caixa Postal">Caixa Postal</option>
                <option value="Ocupado">Ocupado</option>
                <option value="Ligar mais tarde">Ligar mais tarde</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-neutral-400 font-medium block mb-1">Resumo das Negociações e Observações</label>
            <textarea
              value={newCallResumo}
              onChange={(e) => setNewCallResumo(e.target.value)}
              placeholder="O que foi conversado? Demonstrou muito interesse?"
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
          <label className="text-neutral-400 text-[10px] block mb-1">Filtrar por Lead Específico</label>
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
          <label className="text-neutral-400 text-[10px] block mb-1">Pesquisar por Palavras-Chave</label>
          <div className="flex items-center rounded border border-neutral-850 bg-neutral-950 px-2.5 py-1.5 focus-within:border-red-500">
            <Search className="h-4 w-4 text-neutral-500 mr-2" />
            <input
              type="text"
              placeholder="Pesquise nos resumos históricos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Call feed list timeline styled */}
      <div className="space-y-3">
        {filteredCalls.length > 0 ? (
          filteredCalls
            .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .map(call => (
              <div key={call.id} className="rounded-xl border border-neutral-900 bg-neutral-900/10 p-4.5 flex items-start gap-4">
                <div className={`p-2.5 rounded-full border ${
                  call.resultado === 'Sucesso' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  <Phone className="h-4.5 w-4.5" />
                </div>
                
                <div className="flex-1 space-y-1 text-zinc-300">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                      {call.lead_nome} 
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        call.resultado === 'Sucesso' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {call.resultado}
                      </span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(call.data).toLocaleDateString('pt-BR')} {new Date(call.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>

                  {call.resumo && <p className="text-neutral-400 leading-relaxed text-xs">"{call.resumo}"</p>}

                  <div className="flex items-center gap-4 text-[10px] text-neutral-500 pt-1 font-mono">
                    <span>Duração: {call.duracao_min} min</span>
                    <span>Tipo: {call.direcao}</span>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="rounded-xl border border-neutral-900 p-12 text-center bg-neutral-950/20 text-zinc-500">
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-neutral-700" />
            <p>Nenhuma ligação registrada para esta busca.</p>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllLigacoes}
          title="Excluir Todas as Ligações"
          description={`Essa operação é irreversível e removerá permanentemente todas as ${ligacoes.length} ligações registradas em sua base.`}
        />
      )}

    </div>
  );
}
