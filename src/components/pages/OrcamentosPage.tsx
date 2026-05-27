import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, HelpCircle, Calendar, Trash2, Check, DollarSign, Clock, Bell } from 'lucide-react';
import { Orcamento, Lead, TipoProjeto, OpcaoOrcamento, OrcamentoStatus } from '../../types';
import DeleteConfirmModal from '../DeleteConfirmModal';
import { base44 } from '../../lib/base44';

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [tipoProjeto, setTipoProjeto] = useState<TipoProjeto>('Residencial');
  const [vEssencial, setVEssencial] = useState<number | ''>('');
  const [vPremium, setVPremium] = useState<number | ''>('');
  const [vCompleta, setVCompleta] = useState<number | ''>('');
  const [opcaoRecomendada, setOpcaoRecomendada] = useState<OpcaoOrcamento>('Premium');
  const [validDays, setValidDays] = useState('7');
  const [observacoes, setObservacoes] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllOrcamentos = () => {
    localStorage.removeItem('tony_crm_orcamentos');
    loadData();
  };

  const loadData = () => {
    setOrcamentos(base44.db.orcamentos.list());
    setLeads(base44.db.leads.list());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveOrcamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome.trim()) return;

    // Search for a matching lead by name or create a new one automatically for tracking integrity
    let targetedLead = leads.find(l => l.nome.toLowerCase().trim() === clienteNome.toLowerCase().trim());
    if (!targetedLead) {
      targetedLead = {
        id: `lead-${Date.now()}`,
        nome: clienteNome.trim(),
        status: 'Orçamento Entregue',
        temperatura: 'Morno',
        data_entrada: new Date().toISOString(),
        prioridade: false,
        respondido: true,
        cidade: 'São Paulo',
        origem: 'Orçamento Manual',
        valor_estimado: vPremium !== '' ? Number(vPremium) : (vEssencial !== '' ? Number(vEssencial) : 0),
        data_primeira_resposta: new Date().toISOString()
      };
      base44.db.leads.save(targetedLead);
    } else {
      targetedLead.status = 'Orçamento Entregue';
      targetedLead.valor_estimado = vPremium !== '' ? Number(vPremium) : (vEssencial !== '' ? Number(vEssencial) : 0);
      base44.db.leads.save(targetedLead);
    }

    const dataOrc = new Date();
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + Number(validDays));

    const item: Orcamento = {
      id: `orc-${Date.now()}`,
      lead_id: targetedLead.id,
      lead_nome: targetedLead.nome,
      data_orcamento: dataOrc.toISOString().split('T')[0],
      tipo_projeto: tipoProjeto,
      valor_essencial: vEssencial !== '' ? Number(vEssencial) : undefined,
      valor_premium: vPremium !== '' ? Number(vPremium) : undefined,
      valor_completa: vCompleta !== '' ? Number(vCompleta) : undefined,
      opcao_recomendada: opcaoRecomendada,
      status: 'Enviado',
      prazo_validade: limitDate.toISOString().split('T')[0],
      observacoes
    };

    base44.db.orcamentos.save(item);

    // If auto-follow up is enabled, set reminders automatically
    if (autoFollowUp) {
      const followupDate = new Date();
      followupDate.setDate(followupDate.getDate() + 3);
      const followupISO = followupDate.toISOString();

      targetedLead.data_proximo_followup = followupISO;
      targetedLead.proxima_acao = 'Followup';
      base44.db.leads.save(targetedLead);

      // Save a calendar event as a visual reminder
      base44.db.eventos.save({
        id: `event-follow-${Date.now()}`,
        titulo: `📞 Follow-up Orçamento - ${targetedLead.nome}`,
        descricao: `Lembrete automático para avaliar proposta de revestimento em 3 tiers com o cliente.`,
        data_inicio: followupISO,
        dia_inteiro: true,
        tipo: 'Follow-up',
        cor: 'orange',
        concluido: false
      });

      // Insert real active alert notification
      base44.db.notifications.add({
        tipo: 'atraso_followup',
        titulo: '⏰ Lembrar Follow-up Agendado',
        mensagem: `Alerta automático configurado: Retornar contato para o cliente ${targetedLead.nome} em 3 dias.`,
        data: new Date().toISOString()
      });
    }

    // reset state
    setClienteNome('');
    setAutoFollowUp(true);
    setVEssencial('');
    setVPremium('');
    setVCompleta('');
    setObservacoes('');
    setShowForm(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover esta proposta?')) {
      base44.db.orcamentos.delete(id);
      loadData();
    }
  };

  const handleApprove = (orc: Orcamento) => {
    // 1. Marca orcamento como aprovado
    orc.status = 'Aprovado';
    base44.db.orcamentos.save(orc);

    // 2. Cria venda automaticamente
    const valorFechado = orc.opcao_recomendada === 'Essencial' ? orc.valor_essencial :
                         orc.opcao_recomendada === 'Completa' ? orc.valor_completa : orc.valor_premium;

    base44.db.vendas.save({
      id: `venda-${Date.now()}`,
      lead_id: orc.lead_id,
      cliente_nome: orc.lead_nome,
      projeto_vendido: `${orc.tipo_projeto || 'Acabamento'} - Proposta Aprovada`,
      valor_fechado: valorFechado || 0,
      data_fechamento: new Date().toISOString().split('T')[0],
      status_instalacao: 'Aguardando medição',
      responsavel: 'Tony'
    });

    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      {/* Header bar */}
      <div className="flex justify-between items-center bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-white text-sm">Gerador e Histórico de Orçamentos</h3>
            <p className="text-zinc-500 text-[11px]">Propostas comerciais segmentadas em 3 níveis (Essencial, Premium e Completo)</p>
          </div>
        </div>

        <div className="flex gap-2">
          {orcamentos.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg bg-red-950/15 hover:bg-red-900/15 border border-red-950/40 text-red-400 px-3 py-2 font-semibold transition flex items-center gap-1"
              title="Excluir Todos os Orçamentos"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir Tudo</span>
            </button>
          )}

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-red-650 hover:bg-red-600 px-4 py-2 font-semibold text-white transition flex items-center gap-1"
          >
            {showForm ? 'Cancelar' : <><Plus className="h-4 w-4" /> Nova Proposta</>}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSaveOrcamento} className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-5 space-y-4">
          <h4 className="font-semibold text-white text-xs">Montar Novo Orçamento em 3 Níveis</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Para qual Cliente enviamos o Orçamento? *</label>
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Tipo de Revestimento</label>
              <select
                value={tipoProjeto}
                onChange={(e) => setTipoProjeto(e.target.value as any)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
              >
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Opção Recomendada</label>
              <select
                value={opcaoRecomendada}
                onChange={(e) => setOpcaoRecomendada(e.target.value as any)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white font-semibold"
              >
                <option value="Essencial">Essencial</option>
                <option value="Premium">Premium</option>
                <option value="Completa">Completa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/20 p-3 rounded-lg border border-neutral-900">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Opção Essencial (R$)</label>
              <input
                type="number"
                value={vEssencial}
                onChange={(e) => setVEssencial(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="Ex: 8500"
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Opção Premium (R$)</label>
              <input
                type="number"
                value={vPremium}
                onChange={(e) => setVPremium(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="Ex: 12000"
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Opção Completa (R$)</label>
              <input
                type="number"
                value={vCompleta}
                onChange={(e) => setVCompleta(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="Ex: 16500"
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Validade do Orçamento (Dias)</label>
              <input
                type="number"
                value={validDays}
                onChange={(e) => setValidDays(e.target.value)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Notas Gerais das Chapas/Prazos</label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Chapas reservadas no pátio por 7 dias."
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
              />
            </div>
          </div>

          <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <span className="font-semibold text-amber-500 block">Lembrete Automático de Follow-up</span>
                <p className="text-zinc-500 text-[10px]">O CRM gerará um lembrete na Central e na Agenda para você retornar daqui a 3 dias.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoFollowUp(!autoFollowUp)}
                className={`py-1.5 px-3 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                  autoFollowUp
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-neutral-850 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                {autoFollowUp ? <Bell className="h-3.5 w-3.5 animate-bounce" /> : <Clock className="h-3.5 w-3.5" />}
                <span>{autoFollowUp ? 'Ativado: Lembrar Automático' : 'Desativado: Sem Lembrete'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs pt-1">
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="px-4 py-2 text-neutral-450 hover:text-white"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="rounded bg-red-650 hover:bg-red-600 px-5 py-2 font-semibold text-white"
            >
              Emitir Proposta e Notificar
            </button>
          </div>
        </form>
      )}

      {/* List proposals */}
      <div className="space-y-4">
        {orcamentos
          .filter(o => o.lead_nome.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(orc => {
            const isVencido = orc.status === 'Vencido' || new Date(orc.prazo_validade) < new Date();
            const resolvedStatus = isVencido && orc.status !== 'Aprovado' ? 'Vencido' : orc.status;

            return (
              <div key={orc.id} className="rounded-xl border border-neutral-900 bg-neutral-900/15 p-5 space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-2 border-b border-neutral-900 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">{orc.lead_nome}</h4>
                    <span className="text-zinc-500 text-[10px]">Emitido em {new Date(orc.data_orcamento).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                      resolvedStatus === 'Aprovado' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      resolvedStatus === 'Vencido' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      resolvedStatus === 'Enviado' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {resolvedStatus}
                    </span>
                    
                    <button 
                      onClick={() => handleDelete(orc.id)}
                      className="text-neutral-500 hover:text-red-400 p-1 rounded hover:bg-neutral-800 transition"
                      title="Deletar proposta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Display 3 Tiers grid visual exactly as CRM requested */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  {/* Essencial Column */}
                  <div className={`rounded-lg border p-3 bg-black/20 ${orc.opcao_recomendada === 'Essencial' ? 'border-amber-500/60 bg-amber-500/5' : 'border-neutral-900'}`}>
                    <small className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">A. Essencial</small>
                    <div className="text-sm font-bold text-neutral-200 mt-1">
                      R$ {orc.valor_essencial?.toLocaleString('pt-BR') || '---'}
                    </div>
                  </div>

                  {/* Premium Column */}
                  <div className={`rounded-lg border p-3 bg-black/20 ${orc.opcao_recomendada === 'Premium' ? 'border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/35' : 'border-neutral-900'}`}>
                    <small className="text-[9px] uppercase font-bold text-amber-500 tracking-wider flex items-center justify-center gap-0.5">
                      B. Premium ⭐ (Recomendada)
                    </small>
                    <div className="text-sm font-bold text-amber-400 mt-1">
                      R$ {orc.valor_premium?.toLocaleString('pt-BR') || '---'}
                    </div>
                  </div>

                  {/* Completa column */}
                  <div className={`rounded-lg border p-3 bg-black/20 ${orc.opcao_recomendada === 'Completa' ? 'border-amber-500/60 bg-amber-500/5' : 'border-neutral-900'}`}>
                    <small className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">C. Completa</small>
                    <div className="text-sm font-bold text-neutral-200 mt-1">
                      R$ {orc.valor_completa?.toLocaleString('pt-BR') || '---'}
                    </div>
                  </div>
                </div>

                {/* Proposal bottom info */}
                <div className="flex justify-between items-center text-[10.5px] text-zinc-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    <span>Vencimento em: <strong className="text-neutral-200">{new Date(orc.prazo_validade).toLocaleDateString('pt-BR')}</strong></span>
                  </div>
                  
                  {resolvedStatus === 'Enviado' && (
                    <button
                      onClick={() => handleApprove(orc)}
                      className="rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-1.5 flex items-center gap-1 transition"
                    >
                      <Check className="h-3.5 w-3.5" /> Aprovar e Gerar Venda
                    </button>
                  )}
                </div>

                {orc.observacoes && (
                  <p className="mt-2 pl-3.5 border-l-2 border-neutral-800 text-[11px] text-neutral-500 italic">
                    "{orc.observacoes}"
                  </p>
                )}
              </div>
            );
          })}
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllOrcamentos}
          title="Excluir Todos os Orçamentos"
          description={`Essa operação é irreversível e removerá permanentemente todos os ${orcamentos.length} orçamentos cadastrados em sua base.`}
        />
      )}

    </div>
  );
}
