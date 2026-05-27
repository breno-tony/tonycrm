import React, { useState, useEffect } from 'react';
import { Target, Plus, BarChart, TrendingUp, DollarSign, ToggleLeft, ToggleRight, Percent, RefreshCw, Trash2 } from 'lucide-react';
import { Campanha, CampanhaPlataforma } from '../../types';
import { base44 } from '../../lib/base44';
import DeleteConfirmModal from '../DeleteConfirmModal';

export default function CampanhasPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllCampanhas = () => {
    localStorage.removeItem('tony_crm_campanhas');
    loadCampanhas();
  };

  // Form entries
  const [nome, setNome] = useState('');
  const [plataforma, setPlataforma] = useState<CampanhaPlataforma>('Facebook Ads');
  const [investido, setInvestido] = useState<number | ''>('');

  const loadCampanhas = () => {
    // Dynamic recalculation: Let's count actual figures from database for leads, proposals, sales
    const rawCamps = base44.db.campanhas.list();
    const leads = base44.db.leads.list();
    const orcs = base44.db.orcamentos.list();
    const sales = base44.db.vendas.list();

    const updatedCamps = rawCamps.map(camp => {
      // leads attached to this campaign
      const campLeads = leads.filter(l => l.campanha === camp.nome || l.origem === camp.nome);
      const leads_gerados = campLeads.length || camp.leads_gerados;
      const leads_qualificados = campLeads.filter(l => l.temperatura === 'Quente' || l.status !== 'Novo').length || camp.leads_qualificados;
      
      // sales attached to this campaign
      const campSales = sales.filter(s => s.campanha === camp.nome || s.origem === camp.nome);
      const vendas_fechadas = campSales.length || camp.vendas_fechadas;
      const receita_gerada = campSales.reduce((sum, s) => sum + s.valor_fechado, 0) || camp.receita_gerada;

      // budgets
      const orcamentos_enviados = orcs.filter(o => {
        const matchingLead = leads.find(l => l.id === o.lead_id);
        return matchingLead && (matchingLead.campanha === camp.nome || matchingLead.origem === camp.nome);
      }).length || camp.orcamentos_enviados;

      return {
        ...camp,
        leads_gerados,
        leads_qualificados,
        orcamentos_enviados,
        vendas_fechadas,
        receita_gerada
      };
    });

    setCampanhas(updatedCamps);
  };

  useEffect(() => {
    loadCampanhas();
  }, []);

  const handleCreateCampanha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const newCamp: Campanha = {
      id: `camp-${Date.now()}`,
      nome,
      plataforma,
      valor_investido: investido !== '' ? Number(investido) : 0,
      leads_gerados: 0,
      leads_qualificados: 0,
      orcamentos_enviados: 0,
      vendas_fechadas: 0,
      receita_gerada: 0,
      ativo: true
    };

    base44.db.campanhas.save(newCamp);
    setNome('');
    setInvestido('');
    setShowAddForm(false);
    loadCampanhas();
  };

  const handleToggleActive = (camp: Campanha) => {
    camp.ativo = !camp.ativo;
    base44.db.campanhas.save(camp);
    loadCampanhas();
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-white text-sm">Dashboard de Campanhas de Marketing</h3>
            <p className="text-zinc-500 text-[11px]">Gestão de tráfego pago, orgânico e mensuração de Retorno sobre Investimento (ROI)</p>
          </div>
        </div>

        <div className="flex gap-2">
          {campanhas.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg bg-red-950/15 hover:bg-red-900/15 border border-red-950/40 text-red-400 px-3 py-2 font-semibold transition flex items-center gap-1"
              title="Excluir Todas as Campanhas"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir Tudo</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-red-650 hover:bg-red-650/85 px-4 py-2 font-semibold text-white transition flex items-center gap-1"
          >
            {showAddForm ? 'Cancelar' : <><Plus className="h-4 w-4" /> Nova Campanha</>}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateCampanha} className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-5 space-y-4 max-w-xl">
          <h4 className="font-semibold text-white text-xs">Adicionar Campanha para Rastreamento</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Nome Identificador (Igual no Ads) *</label>
              <input
                type="text"
                placeholder="Ex: Verão 2024"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Rede / Plataforma</label>
              <select
                value={plataforma}
                onChange={(e) => setPlataforma(e.target.value as any)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
              >
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Instagram Organico">Instagram Orgânico</option>
                <option value="Indicação">Indicação de Parceiros</option>
                <option value="Panfletagem">Panfletagem / Mídia Física</option>
                <option value="Outro">Outra Origem</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Custo / Orçamento Investido (R$)</label>
              <input
                type="number"
                placeholder="Ex: 1500"
                value={investido}
                onChange={(e) => setInvestido(e.target.value !== '' ? Number(e.target.value) : '')}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-neutral-450 px-3 py-1.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded bg-red-650 hover:bg-red-600 px-4 py-2 font-semibold text-white"
            >
              Criar Campanha
            </button>
          </div>
        </form>
      )}

      {/* Grid displays tracking stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {campanhas.map(camp => {
          const roi = camp.valor_investido > 0 
            ? (camp.receita_gerada / camp.valor_investido).toFixed(1)
            : 'Orgânico 💚';

          const leadCost = camp.valor_investido > 0 && camp.leads_gerados > 0
            ? (camp.valor_investido / camp.leads_gerados).toFixed(2)
            : '0.00';

          const purchaseRate = camp.leads_gerados > 0
            ? ((camp.vendas_fechadas / camp.leads_gerados) * 100).toFixed(1)
            : '0.0';

          return (
            <div 
              key={camp.id} 
              className={`rounded-xl border p-5 space-y-4 relative overflow-hidden transition ${
                camp.ativo 
                  ? 'border-neutral-900 bg-neutral-900/15' 
                  : 'border-neutral-950 bg-neutral-950/20 opacity-60'
              }`}
            >
              {/* Card Title Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm tracking-tight">{camp.nome}</h4>
                  <p className="text-[10px] text-zinc-500">{camp.plataforma}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    camp.ativo ? 'bg-green-500/10 text-green-400 border border-green-500/15' : 'bg-neutral-850 text-neutral-450'
                  }`}>
                    {camp.ativo ? 'Ativo' : 'Pausado'}
                  </span>
                  
                  <button 
                    onClick={() => handleToggleActive(camp)}
                    className="text-neutral-400 hover:text-white transition"
                  >
                    {camp.ativo ? (
                      <ToggleRight className="h-6 w-6 text-red-500 cursor-pointer" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-neutral-600 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>

              {/* ROI & Main metric block */}
              <div className="bg-black/20 p-3 rounded-lg border border-neutral-900 grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-500">Valor Investido</span>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {camp.valor_investido > 0 ? `R$ ${camp.valor_investido.toLocaleString('pt-BR')}` : 'Grátis'}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-red-400">ROI Multiplicador</span>
                  <div className="text-xs font-bold text-red-400 mt-0.5 font-mono">
                    {roi === 'Orgânico 💚' ? roi : `${roi}x`}
                  </div>
                </div>
              </div>

              {/* Secondary funnels metrics */}
              <div className="space-y-1.5 pt-1.5">
                {/* Metr 1 */}
                <div className="flex justify-between text-[11px] border-b border-neutral-900/40 pb-1.5">
                  <span className="text-neutral-450">Leads Gerados / Qualificados</span>
                  <span className="font-semibold text-white">{camp.leads_gerados} / {camp.leads_qualificados}</span>
                </div>
                {/* Metr 2 */}
                <div className="flex justify-between text-[11px] border-b border-neutral-900/40 pb-1.5">
                  <span className="text-neutral-450">Orçamentos Emitidos</span>
                  <span className="font-semibold text-white">{camp.orcamentos_enviados}</span>
                </div>
                {/* Metr 3 */}
                <div className="flex justify-between text-[11px] border-b border-neutral-900/40 pb-1.5">
                  <span className="text-neutral-450">Vendas Fechadas (Conversão)</span>
                  <span className="font-semibold text-emerald-400">{camp.vendas_fechadas} ({purchaseRate}%)</span>
                </div>
                {/* Metr 4 */}
                <div className="flex justify-between text-[11px] border-b border-neutral-900/40 pb-1.5">
                  <span className="text-neutral-450">Custo por Lead (CPL)</span>
                  <span className="font-semibold text-white font-mono">R$ {leadCost}</span>
                </div>
                {/* Metr 5 */}
                <div className="flex justify-between text-[11px] font-semibold text-zinc-350">
                  <span className="text-neutral-450">Faturamento Bruto</span>
                  <span className="text-emerald-400 font-bold">R$ {camp.receita_gerada.toLocaleString('pt-BR')}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllCampanhas}
          title="Excluir Todas as Campanhas"
          description={`Essa operação é irreversível e removerá permanentemente todas as ${campanhas.length} campanhas cadastradas em sua base.`}
        />
      )}

    </div>
  );
}
