import { useState, useEffect } from 'react';
import { X, Calendar, Type, Clock, Check, Trash2, Search } from 'lucide-react';
import { Evento, EventoTipo, EventoCor, Lead } from '../types';
import { base44 } from '../lib/base44';

interface EventoModalProps {
  eventToEdit?: Evento;
  selectedDate?: string; // ISO date format YYYY-MM-DD
  onClose: () => void;
  onSuccess: () => void;
}

const EVENT_TYPES: EventoTipo[] = ['Follow-up', 'Visita', 'Reunião', 'Ligação', 'Instalação', 'Outro'];
const EVENT_COLORS: { name: EventoCor; hex: string; bg: string }[] = [
  { name: 'blue', hex: '#3b82f6', bg: 'bg-blue-600/20 text-blue-400 border-blue-500/50' },
  { name: 'green', hex: '#10b981', bg: 'bg-green-600/20 text-green-400 border-green-500/50' },
  { name: 'red', hex: '#ef4444', bg: 'bg-red-600/20 text-red-400 border-red-500/50' },
  { name: 'yellow', hex: '#f59e0b', bg: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50' },
  { name: 'purple', hex: '#8b5cf6', bg: 'bg-purple-600/20 text-purple-400 border-purple-500/50' },
  { name: 'orange', hex: '#f97316', bg: 'bg-orange-600/20 text-orange-400 border-orange-500/50' },
];

export default function EventoModal({ eventToEdit, selectedDate, onClose, onSuccess }: EventoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [diaInteiro, setDiaInteiro] = useState(false);
  const [tipo, setTipo] = useState<EventoTipo>('Outro');
  const [subCor, setSubCor] = useState<EventoCor>('blue');
  const [concluido, setConcluido] = useState(false);
  
  // Lead association
  const [leadId, setLeadId] = useState('');
  const [leadNome, setLeadNome] = useState('');
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [searchLead, setSearchLead] = useState('');
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);

  useEffect(() => {
    // Lead loading
    const leads = base44.db.leads.list();
    setLeadsList(leads);

    if (eventToEdit) {
      setTitulo(eventToEdit.titulo);
      setDescricao(eventToEdit.descricao || '');
      // Format to Datetime-local inputs (YYYY-MM-DDTHH:MM)
      setDataInicio(formatDateToInput(eventToEdit.data_inicio));
      setDataFim(eventToEdit.data_fim ? formatDateToInput(eventToEdit.data_fim) : '');
      setDiaInteiro(eventToEdit.dia_inteiro);
      setTipo(eventToEdit.tipo);
      setSubCor(eventToEdit.cor);
      setConcluido(eventToEdit.concluido);
      setLeadId(eventToEdit.lead_id || '');
      setLeadNome(eventToEdit.lead_nome || '');
    } else {
      // Set default start datetime
      const baseDate = selectedDate || new Date().toISOString().split('T')[0];
      const startDateTime = `${baseDate}T09:00`;
      const endDateTime = `${baseDate}T10:00`;
      setDataInicio(startDateTime);
      setDataFim(endDateTime);
    }
  }, [eventToEdit, selectedDate]);

  const formatDateToInput = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      // Offset timezone to local format
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}-${minutes}`.replace('-', '/').replace('-', '/').split('T')[1] 
        ? `${year}-${month}-${day}T${hours}:${minutes}` 
        : `${year}-${month}-${day}T09:00`;
    } catch (e) {
      return '';
    }
  };

  const handleSave = () => {
    if (!titulo.trim()) return;

    const newEvent: Evento = {
      id: eventToEdit ? eventToEdit.id : `event-${Date.now()}`,
      titulo,
      descricao,
      data_inicio: new Date(dataInicio).toISOString(),
      data_fim: dataFim ? new Date(dataFim).toISOString() : undefined,
      dia_inteiro: diaInteiro,
      tipo,
      cor: subCor,
      concluido,
      lead_id: leadId || undefined,
      lead_nome: leadNome || undefined,
    };

    base44.db.eventos.save(newEvent);
    onSuccess();
    onClose();
  };

  const handleDelete = () => {
    if (eventToEdit) {
      base44.db.eventos.delete(eventToEdit.id);
      onSuccess();
      onClose();
    }
  };

  // Filtered Leads
  const filteredLeads = leadsList.filter(l => 
    l.nome.toLowerCase().includes(searchLead.toLowerCase()) || 
    (l.telefone && l.telefone.includes(searchLead))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative flex w-full max-w-lg flex-col rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-lg font-semibold tracking-tight text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-red-500" />
          {eventToEdit ? 'Editar Compromisso' : 'Novo Compromisso'}
        </h2>

        <div className="space-y-4 text-xs">
          {/* Título */}
          <div className="space-y-1">
            <label className="font-semibold text-neutral-400">Título do Evento *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Visita de Medição de Mármore"
              className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-white focus:border-red-500 focus:outline-none"
              required
            />
          </div>

          {/* Tipo e Cor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">Tipo de Evento</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as EventoTipo)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-white focus:border-red-500 focus:outline-none"
              >
                {EVENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">Cor Indicativa</label>
              <div className="flex items-center gap-1.5 h-10">
                {EVENT_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSubCor(c.name)}
                    className={`h-6 w-6 rounded-full cursor-pointer border-2 transition ${
                      subCor === c.name ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">Início</label>
              <input
                type="datetime-local"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-400">Término (Opcional)</label>
              <input
                type="datetime-local"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dia inteiro & Concluído */}
          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
              <input
                type="checkbox"
                checked={diaInteiro}
                onChange={(e) => setDiaInteiro(e.target.checked)}
                className="h-4 w-4 rounded accent-red-600 cursor-pointer"
              />
              <span>Dia Inteiro</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
              <input
                type="checkbox"
                checked={concluido}
                onChange={(e) => setConcluido(e.target.checked)}
                className="h-4 w-4 rounded accent-red-600 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                Concluído {concluido && <Check className="h-4 w-4 text-green-400" />}
              </span>
            </label>
          </div>

          {/* Vinculação de Lead */}
          <div className="relative space-y-1">
            <label className="font-semibold text-neutral-400">Associar a um Lead</label>
            {leadId ? (
              <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/60 p-2">
                <span className="text-white font-medium">{leadNome}</span>
                <button
                  onClick={() => {
                    setLeadId('');
                    setLeadNome('');
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Desvincular
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center rounded-md border border-neutral-800 bg-neutral-900 p-2 focus-within:border-red-500">
                  <Search className="h-4 w-4 text-neutral-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Pesquisar lead por nome..."
                    value={searchLead}
                    onChange={(e) => {
                      setSearchLead(e.target.value);
                      setShowLeadDropdown(true);
                    }}
                    onFocus={() => setShowLeadDropdown(true)}
                    className="w-full bg-transparent text-white focus:outline-none"
                  />
                  {searchLead && (
                    <button onClick={() => setSearchLead('')} className="text-neutral-500 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {showLeadDropdown && searchLead && (
                  <div className="absolute left-0 right-0 z-50 mt-1 max-h-36 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-900 shadow-xl divide-y divide-neutral-800">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map(l => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            setLeadId(l.id);
                            setLeadNome(l.nome);
                            setSearchLead('');
                            setShowLeadDropdown(false);
                          }}
                          className="w-full text-left p-2.5 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        >
                          <div className="font-semibold">{l.nome}</div>
                          <div className="text-[10px] text-neutral-500">{l.telefone || '(Sem telefone)'} | {l.cidade}</div>
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-neutral-500">Nenhum lead encontrado.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="font-semibold text-neutral-400">Observações / Detalhes</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes sobre a visita técnica ou pauta da reunião"
              className="h-20 w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-white focus:border-red-500 focus:outline-none resize-none"
            />
          </div>

          {/* Rodapé do Modal */}
          <div className="flex justify-between items-center pt-2 border-t border-neutral-900">
            {eventToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition"
              >
                <Trash2 className="h-4 w-4" /> Excluir
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
                disabled={!titulo.trim() || !dataInicio}
                className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
