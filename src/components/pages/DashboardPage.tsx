import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  ChevronRight, 
  ArrowUpRight, 
  Calendar,
  Layers,
  Award,
  Bell,
  BellRing,
  Sparkles
} from 'lucide-react';
import { base44, getCriticalMetrics } from '../../lib/base44';

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  
  const [activeSegment, setActiveSegment] = useState<'leads' | 'receita'>('leads');

  useEffect(() => {
    setLeads(base44.db.leads.list());
    setVendas(base44.db.vendas.list());
    setCampanhas(base44.db.campanhas.list());
    setOrcamentos(base44.db.orcamentos.list());

    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
    } else {
      setNotificationPermission(window.Notification.permission as any);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não possui suporte nativo para notificações, mas os alertas via Pop-up integrado com bip sonoro já estão ativos!');
      return;
    }
    
    try {
      const permission = await window.Notification.requestPermission();
      setNotificationPermission(permission as any);
      
      if (permission === 'granted') {
        base44.db.notifications.add({
          tipo: 'geral',
          titulo: '💎 Google Sincronizado!',
          mensagem: 'Você agora receberá alertas rápidos de orçamentos, vendas e novos contatos direto na sua tela!',
          data: new Date().toISOString()
        });
      } else {
        alert('As notificações foram negadas no seu navegador. Para habilitar, clique no ícone de cadeado ao lado da URL e marque "Permitir notificações"!');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const triggerTestNotification = () => {
    base44.db.notifications.add({
      tipo: 'orcamento_vencendo',
      titulo: '🔔 Alerta Sonoro e Pop-up (Tony CRM)',
      mensagem: 'Sucesso! O sistema disparou a notificação com bip sonoro (Opção 1) e sincronia nativa do desktop do Google (Opção 2).',
      data: new Date().toISOString()
    });
  };

  // Compute metrics
  const totalLeadsCount = leads.length;
  const totalRevenue = vendas.reduce((sum, v) => sum + v.valor_fechado, 0);
  const totalSpentCampanhas = campanhas.reduce((sum, c) => sum + (c.valor_investido || 0), 0);
  
  // ROI global = total faturamento / total investido
  const globalROI = totalSpentCampanhas > 0 
    ? (totalRevenue / totalSpentCampanhas).toFixed(1)
    : 'N/A';

  // Taxa de conversão: (Leads Fechados / Total de Leads) * 100
  const closedLeads = leads.filter(l => l.status === 'Fechado').length;
  const conversionRate = totalLeadsCount > 0
    ? ((closedLeads / totalLeadsCount) * 100).toFixed(1)
    : '0';

  const { criticalLeadsCount, vencendoBudgetsCount } = getCriticalMetrics();

  // Pie chart calculation for Temperature
  const hotLeads = leads.filter(l => l.temperatura === 'Quente').length;
  const warmLeads = leads.filter(l => l.temperatura === 'Morno').length;
  const coldLeads = leads.filter(l => l.temperatura === 'Frio').length;

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Alert Header Banner if Critical issues exist */}
      {(criticalLeadsCount > 0 || vencendoBudgetsCount > 0) && (
        <div className="rounded-xl border border-dashed border-red-500/40 bg-red-950/10 p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-semibold text-red-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              ⚠️ PENDÊNCIAS CRÍTICAS: {criticalLeadsCount} Leads Críticos e {vencendoBudgetsCount} Orçamentos Vencendo.
            </span>
            <a href="#followup" className="text-red-400 underline font-semibold hover:text-red-300">
              Ver Detalhes e Agir →
            </a>
          </div>
        </div>
      )}

      {/* PAINEL DE CONTROLE DE NOTIFICAÇÕES GOOGLE */}
      <div className="rounded-xl border border-neutral-900 bg-neutral-900/40 p-4.5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              🔔 Conexão Google & Notificações de Desktop
            </h4>
          </div>
          <p className="text-zinc-500 text-[11px] max-w-xl leading-relaxed">
            Habilite as duas opções de alertas do CRM: **Pop-ups Sonoros do App** (Opção 1) e **Notificações de Sistema padrão do Google/Browser** (Opção 2) para nunca perder nenhum follow-up ou orçamento.
          </p>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto items-center justify-center">
          {notificationPermission === 'granted' ? (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <span className="text-[10px] bg-emerald-950/20 text-emerald-400 border border-emerald-950/40 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 font-mono uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Google Ativo
              </span>
              <button
                type="button"
                onClick={triggerTestNotification}
                className="w-full sm:w-auto rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-4 py-2 transition flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-750"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Testar Alerta
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full sm:w-auto rounded-lg bg-red-650 hover:bg-red-600 text-white font-bold px-4 py-2 hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BellRing className="h-4 w-4 animate-bounce" />
                Ativar com Google
              </button>
              {notificationPermission === 'denied' && (
                <span className="text-[10px] text-zinc-500">🚫 Bloqueado. Habilite nas config. do site.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main summary grid metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-4.5">
          <div className="flex justify-between items-start text-neutral-400">
            <span className="font-medium">Total de Leads</span>
            <Users className="h-4.5 w-4.5 text-neutral-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white leading-none">{totalLeadsCount}</p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
            <span>+{leads.filter(l => l.status === 'Novo').length} novos nesta semana</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-4.5">
          <div className="flex justify-between items-start text-neutral-400">
            <span className="font-medium">Faturamento Fechado</span>
            <DollarSign className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400 leading-none">
            R$ {totalRevenue.toLocaleString('pt-BR')}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
            <ArrowUpRight className="h-3 w-3" />
            <span>Média de R$ {(totalRevenue / (vendas.length || 1)).toLocaleString('pt-BR', {maximumFractionDigits:0})} por projeto</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-4.5">
          <div className="flex justify-between items-start text-neutral-400">
            <span className="font-medium">Taxa de Conversão</span>
            <Percent className="h-4.5 w-4.5 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white leading-none">{conversionRate}%</p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
            <span>{closedLeads} de {totalLeadsCount} convertidos</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-4.5">
          <div className="flex justify-between items-start text-neutral-400">
            <span className="font-medium">ROI das Campanhas</span>
            <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-400 leading-none">{globalROI}x</p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
            <span>Investidos: R$ {totalSpentCampanhas.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 1: Leads funnel / Status */}
        <div className="md:col-span-2 rounded-xl border border-neutral-900 bg-neutral-900/20 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-white text-sm">Funil de Leads</h3>
              <p className="text-zinc-500 text-[11px]">Distribuição e andamento do pipeline comercial</p>
            </div>
            <div className="flex gap-1 bg-neutral-900 p-1 rounded-lg">
              <button 
                onClick={() => setActiveSegment('leads')}
                className={`px-3 py-1 rounded text-[10px] font-semibold transition ${
                  activeSegment === 'leads' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Leads por status
              </button>
              <button 
                onClick={() => setActiveSegment('receita')}
                className={`px-3 py-1 rounded text-[10px] font-semibold transition ${
                  activeSegment === 'receita' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Geração de Valor
              </button>
            </div>
          </div>

          {/* Interactive Responsive SVG Graph */}
          {activeSegment === 'leads' ? (
            <div className="space-y-3.5 pt-2">
              {[
                { label: 'Novo', count: leads.filter(l => l.status === 'Novo').length, color: 'bg-blue-500' },
                { label: 'Em Atendimento', count: leads.filter(l => l.status === 'Em Atendimento').length, color: 'bg-indigo-500' },
                { label: 'Orçamento Entregue', count: leads.filter(l => l.status === 'Orçamento Entregue').length, color: 'bg-cyan-500' },
                { label: 'Negociação', count: leads.filter(l => l.status === 'Negociação').length, color: 'bg-amber-500' },
                { label: 'Fechado (Sucesso)', count: leads.filter(l => l.status === 'Fechado').length, color: 'bg-green-500' },
                { label: 'Perdido', count: leads.filter(l => l.status === 'Perdido').length, color: 'bg-neutral-600' },
              ].map(item => {
                const percentage = totalLeadsCount > 0 ? (item.count / totalLeadsCount) * 100 : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-neutral-300">{item.label}</span>
                      <span className="font-mono text-white">{item.count} leads ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded bg-neutral-900 overflow-hidden">
                      <div className={`h-full ${item.color} rounded transition-all duration-500`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="text-zinc-400 leading-relaxed text-[11.5px] max-w-md">
                Previsões baseadas em orçamentos: Propostas comerciais ativas estimadas para novas conversões.
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-neutral-900 p-3 rounded-lg bg-black/20 text-center">
                  <div className="text-[11px] text-neutral-500">Orçamentos Ativos (Valor)</div>
                  <div className="text-lg font-bold text-amber-500 mt-1">
                    R$ {orcamentos.filter(o => o.status === 'Enviado' || o.status === 'A montar').reduce((sum, o) => sum + (o.valor_premium || o.valor_essencial || 0), 0).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="border border-neutral-900 p-3 rounded-lg bg-black/20 text-center">
                  <div className="text-[11px] text-neutral-500">Valor Já Faturado</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    R$ {totalRevenue.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: Leads by Temperature (Donut) */}
        <div className="rounded-xl border border-neutral-900 bg-neutral-900/20 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">Temperatura de Entrada</h3>
            <p className="text-zinc-500 text-[11px]">Propensão imediata de compra detectada</p>
          </div>

          {/* Interactive SVG Pie/Donut representation */}
          <div className="flex justify-center my-4 pr-1">
            <svg width="150" height="150" viewBox="0 0 42 42" className="transform -rotate-90">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1c1917" strokeWidth="4" />
              
              {/* Hot section */}
              {hotLeads > 0 && (
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4.2"
                  strokeDasharray={`${(hotLeads/totalLeadsCount)*100} ${100 - (hotLeads/totalLeadsCount)*100}`}
                  strokeDashoffset="100"
                />
              )}
              {/* Warm section */}
              {warmLeads > 0 && (
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4.2"
                  strokeDasharray={`${(warmLeads/totalLeadsCount)*100} ${100 - (warmLeads/totalLeadsCount)*100}`}
                  strokeDashoffset={`${100 - (hotLeads/totalLeadsCount)*100}`}
                />
              )}
              {/* Cold section */}
              {coldLeads > 0 && (
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4.2"
                  strokeDasharray={`${(coldLeads/totalLeadsCount)*100} ${100 - (coldLeads/totalLeadsCount)*100}`}
                  strokeDashoffset={`${100 - ((hotLeads+warmLeads)/totalLeadsCount)*100}`}
                />
              )}
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="p-1 rounded bg-[#ef4444]/5 border border-[#ef4444]/15">
              <div className="font-semibold text-red-500">Quente</div>
              <div className="text-white font-bold">{hotLeads} leads</div>
            </div>
            <div className="p-1 rounded bg-[#f59e0b]/5 border border-[#f59e0b]/15">
              <div className="font-semibold text-amber-500">Morno</div>
              <div className="text-white font-bold">{warmLeads} leads</div>
            </div>
            <div className="p-1 rounded bg-[#3b82f6]/5 border border-[#3b82f6]/15">
              <div className="font-semibold text-blue-500">Frio</div>
              <div className="text-white font-bold">{coldLeads} leads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recentes & Campanhas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campanhas Desempenho */}
        <div className="rounded-xl border border-neutral-900 p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center justify-between">
            <span>Desempenho de Campanhas</span>
            <span className="text-[10px] text-zinc-500 font-normal">ROI Decrescente</span>
          </h3>
          
          <div className="divide-y divide-neutral-900">
            {campanhas.map(camp => {
              const roi = camp.valor_investido > 0 ? (camp.receita_gerada / camp.valor_investido).toFixed(1) : 'Orgânico';
              return (
                <div key={camp.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white text-xs">{camp.nome}</span>
                    <p className="text-[10px] text-zinc-500">{camp.plataforma}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-neutral-200">R$ {camp.receita_gerada.toLocaleString('pt-BR')}</span>
                    <p className="text-[10px] text-red-400 font-semibold">
                      {roi === 'Orgânico' ? '100% Lucro (Org.)' : `ROI: ${roi}x`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Últimas Vendas status de Instalação */}
        <div className="rounded-xl border border-neutral-900 p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm">Cronograma pós-venda</h3>
          <div className="space-y-3">
            {vendas.slice(0, 3).map(venda => (
              <div key={venda.id} className="rounded-lg bg-neutral-900/30 p-3 border border-neutral-900/40 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-white text-xs block">{venda.cliente_nome}</span>
                  <span className="text-[10px] text-zinc-500">{venda.projeto_vendido}</span>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${
                    venda.status_instalacao === 'Aguardando medição' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    venda.status_instalacao === 'Em corte/produção' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    venda.status_instalacao === 'Instalação concluída' || venda.status_instalacao === 'Entregue' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {venda.status_instalacao}
                  </span>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">R$ {venda.valor_fechado.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
