import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Tag, DollarSign, Calendar, Eye, Trash2 } from 'lucide-react';
import { Lead, LeadStatus, LeadTemperatura, TipoProjeto, InteresseAcabamento, FaseObra, FaixaInvestimento } from '../types';
import { base44 } from '../lib/base44';

interface LeadModalProps {
  leadToEdit?: Lead;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: LeadStatus[] = ['Novo', 'Em Atendimento', 'Orçamento Entregue', 'Negociação', 'Fechado', 'Perdido'];
const TEMPERATURA_OPTIONS: LeadTemperatura[] = ['Frio', 'Morno', 'Quente'];
const PROJETO_OPTIONS: TipoProjeto[] = ['Residencial', 'Comercial', 'Corporativo', 'Industrial', 'Outro'];
const INTERESSE_OPTIONS: InteresseAcabamento[] = ['Mármores', 'Granitos', 'Quartzos', 'Acabamentos Especiais', 'Porcelanatos', 'Outro'];
const OBRA_OPTIONS: FaseObra[] = ['Projeto', 'Alvenaria', 'Acabamento/Revestimento', 'Instalação', 'Pronto'];
const INVESTIMENTO_OPTIONS: FaixaInvestimento[] = ['Até R$ 5k', 'R$ 5k - R$ 15k', 'R$ 15k - R$ 50k', 'Acima de R$ 50k'];

export default function LeadModal({ leadToEdit, onClose, onSuccess }: LeadModalProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [origem, setOrigem] = useState('Instagram');
  const [campanha, setCampanha] = useState('');
  const [status, setStatus] = useState<LeadStatus>('Novo');
  const [temperatura, setTemperatura] = useState<LeadTemperatura>('Morno');
  const [responsavel, setResponsavel] = useState('Tony');
  const [tipoProjeto, setTipoProjeto] = useState<TipoProjeto>('Residencial');
  const [interesse, setInteresse] = useState('Mármores');
  const [faseObra, setFaseObra] = useState<FaseObra>('Projeto');
  const [faixaInvestimento, setFaixaInvestimento] = useState('R$ 5k - R$ 15k');
  const [medidas, setMedidas] = useState('');
  const [fotoUrl, setFotoUrl] = useState(''); // Maps link
  const [observacoes, setObservacoes] = useState('');
  const [proximaAcao, setProximaAcao] = useState('');
  const [dataProximoFollowup, setDataProximoFollowup] = useState('');
  const [probabilidade, setProbabilidade] = useState<number>(50);
  const [prioridade, setPrioridade] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setNome(leadToEdit.nome);
      setTelefone(leadToEdit.telefone || '');
      setCidade(leadToEdit.cidade || '');
      setOrigem(leadToEdit.origem || 'Instagram');
      setCampanha(leadToEdit.campanha || '');
      setStatus(leadToEdit.status);
      setTemperatura(leadToEdit.temperatura);
      setResponsavel(leadToEdit.responsavel || '');
      setTipoProjeto(leadToEdit.tipo_projeto || 'Residencial');
      setInteresse(leadToEdit.interesse || '');
      setFaseObra(leadToEdit.fase_obra || 'Projeto');
      setFaixaInvestimento(leadToEdit.faixa_investimento || '');
      setMedidas(leadToEdit.medidas || '');
      setFotoUrl(leadToEdit.foto_url || '');
      setObservacoes(leadToEdit.observacoes || '');
      setProximaAcao(leadToEdit.proxima_acao || '');
      setPrioridade(leadToEdit.prioridade || false);
      setProbabilidade(leadToEdit.probabilidade_fechamento ?? 50);
      
      if (leadToEdit.data_proximo_followup) {
        try {
          const d = new Date(leadToEdit.data_proximo_followup);
          setDataProximoFollowup(d.toISOString().slice(0, 16));
        } catch (e) {
          setDataProximoFollowup('');
        }
      }
    }
  }, [leadToEdit]);

  const handleSave = () => {
    if (!nome.trim()) return;

    const lead: Lead = {
      id: leadToEdit ? leadToEdit.id : `lead-${Date.now()}`,
      nome,
      telefone: telefone || undefined,
      cidade: cidade || undefined,
      origem: origem || undefined,
      campanha: campanha || undefined,
      status,
      temperatura,
      data_entrada: leadToEdit ? leadToEdit.data_entrada : new Date().toISOString(),
      responsavel,
      tipo_projeto: tipoProjeto,
      interesse,
      fase_obra: faseObra,
      faixa_investimento: faixaInvestimento,
      medidas: medidas || undefined,
      foto_url: fotoUrl || undefined,
      observacoes: observacoes || undefined,
      proxima_acao: proximaAcao || undefined,
      data_proximo_followup: dataProximoFollowup ? new Date(dataProximoFollowup).toISOString() : undefined,
      probabilidade_fechamento: probabilidade,
      prioridade,
      respondido: leadToEdit ? leadToEdit.respondido : false,
      data_primeira_resposta: leadToEdit ? leadToEdit.data_primeira_resposta : undefined
    };

    base44.db.leads.save(lead);
    
    // Auto-create notification if new & urgent
    if (!leadToEdit && prioridade) {
      base44.db.notifications.add({
        tipo: 'novo_urgente',
        titulo: `Lead Urgente Criado: ${nome}`,
        mensagem: `O lead ${nome} foi marcado como prioritário com investimento estimado.`,
        data: new Date().toISOString(),
        entidadeId: lead.id
      });
    }

    onSuccess();
    onClose();
  };

  const handleDelete = () => {
    if (leadToEdit && confirm(`Deseja realmente deletar o lead "${nome}"?`)) {
      base44.db.leads.delete(leadToEdit.id);
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative flex w-full max-w-2xl flex-col rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl h-full max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-lg font-semibold tracking-tight text-white flex items-center gap-2">
          <User className="h-5 w-5 text-red-500" />
          {leadToEdit ? 'Editar Detalhes do Lead' : 'Cadastrar Novo Lead'}
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Sessão 1: Informações de Contato */}
          <div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-900 space-y-3">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-widest text-[10px]">1. Identificação e Contato</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Nome do Lead/Cliente *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ana Silva"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">WhatsApp / Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: (21) 98765-4321"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Cidade/Localidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: Rio de Janeiro"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Link do Google Maps (foto_url)</label>
                <input
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="Link do local pego doMaps"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white text-[11px] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Sessão 2: Qualificação do Acabamento */}
          <div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-900 space-y-3">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-widest text-[10px]">2. Qualificação do Projeto</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Interesse de Material</label>
                <input
                  type="text"
                  value={interesse}
                  onChange={(e) => setInteresse(e.target.value)}
                  placeholder="Ex: Mármores, Granitos, etc."
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Tipo de Projeto</label>
                <select
                  value={tipoProjeto}
                  onChange={(e) => setTipoProjeto(e.target.value as any)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white"
                >
                  {PROJETO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Fase da Obra</label>
                <select
                  value={faseObra}
                  onChange={(e) => setFaseObra(e.target.value as any)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white"
                >
                  {OBRA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              
              <div className="space-y-1 col-span-2">
                <label className="text-neutral-400 font-medium">Dimensões / Medidas do Revestimento</label>
                <input
                  type="text"
                  value={medidas}
                  onChange={(e) => setMedidas(e.target.value)}
                  placeholder="Ex: Cozinha 4.20x0.60m + Soleiras"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Responsável</label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Ex: Tony, Juliana, Breno"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Sessão 3: Status Comercial */}
          <div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-900 space-y-3">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-widest text-[10px]">3. Gestão de Vendas</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Status do Lead</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white font-medium"
                >
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Temperatura</label>
                <select
                  value={temperatura}
                  onChange={(e) => setTemperatura(e.target.value as any)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white font-medium"
                >
                  {TEMPERATURA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Faixa Investimento</label>
                <input
                  type="text"
                  value={faixaInvestimento}
                  onChange={(e) => setFaixaInvestimento(e.target.value)}
                  placeholder="Ex: R$ 5k - R$ 15k, Acima de R$ 50k"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white font-medium"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-neutral-400 font-medium flex justify-between">
                  <span>Probabilidade de Fechamento</span>
                  <strong className="text-red-400">{probabilidade}%</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={probabilidade}
                  onChange={(e) => setProbabilidade(Number(e.target.value))}
                  className="w-full h-8 cursor-pointer accent-red-600 mt-1"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Origem do Lead</label>
                <input
                  type="text"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white"
                  placeholder="Ex: Instagram"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-neutral-400 font-medium">Campanha Ads</label>
                <input
                  type="text"
                  value={campanha}
                  onChange={(e) => setCampanha(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white"
                  placeholder="Ex: Verão 2024"
                />
              </div>

              <div className="pt-5 pl-2">
                <label className="flex items-center gap-2 cursor-pointer text-white font-medium select-none">
                  <input
                    type="checkbox"
                    checked={prioridade}
                    onChange={(e) => setPrioridade(e.target.checked)}
                    className="h-4 w-4 rounded accent-red-600 cursor-pointer"
                  />
                  <span>Alta Prioridade 🔥</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sessão 4: Próxima Ação e Observações */}
          <div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-900 space-y-3">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-widest text-[10px]">4. Ações Futuras & Notas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Próxima Ação Agendada</label>
                <input
                  type="text"
                  value={proximaAcao}
                  onChange={(e) => setProximaAcao(e.target.value)}
                  placeholder="Ex: Retornar WhatsApp, Visitar showroom"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-medium">Data do Próximo Follow-up</label>
                <input
                  type="datetime-local"
                  value={dataProximoFollowup}
                  onChange={(e) => setDataProximoFollowup(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-neutral-400 font-medium">Observações Gerais</label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais detalhadas do lead"
                  className="h-20 w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex justify-between items-center pt-3 border-t border-neutral-900">
          {leadToEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1 text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded transition"
            >
              <Trash2 className="h-4 w-4" /> Excluir Lead
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!nome.trim()}
              className="rounded bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              Salvar Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
