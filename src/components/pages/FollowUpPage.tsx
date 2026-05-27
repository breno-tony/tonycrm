import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Search,
  CheckCircle,
  PhoneCall,
  User,
  Star
} from 'lucide-react';
import { Lead } from '../../types';
import { base44, CURRENT_MOCK_TIME, getCriticalMetrics } from '../../lib/base44';
import LeadCard from '../LeadCard';
import LeadModal from '../LeadModal';

export default function FollowUpPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<'geral' | 'alertas'>('alertas'); // Default to Alertas following mockup screenshot
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal tracking
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | undefined>(undefined);

  const loadData = () => {
    setLeads(base44.db.leads.list());
  };

  useEffect(() => {
    loadData();
  }, []);

  const now = new Date(CURRENT_MOCK_TIME);

  // Compute metrics
  const { criticalLeadsCount, vencendoBudgetsCount, criticalLeadList } = getCriticalMetrics();

  // "Alertas" Tab filtering logic
  const alertLeads = leads.filter(lead => {
    // Lead conditions
    if (lead.status === 'Fechado' || lead.status === 'Perdido') return false;

    // Condition 1: followup overdue >= 2 days
    let isOverdue = false;
    if (lead.data_proximo_followup) {
      const fDate = new Date(lead.data_proximo_followup);
      const diffDays = (now.getTime() - fDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 2) isOverdue = true;
    }

    // Condition 2: no calls/atendimentos logged in the last 5 days
    const leadCalls = base44.db.ligacoes.list().filter(c => c.lead_id === lead.id);
    const leadServices = base44.db.atendimentos.list().filter(s => s.lead_id === lead.id);
    const activityDates = [
      ...leadCalls.map(c => new Date(c.data).getTime()),
      ...leadServices.map(s => new Date(s.data).getTime()),
      new Date(lead.data_entrada).getTime()
    ];
    const lastActivityTime = Math.max(...activityDates);
    const diffActivityDays = (now.getTime() - lastActivityTime) / (1000 * 60 * 60 * 24);
    const isNoActivity = diffActivityDays >= 5;

    return isOverdue || isNoActivity;
  });

  const getOverdueTitle = (lead: Lead) => {
    if (!lead.data_proximo_followup) return '';
    const fDate = new Date(lead.data_proximo_followup);
    const diffDays = Math.floor((now.getTime() - fDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `Atrasado há ${diffDays} dias` : `Em dia (Próximo)`;
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Permanent notice block exactly styled like mockup with dashed orange/red border and warning icons */}
      <div className="rounded-xl border border-dashed border-red-500/80 bg-neutral-950 p-4 shadow-[0_4px_16px_rgba(239,68,68,0.06)]">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-500/10 p-2 text-red-500 animate-pulse">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-500 tracking-wide uppercase text-xs flex items-center gap-1.5">
              Pendências Críticas Detectadas
            </h3>
            <p className="mt-0.5 text-neutral-400 font-medium">
              Há <strong className="text-white font-bold">{criticalLeadsCount} leads atrasados</strong> aguardando retorno e <strong className="text-white font-bold">{vencendoBudgetsCount} propostas de orçamentos</strong> expirando. Priorize as respostas imediatas.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs list matching mockup visual bar */}
      <div className="border-b border-neutral-900 pb-px">
        <div className="flex gap-4.5">
          <button
            onClick={() => setActiveTab('geral')}
            className={`pb-3 font-semibold text-xs tracking-tight border-b-2 transition select-none ${
              activeTab === 'geral' 
                ? 'border-red-600 text-white' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Geral
          </button>
          
          <button
            onClick={() => setActiveTab('alertas')}
            className={`pb-3 font-semibold text-xs tracking-tight border-b-2 transition flex items-center gap-1.5 select-none ${
              activeTab === 'alertas' 
                ? 'border-red-600 text-white' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <span>Alertas</span>
            <span className="rounded bg-red-600/15 py-0.5 px-1.5 text-[9px] font-bold text-red-500">
              {alertLeads.length}
            </span>
          </button>
        </div>
      </div>

      <p className="text-neutral-400 text-xs font-semibold select-none leading-none pt-0.5">
        {activeTab === 'alertas' 
          ? 'Leads com follow-up atrasado (≥ 2 dias) ou sem atividade recente (≥ 5 dias).' 
          : 'Lista de todos os leads ativos com datas de acompanhamento agendadas.'
        }
      </p>

      {/* Search filters within Follow-up Page */}
      <div className="flex items-center rounded-lg border border-neutral-850 bg-neutral-900/40 px-3.5 py-2">
        <Search className="h-4 w-4 text-neutral-500 mr-2" />
        <input 
          type="text" 
          placeholder="Filtrar por nome do lead em alerta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-neutral-200 text-xs focus:outline-none placeholder:text-neutral-500"
        />
      </div>

      {/* Grid of Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {(activeTab === 'alertas' ? alertLeads : leads.filter(l => l.status !== 'Fechado' && l.status !== 'Perdido'))
          .filter(lead => lead.nome.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onUpdate={loadData}
              onEditLead={(l) => {
                setLeadToEdit(l);
                setShowLeadModal(true);
              }}
            />
          ))}

        {((activeTab === 'alertas' ? alertLeads : leads).length === 0) && (
          <div className="col-span-full rounded-xl border border-neutral-900 p-12 text-center bg-neutral-950/20">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
            <span className="font-semibold text-white block text-sm">Nenhum Lead em Alerta Extremo</span>
            <p className="text-neutral-500 mt-1">Parabéns! Todos os acompanhamentos e tarefas comerciais estão absolutamente em dia.</p>
          </div>
        )}
      </div>

      {/* Modal for Lead edits directly from Card */}
      {showLeadModal && (
        <LeadModal
          leadToEdit={leadToEdit}
          onClose={() => {
            setShowLeadModal(false);
            setLeadToEdit(undefined);
          }}
          onSuccess={loadData}
        />
      )}

    </div>
  );
}
