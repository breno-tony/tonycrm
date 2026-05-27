import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  MapPin, 
  Check, 
  FilterX,
  X,
  Trash2,
  Archive,
  AlertTriangle
} from 'lucide-react';
import { Lead } from '../../types';
import { base44 } from '../../lib/base44';
import LeadCard from '../LeadCard';
import LeadModal from '../LeadModal';
import ImportLeadsModal from '../ImportLeadsModal';
import DeleteConfirmModal from '../DeleteConfirmModal';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [tempFilter, setTempFilter] = useState<string>('todos');
  const [origemFilter, setOrigemFilter] = useState<string>('todos');
  const [showArchivedFilter, setShowArchivedFilter] = useState<'ativos' | 'arquivados' | 'todos'>('ativos');

  // Confirmation dialog state
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showArchiveUselessConfirm, setShowArchiveUselessConfirm] = useState(false);
  const [showPasswordDeleteModal, setShowPasswordDeleteModal] = useState(false);

  // Modals state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | undefined>(undefined);

  const loadLeads = () => {
    setLeads(base44.db.leads.list());
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Filter unique values for selector dropdown
  const uniqueOrigens = Array.from(new Set(leads.map(l => l.origem).filter(Boolean)));

  // Filter computation
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (lead.telefone && lead.telefone.includes(searchTerm)) ||
      (lead.cidade && lead.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.interesse && lead.interesse.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || lead.status === statusFilter;
    const matchesTemp = tempFilter === 'todos' || lead.temperatura === tempFilter;
    const matchesOrigem = origemFilter === 'todos' || lead.origem === origemFilter;

    // Filter by archived status
    let matchesArchived = true;
    if (showArchivedFilter === 'ativos') {
      matchesArchived = !lead.arquivado;
    } else if (showArchivedFilter === 'arquivados') {
      matchesArchived = !!lead.arquivado;
    }

    return matchesSearch && matchesStatus && matchesTemp && matchesOrigem && matchesArchived;
  });

  const clearFilters = () => {
    setStatusFilter('todos');
    setTempFilter('todos');
    setOrigemFilter('todos');
    setShowArchivedFilter('ativos');
    setSearchTerm('');
  };

  const handleDeleteAllLeads = () => {
    localStorage.removeItem('tony_crm_leads');
    loadLeads();
    setShowDeleteAllConfirm(false);
  };

  const handleArchiveUselessLeads = () => {
    const list = base44.db.leads.list();
    const updated = list.map(lead => {
      // Define what is "useless" (status 'Perdido' OR temperature 'Frio')
      if (lead.status === 'Perdido' || lead.temperatura === 'Frio') {
        return { ...lead, arquivado: true };
      }
      return lead;
    });
    localStorage.setItem('tony_crm_leads', JSON.stringify(updated));
    loadLeads();
    setShowArchiveUselessConfirm(false);
  };

  const uselessLeadsCount = leads.filter(
    lead => !lead.arquivado && (lead.status === 'Perdido' || lead.temperatura === 'Frio')
  ).length;

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
        
        {/* Search Input */}
        <div className="flex-1 flex items-center rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2">
          <Search className="h-4 w-4 text-neutral-500 mr-2.5" />
          <input
            type="text"
            placeholder="Pesquise por nome, telefone, cidade ou material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-white focus:outline-none placeholder:text-neutral-500 text-xs"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-neutral-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setShowImportModal(true)}
            className="rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 px-3.5 py-2 font-semibold text-neutral-200 transition flex items-center gap-1.5"
            title="Importar do Google Maps via Planilha/CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Importação Google Maps</span>
          </button>

          <button
            onClick={() => {
              setLeadToEdit(undefined);
              setShowLeadModal(true);
            }}
            className="rounded-lg bg-red-650 hover:bg-red-600 px-4 py-2 font-semibold text-white transition flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Tools / Mass Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/40 p-3 rounded-xl border border-neutral-900 text-[11px]">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="font-semibold uppercase text-[10px] tracking-wider text-neutral-500">Ferramentas de Leads:</span>
          <span>Mostrando {filteredLeads.length} de {leads.length} leads</span>
        </div>
        
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              setShowArchiveUselessConfirm(true);
              setShowDeleteAllConfirm(false);
            }}
            disabled={uselessLeadsCount === 0}
            className={`rounded-lg px-3 py-1.5 font-semibold transition flex items-center gap-1.5 ${
              uselessLeadsCount > 0 
                ? 'bg-amber-600/15 hover:bg-amber-600/25 text-amber-400 border border-amber-500/20 shadow-sm'
                : 'bg-neutral-900/30 text-neutral-600 border border-neutral-900/50 cursor-not-allowed'
            }`}
            title="Arquiva todos os leads com status 'Perdido' ou temperatura de compra 'Frio'"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Arquivar "Inúteis" ({uselessLeadsCount})</span>
          </button>

          <button
            onClick={() => {
              setShowDeleteAllConfirm(true);
              setShowArchiveUselessConfirm(false);
            }}
            disabled={leads.length === 0}
            className={`rounded-lg px-3 py-1.5 font-semibold transition flex items-center gap-1.5 ${
              leads.length > 0
                ? 'bg-red-950/15 hover:bg-red-900/10 text-red-400 border border-red-950/40 shadow-sm'
                : 'bg-neutral-900/30 text-neutral-600 border border-neutral-900/50 cursor-not-allowed'
            }`}
            title="Excluir permanentemente todos os leads cadastrados"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Excluir Todos os Leads</span>
          </button>
        </div>
      </div>

      {/* Confirmation Banners */}
      {showDeleteAllConfirm && (
        <div className="bg-red-950/15 border border-red-500/30 p-4 rounded-xl space-y-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-400 text-xs">Tem certeza absoluta de que deseja excluir todos os leads?</h4>
              <p className="text-neutral-400 mt-1">Essa operação é <strong>irreversível</strong> e removerá permanentemente todos os <strong>{leads.length}</strong> leads cadastrados em sua base de dados local.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setShowDeleteAllConfirm(false)} 
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-semibold"
            >
              Cancelar
            </button>
            <button 
              onClick={() => setShowPasswordDeleteModal(true)} 
              className="px-3.5 py-1.5 rounded-lg bg-red-650 text-white hover:bg-red-600 font-bold transition"
            >
              Sim, Excluir Leads
            </button>
          </div>
        </div>
      )}

      {showArchiveUselessConfirm && (
        <div className="bg-amber-950/15 border border-amber-500/30 p-4 rounded-xl space-y-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-400 text-xs font-sans">Deseja arquivar todos os leads "inúteis" de uma só vez?</h4>
              <p className="text-neutral-400 mt-1">Isso marcará como arquivados todos os <strong>{uselessLeadsCount}</strong> leads que estão com status comercial <strong>"Perdido"</strong> ou temperatura de compra <strong>"Frio"</strong>. Eles serão removidos dos ativos para manter seu funil limpo.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setShowArchiveUselessConfirm(false)} 
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-semibold"
            >
              Cancelar
            </button>
            <button 
              onClick={handleArchiveUselessLeads} 
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-500 font-bold transition"
            >
              Sim, Arquivar Leads
            </button>
          </div>
        </div>
      )}

      {/* Advanced Filters Drawer/Row */}
      <div className="bg-neutral-900/10 p-4 rounded-xl border border-neutral-900 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" /> Filtros Rápidos
          </span>
          {(statusFilter !== 'todos' || tempFilter !== 'todos' || origemFilter !== 'todos' || showArchivedFilter !== 'ativos') && (
            <button 
              onClick={clearFilters}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline transition font-semibold"
            >
              <FilterX className="h-3.5 w-3.5" /> Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Status filter */}
          <div>
            <label className="text-neutral-400 text-[10px] font-medium block mb-1">Status Comercial</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white font-medium"
            >
              <option value="todos">Todos os Status</option>
              <option value="Novo">Novo</option>
              <option value="Em Atendimento">Em Atendimento</option>
              <option value="Orçamento Entregue">Orçamento Entregue</option>
              <option value="Negociação">Negociação</option>
              <option value="Fechado">Fechado</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>

          {/* Temperature filter */}
          <div>
            <label className="text-neutral-400 text-[10px] font-medium block mb-1">Temperatura de Compra</label>
            <select
              value={tempFilter}
              onChange={(e) => setTempFilter(e.target.value)}
              className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white font-medium"
            >
              <option value="todos">Todas as Temperaturas</option>
              <option value="Quente">Quente 🔥</option>
              <option value="Morno">Morno ⚡</option>
              <option value="Frio">Frio ❄️</option>
            </select>
          </div>

          {/* Origin / Channel filter */}
          <div>
            <label className="text-neutral-400 text-[10px] font-medium block mb-1">Canal de Origem</label>
            <select
              value={origemFilter}
              onChange={(e) => setOrigemFilter(e.target.value)}
              className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white font-medium"
            >
              <option value="todos">Todas as Origens</option>
              {uniqueOrigens.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Archive toggle filter */}
          <div>
            <label className="text-neutral-400 text-[10px] font-medium block mb-1">Filtro de Arquivo (Inúteis)</label>
            <select
              value={showArchivedFilter}
              onChange={(e) => setShowArchivedFilter(e.target.value as any)}
              className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white font-medium"
            >
              <option value="ativos">Apenas Leads Ativos</option>
              <option value="arquivados">Apenas Arquivados</option>
              <option value="todos">Todos os Leads</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leads display cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {filteredLeads.length > 0 ? (
          filteredLeads.map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onUpdate={loadLeads}
              onEditLead={(l) => {
                setLeadToEdit(l);
                setShowLeadModal(true);
              }}
            />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-neutral-900 p-12 text-center bg-neutral-950/20">
            <FilterX className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
            <span className="font-semibold text-white block text-sm">Nenhum Lead Encontrado</span>
            <p className="text-neutral-500 mt-1 max-w-sm mx-auto">Tente alterar os filtros ou limpe os termos de pesquisa para listar todos os leads.</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showLeadModal && (
        <LeadModal
          leadToEdit={leadToEdit}
          onClose={() => {
            setShowLeadModal(false);
            setLeadToEdit(undefined);
          }}
          onSuccess={loadLeads}
        />
      )}

      {showImportModal && (
        <ImportLeadsModal
          onClose={() => setShowImportModal(false)}
          onSuccess={loadLeads}
        />
      )}

      {showPasswordDeleteModal && (
        <DeleteConfirmModal
          isOpen={showPasswordDeleteModal}
          onClose={() => setShowPasswordDeleteModal(false)}
          onConfirm={handleDeleteAllLeads}
          title="Excluir Todos os Leads"
          description={`Essa operação é irreversível e removerá permanentemente todos os ${leads.length} leads cadastrados em sua base de dados local.`}
        />
      )}

    </div>
  );
}
