import React, { useState, useEffect } from 'react';
import { Award, Search, Calendar, CheckSquare, Plus, Check, MapPin, ListCollapse, Trash2 } from 'lucide-react';
import { Venda, StatusInstalacao } from '../../types';
import { base44 } from '../../lib/base44';
import DeleteConfirmModal from '../DeleteConfirmModal';

const STATUS_ETAPAS: StatusInstalacao[] = [
  'Aguardando medição',
  'Medição agendada',
  'Em corte/produção',
  'Instalação agendada',
  'Instalação concluída',
  'Entregue'
];

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom manual record
  const [showAddForm, setShowAddForm] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  const [projetoVendido, setProjetoVendido] = useState('');
  const [valorFechado, setValorFechado] = useState<number | ''>('');
  const [formaPagto, setFormaPagto] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllVendas = () => {
    localStorage.removeItem('tony_crm_vendas');
    loadVendas();
  };

  const loadVendas = () => {
    setVendas(base44.db.vendas.list());
  };

  useEffect(() => {
    loadVendas();
  }, []);

  const handleUpdateStatus = (venda: Venda, status: StatusInstalacao) => {
    venda.status_instalacao = status;
    base44.db.vendas.save(venda);
    loadVendas();
  };

  const handleCreateVenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome.trim() || !projetoVendido.trim() || valorFechado === '') return;

    const entry: Venda = {
      id: `venda-${Date.now()}`,
      cliente_nome: clienteNome,
      projeto_vendido: projetoVendido,
      valor_fechado: Number(valorFechado),
      data_fechamento: new Date().toISOString().split('T')[0],
      forma_pagamento: formaPagto,
      status_instalacao: 'Aguardando medição',
      responsavel: 'Tony'
    };

    base44.db.vendas.save(entry);
    setClienteNome('');
    setProjetoVendido('');
    setValorFechado('');
    setFormaPagto('');
    setShowAddForm(false);
    loadVendas();
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      {/* Header element */}
      <div className="flex justify-between items-center bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="font-semibold text-white text-sm">Controle de Vendas e Fluxo de Instalação</h3>
            <p className="text-zinc-500 text-[11px]">Acompanhamento técnico pós-vendas, da medição à entrega e instalação das pedras</p>
          </div>
        </div>

        <div className="flex gap-2">
          {vendas.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg bg-red-950/15 hover:bg-red-900/15 border border-red-950/40 text-red-400 px-3 py-2 font-semibold transition flex items-center gap-1"
              title="Excluir Todas as Vendas"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir Tudo</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-red-650 hover:bg-red-650/85 px-4 py-2 font-semibold text-white transition flex items-center gap-1"
          >
            {showAddForm ? 'Cancelar' : <><Plus className="h-4 w-4" /> Adicionar Venda Direta</>}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateVenda} className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-5 space-y-4 max-w-xl">
          <h4 className="font-semibold text-white text-xs">Cadastrar Venda Fechada Manualmente</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">Nome do Cliente *</label>
              <input
                type="text"
                placeholder="Ex: Pedro Alveres"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Projeto/Material Vendido *</label>
              <input
                type="text"
                placeholder="Ex: Bancada Mármore Calacatta"
                value={projetoVendido}
                onChange={(e) => setProjetoVendido(e.target.value)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Valor Venda Fechado (R$) *</label>
              <input
                type="number"
                placeholder="Ex: 14500"
                value={valorFechado}
                onChange={(e) => setValorFechado(e.target.value !== '' ? Number(e.target.value) : '')}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">Forma de Pagamento</label>
              <input
                type="text"
                placeholder="Ex: Pix 50/50"
                value={formaPagto}
                onChange={(e) => setFormaPagto(e.target.value)}
                className="w-full rounded border border-neutral-850 bg-neutral-950 p-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
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
              Confirmar Contrato Venda
            </button>
          </div>
        </form>
      )}

      {/* Search block */}
      <div className="flex items-center rounded-lg border border-neutral-850 bg-neutral-900/40 px-3.5 py-2">
        <Search className="h-4 w-4 text-neutral-500 mr-2" />
        <input
          type="text"
          placeholder="Pesquise por nome do cliente ou projeto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-white focus:outline-none placeholder:text-neutral-500 text-xs"
        />
      </div>

      {/* Sales list with step indicator bar for installation post sales flow */}
      <div className="space-y-4">
        {vendas
          .filter(v => v.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) || v.projeto_vendido.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(sale => (
            <div key={sale.id} className="rounded-xl border border-neutral-900 bg-neutral-900/15 p-5 space-y-4">
              
              {/* Header block values */}
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{sale.cliente_nome}</h4>
                  <p className="text-zinc-500 text-[10.5px]">
                    Projeto: <strong className="text-neutral-300 font-semibold">{sale.projeto_vendido}</strong> • Fechado em {new Date(sale.data_fechamento).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-zinc-200">R$ {sale.valor_fechado.toLocaleString('pt-BR')}</div>
                  {sale.forma_pagamento && <span className="text-[10px] text-zinc-500">Pagtinho: {sale.forma_pagamento}</span>}
                </div>
              </div>

              {/* Status Stepper Progression container */}
              <div className="space-y-2 pt-2 border-t border-neutral-900/50">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Progresso da Instalação das Obras</span>
                
                {/* Horizontal Stepper list */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 pt-1">
                  {STATUS_ETAPAS.map((etapa, idx) => {
                    const isSelected = sale.status_instalacao === etapa;
                    const isPassed = STATUS_ETAPAS.indexOf(sale.status_instalacao) >= idx;

                    return (
                      <button
                        key={etapa}
                        onClick={() => handleUpdateStatus(sale, etapa)}
                        className={`rounded px-2.5 py-2 text-center text-[10px] font-semibold border transition cursor-pointer select-none ${
                          isSelected 
                            ? 'bg-red-600/15 border-red-500 text-red-400 ring-1 ring-red-500/20' 
                            : isPassed
                              ? 'bg-neutral-900/60 border-neutral-800 text-zinc-350 hover:border-neutral-700'
                              : 'bg-black/10 border-neutral-950/20 text-neutral-600 hover:border-neutral-900'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {isPassed && !isSelected && <Check className="h-3 w-3 text-red-500" />}
                          <span>{etapa}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ))}
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllVendas}
          title="Excluir Todas as Vendas"
          description={`Essa operação é irreversível e removerá permanentemente todas as ${vendas.length} vendas cadastradas em sua base.`}
        />
      )}

    </div>
  );
}
