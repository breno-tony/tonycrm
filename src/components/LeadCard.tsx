import React, { useState } from 'react';
import { Lead, Ligacao, Atendimento, LeadStatus, LeadTemperatura } from '../types';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  Star, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Plus,
  DollarSign,
  Archive
} from 'lucide-react';
import { base44, CURRENT_MOCK_TIME } from '../lib/base44';

interface LeadCardProps {
  lead: Lead;
  onUpdate: () => void;
  onEditLead: (lead: Lead) => void;
  key?: any;
}

export default function LeadCard({ lead, onUpdate, onEditLead }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState<'ligacao' | 'atendimento' | null>(null);
  
  // Quick Call form
  const [callResult, setCallResult] = useState<'Sucesso' | 'Não Atendeu' | 'Caixa Postal' | 'Ocupado' | 'Ligar mais tarde'>('Sucesso');
  const [callResumo, setCallResumo] = useState('');
  const [callReturnDate, setCallReturnDate] = useState('');

  // Quick Atendimento form
  const [atendCanal, setAtendCanal] = useState<'WhatsApp' | 'Ligação' | 'E-mail' | 'Presencial Showroom' | 'Instagram DM'>('WhatsApp');
  const [atendTipo, setAtendTipo] = useState<'Primeiro contato' | 'Dúvida' | 'Envio de medidas' | 'Negociação' | 'Pós-Venda'>('Dúvida');
  const [atendResumo, setAtendResumo] = useState('');
  const [atendNextContact, setAtendNextContact] = useState('');

  // Calculate Critical conditions for Borders
  const now = new Date(CURRENT_MOCK_TIME);
  
  // 1. delayed followup >= 2 days
  let isDelayedFollowup = false;
  if (lead.data_proximo_followup) {
    const fn = new Date(lead.data_proximo_followup);
    const diff = now.getTime() - fn.getTime();
    const diffDays = diff / (1000 * 60 * 60 * 24);
    if (diffDays >= 2) {
      isDelayedFollowup = true;
    }
  }

  // 2. no activity in last 5 days
  const leadCalls = base44.db.ligacoes.list().filter(c => c.lead_id === lead.id);
  const leadServices = base44.db.atendimentos.list().filter(s => s.lead_id === lead.id);
  const activityDates = [
    ...leadCalls.map(c => new Date(c.data).getTime()),
    ...leadServices.map(s => new Date(s.data).getTime()),
    new Date(lead.data_entrada).getTime()
  ];
  const lastActivityTime = Math.max(...activityDates);
  const diffActivityDays = (now.getTime() - lastActivityTime) / (1000 * 60 * 60 * 24);
  const isNoRecentActivity = diffActivityDays >= 5;

  // Final determinations:
  const isCritical = (isDelayedFollowup || isNoRecentActivity) && lead.status !== 'Fechado' && lead.status !== 'Perdido';
  const isHighPriority = lead.prioridade || lead.temperatura === 'Quente' || (lead.probabilidade_fechamento || 0) > 80;

  // Bordas indicativas
  let borderClass = 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40';
  let badgeHighlight = null;

  if (isCritical) {
    borderClass = 'border-red-600/80 shadow-[0_0_12px_rgba(239,68,68,0.15)] bg-red-950/5';
    badgeHighlight = { label: 'Crítico', bg: 'bg-red-500/10 text-red-400 border-red-500/20' };
  } else if (isHighPriority) {
    borderClass = 'border-amber-600/70 shadow-[0_0_10px_rgba(245,158,11,0.15)] bg-amber-950/5';
    badgeHighlight = { label: 'Atenção', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  }

  const handleSaveQuickCall = () => {
    const newCall: Ligacao = {
      id: `call-${Date.now()}`,
      lead_id: lead.id,
      lead_nome: lead.nome,
      data: new Date().toISOString(),
      duracao_min: callResult === 'Sucesso' ? 5 : 0,
      direcao: 'Ativa',
      atendeu: callResult === 'Sucesso',
      resultado: callResult,
      resumo: callResumo,
      proxima_acao: callReturnDate ? 'Aguardando retorno agendado' : undefined,
      data_retorno: callReturnDate ? new Date(callReturnDate).toISOString() : undefined
    };

    base44.db.ligacoes.save(newCall);
    setShowQuickAction(null);
    setCallResumo('');
    setCallReturnDate('');
    onUpdate();
  };

  const handleSaveQuickAtend = () => {
    const newAtend: Atendimento = {
      id: `atend-${Date.now()}`,
      lead_id: lead.id,
      lead_nome: lead.nome,
      data: new Date().toISOString(),
      canal: atendCanal,
      tipo_interacao: atendTipo,
      resumo: atendResumo,
      proxima_acao: atendNextContact ? 'Contato agendado' : undefined,
      data_proximo_contato: atendNextContact ? new Date(atendNextContact).toISOString() : undefined
    };

    base44.db.atendimentos.save(newAtend);
    setShowQuickAction(null);
    setAtendResumo('');
    setAtendNextContact('');
    onUpdate();
  };

  const handleToggleArchive = () => {
    const updatedLead = { ...lead, arquivado: !lead.arquivado };
    base44.db.leads.save(updatedLead);
    onUpdate();
  };

  return (
    <div className={`rounded-xl border p-4.5 transition duration-200 ${lead.arquivado ? 'opacity-70 grayscale-[30%] bg-neutral-900/20 border-neutral-800/60' : borderClass}`}>
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white tracking-tight text-sm">
              {lead.nome}
            </h3>
            
            {/* Tag arquivado */}
            {lead.arquivado && (
              <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold border bg-neutral-800 text-neutral-400 border-neutral-700">
                Arquivado (Inútil)
              </span>
            )}

            {/* Tag status */}
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${
              lead.status === 'Novo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              lead.status === 'Em Atendimento' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
              lead.status === 'Orçamento Entregue' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
              lead.status === 'Negociação' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              lead.status === 'Fechado' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
            }`}>
              {lead.status}
            </span>

            {/* Tag temperature */}
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${
              lead.temperatura === 'Quente' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              lead.temperatura === 'Morno' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
              'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {lead.temperatura}
            </span>

            {/* Alert Indicator */}
            {badgeHighlight && (
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border flex items-center gap-0.5 ${badgeHighlight.bg}`}>
                <Star className="h-2.5 w-2.5 fill-current" />
                {badgeHighlight.label}
              </span>
            )}
          </div>
          
          <p className="mt-1 text-xs text-neutral-400 font-mono">
            {lead.origem || 'Origem não informada'} {lead.campanha ? `• ${lead.campanha}` : ''}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Action icon for Maps */}
          {lead.foto_url && (
            <a 
              href={lead.foto_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="rounded-lg bg-neutral-800 p-2 text-neutral-400 hover:bg-neutral-700 hover:text-white transition"
              title="Ver no Google Maps"
            >
              <MapPin className="h-4 w-4 text-emerald-400" />
            </a>
          )}
          <button 
            onClick={() => onEditLead(lead)}
            className="rounded-lg bg-neutral-800 px-2.5 py-1.5 text-[11px] font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
          >
            Editar
          </button>
          <button 
            onClick={handleToggleArchive}
            className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition flex items-center gap-1 ${
              lead.arquivado 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25' 
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }`}
            title={lead.arquivado ? "Reativar Lead" : "Arquivar Lead como Inútil"}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>{lead.arquivado ? 'Ativar' : 'Arquivar'}</span>
          </button>
        </div>
      </div>

      {/* Main Stats in brief */}
      <div className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs border-t border-neutral-900 pt-3">
        {lead.telefone && (
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Phone className="h-3.5 w-3.5 text-neutral-500" />
            <span className="font-medium select-all">{lead.telefone}</span>
          </div>
        )}
        {lead.cidade && (
          <div className="flex items-center gap-1.5 text-neutral-300">
            <MapPin className="h-3.5 w-3.5 text-neutral-500" />
            <span>{lead.cidade}</span>
          </div>
        )}
        
        {/* Probabilidade de Fechamento */}
        <div className="flex items-center gap-1.5 text-neutral-400 col-span-2 mt-1">
          <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-750 text-neutral-300">
            Probabilidade de Fechamento: {lead.probabilidade_fechamento || 50}%
          </span>
        </div>
      </div>

      {/* Overdue/Followup Info Banner */}
      <div className="mt-3.5 rounded-lg bg-black/40 p-2 text-[11px] flex items-center justify-between border border-neutral-950">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-red-500" />
          {lead.data_proximo_followup ? (
            <div>
              <span className="text-neutral-400">Próxima Ação: </span>
              <span className={`font-semibold ${isDelayedFollowup ? 'text-red-400 animate-pulse' : 'text-neutral-200'}`}>
                {isDelayedFollowup 
                  ? `Atrasado há ${Math.floor((now.getTime() - new Date(lead.data_proximo_followup).getTime()) / (1000 * 60 * 60 * 24))} dias`
                  : new Date(lead.data_proximo_followup).toLocaleDateString('pt-BR')
                }
                {lead.proxima_acao ? ` (${lead.proxima_acao})` : ''}
              </span>
            </div>
          ) : (
            <span className="text-neutral-500">Sem follow-up agendado</span>
          )}
        </div>
        
        {isNoRecentActivity && (
          <div className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">
            <AlertCircle className="h-3 w-3" />
            <span>Sem atividade ha {Math.floor(diffActivityDays)} dias</span>
          </div>
        )}
      </div>

      {/* Expandable Section (Activity logs + Quick action tools) */}
      <div className="mt-2 text-right">
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition"
        >
          {expanded ? (
            <>Ocultar Atividades <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>Ver Atividades e Histórico ({leadCalls.length + leadServices.length}) <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-neutral-900 pt-3.5 space-y-4">
          {/* Quick Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickAction(showQuickAction === 'ligacao' ? null : 'ligacao')}
              className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900 transition flex items-center justify-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5 text-red-500" />
              Reg. Ligação
            </button>
            <button
              onClick={() => setShowQuickAction(showQuickAction === 'atendimento' ? null : 'atendimento')}
              className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900 transition flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5 text-red-500" />
              Reg. Atendimento
            </button>
          </div>

          {/* Quick action form overlays */}
          {showQuickAction === 'ligacao' && (
            <div className="rounded-lg bg-neutral-950 p-3 border border-neutral-800 space-y-3 text-xs">
              <h4 className="font-semibold text-white">Registrar Ligação Efetuada</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400">Resultado</label>
                  <select
                    value={callResult}
                    onChange={(e) => setCallResult(e.target.value as any)}
                    className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 p-1.5 text-white"
                  >
                    <option value="Sucesso">Atendeu (Sucesso)</option>
                    <option value="Não Atendeu">Não Atendeu</option>
                    <option value="Caixa Postal">Caixa Postal</option>
                    <option value="Ocupado">Ocupado</option>
                    <option value="Ligar mais tarde">Ligar mais tarde</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400">Agendar Retorno (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={callReturnDate}
                    onChange={(e) => setCallReturnDate(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 p-1.5 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-neutral-400">Resumo da Conversa</label>
                <textarea
                  value={callResumo}
                  onChange={(e) => setCallResumo(e.target.value)}
                  placeholder="Quais acabamentos ela quer? Ficou de enviar medidas?"
                  className="mt-1 h-12 w-full rounded border border-neutral-800 bg-neutral-900 p-1.5 text-white resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowQuickAction(null)} className="text-neutral-400 px-2 py-1">Cancelar</button>
                <button onClick={handleSaveQuickCall} className="bg-red-600 hover:bg-red-500 text-white rounded px-3 py-1 font-semibold">Salvar</button>
              </div>
            </div>
          )}

          {showQuickAction === 'atendimento' && (
            <div className="rounded-lg bg-neutral-950 p-3 border border-neutral-800 space-y-3 text-xs">
              <h4 className="font-semibold text-white">Registrar Mensagem / Interação</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400">Canal</label>
                  <select
                    value={atendCanal}
                    onChange={(e) => setAtendCanal(e.target.value as any)}
                    className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 p-1.5 text-white"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Presencial Showroom">Presencial Showroom</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400">Tipo de Interação</label>
                  <select
                    value={atendTipo}
                    onChange={(e) => setAtendTipo(e.target.value as any)}
                    className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 p-1.5 text-white"
                  >
                    <option value="Primeiro contato">Primeiro contato</option>
                    <option value="Dúvida">Dúvida / Esclarecimentos</option>
                    <option value="Envio de medidas">Envio de Medidas</option>
                    <option value="Negociação">Negociação de Preços</option>
                    <option value="Pós-Venda">Pós-venda</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-neutral-400">Próximo Contato (Opcional)</label>
                <input
                  type="datetime-local"
                  value={atendNextContact}
                  onChange={(e) => setAtendNextContact(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 p-1.5 text-white animate-fade-in"
                />
              </div>
              <div>
                <label className="text-neutral-400">Notas de Atendimento</label>
                <textarea
                  value={atendResumo}
                  onChange={(e) => setAtendResumo(e.target.value)}
                  placeholder="Descreva o que foi conversado ou as pendências decididas."
                  className="mt-1 h-12 w-full rounded border border-neutral-800 bg-neutral-900 p-1.5 text-white resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowQuickAction(null)} className="text-neutral-400 px-2 py-1">Cancelar</button>
                <button onClick={handleSaveQuickAtend} className="bg-red-600 hover:bg-red-500 text-white rounded px-3 py-1 font-semibold">Salvar</button>
              </div>
            </div>
          )}

          {/* Activity feed timeline */}
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Feed de Atividades</h4>
            
            {leadCalls.length === 0 && leadServices.length === 0 ? (
              <p className="text-[11px] text-neutral-500 italic">Nenhuma atividade registrada para este lead até o momento.</p>
            ) : (
              [
                ...leadCalls.map(c => ({ ...c, feedType: 'call' as const })),
                ...leadServices.map(s => ({ ...s, feedType: 'service' as const }))
              ]
              .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .map((item, idx) => (
                <div key={idx} className="rounded-lg bg-black/30 p-2.5 border border-neutral-800 text-[11px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-neutral-200 flex items-center gap-1">
                      {item.feedType === 'call' ? (
                        <Phone className="h-3 w-3 text-red-500" />
                      ) : (
                        <MessageSquare className="h-3 w-3 text-blue-400" />
                      )}
                      {item.feedType === 'call' ? `Ligação: ${item.resultado}` : `Mensagem: ${item.tipo_interacao} (${item.canal})`}
                    </span>
                    <span className="text-neutral-500 font-mono text-[10px]">
                      {new Date(item.data).toLocaleDateString('pt-BR')} {new Date(item.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  {item.resumo && <p className="text-neutral-400 leading-relaxed text-xs">{item.resumo}</p>}
                </div>
              ))
            )}
          </div>

          {/* Lead specifications overview */}
          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-900 space-y-1.5 text-[11.5px]">
            <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">Especificações</span>
            <div className="grid grid-cols-2 gap-2 text-neutral-300">
              <div>Tipo Projeto: <strong className="text-neutral-100">{lead.tipo_projeto || 'N/A'}</strong></div>
              <div>Interesse: <strong className="text-neutral-100">{lead.interesse || 'N/A'}</strong></div>
              <div>Fase Obra: <strong className="text-neutral-100">{lead.fase_obra || 'N/A'}</strong></div>
              <div>Investimento: <strong className="text-neutral-100">{lead.faixa_investimento || 'N/A'}</strong></div>
              {lead.medidas && <div className="col-span-2">Medidas de Projeto: <span className="font-mono text-neutral-100">{lead.medidas}</span></div>}
              {lead.observacoes && <div className="col-span-2 mt-1 italic text-neutral-400 border-t border-neutral-900 pt-1.5">"{lead.observacoes}"</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
